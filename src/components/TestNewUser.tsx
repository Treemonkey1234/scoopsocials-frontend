import React from 'react';

export const TestNewUser: React.FC = () => {
  const triggerNewUserFlow = () => {
    // Clear existing walkthrough state
    localStorage.removeItem('walkthroughCompleted');
    localStorage.removeItem('userSocialAccounts');
    
    // Set new user flag
    localStorage.setItem('isNewUser', 'true');
    
    // Trigger page reload to start walkthrough
    window.location.reload();
  };

  const resetToExistingUser = () => {
    localStorage.setItem('walkthroughCompleted', 'true');
    localStorage.removeItem('isNewUser');
    window.location.reload();
  };

  const showCurrentState = () => {
    const walkthroughCompleted = localStorage.getItem('walkthroughCompleted');
    const isNewUser = localStorage.getItem('isNewUser');
    const socialAccounts = localStorage.getItem('userSocialAccounts');
    
    console.log('Current State:', {
      walkthroughCompleted,
      isNewUser,
      socialAccounts: socialAccounts ? JSON.parse(socialAccounts) : null
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border z-50">
      <div className="text-sm font-semibold mb-2"> Dev Tools</div>
      <div className="space-y-2">
        <button
          onClick={triggerNewUserFlow}
          className="block w-full text-left text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
           Test New User Walkthrough
        </button>
        <button
          onClick={resetToExistingUser}
          className="block w-full text-left text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
           Reset to Existing User
        </button>
        <button
          onClick={showCurrentState}
          className="block w-full text-left text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
           Log Current State
        </button>
      </div>
    </div>
  );
};
