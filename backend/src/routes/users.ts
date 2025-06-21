import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError, UnauthorizedError } from '../middleware/errorHandler';
import { calculateTrustScore, paginate } from '../utils/helpers';
import { Prisma } from '@prisma/client';

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface UserSocialAccount {
  id: string;
  userId: string;
  platform: string;
  username: string;
  isVerified: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

interface FriendConnection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  accountType: string;
  interests: Interest[];
  socialAccounts: UserSocialAccount[];
  isBlocked: boolean;
  isFriend: boolean;
  friendStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string()
  }).optional(),
  occupation: z.string().max(100).optional(),
  interests: z.array(z.string().max(50)).max(10).optional(),
  professionalBio: z.string().max(500).optional(),
  professionalLocation: z.string().max(200).optional()
});

const searchUsersSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  accountType: z.enum(['FREE', 'PROFESSIONAL', 'VENUE']).optional(),
  minTrustScore: z.number().min(0).max(100).optional(),
  location: z.string().optional()
});

// GET /api/users/me - Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        socialAccounts: true,
        _count: {
          select: {
            sentFriendRequests: { where: { status: 'ACCEPTED' } },
            receivedFriendRequests: { where: { status: 'ACCEPTED' } },
            posts: { where: { isDeleted: false } },
            events: { where: { isDeleted: false } }
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      user: {
        ...userWithoutPassword,
        friendsCount: user._count.sentFriendRequests + user._count.receivedFriendRequests,
        postsCount: user._count.posts,
        eventsCount: user._count.events
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const updateData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        email: true,
        bio: true,
        avatar: true,
        location: true,
        occupation: true,
        interests: true,
        accountType: true,
        trustScore: true,
        professionalBio: true,
        professionalLocation: true,
        professionalLayerEnabled: true,
        updatedAt: true
      }
    });

    logger.info(`User profile updated: ${req.user!.id}`);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user profile by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.id;

    // Check if users are friends to determine visibility
    const friendship = await prisma.friendConnection.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, receiverId: id, status: 'ACCEPTED' },
          { requesterId: id, receiverId: currentUserId, status: 'ACCEPTED' }
        ]
      }
    });

    const isFriend = !!friendship;
    const isSelf = currentUserId === id;

    // Check if current user is blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: id, blockedId: currentUserId },
          { blockerId: currentUserId, blockedId: id }
        ]
      }
    });

    if (isBlocked) {
      throw new NotFoundError('User not found');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        socialAccounts: {
          select: {
            id: true,
            platform: true,
            username: true,
            profileUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            sentFriendRequests: { where: { status: 'ACCEPTED' } },
            receivedFriendRequests: { where: { status: 'ACCEPTED' } },
            posts: { where: { isDeleted: false } },
            events: { where: { isDeleted: false } }
          }
        }
      }
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      throw new NotFoundError('User not found');
    }

    // Determine what data to show based on professional layer settings
    let profileData: any = {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      accountType: user.accountType,
      trustScore: user.trustScore,
      joinDate: user.joinDate,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      friendsCount: user._count.sentFriendRequests + user._count.receivedFriendRequests,
      postsCount: user._count.posts,
      eventsCount: user._count.events
    };

    // Check professional layer access
    if (user.accountType === 'PROFESSIONAL' && user.professionalLayerEnabled && !isSelf) {
      // Check if current user has personal access to this professional user
      const professionalCategory = await prisma.professionalFriendCategory.findUnique({
        where: {
          professionalUserId_friendId: {
            professionalUserId: id,
            friendId: currentUserId
          }
        }
      });

      const hasPersonalAccess = professionalCategory?.categoryType === 'PERSONAL_ACCESS';

      if (!hasPersonalAccess || !isFriend) {
        // Show only professional layer
        profileData = {
          ...profileData,
          bio: user.professionalBio,
          location: user.professionalLocation ? JSON.parse(user.professionalLocation) : null,
          occupation: user.occupation,
          interests: user.interests.filter((interest: string) => 
            // Filter to only professional interests (simplified logic)
            ['Programming', 'Marketing', 'Finance', 'Real Estate', 'Healthcare', 'Education', 'Consulting'].includes(interest)
          ),
          socialAccounts: user.socialAccounts.filter((account: { platform: string }) => 
            ['LINKEDIN', 'GITHUB'].includes(account.platform)
          ),
          isProfessionalLayer: true
        };
      } else {
        // Show full personal layer
        profileData = {
          ...profileData,
          bio: user.bio,
          location: user.location,
          occupation: user.occupation,
          interests: user.interests,
          socialAccounts: user.socialAccounts,
          email: isSelf ? user.email : undefined,
          phone: isSelf ? user.phone : undefined,
          isProfessionalLayer: false
        };
      }
    } else {
      // Regular user or self-view - show all data
      profileData = {
        ...profileData,
        bio: user.bio,
        location: user.location,
        occupation: user.occupation,
        interests: user.interests,
        socialAccounts: user.socialAccounts,
        email: isSelf ? user.email : undefined,
        phone: isSelf ? user.phone : undefined
      };
    }

    // Add friendship status
    if (!isSelf) {
      const pendingRequest = await prisma.friendConnection.findFirst({
        where: {
          OR: [
            { requesterId: currentUserId, receiverId: id, status: 'PENDING' },
            { requesterId: id, receiverId: currentUserId, status: 'PENDING' }
          ]
        }
      });

      profileData.friendshipStatus = isFriend ? 'FRIENDS' : 
                                   pendingRequest ? 'PENDING' : 'NOT_FRIENDS';
      
      if (pendingRequest) {
        profileData.friendRequestDirection = pendingRequest.requesterId === currentUserId ? 'SENT' : 'RECEIVED';
      }
    }

    res.json({ user: profileData });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/search - Search users
