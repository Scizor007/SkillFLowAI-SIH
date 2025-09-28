
import { Course } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

/**
 * Helper function to safely convert a string to a number
 * Returns the parsed number or null if invalid
 */
const safelyConvertToNumber = (value: string): number | null => {
  const parsed = Number(value);
  return !isNaN(parsed) ? parsed : null;
};

const getStoredData = <T>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

export const jsonArrayToStringArray = (jsonArray: Json | null): string[] => {
  if (!jsonArray) return [];
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => String(item));
  }
  return [];
};

export const createCourse = async (
  courseData: Omit<Course, 'id' | 'creatorId' | 'creatorName' | 'viewCount' | 'createdAt' | 'updatedAt'>, 
  creatorId: string,
  creatorName: string
): Promise<Course | null> => {
  try {
    console.log("Creating course with data:", courseData);
    
    // Ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('User is not authenticated');
      return null;
    }
    
    const { data, error } = await supabase
      .from('Courses_Table')
      .insert({
        c_name: courseData.title,
        description: courseData.description,
        content_prompt: courseData.systemPrompt,
        skill_offered: courseData.skillsOffered,
        cover_image: courseData.coverImage,
        enrolled_count: 0,
        creator_id: creatorId,
        creator_name: creatorName,
        created_at: new Date().toISOString(),
        

      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course in Supabase:', error);
      toast.error('Failed to save course to database');
      
      // Create a fallback course for local storage
      const tempCourse: Course = {
        id: uuidv4(),
        title: courseData.title,
        description: courseData.description,
        coverImage: courseData.coverImage,
        skillsOffered: courseData.skillsOffered,
        creatorId: creatorId,
        creatorName: creatorName,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        systemPrompt: courseData.systemPrompt
      };
      
      const courses = getStoredData<Course[]>('courses', []);
      const updatedCourses = [...courses, tempCourse];
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      
      const userCourses = getStoredData<Course[]>('userCourses', []);
      const updatedUserCourses = [...userCourses, tempCourse];
      localStorage.setItem('userCourses', JSON.stringify(updatedUserCourses));
      
      return tempCourse;
    } else {
      console.log('Course created successfully in Supabase:', data);
      
      // Transform the response into a Course object
      const createdCourse: Course = {
        id: String(data.id),
        title: data.c_name || '',
        description: data.description || '',
        coverImage: data.cover_image || '/placeholder.svg',
        creatorId: data.creator_id || '',
        creatorName: data.creator_name || '',
        skillsOffered: Array.isArray(data.skill_offered) 
          ? jsonArrayToStringArray(data.skill_offered)
          : [],
        viewCount: data.enrolled_count || 0,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.created_at || new Date().toISOString(), // Using created_at since updated_at might not exist
        systemPrompt: data.content_prompt || ''
      };
      
      toast.success('Course created and saved to database');
      return createdCourse;
    }
  } catch (error) {
    console.error('Unexpected error creating course:', error);
    toast.error('Something went wrong while creating the course');
    throw error;
  }
};

export const fetchAllCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from('Courses_Table')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching courses from Supabase:', error);
      toast.error('Failed to load courses from database');
      
      const storedCourses = localStorage.getItem('courses');
      return storedCourses ? JSON.parse(storedCourses) : [];
    }
    
    const courses: Course[] = data.map(course => ({
      id: String(course.id),
      title: course.c_name || '',
      description: course.content_prompt || '',
      coverImage: course.cover_image || '/placeholder.svg',
      creatorId: course.creator_id || 'unknown',
      creatorName: course.creator_name || 'SkillFlowAI User',
      skillsOffered: jsonArrayToStringArray(course.skill_offered),
      viewCount: course.enrolled_count || 0,
      createdAt: course.created_at,
      updatedAt: course.created_at, // Using created_at as fallback
      systemPrompt: course.content_prompt || ''
    }));
    
    return courses;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    toast.error('Failed to load courses');
    return [];
  }
};

