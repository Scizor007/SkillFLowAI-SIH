
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Course } from '@/types';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllCourses } from '@/services/api';
import { Json } from '@/integrations/supabase/types';

/**
 * Helper function to safely convert values to numbers
 * Only returns numbers, filtering out any non-numeric values
 */
const safelyConvertToNumbers = (values: any[]): number[] => {
  return values
    .map(value => {
      // Handle string numbers
      if (typeof value === 'string') {
        const parsed = Number(value);
        return !isNaN(parsed) ? parsed : null;
      }
      // Pass through numbers
      else if (typeof value === 'number') {
        return value;
      }
      // Filter out other types
      return null;
    })
    .filter((num): num is number => num !== null);
};

export const useDashboardCourses = (user: User | null, isAuthenticated: boolean) => {
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCoursesData = async () => {
      if (!isAuthenticated || !user) {
        setLoadingCourses(false);
        setUserCourses([]);
        setEnrolledCourses([]);
        setAllCourses([]);
        return;
      }
      
      try {
        setLoadingCourses(true);
        
        // Fetch all available courses
        const allCoursesData = await fetchAllCourses();
        setAllCourses(allCoursesData);
        
        // Fetch courses created by the user
        const { data: coursesData, error: coursesError } = await supabase
          .from('Courses_Table')
          .select('*')
          .eq('creator_id', user.id);
          
        if (coursesError) {
          console.error('Error fetching user courses:', coursesError);
          toast.error('Failed to load your courses');
        } else if (coursesData) {
          const transformedCourses: Course[] = coursesData.map(course => ({
            id: String(course.id),
            title: course.c_name || '',
            description: course.description || '',
            coverImage: course.cover_image || '/placeholder.svg',
            creatorId: user.id,
            creatorName: user.name || 'SkillFlowAI',
            skillsOffered: Array.isArray(course.skill_offered) 
              ? course.skill_offered.map((item: any) => String(item))
              : [],
            viewCount: course.enrolled_count || 0,
            createdAt: course.created_at,
            updatedAt: course.created_at,
            systemPrompt: course.content_prompt || ''
          }));
          
          setUserCourses(transformedCourses);
        }
        
        // Fetch enrolled courses - prioritize user_course_progress table as the source of truth
        const { data: progress, error: progressError } = await supabase
          .from('user_course_progress')
          .select('course_id')
          .eq('user_id', user.id);
        
        if (progressError) {
          console.error('Error fetching enrolled courses from progress table:', progressError);
        } else if (progress && progress.length > 0) {
          // Get IDs of courses the user is enrolled in 
          const enrolledCourseIds = progress.map(item => item.course_id);
          console.log('Found enrolled course IDs in progress table:', enrolledCourseIds);
          
          // Convert all IDs to numbers where possible
          const numericIds = safelyConvertToNumbers(enrolledCourseIds);
          
          if (numericIds.length > 0) {
            // Find the full course data for each enrolled course
            const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
              .from('Courses_Table')
              .select('*')
              .in('id', numericIds);
            
            if (enrolledCoursesError) {
              console.error('Error fetching enrolled course details:', enrolledCoursesError);
            } else if (enrolledCoursesData) {
              const transformedEnrolled: Course[] = enrolledCoursesData.map(course => ({
                id: String(course.id),
                title: course.c_name || '',
                description: course.description || '',
                coverImage: course.cover_image || '/placeholder.svg',
                creatorId: String(course.creator_id || ''),
                creatorName: course.creator_name || 'SkillFlowAI',
                skillsOffered: Array.isArray(course.skill_offered) 
                  ? course.skill_offered.map((item: any) => String(item))
                  : [],
                viewCount: course.enrolled_count || 0,
                createdAt: course.created_at,
                updatedAt: course.created_at,
                systemPrompt: course.content_prompt || ''
              }));
              
              setEnrolledCourses(transformedEnrolled);
            }
          }
        } else {
          // Fallback to Learner_Profile if no entries in user_course_progress
          console.log('No enrolled courses found in user_course_progress, checking Learner_Profile');
          
          const { data: learnerProfile, error: profileError } = await supabase
            .from('Learner_Profile')
            .select('Courses_Enrolled')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching learner profile:', profileError);
          } else if (learnerProfile && learnerProfile.Courses_Enrolled) {
            // Process the courses enrolled from the learner profile
            const rawCoursesEnrolled = learnerProfile.Courses_Enrolled;
            
            if (Array.isArray(rawCoursesEnrolled) && rawCoursesEnrolled.length > 0) {
              console.log('Found enrolled courses in Learner_Profile:', rawCoursesEnrolled);
              
              // Filter and convert to ensure we only have numeric values
              const numericIds = safelyConvertToNumbers(rawCoursesEnrolled);
              
              if (numericIds.length > 0) {
                // Get enrolled courses from Courses_Table
                const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
                  .from('Courses_Table')
                  .select('*')
                  .in('id', numericIds);
                
                if (enrolledCoursesError) {
                  console.error('Error fetching enrolled courses from Courses_Table:', enrolledCoursesError);
                } else if (enrolledCoursesData) {
                  const transformedEnrolled: Course[] = enrolledCoursesData.map(course => ({
                    id: String(course.id),
                    title: course.c_name || '',
                    description: course.description || '',
                    coverImage: course.cover_image || '/placeholder.svg',
                    creatorId: String(course.creator_id || ''),
                    creatorName: course.creator_name || 'SkillFlowAI',
                    skillsOffered: Array.isArray(course.skill_offered) 
                      ? course.skill_offered.map((item: any) => String(item))
                      : [],
                    viewCount: course.enrolled_count || 0,
                    createdAt: course.created_at,
                    updatedAt: course.created_at,
                    systemPrompt: course.content_prompt || ''
                  }));
                  
                  setEnrolledCourses(transformedEnrolled);
                }
              }
            }
          } else {
            setEnrolledCourses([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchCoursesData:', error);
        toast.error('Something went wrong while loading courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (isAuthenticated) {
      fetchCoursesData();
    } else {
      setLoadingCourses(false);
      setUserCourses([]);
      setEnrolledCourses([]);
      setAllCourses([]);
    }
  }, [isAuthenticated, user]);

  const getRecommendedCourses = () => {
    return allCourses.filter(course => 
      !enrolledCourses.some(ec => ec.id === course.id) &&
      !userCourses.some(uc => uc.id === course.id)
    ).slice(0, 3);
  };

  const isEnrolledInCourse = (courseId: string) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  return {
    loadingCourses,
    userCourses,
    enrolledCourses,
    recommendedCourses: getRecommendedCourses(),
    isEnrolledInCourse
  };
};