router.post('/search', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { query, page, limit, accountType, minTrustScore, location } = searchUsersSchema.parse(req.body);
    const { take, skip } = paginate(page, limit);
    
    // Get blocked user IDs to exclude from search
    const blockedUsers = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: req.user!.id },
          { blockedId: req.user!.id }
        ]
      },
      select: { blockerId: true, blockedId: true }
    });

    const blockedUserIds = blockedUsers.flatMap((block: { blockerId: string; blockedId: string }) => [block.blockerId, block.blockedId]).filter((id: string) => id !== req.user!.id);

    const whereClause: any = {
      AND: [
        { accountStatus: 'ACTIVE' },
        { id: { notIn: [...blockedUserIds, req.user!.id] } }, // Exclude blocked users and self
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
            { occupation: { contains: query, mode: 'insensitive' } },
            { interests: { hasSome: [query] } }
          ]
        }
      ]
    };

    if (accountType) {
      whereClause.AND.push({ accountType });
    }

    if (minTrustScore !== undefined) {
      whereClause.AND.push({ trustScore: { gte: minTrustScore } });
    }

    if (location) {
      whereClause.AND.push({
        location: {
          path: ['city'],
          string_contains: location
        }
      });
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          accountType: true,
          trustScore: true,
          bio: true,
          location: true,
          occupation: true,
          interests: true,
          isOnline: true,
          lastSeen: true
        },
        orderBy: [
          { trustScore: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
        hasNext: skip + take < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/trust-score - Get detailed trust score breakdown
router.get('/:id/trust-score', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        trustScore: true,
        trustComponents: true,
        accountType: true
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return trust score breakdown
    const trustComponents = user.trustComponents as any || {
      socialMediaVerification: 0,
      communityNetwork: 25,
      platformActivity: 10,
      contentQuality: 50,
      timeInvestment: 5,
      commentEngagement: 30,
      eventParticipation: 0,
      validationAccuracy: 50
    };

    res.json({
      user: {
        id: user.id,
        name: user.name,
        trustScore: user.trustScore,
        accountType: user.accountType
      },
      trustComponents,
      breakdown: {
        'Social Media Verification': { score: trustComponents.socialMediaVerification, weight: '20%' },
        'Community Network': { score: trustComponents.communityNetwork, weight: '20%' },
        'Platform Activity': { score: trustComponents.platformActivity, weight: '15%' },
        'Content Quality': { score: trustComponents.contentQuality, weight: '15%' },
        'Time Investment': { score: trustComponents.timeInvestment, weight: '10%' },
        'Comment Engagement': { score: trustComponents.commentEngagement, weight: '10%' },
        'Event Participation': { score: trustComponents.eventParticipation, weight: '5%' },
        'Validation Accuracy': { score: trustComponents.validationAccuracy, weight: '5%' }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/:id/toggle-professional-layer
router.post('/:id/toggle-professional-layer', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Only the user themselves can toggle their professional layer
    if (req.user!.id !== id) {
      throw new ForbiddenError('Cannot modify another user\'s professional settings');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { accountType: true, professionalLayerEnabled: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.accountType !== 'PROFESSIONAL') {
      throw new ValidationError([{ message: 'Professional layer is only available for Professional accounts' }]);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { professionalLayerEnabled: !user.professionalLayerEnabled },
      select: {
        id: true,
        professionalLayerEnabled: true
      }
    });

    res.json({
      message: 'Professional layer setting updated',
      professionalLayerEnabled: updatedUser.professionalLayerEnabled
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/recommendations - Get friend recommendations
router.get('/recommendations', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    
    // Get current user's friends
    const currentFriends = await prisma.friendConnection.findMany({
      where: {
        OR: [
          { requesterId: currentUserId, status: 'ACCEPTED' },
          { receiverId: currentUserId, status: 'ACCEPTED' }
        ]
      },
      select: { requesterId: true, receiverId: true }
    });

    const friendIds = currentFriends.map((friend: { requesterId: string; receiverId: string }) => 
      friend.requesterId === currentUserId ? friend.receiverId : friend.requesterId
    );

    // Get blocked users
    const blockedUsers = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: currentUserId },
          { blockedId: currentUserId }
        ]
      },
      select: { blockerId: true, blockedId: true }
    });

    const blockedUserIds = blockedUsers.flatMap((block: { blockerId: string; blockedId: string }) => [block.blockerId, block.blockedId]).filter((id: string) => id !== currentUserId);

    // Get current user data for matching
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { interests: true, location: true, occupation: true }
    });

    // Find potential friends (mutual friends, shared interests, same location)
    const recommendations = await prisma.user.findMany({
      where: {
        AND: [
          { accountStatus: 'ACTIVE' },
          { id: { notIn: [...friendIds, ...blockedUserIds, currentUserId] } },
          {
            OR: [
              // Shared interests
              currentUser?.interests ? { interests: { hasSome: currentUser.interests } } : {},
              // Same occupation
              currentUser?.occupation ? { occupation: currentUser.occupation } : {},
              // Same city
              currentUser?.location ? {
                location: {
                  path: ['city'],
                  equals: (currentUser.location as any)?.city
                }
              } : {}
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        accountType: true,
        trustScore: true,
        bio: true,
        occupation: true,
        interests: true,
        location: true,
        isOnline: true
      },
      take: 20,
      orderBy: { trustScore: 'desc' }
    });

    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
});

// Filter functions
const filterInterests = (interest: { id: string }): string => interest.id;
const filterAccounts = (account: { id: string; platform: string; username: string }): { id: string; platform: string; username: string } => ({
  id: account.id,
  platform: account.platform,
  username: account.username
});
const filterBlocked = (blocked: { blockedId: string }): string => blocked.blockedId;
const filterFriendIds = (friend: { friendId: string }): string => friend.friendId;

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        accountType: true,
        interests: true,
        socialAccounts: {
          select: {
            id: true,
            userId: true,
            platform: true,
            username: true,
            isVerified: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true
          }
        },
        blockedUsers: {
          select: {
            id: true,
            blockerId: true,
            blockedId: true,
            createdAt: true
          }
        },
        sentFriendRequests: {
          select: {
            id: true,
            requesterId: true,
            receiverId: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        },
        receivedFriendRequests: {
          select: {
            id: true,
            requesterId: true,
            receiverId: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError();
    }

    const profile: UserProfile = {
      id: user.id,
      username: user.username,
      displayName: user.name || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      accountType: user.accountType,
      interests: user.interests.map((interest: string) => ({
        id: interest,
        name: interest,
        category: 'general'
      })),
      socialAccounts: user.socialAccounts.map((account: UserSocialAccount) => ({
        id: account.id,
        userId: account.userId,
        platform: account.platform,
        username: account.username,
        isVerified: account.isVerified,
        verifiedAt: account.verifiedAt,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      })),
      isBlocked: user.blockedUsers.some((block: Block) => 
        block.blockerId === userId || block.blockedId === userId
      ),
      isFriend: [...user.sentFriendRequests, ...user.receivedFriendRequests].some((friend: FriendConnection) => 
        (friend.requesterId === userId || friend.receiverId === userId) && 
        friend.status === 'ACCEPTED'
      ),
      friendStatus: [...user.sentFriendRequests, ...user.receivedFriendRequests].find((friend: FriendConnection) => 
        (friend.requesterId === userId || friend.receiverId === userId)
      )?.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Check professional layer access
router.get('/professional-layer', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accountType: true,
        professionalLayerEnabled: true
      }
    });

    if (!user) {
      throw new NotFoundError();
    }

    if (user.accountType !== 'PROFESSIONAL') {
      throw new ValidationError([{ message: 'Professional layer is only available for Professional accounts' }]);
    }

    // ... rest of the code ...
  } catch (error) {
    next(error);
  }
});

export default router;