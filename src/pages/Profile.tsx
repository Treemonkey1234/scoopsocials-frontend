import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlusButton from "../components/PlusButton";
import PostCard from "../components-v2/features/PostCard";
import { Button, Card } from "../components-v2";
import { useUser, User } from "../context/UserContext";
import { getUser } from "../services/api";

// --- Data Types ---
type SocialConnection = {
  platform: string;
  username: string;
  verified: boolean;
  connectedAt: string;
  lastActive: string;
};

type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
};

type MutualFriend = {
  id: number;
  name:string;
  username: string;
  avatar: string;
  trustScore: number;
  mutualFriends: number;
  connectionStrength: number;
};

type SocialStat = {
  posts: number;
  events: number;
  groups: number;
  followers: number;
  following: number;
  trustScore: number;
  verificationLevel: string;
  memberSince: string;
  lastActive: string;
};

type Interest = {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
  verified: boolean;
};

type Flavor = {
  id: number;
  name: string;
  description: string;
  confidence: number;
  postCount: number;
  category: 'personality' | 'skill' | 'trait' | 'reputation';
  generatedAt: string;
  samplePosts: string[];
};

type MediaItem = {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  alt?: string;
  uploadedAt: string;
  size: number;
  dimensions?: { width: number; height: number };
};

type ReactionData = {
  count: number;
  users: string[];
};

type PostReactions = {
  [emoji: string]: ReactionData;
};

type Post = {
  id: number | string;
  author: {
    name: string;
    username: string;
    avatar: string;
    trustScore?: number;
  };
  content: string;
  timestamp: string;
  votes: number;
  type: string;
  canVote: boolean;
  reactions: PostReactions;
  media?: MediaItem[];
  tags?: string[];
  location?: string;
  isEdited?: boolean;
  isDemo?: boolean;
  editHistory?: Array<{ timestamp: string; content: string }>;
  engagement?: {
    views: number;
    shares: number;
    saves: number;
    reach: number;
  };
  mentionedFriend?: {
    name: string;
    username: string;
    avatar: string;
    trustScore?: number;
  };
};

// Default user data for new accounts
const getDefaultUserData = (user: any) => ({
  name: user.name,
  username: user.username,
  profilePhoto: `https://via.placeholder.com/100x100/6366f1/ffffff?text=${user.name.split(' ').map((n: string) => n[0]).join('')}`,
  trustScore: user.trustScore || 50,
  bio: user.bio || "Welcome to ScoopSocials!",
  location: user.location ? `${user.location.city}, ${user.location.state}` : "Location not set",
  occupation: user.occupation || "Not specified",
  company: "",
  education: "",
  flavors: [] as Flavor[],
  achievements: [] as Achievement[],
  socials: (user.socials || {}) as { [key: string]: string },
  socialStats: {
    posts: 0,
    events: 0,
    groups: 0,
    followers: 0,
    following: 0,
    trustScore: user.trustScore || 50,
    verificationLevel: "New User",
    memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    lastActive: "Just now"
  } as SocialStat,
  mutualFriends: [] as MutualFriend[],
});

// Mock posts for the profile (will be empty for new users)
const mockPosts: Post[] = [];

const socialPlatforms = [
    "Facebook", "Instagram", "Twitter/X", "TikTok", "Snapchat", 
    "LinkedIn", "YouTube", "Reddit", "Pinterest", "Threads", "BeReal"
];

const tabList = ["Posts", "Groups", "Likes"];

const getSocialMediaUrl = (platform: string, username: string) => {
    const baseUrl = {
        "Facebook": "https://facebook.com/",
        "Instagram": "https://instagram.com/",
        "Twitter/X": "https://x.com/",
        "TikTok": "https://tiktok.com/@",
        "LinkedIn": "https://linkedin.com/in/",
        "YouTube": "https://youtube.com/",
        "Reddit": "https://reddit.com/user/",
        "Pinterest": "https://pinterest.com/",
        "Threads": "https://threads.net/@",
    };
    // @ts-ignore
    return baseUrl[platform] ? `${baseUrl[platform]}${username}` : '#';
};

