import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';
import { Module, ModuleContent as ModuleContentType, Quiz, Question } from '@/types';
import { toast } from 'sonner';
import anime from 'animejs';

// Custom hooks
import { useCourseModules } from '@/hooks/useCourseModules';
import { useCourseContentGenerator } from '@/hooks/useCourseContentGenerator';

// Course components
import CourseHeader from '@/components/course/CourseHeader';
import ModuleSidebar from '@/components/course/ModuleSidebar';
import ModuleContent from '@/components/course/ModuleContent';
import EmptyModuleState from '@/components/course/EmptyModuleState';
import CourseModules from '@/components/course/CourseModules';
import { fetchCourseById } from '@/services/courseService';
import { supabase } from '@/integrations/supabase/client';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { enrolledCourses, userCourses } = useUser();
  
  type CourseType = {
    id: string;
    title: string;
    description: string;
    skillsOffered: string[];
    coverImage: string;
    viewCount: number;
    courseModules: Module[];
    systemPrompt?: string;
  };

  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModuleList, setShowModuleList] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  
  // Use our hook for content generation
  const { 
    isLoading: contentLoading, 
    moduleContent, 
    getOrGenerateContent,
    error: contentError
  } = useCourseContentGenerator({
    onContentLoaded: (content) => {
      // If content was loaded successfully, we can clear any errors
      if (contentError) {
        setError(null);
      }
    }
  });

  const [error, setError] = useState<string | null>(null);
  
  // Fetch the course directly from the database if not found in enrolled or created courses
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        
        // First check if the course is in our enrolled or created courses
        const allCourses = [...enrolledCourses, ...userCourses];
        const foundCourse = allCourses.find(c => c.id === courseId);
        
        if (foundCourse) {
          setCourse({
            ...foundCourse,
            courseModules: foundCourse.courseModules || [],
          });
        } else {
          const fetchedCourse = await fetchCourseById(courseId);
          if (fetchedCourse) {
            setCourse({
              ...fetchedCourse,
              courseModules: fetchedCourse.courseModules || [],
            });
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId, enrolledCourses, userCourses]);

  // Add animation when the course loads
  useEffect(() => {
    if (!loading && course) {
      // Animate the course header
      anime({
        targets: '.course-header',
        translateY: [20, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 800,
        delay: 300
      });
      
      // Animate the content area
      anime({
        targets: '.course-content',
        translateY: [30, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 1000,
        delay: 500
      });
    }
  }, [loading, course]);

  // Initialize course modules hook only when both course and user are available
  const courseModules = useCourseModules({
    courseId: courseId || '',
    courseTitle: course?.title || '',
    courseDescription: course?.description || '',
    systemPrompt: course?.systemPrompt || '',
    userId: user?.id || '',
    userVisualPoints: user?.visualPoints || 0,
    userTextualPoints: user?.textualPoints || 0,
    userSkills: user?.skills || []
  });
  
  // Load modules when the course is loaded
  useEffect(() => {
    if (course && user) {
      courseModules.loadModules();
    }
  }, [course, user]);

  // Handle module selection with better error handling
  const onModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setError(null);
    
    // Regular module content loading
    try {
      await getOrGenerateContent(module);
      
      // Animate the module content
      anime({
        targets: '.module-content',
        translateX: [30, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 600
      });
    } catch (err) {
      console.error('Error selecting module:', err);
      setError('Failed to load module content. Please try again.');
    }
  };

  const [userPoints, setUserPoints] = useState({
    visualPoints: 0,
    textualPoints: 0
  });

  // Fetch user's latest points from the database
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('visual_points, textual_points')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user points:', error);
          return;
        }
        
        if (data) {
          setUserPoints({
            visualPoints: data.visual_points || 0,
            textualPoints: data.textual_points || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch user points:', err);
      }
    };
    
    fetchUserPoints();
  }, [user?.id]);

  // This handler will be called when points are updated in the ModuleContent component
  const handlePointsUpdated = (type: 'visual' | 'textual', points: number) => {
    setUserPoints(prev => ({
      ...prev,
      [type === 'visual' ? 'visualPoints' : 'textualPoints']: points
    }));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The course you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/home">
              <Button>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          {/* Course Header */}
          <div className="course-header opacity-0">
            <CourseHeader 
              title={course.title}
              description={course.description}
              skillsOffered={course.skillsOffered}
              coverImage={course.coverImage}
              viewCount={course.viewCount}
            />
          </div>
          
          {/* Module List / Content Toggle */}
          <div className="mb-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowModuleList(!showModuleList)}
            >
              {showModuleList ? 'View Interactive Content' : 'View Module List'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
              <p className="text-red-800 dark:text-red-300">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
          
          <div className="course-content opacity-0">
            {showModuleList ? (
              /* Course Modules List View */
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
                <CourseModules modules={courseModules.modules.length > 0 ? courseModules.modules : course.courseModules || []} />
              </div>
            ) : (
              /* Interactive Course View */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Module Sidebar */}
                <div className="md:col-span-1">
                  <ModuleSidebar 
                    modules={courseModules.modules.length > 0 ? courseModules.modules : course.courseModules || []}
                    selectedModuleId={selectedModule?.id || null}
                    onModuleSelect={onModuleSelect}
                    courseId={courseId}
                  />
                </div>
                
                {/* Module Content */}
                <div className="md:col-span-3">
                  <div className="module-content bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    {contentLoading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading module content...</p>
                      </div>
                    ) : moduleContent ? (
                      <ModuleContent 
                        title={selectedModule?.title || ''}
                        content={moduleContent}
                        visualPoints={userPoints.visualPoints}
                        textualPoints={userPoints.textualPoints}
                        onPointsUpdated={handlePointsUpdated}
                      />
                    ) : (
                      <EmptyModuleState 
                        message="Select a module from the sidebar to view its content."
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
