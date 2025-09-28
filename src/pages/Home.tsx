import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { fetchAllCourses } from '@/services/api';
import { Course } from '@/types';
import CourseCard from '@/components/ui/CourseCard';
import { toast } from 'sonner';
import { useDashboardCourses } from '@/hooks/useDashboardCourses';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const { enrolledCourses, loadingCourses } = useDashboardCourses(user, isAuthenticated);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const courses = await fetchAllCourses();
        setAllCourses(courses);
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Get user's enrolled courses for the dashboard section
  const userEnrolledCourses = enrolledCourses.slice(0, 3);
  const isLoading = loading || loadingCourses;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold mb-4">
                Welcome{user ? ` back, ${user.name}` : ''}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user 
                  ? 'Continue your learning journey or explore new courses.'
                  : 'Explore our courses and start your learning journey.'}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              {user && (
                <Link to="/profile">
                  <Button variant="outline">My Profile</Button>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
          
          {/* Available Courses Section */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Available Courses</h2>
              {user && (
                <Link to="/profile" className="text-primary hover:underline flex items-center gap-2">
                  Go to Profile <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : allCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses.map((course, idx) => (
                  <div key={course.id} style={{ animationDelay: `${idx * 80}ms` }} className="animate-pop-up">
                    <CourseCard 
                      course={course} 
                      isEnrolled={enrolledCourses.some(ec => ec.id === course.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No courses available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  There are no courses available yet. Check back later or create your own course.
                </p>
                <Link to="/create-course">
                  <Button>
                    Create a Course
                  </Button>
                </Link>
              </div>
            )}
          </section>
          
          {/* Your Learning Section */}
          {user && userEnrolledCourses.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Your Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEnrolledCourses.map((course, idx) => (
                  <div key={course.id} style={{ animationDelay: `${idx * 80}ms` }} className="animate-pop-up">
                    <CourseCard course={course} isEnrolled={true} />
                  </div>
                ))}
                {userEnrolledCourses.length < enrolledCourses.length && (
                  <Link to="/profile" className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 h-full">
                    <div className="text-center">
                      <h3 className="text-xl font-medium mb-2">View All Courses</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You have {enrolledCourses.length - userEnrolledCourses.length} more enrolled courses
                      </p>
                      <Button variant="outline">Go to Profile</Button>
                    </div>
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
