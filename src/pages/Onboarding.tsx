
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfileForm from '@/components/forms/UserProfileForm';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const Onboarding = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect logged out users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us about yourself so we can personalize your learning experience.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
          <UserProfileForm />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
