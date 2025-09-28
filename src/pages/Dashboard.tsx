
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { PlusCircle, Lightbulb, BookOpen, GraduationCap } from 'lucide-react';
import CourseSection from '@/components/dashboard/CourseSection';
import { useDashboardCourses } from '@/hooks/useDashboardCourses';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { fetchEnrolledCourses, fetchUserCourses } = useUser();
  const { 
    loadingCourses, 
    userCourses, 
    enrolledCourses, 
    recommendedCourses 
  } = useDashboardCourses(user, isAuthenticated);
  
  // Call these for backward compatibility
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchEnrolledCourses();
      fetchUserCourses();
    }
  }, [isAuthenticated, fetchEnrolledCourses, fetchUserCourses]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {user?.name || 'Learner'}
              </h1>
              <p className="mt-1 text-gray-400">
                Continue your learning journey or create new courses
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Link to="/create-course">
                <Button className="group" size="lg">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>
          
          <CourseSection
            title="My Learning"
            icon={BookOpen}
            courses={enrolledCourses}
            loadingCourses={loadingCourses}
            emptyMessage="You haven't enrolled in any courses yet."
            emptyActionText="Explore Courses"
            emptyActionLink="/home"
            user={user}
          />
          
          <CourseSection
            title="My Courses"
            icon={Lightbulb}
            courses={userCourses}
            loadingCourses={loadingCourses}
            emptyMessage="You haven't created any courses yet."
            emptyActionText="Create Course"
            emptyActionLink="/create-course"
            user={user}
          />
          
          <CourseSection
            title="Recommended Courses"
            icon={GraduationCap}
            courses={recommendedCourses}
            loadingCourses={loadingCourses}
            emptyMessage="No recommended courses available yet."
            emptyActionText="Explore All Courses"
            emptyActionLink="/home"
            user={user}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