const getPlatformIcon = (platform: string) => {
    switch(platform) {
        case "Facebook": return "📘";
        case "Instagram": return "📸";
        case "Twitter/X": return "🐦";
        case "TikTok": return "🎵";
        case "Snapchat": return "👻";
        case "LinkedIn": return "💼";
        case "YouTube": return "📺";
        case "Reddit": return "🤖";
        case "Pinterest": return "📌";
        case "Threads": return "🧵";
        case "BeReal": return "📱";
        default: return "🌐";
    }
};

const SocialPlatformItem = ({ 
    platform, 
    isConnected, 
    username, 
    onConnect, 
    isEditing, 
    onSave, 
    onCancel, 
    socialUsername, 
    setSocialUsername 
}: any) => {
    if (isEditing) {
        return (
            <div className="p-sm bg-blue-50 rounded-lg space-y-md">
                <div className="flex items-center space-x-md">
                    <span className="text-2xl">{getPlatformIcon(platform)}</span>
                    <p className="font-semibold text-primary">{platform}</p>
                </div>
                <input 
                    type="text"
                    value={socialUsername}
                    onChange={(e) => setSocialUsername(e.target.value)}
                    placeholder={`Enter your ${platform} username`}
                    className="input w-full"
                />
                <div className="flex justify-end space-x-sm">
                    <Button variant="outline" size="small" onClick={onCancel}>Cancel</Button>
                    <Button variant="primary" size="small" onClick={() => onSave(platform, socialUsername)}>Save</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center p-sm bg-secondary-light rounded-lg">
            <div className="flex items-center space-x-md">
                <span className="text-2xl">{getPlatformIcon(platform)}</span>
                <div>
                    <p className="font-semibold text-primary">{platform}</p>
                    {isConnected && <p className="text-xs text-secondary">{username}</p>}
                </div>
            </div>
            <Button 
                variant={isConnected ? "primary" : "outline"}
                onClick={() => onConnect(platform)}
                disabled={isConnected}
            >
                {isConnected ? "Connected" : "Connect"}
            </Button>
        </div>
    );
};


export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, updateUser } = useUser();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Posts");
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showFlavorDetails, setShowFlavorDetails] = useState(false);
  const [votes, setVotes] = useState<{ [id: string]: 0 | 1 | -1 }>({});
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [socialUsername, setSocialUsername] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      const idToFetch = userId || currentUser?.id;
      if (!idToFetch) {
        setError("User ID not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getUser(idToFetch);
        setProfileData(response.data);
      } catch (err) {
        setError("Failed to load profile. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser?.id]);

  // If no user is authenticated, redirect to auth
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="p-lg text-center text-red-500">{error}</div>;
  }
  
  if (!profileData) {
    return <div className="p-lg text-center">User not found.</div>;
  }

  // Get user data with defaults for new accounts
  const userData = getDefaultUserData(profileData);

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrustScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const handlePlusAction = (action: 'post' | 'event' | 'friend') => {
    console.log(`${action} action triggered`);
  };

  const handleViewAllSocials = () => {
    setEditingPlatform(null);
    setShowSocialModal(true);
  };

  const handleConnectSocial = (platform: string) => {
    setEditingPlatform(platform);
    setSocialUsername(userData.socials[platform] || '');
  };

  const handleSaveSocial = (platform: string, username: string) => {
    if (!username.trim()) {
        // If username is empty, treat as disconnect
        const newSocials = { ...currentUser?.socials };
        delete newSocials[platform];
        updateUser({ socials: newSocials });
    } else {
        const newSocials = { ...currentUser?.socials, [platform]: username };
        updateUser({ socials: newSocials });
    }
    setEditingPlatform(null);
  };
  
  const handleCancelSocial = () => {
    setEditingPlatform(null);
  };

  const handleSocialClick = (platform: string, username: string) => {
    const url = getSocialMediaUrl(platform, username);
    if (url) window.open(url, '_blank');
  };

  const handleViewFlavors = () => setShowFlavorDetails(true);
  
  const getFlavorBackground = (category: string) => {
    switch (category) {
      case 'personality': return 'bg-blue-100';
      case 'skill': return 'bg-green-100';
      case 'trait': return 'bg-purple-100';
      case 'reputation': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const getFlavorIcon = (category: string) => {
    switch (category) {
      case 'personality': return '🌟';
      case 'skill': return '💡';
      case 'trait': return '🎯';
      case 'reputation': return '🏆';
      default: return '✨';
    }
  };

  const getFlavorShape = (index: number) => {
    const shapes = ['rounded-lg', 'rounded-full', 'rounded-xl', 'rounded-2xl'];
    return shapes[index % shapes.length];
  };

  // Post handlers
  const handleComment = (postId: string | number) => {
    console.log(`Comment on post ${postId}`);
  };

  const handleShare = (postId: string | number) => {
    console.log(`Share post ${postId}`);
  };

  const handleReaction = (postId: string | number, emoji: string) => {
    console.log(`React with ${emoji} on post ${postId}`);
  };

  const handleVote = (id: string | number, direction: 1 | -1) => {
    const idStr = id.toString();
    setVotes(prev => ({ ...prev, [idStr]: prev[idStr] === direction ? 0 : direction }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="bg-primary text-white p-lg shadow-lg">
        <div className="flex items-center justify-between mb-md">
            <h1 className="text-5xl font-extrabold text-white">Profile</h1>
            <PlusButton onAction={handlePlusAction} />
        </div>
        <div className="flex justify-end">
            <button 
                className="p-sm bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all"
                onClick={() => navigate('/settings')}
                aria-label="Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>
      </div>

      <div className="p-lg -mt-lg">
        <div className="max-w-2xl mx-auto space-y-xl">
          {/* Profile Header */}
          <Card className="p-xl text-center relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary/30 shadow-lg overflow-hidden">
                    <img src={userData.profilePhoto} alt={userData.name} />
                </div>
                <h2 className="text-h2 font-bold mt-xl mb-sm text-primary">{userData.name}</h2>
                <p className="text-secondary mb-md">{userData.username}</p>
                <div className="flex items-center justify-center space-x-sm">
                    <div className="px-md py-sm bg-primary/20 rounded-full text-sm font-medium backdrop-blur-sm text-primary">
                        Trust Score: {userData.trustScore}
                    </div>
                 </div>
               </div>
          </Card>

          {/* Bio Card */}
          <Card className="p-xl text-center bg-white">
            <p className="text-body1 text-primary">{userData.bio}</p>
          </Card>

          {/* Flavors Section */}
          <div className="bg-white rounded-lg p-lg">
            <div className="flex justify-between items-center mb-xl">
                <h3 className="text-h3 font-bold text-primary text-center">Flavors</h3>
                <Button variant="outline" size="small" onClick={handleViewFlavors}>View</Button>
            </div>
            <div className="flex flex-wrap gap-md justify-center">
              {userData.flavors.map((flavor, index) => (
                <div key={flavor.id} className={`${getFlavorBackground(flavor.category)} text-white px-lg py-md ${getFlavorShape(index)} shadow-md flex items-center space-x-sm`}>
                  <span className="text-base">{getFlavorIcon(flavor.category)}</span>
                  <span className="font-medium text-base">{flavor.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Connections */}
          <Card className="p-xl bg-white">
            <div className="flex justify-between items-center mb-xl">
                <h3 className="text-h3 font-bold text-primary">Socials</h3>
                <Button variant="outline" size="small" onClick={handleViewAllSocials}>View all</Button>
            </div>
            {Object.keys(userData.socials).length > 0 ? (
              <div className="flex justify-center space-x-xl">
                {Object.entries(userData.socials).map(([platform, username]) => (
                  <div key={platform} className="flex flex-col items-center space-y-sm cursor-pointer group" onClick={() => handleSocialClick(platform, username || '')}>
                    <div className="relative">
                      <span className="text-3xl group-hover:scale-110 transition-transform">{getPlatformIcon(platform)}</span>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{platform}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-lg">
                <div className="text-4xl mb-md">📱</div>
                <p className="text-secondary mb-md">No social accounts connected yet</p>
                <Button variant="outline" size="small" onClick={handleViewAllSocials}>
                  Connect Social Accounts
                </Button>
              </div>
            )}
          </Card>

          {/* Tabs */}
          <div className="bg-white rounded-lg">
            <div className="border-b border-gray-200">
              <div className="flex justify-around">
                {tabList.map(tab => (
                  <button
                    key={tab}
                    className={`w-full py-lg text-center font-medium ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-secondary'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-xl px-lg">
              {activeTab === "Posts" && (
                <div className="space-y-md">
                  {mockPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={{...post, author: post.author}}
                      onComment={handleComment}
                      onShare={handleShare}
                      onReaction={handleReaction}
                      onVote={handleVote}
                      userVote={votes[post.id.toString()] || 0}
                    />
                  ))}
                </div>
              )}
              {activeTab === "Groups" && (
                <p className="text-center text-secondary">Groups content goes here.</p>
              )}
              {activeTab === "Likes" && (
                <p className="text-center text-secondary">Likes content goes here.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSocialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-md">
              <Card className="w-full max-w-md">
                  <div className="flex justify-between items-center p-xl border-b">
                      <h3 className="text-h3 font-bold text-primary">All Socials</h3>
                      <button onClick={() => setShowSocialModal(false)} className="text-secondary text-xl">&times;</button>
                  </div>
                  <div className="p-xl max-h-[60vh] overflow-y-auto">
                      <div className="space-y-md">
                          {socialPlatforms.map(platform => (
                              <SocialPlatformItem 
                                  key={platform}
                                  platform={platform}
                                  isConnected={!!userData.socials[platform]}
                                  username={userData.socials[platform]}
                                  onConnect={handleConnectSocial}
                                  isEditing={editingPlatform === platform}
                                  onSave={handleSaveSocial}
                                  onCancel={handleCancelSocial}
                                  socialUsername={socialUsername}
                                  setSocialUsername={setSocialUsername}
                              />
                          ))}
                      </div>
                  </div>
              </Card>
          </div>
      )}

      {showFlavorDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-md">
              <Card className="w-full max-w-2xl">
                  <div className="flex justify-between items-center p-xl border-b">
                      <h3 className="text-h3 font-bold text-primary">All Flavors</h3>
                      <button onClick={() => setShowFlavorDetails(false)} className="text-secondary text-xl">&times;</button>
                  </div>
                  <div className="p-xl max-h-[60vh] overflow-y-auto">
                      <div className="space-y-lg">
                          {userData.flavors.map((flavor, index) => (
                              <div key={flavor.id} className={`${getFlavorBackground(flavor.category)} text-white p-lg ${getFlavorShape(index)} shadow-md`}>
                                  <div className="flex items-center space-x-sm mb-sm">
                                      <span className="text-xl">{getFlavorIcon(flavor.category)}</span>
                                      <h4 className="font-bold text-lg">{flavor.name}</h4>
                                  </div>
                                  <p className="text-white/90 mb-sm">{flavor.description}</p>
                                  <div className="flex items-center justify-between text-sm">
                                      <span>Confidence: {flavor.confidence}%</span>
                                      <span>Posts: {flavor.postCount}</span>
                                      <span>Generated: {flavor.generatedAt}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
} 