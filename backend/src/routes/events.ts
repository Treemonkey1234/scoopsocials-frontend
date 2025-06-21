import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { isConnected } from '../config/prisma';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to check database connection
const checkDatabaseConnection = (res: Response) => {
  if (!isConnected) {
    return res.status(503).json({ 
      error: 'Database not available',
      message: 'Server is running with Redis only. Database connection required for events functionality.',
      code: 'DATABASE_UNAVAILABLE'
    });
  }
  return null;
};

// Get all events (with optional filtering)
router.get('/', [
  query('category').optional().isString(),
  query('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
  query('organizerId').optional().isString(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check database connection
    const dbError = checkDatabaseConnection(res);
    if (dbError) return dbError;

    const { category, visibility, organizerId, search, limit = 20, offset = 0 } = req.query;

    // Build where clause
    const where: any = {
      isDeleted: false,
    };

    if (category) where.category = category;
    if (visibility) where.visibility = visibility;
    if (organizerId) where.organizerId = organizerId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            rsvps: true,
            likes: true,
            reviews: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit as number,
      skip: offset as number,
    });

    const total = await prisma.event.count({ where });

    res.json({
      events,
      pagination: {
        total,
        limit: limit as number,
        offset: offset as number,
        hasMore: (offset as number) + (limit as number) < total,
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get a specific event
router.get('/:id', [
  param('id').isString(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: { id, isDeleted: false },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            trustScore: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            rsvps: true,
            likes: true,
            reviews: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create a new event
router.post('/', [
  authenticateToken,
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').isString().trim().isLength({ min: 1, max: 2000 }),
  body('category').optional().isIn(['PROFESSIONAL', 'SOCIAL', 'EDUCATIONAL', 'SPORTS', 'CULTURAL', 'COMMUNITY', 'NETWORKING']),
  body('location').isString().trim().isLength({ min: 1, max: 500 }),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('maxAttendees').optional().isInt({ min: 1, max: 10000 }),
  body('trustScoreRequired').optional().isInt({ min: 0, max: 100 }),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category = 'SOCIAL',
      location,
      startDate,
      endDate,
      maxAttendees,
      trustScoreRequired = 0,
      visibility = 'PUBLIC',
    } = req.body;

    const userId = req.user!.id;

    // Validate dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (start < new Date()) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }
    
    if (end && end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        location,
        startDate: start,
        endDate: end,
        maxAttendees,
        trustScoreRequired,
        visibility,
        organizerId: userId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Auto-RSVP the organizer
    await prisma.eventRSVP.create({
      data: {
        eventId: event.id,
        userId,
        status: 'GOING',
      },
    });

    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an event
router.put('/:id', [
  authenticateToken,
  param('id').isString(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().trim().isLength({ min: 1, max: 2000 }),
  body('category').optional().isIn(['PROFESSIONAL', 'SOCIAL', 'EDUCATIONAL', 'SPORTS', 'CULTURAL', 'COMMUNITY', 'NETWORKING']),
  body('location').optional().isString().trim().isLength({ min: 1, max: 500 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('maxAttendees').optional().isInt({ min: 1, max: 10000 }),
  body('trustScoreRequired').optional().isInt({ min: 0, max: 100 }),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user!.id;

    // Check if event exists and user is the organizer
    const existingEvent = await prisma.event.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== userId) {
      return res.status(403).json({ error: 'Only the organizer can update this event' });
    }

    // Validate dates if provided
    if (req.body.startDate) {
      const start = new Date(req.body.startDate);
      if (start < new Date()) {
        return res.status(400).json({ error: 'Start date cannot be in the past' });
      }
    }

    if (req.body.startDate && req.body.endDate) {
      const start = new Date(req.body.startDate);
      const end = new Date(req.body.endDate);
      if (end <= start) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: req.body,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event (soft delete)
router.delete('/:id', [
  authenticateToken,
  param('id').isString(),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user!.id;

    // Check if event exists and user is the organizer
    const existingEvent = await prisma.event.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== userId) {
      return res.status(403).json({ error: 'Only the organizer can delete this event' });
    }

    await prisma.event.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// RSVP to an event
router.post('/:id/rsvp', [
  authenticateToken,
  param('id').isString(),
  body('status').isIn(['GOING', 'MAYBE', 'NOT_GOING']),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    // Check if event exists
    const event = await prisma.event.findFirst({
      where: { id, isDeleted: false },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is full
    if (event.maxAttendees) {
      const confirmedCount = await prisma.eventRSVP.count({
        where: {
          eventId: id,
          status: 'GOING',
        },
      });

      if (status === 'GOING' && confirmedCount >= event.maxAttendees) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    // Check if user already has an RSVP
    const existingRSVP = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (existingRSVP) {
      // Update existing RSVP
      const updatedRSVP = await prisma.eventRSVP.update({
        where: {
          eventId_userId: {
            eventId: id,
            userId,
          },
        },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      res.json({ rsvp: updatedRSVP });
    } else {
      // Create new RSVP
      const newRSVP = await prisma.eventRSVP.create({
        data: {
          eventId: id,
          userId,
          status,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      res.status(201).json({ rsvp: newRSVP });
    }
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    res.status(500).json({ error: 'Failed to RSVP to event' });
  }
});

// Remove RSVP from an event
router.delete('/:id/rsvp', [
  authenticateToken,
  param('id').isString(),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user!.id;

    // Check if RSVP exists
    const existingRSVP = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (!existingRSVP) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    await prisma.eventRSVP.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    res.json({ message: 'RSVP removed successfully' });
  } catch (error) {
    console.error('Error removing RSVP:', error);
    res.status(500).json({ error: 'Failed to remove RSVP' });
  }
});

// Like/unlike an event
router.post('/:id/like', [
  authenticateToken,
  param('id').isString(),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user!.id;

    // Check if event exists
    const event = await prisma.event.findFirst({
      where: { id, isDeleted: false },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user already liked the event
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        eventId: id,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      res.json({ message: 'Event unliked successfully' });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          eventId: id,
        },
      });

      res.json({ message: 'Event liked successfully' });
    }
  } catch (error) {
    console.error('Error liking/unliking event:', error);
    res.status(500).json({ error: 'Failed to like/unlike event' });
  }
});

export default router; 