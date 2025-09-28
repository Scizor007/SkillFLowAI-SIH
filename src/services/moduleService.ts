
import { supabase } from '@/integrations/supabase/client';
import { Module } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Transform database module to our Module type
const transformModule = (dbModule: any): Module => {
  return {
    id: dbModule.id,
    title: dbModule.title,
    course_id: dbModule.course_id,
    courseId: dbModule.course_id, // Add alias
    order: dbModule.order,
    orderNum: dbModule.order, // Add alias
    type: dbModule.type || 'mixed',
    description: dbModule.description || `Module ${dbModule.order}`, // Ensure a description exists
    createdAt: dbModule.created_at,
    updatedAt: dbModule.updated_at,
    created_at: dbModule.created_at,
    updated_at: dbModule.updated_at
  };
};

// Fetch all modules for a course
export const fetchModules = async (courseId: string): Promise<Module[]> => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });
    
    if (error) {
      console.error('Error fetching modules:', error);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // Transform the data to match our Module type
    return data.map(transformModule);
  } catch (error) {
    console.error('Exception in fetchModules:', error);
    return [];
  }
};

// Fetch a single module by ID
export const fetchModule = async (moduleId: string): Promise<Module | null> => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();
    
    if (error) {
      console.error('Error fetching module:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform the data to match our Module type
    return transformModule(data);
  } catch (error) {
    console.error('Exception in fetchModule:', error);
    return null;
  }
};

// Create a new module
export const createModule = async (
  courseId: string,
  title: string,
  orderNum: number,
  type: 'visual' | 'textual' | 'mixed' = 'mixed',
  description?: string
): Promise<Module | null> => {
  try {
    const moduleId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('modules')
      .insert({
        id: moduleId,
        course_id: courseId,
        title,
        order: orderNum,
        type,
        description: description || `Module ${orderNum}: ${title}`, // Use provided description or generate default
        created_at: timestamp,
        updated_at: timestamp
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating module:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform the data to match our Module type
    return transformModule(data);
  } catch (error) {
    console.error('Exception in createModule:', error);
    return null;
  }
};

// Update a module
export const updateModule = async (
  moduleId: string, 
  moduleData: Partial<Omit<Module, 'id' | 'course_id' | 'created_at' | 'updated_at'>>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('modules')
      .update({
        ...moduleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId);
    
    if (error) {
      console.error('Error updating module:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in updateModule:', error);
    return false;
  }
};

// Delete a module
export const deleteModule = async (moduleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);
    
    if (error) {
      console.error('Error deleting module:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in deleteModule:', error);
    return false;
  }
};

// Synchronize modules from course_modules JSON to modules table
export const syncModulesToModuleTable = async (courseId: string, courseModules: any[]): Promise<boolean> => {
  try {
    console.log(`Syncing ${courseModules.length} modules for course ${courseId}`);
    
    // Create each module in the modules table
    for (let i = 0; i < courseModules.length; i++) {
      const moduleData = courseModules[i];
      await createModule(
        courseId,
        moduleData.title || `Module ${i + 1}`,
        i + 1,
        'mixed',
        moduleData.description || `Module ${i + 1}: ${moduleData.title}`
      );
    }
    
    console.log('Module synchronization complete');
    return true;
  } catch (error) {
    console.error('Error in syncModulesToModuleTable:', error);
    return false;
  }
};

// Check if modules exist for a course
export const checkModulesExist = async (courseId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);
    
    if (error) {
      console.error('Error checking if modules exist:', error);
      return false;
    }
    
    return count > 0;
  } catch (error) {
    console.error('Exception in checkModulesExist:', error);
    return false;
  }
};
