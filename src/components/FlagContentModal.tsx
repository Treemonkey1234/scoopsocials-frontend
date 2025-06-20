import React, { useState } from 'react';

interface FlagContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'POST' | 'EVENT' | 'SOCIAL_ACCOUNT';
  contentId: string;
  contentTitle?: string;
  contentPreview?: string;
  flaggedUserName: string;
  onFlagSubmit: (flagData: {
    category: string;
    evidence: string;
    verificationInfo?: string;
  }) => void;
}

const FlagContentModal: React.FC<FlagContentModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle,
  contentPreview,
  flaggedUserName,
  onFlagSubmit
}) => {
  const [category, setCategory] = useState('');
  const [evidence, setEvidence] = useState('');
  const [verificationInfo, setVerificationInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flagCategories = [
    {
      value: 'INAPPROPRIATE',
      label: 'Inappropriate Content',
      description: 'Content that violates community guidelines'
    },
    {
      value: 'SPAM',
      label: 'Spam',
      description: 'Unwanted promotional content or repetitive posts'
    },
    {
      value: 'FAKE_ACCOUNT',
      label: 'Fake Account',
      description: 'Account that doesn\'t belong to this user or is fabricated'
    },
    {
      value: 'HARASSMENT',
      label: 'Harassment',
      description: 'Content that targets or harasses individuals'
    },
    {
      value: 'OTHER',
      label: 'Other',
      description: 'Other violations not covered above'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !evidence.trim()) {
      alert('Please select a category and provide evidence.');
      return;
    }

    if (evidence.trim().length < 20) {
      alert('Evidence must be at least 20 characters long.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onFlagSubmit({
        category,
        evidence: evidence.trim(),
        verificationInfo: verificationInfo.trim() || undefined
      });
      
      // Reset form
      setCategory('');
      setEvidence('');
      setVerificationInfo('');
      onClose();
    } catch (error) {
      console.error('Error submitting flag:', error);
      alert('Failed to submit flag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'POST': return 'Post';
      case 'EVENT': return 'Event';
      case 'SOCIAL_ACCOUNT': return 'Social Account';
      default: return 'Content';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Flag {getContentTypeLabel()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Content being flagged:
            </h3>
            <div className="text-sm text-gray-600">
              <div><strong>User:</strong> {flaggedUserName}</div>
              {contentTitle && <div><strong>Title:</strong> {contentTitle}</div>}
              {contentPreview && (
                <div className="mt-2">
                  <strong>Preview:</strong>
                  <div className="mt-1 p-2 bg-white rounded border text-sm">
                    {contentPreview}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flag Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Flag Category *
              </label>
              <div className="space-y-2">
                {flagCategories.map((cat) => (
                  <label key={cat.value} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 mr-3"
                      required
                    />
                    <div>
                      <div className="font-medium text-gray-900">{cat.label}</div>
                      <div className="text-sm text-gray-600">{cat.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence *
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide detailed evidence for your flag. Minimum 20 characters required."
                required
                minLength={20}
              />
              <div className="mt-1 text-sm text-gray-500">
                {evidence.length}/∞ characters (minimum 20)
              </div>
            </div>

            {/* Verification Info (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Information (Optional)
              </label>
              <input
                type="text"
                value={verificationInfo}
                onChange={(e) => setVerificationInfo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username, URL, or other verification details"
              />
              <div className="mt-1 text-sm text-gray-500">
                Help us verify your claim with additional information
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      False flags may result in a reduction of your trust score and daily flag limits. 
                      Please ensure your flag is accurate and well-evidenced.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !category || evidence.trim().length < 20}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Flag'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FlagContentModal; 