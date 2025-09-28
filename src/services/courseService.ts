
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { jsonArrayToStringArray } from './utilService';
import { createModule, syncModulesToModuleTable, checkModulesExist } from './moduleService';

/**
 * Helper function to safely parse a string to a number
 * Returns the number if valid, null otherwise
 */
const parseNumericId = (id: string): number | null => {
  const numericId = parseInt(id);
  return !isNaN(numericId) ? numericId : null;
};

export const transformCourseData = (data: any): Course => {
  return {
    id: String(data.id || ''),
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
    updatedAt: data.updated_at || new Date().toISOString(),
    systemPrompt: data.content_prompt || '',
    courseModules: data.course_modules || []
  };
};

export const fetchCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    // Try to fetch by id - convert to number for Supabase query
    const numericId = parseNumericId(courseId);
    
    if (numericId === null) {
      console.error('Invalid course ID - must be a number:', courseId);
      return null;
    }
    
    let { data, error } = await supabase
      .from('Courses_Table')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching course:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Check if modules exist for this course in the modules table
    const modulesExist = await checkModulesExist(courseId);
    
    // If no modules exist but there are course_modules in the JSON, sync them to the modules table
    if (!modulesExist && data.course_modules && Array.isArray(data.course_modules) && data.course_modules.length > 0) {
      console.log(`Modules not found for course ${courseId}, syncing from course_modules JSON`);
      await syncModulesToModuleTable(courseId, data.course_modules);
    } else {
      console.log(`Modules already exist for course ${courseId}`);
    }
    
    return transformCourseData(data);
  } catch (error) {
    console.error('Exception fetching course:', error);
    return null;
  }
};

const createModulesInModuleTable = async (courseId: string, modules: any[]): Promise<void> => {
  try {
    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      console.log('No modules to create in module table');
      return;
    }
    
    console.log(`Creating ${modules.length} modules in module table for course ${courseId}`);
    
    for (let i = 0; i < modules.length; i++) {
      const moduleData = modules[i];
      await createModule(
        courseId,
        moduleData.title || `Module ${i + 1}`,
        i + 1,
        'mixed'
      );
    }
    
    console.log('Modules created successfully in module table');
  } catch (error) {
    console.error('Error creating modules in module table:', error);
  }
};

export const createCourseInDB = async (courseData: {
  title: string;
  description: string;
  coverImage: string;
  skillsOffered: string[];
  systemPrompt: string;
  creatorId: string;
  creatorName: string;
  courseModules?: any[];
}): Promise<Course | null> => {
  try {
    console.log("Creating course with data:", courseData);
    
    // Ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('User is not authenticated');
      return null;
    }
    
    // Make sure skillsOffered is an array for Supabase
    const skillsOfferedJson = courseData.skillsOffered as unknown as Json;
    
    const { data, error } = await supabase
      .from('Courses_Table')
      .insert({
        c_name: courseData.title,
        description: courseData.description,
        cover_image: courseData.coverImage,
        skill_offered: skillsOfferedJson,
        content_prompt: courseData.systemPrompt,
        creator_id: courseData.creatorId,
        creator_name: courseData.creatorName,
        enrolled_count: 0,
        course_modules: courseData.courseModules || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return null;
    }

    console.log("Course created successfully:", data);
    
    // Create modules in the module table
    if (data && data.id && courseData.courseModules) {
      console.log("Syncing modules to module table...");
      await syncModulesToModuleTable(String(data.id), courseData.courseModules);
    }
    
    return transformCourseData(data);
  } catch (error) {
    console.error('Exception creating course:', error);
    return null;
  }
};

export const fetchAllCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from('Courses_Table')
      .select('*');

    if (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map(course => transformCourseData(course));
  } catch (error) {
    console.error('Exception fetching all courses:', error);
    return [];
  }
};

export const updateCourseEnrolledCount = async (courseId: string): Promise<boolean> => {
  try {
    // Parse courseId to number for database query
    const numericId = parseNumericId(courseId);
    
    if (numericId === null) {
      console.error('Invalid course ID - must be a number:', courseId);
      return false;
    }
    
    // First get the current course to get the current enrolled_count
    const { data: courseData, error: fetchError } = await supabase
      .from('Courses_Table')
      .select('enrolled_count')
      .eq('id', numericId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching course enrolled count:', fetchError);
      return false;
    }
    
    const currentCount = courseData?.enrolled_count || 0;
    
    // Update the enrolled count
    const { error: updateError } = await supabase
      .from('Courses_Table')
      .update({
        enrolled_count: currentCount + 1
      })
      .eq('id', numericId);
      
    if (updateError) {
      console.error('Error updating course enrolled count:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating course enrolled count:', error);
    return false;
  }
};
