import React, { useState } from 'react';
import FlagContentModal from './FlagContentModal';

interface FlagButtonProps {
  contentType: 'POST' | 'EVENT' | 'SOCIAL_ACCOUNT';
  contentId: string;
  contentTitle?: string;
  contentPreview?: string;
  flaggedUserName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'full';
}

const FlagButton: React.FC<FlagButtonProps> = ({
  contentType,
  contentId,
  contentTitle,
  contentPreview,
  flaggedUserName,
  className = '',
  size = 'md',
  variant = 'icon'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFlagSubmit = async (flagData: {
    category: string;
    evidence: string;
    verificationInfo?: string;
  }) => {
    // In a real app, this would make an API call
    console.log('Flag submitted:', {
      contentType,
      contentId,
      flaggedUserName,
      ...flagData
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success message
    alert('Flag submitted successfully. Our moderators will review it shortly.');
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'text':
        return (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4a4 4 0 014-4h6a4 4 0 014 4v4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4a4 4 0 004 4h2a4 4 0 004-4V3" />
            </svg>
            Flag
          </span>
        );
      case 'full':
        return (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4a4 4 0 014-4h6a4 4 0 014 4v4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4a4 4 0 004 4h2a4 4 0 004-4V3" />
            </svg>
            Flag Content
          </span>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4a4 4 0 014-4h6a4 4 0 014 4v4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4a4 4 0 004 4h2a4 4 0 004-4V3" />
          </svg>
        );
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center justify-center
          text-gray-600 hover:text-red-600
          hover:bg-red-50 rounded-md transition-colors
          ${getSizeClasses()}
          ${className}
        `}
        title="Flag this content"
      >
        {getButtonContent()}
      </button>

      <FlagContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentType={contentType}
        contentId={contentId}
        contentTitle={contentTitle}
        contentPreview={contentPreview}
        flaggedUserName={flaggedUserName}
        onFlagSubmit={handleFlagSubmit}
      />
    </>
  );
};

export default FlagButton; 