export const enrollInCourse = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to enroll user ${userId} in course ${courseId}`);
    
    // Parse courseId to number for database query
    const numericCourseId = safelyConvertToNumber(courseId);
    
    if (numericCourseId === null) {
      console.error('Invalid course ID - must be a number', courseId);
      toast.error('Invalid course ID');
      return false;
    }
    
    // First check if the user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', numericCourseId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking enrollment:', checkError);
      toast.error(`Error checking enrollment: ${checkError.message}`);
      return false;
    }
    
    if (existingEnrollment) {
      console.log('User already enrolled in this course');
      toast.info('You are already enrolled in this course');
      return true;
    }
    
    // Create a new enrollment record in user_course_progress
    const { error } = await supabase
      .from('user_course_progress')
      .insert({
        user_id: userId,
        course_id: numericCourseId, // Use the numeric ID
        last_accessed: new Date().toISOString(),
        completed_module_ids: [],
        quiz_scores: {}
      });
    
    if (error) {
      console.error('Error enrolling in course in Supabase:', error);
      toast.error(`Failed to enroll: ${error.message}`);
      
      // Fallback to local storage
      const enrollments = getStoredData<any[]>('userEnrollments', []);
      
      const newEnrollment = {
        userId,
        courseId,
        completedModules: [],
        quizScores: {},
        lastAccessed: new Date().toISOString(),
      };
      
      const updatedEnrollments = [...enrollments, newEnrollment];
      localStorage.setItem('userEnrollments', JSON.stringify(updatedEnrollments));
      return false;
    } else {
      try {
        // Increment enrolled count on the course
        const { data: courseData } = await supabase
          .from('Courses_Table')
          .select('enrolled_count')
          .eq('id', numericCourseId)
          .single();
          
        if (courseData) {
          const currentCount = courseData.enrolled_count || 0;
          
          await supabase
            .from('Courses_Table')
            .update({ enrolled_count: currentCount + 1 })
            .eq('id', numericCourseId);
        }
        
        // Update Learner_Profile to add the course ID to Courses_Enrolled array
        const { data: learnerProfile, error: profileError } = await supabase
          .from('Learner_Profile')
          .select('Courses_Enrolled')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching learner profile:', profileError);
        } else {
          // Extract the existing enrolled courses array, ensuring we get a proper array
          let coursesEnrolled: number[] = [];
          
          if (learnerProfile && learnerProfile.Courses_Enrolled) {
            // Convert to an array of numbers
            if (Array.isArray(learnerProfile.Courses_Enrolled)) {
              coursesEnrolled = safelyConvertToNumbers(learnerProfile.Courses_Enrolled);
            }
          }
          
          // Add the new course ID if it's not already in the array
          if (!coursesEnrolled.includes(numericCourseId)) {
            coursesEnrolled.push(numericCourseId);
            
            if (learnerProfile) {
              const { error: updateError } = await supabase
                .from('Learner_Profile')
                .update({ Courses_Enrolled: coursesEnrolled })
                .eq('user_id', userId);
              
              if (updateError) {
                console.error('Error updating learner profile:', updateError);
              }
            } else {
              const { error: insertError } = await supabase
                .from('Learner_Profile')
                .insert({
                  user_id: userId,
                  Courses_Enrolled: coursesEnrolled
                });
              
              if (insertError) {
                console.error('Error creating learner profile:', insertError);
              }
            }
          }
        }
        
        // Also update the profiles table courses_enrolled
        const { data: profileData, error: profilesError } = await supabase
          .from('profiles')
          .select('courses_enrolled')
          .eq('id', userId)
          .maybeSingle();
        
        if (!profilesError && profileData) {
          let profileCoursesEnrolled: number[] = [];
          
          if (profileData.courses_enrolled) {
            // Convert to an array of numbers
            if (Array.isArray(profileData.courses_enrolled)) {
              profileCoursesEnrolled = safelyConvertToNumbers(profileData.courses_enrolled);
            }
          }
          
          if (!profileCoursesEnrolled.includes(numericCourseId)) {
            profileCoursesEnrolled.push(numericCourseId);
            
            const { error: updateProfileError } = await supabase
              .from('profiles')
              .update({ courses_enrolled: profileCoursesEnrolled })
              .eq('id', userId);
              
            if (updateProfileError) {
              console.error('Error updating profiles courses_enrolled:', updateProfileError);
            }
          }
        }
        
        toast.success('Successfully enrolled in the course');
        return true;
      } catch (incrementError) {
        console.error('Error incrementing enrolled count:', incrementError);
      }
    }
  } catch (error) {
    console.error('Error enrolling in course:', error);
    toast.error('Failed to enroll in the course');
    return false;
  }
};

export const updateModuleProgress = async (
  userId: string, 
  courseId: string, 
  moduleId: string, 
  completed: boolean
): Promise<boolean> => {
  try {
    // Convert courseId to number for database query
    const numericCourseId = safelyConvertToNumber(courseId);
    
    if (numericCourseId === null) {
      console.error('Invalid course ID - must be a number', courseId);
      toast.error('Invalid course ID');
      return false;
    }
    
    const { data: progressData, error: getError } = await supabase
      .from('user_course_progress')
      .select('completed_module_ids')
      .eq('user_id', userId)
      .eq('course_id', numericCourseId)
      .maybeSingle();
    
    if (getError) {
      console.error('Error fetching module progress:', getError);
      return false;
    }
    
    let completedModules: string[] = progressData?.completed_module_ids || [];
    
    if (completed && !completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    } else if (!completed && completedModules.includes(moduleId)) {
      completedModules = completedModules.filter(id => id !== moduleId);
    }
    
    const { error: updateError } = await supabase
      .from('user_course_progress')
      .update({ 
        completed_module_ids: completedModules,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', numericCourseId);
    
    if (updateError) {
      console.error('Error updating module progress:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating module progress:', error);
    return false;
  }
};

export const updateQuizScore = async (
  userId: string,
  courseId: string,
  moduleId: string,
  score: number,
  visualScore: number,
  textualScore: number
): Promise<boolean> => {
  try {
    // Convert courseId to number for database query
    const numericCourseId = safelyConvertToNumber(courseId);
    
    if (numericCourseId === null) {
      console.error('Invalid course ID - must be a number', courseId);
      toast.error('Invalid course ID');
      return false;
    }
    
    const { data: progressData, error: getError } = await supabase
      .from('user_course_progress')
      .select('quiz_scores')
      .eq('user_id', userId)
      .eq('course_id', numericCourseId)
      .maybeSingle();
    
    if (getError) {
      console.error('Error fetching quiz scores:', getError);
      return false;
    }
    
    let quizScores = progressData?.quiz_scores || {};
    quizScores[moduleId] = score;
    
    const { error: updateError } = await supabase
      .from('user_course_progress')
      .update({ 
        quiz_scores: quizScores,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', numericCourseId);
    
    if (updateError) {
      console.error('Error updating quiz score:', updateError);
      return false;
    }
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        visual_points: visualScore,
        textual_points: textualScore
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating user profile learning points:', profileError);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating quiz score:', error);
    return false;
  }
};
