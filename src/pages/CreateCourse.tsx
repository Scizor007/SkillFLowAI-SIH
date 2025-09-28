
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseCreationForm } from '@/components/forms/course-creation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const CreateCourse = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect non-authenticated users
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
            <ThemeToggle />
          </div>
          
          <p className="mt-2 mb-8 text-gray-600 dark:text-gray-400">
            Share your knowledge by creating a course that adapts to each learner's style.
          </p>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
            <CourseCreationForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateCourse;
