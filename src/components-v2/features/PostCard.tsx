import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Post, User, Event } from '../../types'; // Updated import

interface PostCardProps {
    post: Post;
    onComment: (postId: string | number) => void;
    onShare: (postId: string | number) => void;
    onReaction: (postId: string | number, emoji: string) => void;
    onVote?: (postId: string | number, direction: 1 | -1) => void;
    userVote?: 0 | 1 | -1;
}

const PostCard: React.FC<PostCardProps> = ({ post, onComment, onShare, onReaction, onVote, userVote = 0 }) => {
    const handleVote = (direction: 1 | -1) => {
        if (onVote) {
            onVote(post.id, direction);
        }
    };

    const getVoteButtonStyle = (direction: 1 | -1) => {
        const isVoted = userVote === direction;
        return `flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            isVoted 
                ? direction === 1 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                : 'text-gray-500 hover:bg-gray-100'
        }`;
    };

    const getBadgeText = () => {
        if (!post.reviewOf) {
            return 'post';
        }
        if (post.reviewOf.type === 'user') {
            return 'user review';
        }
        if (post.reviewOf.type === 'event') {
            return post.reviewOf.event.hasEnded ? 'event review' : 'event post';
        }
        return 'post';
    };

    const renderReviewHeader = () => {
        if (!post.reviewOf) return null;

        if (post.reviewOf.type === 'event') {
            const event = post.reviewOf.event;
            const headerLabel = event.hasEnded ? "Review for:" : "About event:";
            return (
                <div className="pb-sm pr-sm">
                    <div className="flex items-center space-x-xs bg-purple-50 rounded-md p-xs">
                        <span className="text-purple-600 text-xs font-medium">📅</span>
                        <div className="flex-grow min-w-0">
                            <span className="font-medium text-primary text-xs truncate">{headerLabel} {event.name}</span>
                            <span className="text-secondary text-xs block">{event.date} at {event.location}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (post.reviewOf.type === 'user') {
            const user = post.reviewOf.user;
            return (
                <div className="pb-sm pr-sm">
                    <div className="flex items-center space-x-xs bg-blue-50 rounded-md p-xs">
                        <span className="text-blue-600 text-xs font-medium pr-xs">Reviewing:</span>
                        <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
                        <div className="flex items-center space-x-xs min-w-0">
                            <span className="font-medium text-primary text-xs truncate">{user.name}</span>
                            <span className="text-secondary text-xs">{user.username}</span>
                            {user.trustScore && (
                                <span className="text-green-500 text-xs font-bold">⭐ {user.trustScore}</span>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };
    
    const renderTaggedUsers = () => {
        if (!post.taggedUsers || post.taggedUsers.length === 0) return null;
        
        return (
            <div className="pb-sm pr-sm">
                <div className="flex items-center space-x-sm bg-gray-100 rounded-md p-xs">
                    <span className="text-gray-600 text-xs font-medium">Tagged:</span>
                    <div className="flex flex-wrap items-center gap-x-sm gap-y-xs">
                        {post.taggedUsers.map(user => (
                            <div key={user.id || user.username} className="flex items-center space-x-xs bg-gray-200 rounded-full px-sm py-xs">
                                <img src={user.avatar} alt={user.name} className="w-4 h-4 rounded-full" />
                                <span className="text-primary text-xs font-medium truncate">{user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className="mb-md shadow-sm">
            <div className="flex">
                {/* Left Side - Vote Column */}
                <div className="flex flex-col items-center mr-md py-md">
                    {/* Upvote Button */}
                    <button 
                        onClick={() => handleVote(1)}
                        className={getVoteButtonStyle(1)}
                        disabled={!post.canVote}
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Vote Counter */}
                    <div className="flex items-center justify-center my-sm">
                        <span className={`text-base font-bold ${
                            post.votes > 0 ? 'text-green-600' : 
                            post.votes < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                            {post.votes}
                        </span>
                    </div>

                    {/* Downvote Button */}
                    <button 
                        onClick={() => handleVote(-1)}
                        className={getVoteButtonStyle(-1)}
                        disabled={!post.canVote}
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Right Side - Post Content */}
                <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-center py-sm pr-sm">
                        <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full mr-sm flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                            <p className="font-bold text-primary text-sm truncate">{post.author.name}</p>
                            <p className="text-secondary text-xs">{post.author.username} · {post.timestamp}</p>
                        </div>
                        {post.author.trustScore && (
                            <div className="text-green-500 font-bold text-sm flex-shrink-0">
                                {post.author.trustScore}
                            </div>
                        )}
                    </div>

                    {/* Review Header */}
                    {renderReviewHeader()}

                    {/* Tagged Users */}
                    {renderTaggedUsers()}

                    {/* Post Content */}
                    <div className="pb-sm pr-sm">
                        <p className="text-primary text-sm leading-relaxed">{post.content}</p>
                    </div>

                    {/* Media */}
                    {post.media && post.media.length > 0 && (
                        <div className="pb-sm pr-sm">
                            <img src={post.media[0].url} alt={post.media[0].alt || 'Post media'} className="w-full rounded-md max-h-64 object-cover" />
                        </div>
                    )}

                    {/* Post Type Badge (can be removed if reviewOf is enough) */}
                    <div className="pb-sm pr-sm">
                        <span className="text-xs text-secondary bg-gray-100 px-xs py-xs rounded-full">
                            {getBadgeText()}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-sm border-t border-gray-100 pr-sm">
                        <div className="flex space-x-sm">
                            <Button variant="text" size="small" onClick={() => onComment(post.id)}>
                                <span className="text-xs">Comment</span>
                            </Button>
                            <Button variant="text" size="small" onClick={() => onShare(post.id)}>
                                <span className="text-xs">Share</span>
                            </Button>
                        </div>
                        <div className="flex space-x-xs">
                            {post.reactions && Object.keys(post.reactions).length > 0 && 
                                Object.entries(post.reactions).slice(0, 3).map(([emoji, reactionData]) => (
                                    <div 
                                        key={emoji} 
                                        className="bg-gray-100 rounded-full px-xs py-xs flex items-center cursor-pointer"
                                        onClick={() => onReaction(post.id, emoji)}
                                    >
                                        <span className="text-sm">{emoji}</span>
                                        <span className="text-secondary text-xs ml-xs">{reactionData.count}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PostCard; 