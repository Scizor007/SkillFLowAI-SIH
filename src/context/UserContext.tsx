import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Course, User } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Define the shape of our User context
interface UserContextType {
  userCourses: Course[];
  enrolledCourses: Course[];
  loading: boolean;
  error: Error | null;
  refreshUserData: () => Promise<void>;
  updateUserSkills: (skills: string[]) => Promise<boolean>;
  // Include all required methods
  fetchEnrolledCourses: () => Promise<void>;
  fetchUserCourses: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  userCourses: [],
  enrolledCourses: [],
  loading: false,
  error: null,
  refreshUserData: async () => {},
  updateUserSkills: async () => false,
  // Add default implementations
  fetchEnrolledCourses: async () => {},
  fetchUserCourses: async () => {},
  updateUserProfile: async () => false,
});

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
 * Helper function to convert array to string array
 * Only converts string and number values, filtering out other types
 */
const convertToStringArray = (values: Json[]): string[] => {
  return values
    .filter((value): value is string | number | null => 
      typeof value === 'string' || 
      typeof value === 'number' || 
      value === null
    )
    .filter((value): value is string | number => value !== null)
    .map(value => String(value));
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Load user's created and enrolled courses
  const refreshUserData = async () => {
    if (!isAuthenticated || !user) {
      setUserCourses([]);
      setEnrolledCourses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Logic to fetch user's created courses
      const { data: createdCoursesData, error: createdCoursesError } = await supabase
        .from('Courses_Table')
        .select('*')
        .eq('creator_id', user.id);

      if (createdCoursesError) {
        throw new Error(`Error fetching created courses: ${createdCoursesError.message}`);
      }

      // Logic to fetch user's enrolled courses
      // First try to fetch from user_course_progress table which is more reliable
      const { data: progress, error: progressError } = await supabase
        .from('user_course_progress')
        .select('course_id')
        .eq('user_id', user.id);

      if (progressError) {
        throw new Error(`Error fetching enrolled courses: ${progressError.message}`);
      }

      let enrolledCourseIds: string[] = progress?.map(entry => String(entry.course_id)) || [];

      // As a fallback, try to fetch from Learner_Profile if we have no results
      if (enrolledCourseIds.length === 0) {
        try {
          const { data: learnerProfile } = await supabase
            .from('Learner_Profile')
            .select('Courses_Enrolled')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (learnerProfile && learnerProfile.Courses_Enrolled) {
            // Process the courses enrolled from the learner profile
            const rawEnrolledCourses = learnerProfile.Courses_Enrolled;
            if (Array.isArray(rawEnrolledCourses)) {
              // Safely convert the JSON array to string array, filtering out non-string/number values
              enrolledCourseIds = convertToStringArray(rawEnrolledCourses as Json[]);
            }
          }
        } catch (profileError) {
          console.error('Error fetching from Learner_Profile:', profileError);
          // Continue with empty array if this fallback fails
        }
      }

      // Fetch detailed course information
      let enrolledCoursesData: any[] = [];

      if (enrolledCourseIds.length > 0) {
        // Convert all courseIds to numbers where possible
        const numericIds = safelyConvertToNumbers(enrolledCourseIds);
        
        if (numericIds.length > 0) {
          const { data: coursesData, error: coursesError } = await supabase
            .from('Courses_Table')
            .select('*')
            .in('id', numericIds);

          if (coursesError) {
            throw new Error(`Error fetching enrolled course details: ${coursesError.message}`);
          }

          enrolledCoursesData = coursesData || [];
        }
      }

      // Transform the course data to match our Course type
      const transformCourseData = (courseData: any): Course => ({
        id: String(courseData.id),
        title: courseData.c_name || 'Untitled Course',
        description: courseData.description || '',
        coverImage: courseData.cover_image || '/placeholder.svg',
        creatorId: String(courseData.creator_id || ''),
        creatorName: courseData.creator_name || 'SkillFlowAI',
        skillsOffered: Array.isArray(courseData.skill_offered) 
          ? courseData.skill_offered.map((skill: any) => String(skill))
          : [],
        viewCount: courseData.enrolled_count || 0,
        createdAt: courseData.created_at || new Date().toISOString(),
        updatedAt: courseData.created_at || new Date().toISOString(),
        systemPrompt: courseData.content_prompt || ''
      });

      // Set the state with transformed data
      setUserCourses(createdCoursesData ? createdCoursesData.map(transformCourseData) : []);
      setEnrolledCourses(enrolledCoursesData.map(transformCourseData));
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  // Method to fetch enrolled courses - extract from refreshUserData to use separately
  const fetchEnrolledCourses = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      await refreshUserData();
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Method to fetch user's created courses - extract from refreshUserData to use separately
  const fetchUserCourses = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      await refreshUserData();
    } catch (err) {
      console.error('Error fetching user courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Update auth user metadata if needed
      if (userData.name || userData.skills) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { 
            name: userData.name || user.name,
            skills: userData.skills || user.skills,
          }
        });
        
        if (authError) {
          console.error('Error updating auth metadata:', authError);
          return false;
        }
      }
      
      // Update profiles table if needed
      if (userData.name || userData.skills) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: userData.name || user.name,
            skills: userData.skills || user.skills,
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error('Error updating profiles table:', profileError);
          return false;
        }
      }
      
      // Update Learner_Profile table if needed
      if (userData.name || userData.skills) {
        const { error: learnerError } = await supabase
          .from('Learner_Profile')
          .update({
            Name: userData.name || user.name,
            Skills: userData.skills || user.skills,
          })
          .eq('user_id', user.id);
          
        if (learnerError) {
          console.error('Error updating Learner_Profile:', learnerError);
          // Continue anyway, this is a fallback table
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error updating user profile:', err);
      return false;
    }
  };

  // Update user skills
  const updateUserSkills = async (skills: string[]): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Remove duplicates
      const uniqueSkills = [...new Set(skills)];
      
      // First try to update the profiles table (newer schema)
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({ skills: uniqueSkills })
        .eq('id', user.id);
        
      if (profilesError) {
        console.error('Error updating skills in profiles table:', profilesError);
        
        // Fallback to the Learner_Profile table
        const { error: learnerProfileError } = await supabase
          .from('Learner_Profile')
          .update({ Skills: uniqueSkills })
          .eq('user_id', user.id);
          
        if (learnerProfileError) {
          console.error('Error updating skills in Learner_Profile table:', learnerProfileError);
          return false;
        }
      }
      
      // Update user in context
      if (user) {
        user.skills = uniqueSkills;
      }
      
      return true;
    } catch (err) {
      console.error('Error updating user skills:', err);
      return false;
    }
  };

  // Load user data when the auth state changes
  useEffect(() => {
    refreshUserData();
  }, [isAuthenticated, user]);

  return (
    <UserContext.Provider
      value={{
        userCourses,
        enrolledCourses,
        loading,
        error,
        refreshUserData,
        fetchEnrolledCourses,
        fetchUserCourses,
        updateUserProfile,
        updateUserSkills
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
