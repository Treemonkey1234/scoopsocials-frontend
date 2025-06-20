import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

// Step enums for clarity
enum Step {
  Landing,
  PhoneEntry,
  SMSVerification,
  ProfileCreation,
  InterestsOnboarding,
  SocialOnboarding,
  FriendsOnboarding,
  Complete,
  SignInSuccess,
}

type Mode = "signIn" | "signUp" | null;

// Country code data
const countryList = getCountries();
const countryOptions = countryList.map(code => ({
  code,
  label: code,
  callingCode: getCountryCallingCode(code)
}));

export default function Auth() {
  const [step, setStep] = useState<Step>(Step.Landing);
  const [mode, setMode] = useState<Mode>(null);
  const [country, setCountry] = useState<CountryCode>('US' as CountryCode);
  const [localNumber, setLocalNumber] = useState('');
  const [sms, setSms] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [socials, setSocials] = useState<{ [platform: string]: string }>({});
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useUser();

  // Social connection state
  const [socialConnections, setSocialConnections] = useState<{
    [platform: string]: {
      connected: boolean;
      method: 'manual' | 'oauth' | null;
      username?: string;
    }
  }>({});

  // Handle redirect when onboarding is complete
  useEffect(() => {
    if (step === Step.Complete) {
      setTimeout(() => navigate("/home"), 1200);
    }
  }, [step, navigate]);

  // Clear error when step changes
  useEffect(() => {
    setError("");
  }, [step]);

  // Improved progress tracking for different flows
  const getProgressInfo = () => {
    // Define step configurations for different flows
    const signInSteps = [
      { step: Step.Landing, label: "Welcome" },
      { step: Step.PhoneEntry, label: "Enter Phone" },
      { step: Step.SMSVerification, label: "Verify Code" },
      { step: Step.SignInSuccess, label: "Success" }
    ];

    const signUpSteps = [
      { step: Step.Landing, label: "Welcome" },
      { step: Step.PhoneEntry, label: "Enter Phone" },
      { step: Step.SMSVerification, label: "Verify Code" },
      { step: Step.ProfileCreation, label: "Create Profile" },
      { step: Step.InterestsOnboarding, label: "Select Interests" },
      { step: Step.SocialOnboarding, label: "Connect Social" },
      { step: Step.FriendsOnboarding, label: "Find Friends" },
      { step: Step.Complete, label: "Complete" }
    ];

    // Determine which flow we're in
    const currentSteps = mode === "signIn" ? signInSteps : signUpSteps;
    
    // Find current step index
    const currentIndex = currentSteps.findIndex(s => s.step === step);
    
    // Handle edge cases
    if (currentIndex === -1) {
      return {
        currentStepNumber: 0,
        totalSteps: currentSteps.length,
        progressPercentage: 0,
        currentStepLabel: "Unknown",
        shouldShowProgress: false
      };
    }
    
    // Calculate progress
    const totalSteps = currentSteps.length;
    const currentStepNumber = currentIndex + 1;
    const progressPercentage = Math.round((currentStepNumber / totalSteps) * 100);
    
    // Get current step label
    const currentStepLabel = currentSteps[currentIndex]?.label || "Unknown";
    
    return {
      currentStepNumber,
      totalSteps,
      progressPercentage,
      currentStepLabel,
      shouldShowProgress: step !== Step.Landing && step !== Step.SignInSuccess && step !== Step.Complete
    };
  };

  // Phone number validation using libphonenumber-js
  const validatePhoneNumber = () => {
    const fullNumber = `+${getCountryCallingCode(country as CountryCode)}${localNumber.replace(/\D/g, '')}`;
    return isValidPhoneNumber(fullNumber, country as CountryCode);
  };

  const handleSendSMS = async () => {
    if (!localNumber) {
      setError("Please enter your phone number");
      return;
    }
    if (!validatePhoneNumber()) {
      setError("Please enter a valid phone number for your country");
      return;
    }
    const fullNumber = `+${getCountryCallingCode(country as CountryCode)}${localNumber.replace(/\D/g, '')}`;
    setLoading(true);
    setError("");
    try {
      if (mode === "signIn") {
        await authAPI.login(fullNumber);
      }
      await authAPI.sendVerification(fullNumber);
      setStep(Step.SMSVerification);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySMS = async () => {
    const fullNumber = `+${getCountryCallingCode(country as CountryCode)}${localNumber.replace(/\D/g, '')}`;
    if (!sms || sms.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (mode === "signIn") {
        const response = await authAPI.verifyPhone(fullNumber, sms);
        const { accessToken, refreshToken, user } = response.data;
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setStep(Step.SignInSuccess);
        setTimeout(() => navigate("/home"), 1200);
      } else {
        await authAPI.verifySignup(fullNumber, sms);
        setStep(Step.ProfileCreation);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleProfile = async () => {
    const fullNumber = `+${getCountryCallingCode(country as CountryCode)}${localNumber.replace(/\D/g, '')}`;
    if (!name || !username) {
      setError("Please enter your name and username");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userData = {
        phone: fullNumber,
        name,
        username,
        email: email || undefined,
        bio: bio || undefined,
        accountType: 'FREE' as const,
        interests: interests
      };
      const response = await authAPI.signup(userData);
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setStep(Step.InterestsOnboarding);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleInterests = () => setStep(Step.SocialOnboarding);
  const handleSocials = () => setStep(Step.FriendsOnboarding);
  const handleFriends = () => {
    // Save social connections to user object and localStorage
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        socials: socials
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update current user context
      setCurrentUser(updatedUser);
    }
    
    setStep(Step.Complete);
  };

  // Interest categories for onboarding
  const interestCategories = [
    { category: "Technology", interests: ["Programming", "AI/ML", "Web Development", "Mobile Apps", "Gaming", "Cybersecurity"] },
    { category: "Sports & Fitness", interests: ["Running", "Gym", "Yoga", "Basketball", "Soccer", "Swimming", "Hiking"] },
    { category: "Arts & Culture", interests: ["Photography", "Music", "Painting", "Dance", "Theater", "Museums", "Literature"] },
    { category: "Food & Cooking", interests: ["Cooking", "Baking", "Restaurants", "Wine", "Coffee", "Vegan", "BBQ"] },
    { category: "Travel & Adventure", interests: ["Backpacking", "Road Trips", "International Travel", "Camping", "Sightseeing"] },
    { category: "Business & Career", interests: ["Entrepreneurship", "Marketing", "Finance", "Networking", "Leadership"] }
  ];

  // Social platforms for onboarding
  const platforms = [
    "Facebook", "Instagram", "Twitter/X", "TikTok", "Snapchat",
    "LinkedIn", "YouTube", "Reddit", "Pinterest", "Threads", "BeReal"
  ];

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Social connection helpers
  const connectSocialPlatform = (platform: string, method: 'manual' | 'oauth') => {
    setSocialConnections(prev => ({
      ...prev,
      [platform]: {
        connected: true,
        method,
        username: method === 'manual' ? '' : undefined
      }
    }));
  };

  const disconnectSocialPlatform = (platform: string) => {
    setSocialConnections(prev => ({
      ...prev,
      [platform]: {
        connected: false,
        method: null,
        username: undefined
      }
    }));
    // Also clear from socials state
    setSocials(prev => {
      const newSocials = { ...prev };
      delete newSocials[platform];
      return newSocials;
    });
  };

  const updateSocialUsername = (platform: string, username: string) => {
    setSocialConnections(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        username
      }
    }));
    setSocials(prev => ({
      ...prev,
      [platform]: username
    }));
  };

  const handleOAuthConnect = async (platform: string) => {
    // In a real app, this would redirect to OAuth provider
    alert(`This would redirect to ${platform} OAuth. For demo, we'll simulate success.`);
    
    // Simulate OAuth success
    setSocialConnections(prev => ({
      ...prev,
      [platform]: {
        connected: true,
        method: 'oauth',
        username: `@${platform.toLowerCase()}_user_${Math.floor(Math.random() * 1000)}`
      }
    }));
    
    setSocials(prev => ({
      ...prev,
      [platform]: `@${platform.toLowerCase()}_user_${Math.floor(Math.random() * 1000)}`
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Progress Bar (width matches continue button) */}
      {getProgressInfo().shouldShowProgress && (
        <div className="w-full max-w-xs mb-6 flex flex-col items-center">
          <div className="flex justify-between text-sm text-secondary mb-2 w-full">
            <span>Step {getProgressInfo().currentStepNumber} of {getProgressInfo().totalSteps}</span>
            <span>{getProgressInfo().progressPercentage}%</span>
          </div>
          <div className="w-full" style={{ maxWidth: 320 }}>
            <div className="bg-gray-200 rounded-full h-2 w-full">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getProgressInfo().progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-xs text-secondary mt-2 text-center">
            {getProgressInfo().currentStepLabel}
          </div>
        </div>
      )}

      {error && (
        <div className="w-full max-w-xs mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {step === Step.Landing && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🌟</div>
            <div className="text-h1 font-bold mb-4 text-primary">Welcome to Scoop Socials</div>
            <div className="text-body2 text-secondary mb-6">
              Connect with trusted friends, discover amazing events, and build meaningful relationships.
            </div>
          </div>
          <button 
            className="btn btn-primary w-full py-3 disabled:opacity-50" 
            onClick={() => { setMode("signIn"); setStep(Step.PhoneEntry); }}
            disabled={loading}
          >
            Sign In
          </button>
          <button 
            className="btn btn-outline w-full py-3 disabled:opacity-50" 
            onClick={() => { setMode("signUp"); setStep(Step.PhoneEntry); }}
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      )}

      {step === Step.PhoneEntry && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-h2 font-semibold text-primary">
              {mode === "signIn" ? "Sign In" : "Create Account"}
            </div>
            <div className="text-body2 text-secondary">
              {mode === "signIn" 
                ? "Enter your phone number to continue" 
                : "Let's start by verifying your phone number"
              }
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              className="input w-1/3"
              value={country}
              onChange={e => setCountry(e.target.value as CountryCode)}
              disabled={loading}
            >
              {countryOptions.map(opt => (
                <option key={opt.code} value={opt.code}>
                  +{opt.callingCode} {opt.code}
                </option>
              ))}
            </select>
            <input
              className="input w-2/3"
              placeholder="Phone Number"
              value={localNumber}
              onChange={e => setLocalNumber(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              maxLength={15}
            />
          </div>
          <button 
            className="btn btn-primary w-full py-3 disabled:opacity-50" 
            onClick={handleSendSMS}
            disabled={loading}
            style={{ maxWidth: 320 }}
          >
            {loading ? "Sending..." : "Continue"}
          </button>
        </div>
      )}

      {step === Step.SMSVerification && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🔐</div>
            <div className="text-h2 font-semibold text-primary">Verify SMS</div>
            <div className="text-body2 text-secondary">
              Enter the 6-digit code sent to your phone
            </div>
          </div>
          <input
            className="input w-full tracking-widest text-center text-xl"
            placeholder="123456"
            value={sms}
            onChange={e => setSms(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            disabled={loading}
          />
          <button 
            className="btn btn-primary w-full py-3 disabled:opacity-50" 
            onClick={handleVerifySMS}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </div>
      )}

      {step === Step.SignInSuccess && (
        <div className="w-full max-w-xs text-center space-y-4">
          <div className="text-4xl">✅</div>
          <div className="text-h2 font-semibold text-primary">Sign In Successful!</div>
          <div className="text-secondary">Redirecting to your dashboard...</div>
        </div>
      )}

      {step === Step.ProfileCreation && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-h2 font-semibold text-primary">Create Your Profile</div>
            <div className="text-body2 text-secondary">
              Tell us a bit about yourself
            </div>
          </div>
          <input
            className="input w-full"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
          <input
            className="input w-full"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            className="input w-full"
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <textarea
            className="input w-full"
            placeholder="Tell us about yourself (optional)"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            disabled={loading}
          />
          <button 
            className="btn btn-primary w-full py-3 disabled:opacity-50" 
            onClick={handleProfile}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Continue"}
          </button>
        </div>
      )}

      {step === Step.InterestsOnboarding && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-h2 font-semibold text-primary">What interests you?</div>
            <div className="text-body2 text-secondary">
              Select your interests to help us personalize your experience
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {interestCategories.map(category => (
              <div key={category.category} className="space-y-2">
                <h4 className="font-semibold text-primary">{category.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.interests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        interests.includes(interest)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button 
            className="btn btn-primary w-full py-3" 
            onClick={handleInterests}
          >
            Continue ({interests.length} selected)
          </button>
        </div>
      )}

      {step === Step.SocialOnboarding && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-h2 font-semibold text-primary">Connect Social Media</div>
            <div className="text-body2 text-secondary">
              Add your social media accounts (optional)
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {platforms.slice(0, 6).map((platform) => {
              const connection = socialConnections[platform];
              const isConnected = connection?.connected;
              
              return (
                <div key={platform} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary">{platform}</span>
                    {isConnected && (
                      <button
                        onClick={() => disconnectSocialPlatform(platform)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                  
                  {!isConnected ? (
                    <div className="space-y-2">
                      <div className="text-sm text-secondary mb-2">
                        Choose how to connect your {platform} account:
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => connectSocialPlatform(platform, 'manual')}
                          className="btn btn-outline flex-1 py-2 text-sm"
                        >
                          Enter Username
                        </button>
                        <button
                          onClick={() => handleOAuthConnect(platform)}
                          className="btn btn-primary flex-1 py-2 text-sm"
                        >
                          Connect with {platform}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-secondary">Connected via:</span>
                        <span className="text-sm font-medium text-primary">
                          {connection.method === 'oauth' ? 'OAuth' : 'Manual'}
                        </span>
                      </div>
                      
                      {connection.method === 'manual' ? (
                        <input
                          className="input w-full text-sm"
                          placeholder={`Enter your ${platform} username`}
                          value={connection.username || ''}
                          onChange={e => updateSocialUsername(platform, e.target.value)}
                        />
                      ) : (
                        <div className="text-sm text-secondary">
                          Username: {connection.username}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="btn btn-outline flex-1 py-2" 
              onClick={handleSocials}
            >
              Skip for now
            </button>
            <button 
              className="btn btn-primary flex-1 py-3" 
              onClick={handleSocials}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === Step.FriendsOnboarding && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-h2 font-semibold text-primary">Connect with Friends</div>
            <div className="text-body2 text-secondary">
              Find friends who are already on ScoopSocials
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📱</div>
              <div className="font-semibold text-primary mb-2">Connect Your Contacts</div>
              <div className="text-sm text-secondary mb-4">
                We'll help you find friends from your phone contacts who are already using ScoopSocials
              </div>
              <button 
                className="btn btn-primary w-full py-3"
                onClick={() => {
                  // In a real app, this would request contacts permission
                  alert('This would request contacts permission and find friends on ScoopSocials');
                  handleFriends();
                }}
              >
                Connect Contacts
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-secondary mb-2">Or</div>
              <button 
                className="btn btn-outline w-full py-2"
                onClick={handleFriends}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {step === Step.Complete && (
        <div className="w-full max-w-xs text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <div className="text-h2 font-semibold text-primary">Welcome to ScoopSocials!</div>
          <div className="text-secondary">Your account is ready. Redirecting...</div>
        </div>
      )}
    </div>
  );
} 