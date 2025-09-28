
// This is a partial update to handle non-UUID module IDs and fix user_id issue
import { supabase } from '@/integrations/supabase/client';
import { ModuleContent } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

// Helper to check if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper to ensure we have a valid content ID for special cases
const getContentIdForModule = (moduleId: string): string => {
  // If the module ID starts with 'course-quiz-', we'll create a deterministic UUID
  if (moduleId.startsWith('course-quiz-')) {
    // Create a deterministic UUID
    return uuidv4();
  }
  
  // If it's already a valid UUID, use it directly
  if (isValidUUID(moduleId)) {
    return moduleId;
  }
  
  // For other non-UUID module IDs, derive a UUID from them
  return uuidv4();
};

// Helper to convert JSON from database to VisualContent array
const convertJsonToVisualContent = (json: Json | null): ModuleContent['visualContent'] => {
  if (!json) return [];
  
  try {
    if (Array.isArray(json)) {
      return json.map(item => {
        // Ensure each item has the required 'type' field
        if (typeof item === 'object' && item !== null && 'type' in item) {
          // Use type assertion with a check for required properties
          const visualItem = item as Record<string, any>;
          if (typeof visualItem.type === 'string') {
            return {
              type: visualItem.type as 'mermaid' | 'url' | 'excalidraw',
              diagram: visualItem.diagram?.toString(),
              url: visualItem.url?.toString(),
              title: visualItem.title?.toString(),
              description: visualItem.description?.toString()
            };
          }
        }
        // Skip items that don't match the expected structure
        return null;
      }).filter(Boolean) as ModuleContent['visualContent'];
    }
  } catch (error) {
    console.error('Error converting JSON to VisualContent:', error);
  }
  
  return [];
};

// Helper to safely convert VisualContent array to JSON for database storage
const convertVisualContentToJson = (visualContent: ModuleContent['visualContent']): Json => {
  if (!visualContent || !Array.isArray(visualContent)) return [] as Json;
  
  try {
    // Convert each VisualContent item to a plain object
    const jsonArray = visualContent.map(item => {
      return {
        type: item.type,
        diagram: item.diagram || null,
        url: item.url || null,
        title: item.title || null,
        description: item.description || null
      };
    });
    
    return jsonArray as Json;
  } catch (error) {
    console.error('Error converting VisualContent to JSON:', error);
    return [] as Json;
  }
};

// Get current user ID from session
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      console.log('No active session found');
      return null;
    }
    return data.session.user.id;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
};

// Fetch module content by module ID
export const fetchModuleContent = async (moduleId: string): Promise<ModuleContent | null> => {
  try {
    console.log('Fetching module content for module:', moduleId);
    
    // Use the helper function to get a valid content ID
    const contentId = getContentIdForModule(moduleId);
    console.log((await getCurrentUserId()).valueOf());
    const { data, error } = await supabase
      .from('module_content')
      .select('*')
      .eq('module_id', contentId)
      .eq('user_id', (await getCurrentUserId()).valueOf()) // Ensure we only fetch content for the current user
      .maybeSingle(); // Use maybeSingle to prevent errors if no record exists
    
    if (error) {
      console.error('Error fetching module content:', error);
      return null;
    }
    
    if (!data) {
      console.log('No content found for module:', moduleId);
      return null;
    }
    
    const moduleContent: ModuleContent = {
      id: data.id,
      moduleId: data.module_id,
      content: data.content || '',
      textualContent: data.textual_content || '',
      visualContent: convertJsonToVisualContent(data.visual_content),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('Retrieved module content:', moduleContent);
    return moduleContent;
  } catch (error) {
    console.error('Exception in fetchModuleContent:', error);
    return null;
  }
};

// Create module content
export const createModuleContent = async (
  moduleId: string, 
  content: string, 
  textualContent: string, 
  visualContent: ModuleContent['visualContent']
): Promise<ModuleContent | null> => {
  try {
    console.log('Creating module content for module:', moduleId);
    
    // Use the helper function to get a valid content ID
    const contentId = getContentIdForModule(moduleId);
    
    // Get current user ID from session
    const userId = await getCurrentUserId();
    console.log('Current user ID for content creation:', userId);
    
    const { data, error } = await supabase
      .from('module_content')
      .insert({
        module_id: contentId,
        content: content,
        textual_content: textualContent,
        visual_content: convertVisualContentToJson(visualContent),
        user_id: userId, // Add user_id from current session
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating module content:', error);
      return null;
    }
    
    const moduleContent: ModuleContent = {
      id: data.id,
      moduleId: data.module_id,
      content: data.content || '',
      textualContent: data.textual_content || '',
      visualContent: convertJsonToVisualContent(data.visual_content),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('Created module content:', moduleContent);
    return moduleContent;
  } catch (error) {
    console.error('Exception in createModuleContent:', error);
    return null;
  }
};

// Update module content
export const updateModuleContent = async (
  moduleId: string, 
  content: string, 
  textualContent: string, 
  visualContent: ModuleContent['visualContent']
): Promise<ModuleContent | null> => {
  try {
    console.log('Updating module content for module:', moduleId);
    
    // Use the helper function to get a valid content ID
    const contentId = getContentIdForModule(moduleId);
    
    // Get current user ID from session
    const userId = await getCurrentUserId();
    console.log('Current user ID for content update:', userId);
    
    // First, fetch the existing content to get its ID
    const { data: existingData, error: fetchError } = await supabase
      .from('module_content')
      .select('id')
      .eq('module_id', contentId)
      .maybeSingle();  // Use maybeSingle instead of single to avoid errors when no record exists
    
    if (fetchError) {
      console.error('Error fetching existing module content:', fetchError);
      return null;
    }
    
    if (!existingData) {
      console.log('No existing content found for module:', moduleId);
      return null;
    }
    
    const { data, error } = await supabase
      .from('module_content')
      .update({
        content: content,
        textual_content: textualContent,
        visual_content: convertVisualContentToJson(visualContent),
        user_id: userId, // Update user_id from current session
        updated_at: new Date().toISOString()
      })
      .eq('id', existingData.id)
      .eq('user_id', userId) // Ensure we only update content for the current user
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating module content:', error);
      return null;
    }
    
    const moduleContent: ModuleContent = {
      id: data.id,
      moduleId: data.module_id,
      content: data.content || '',
      textualContent: data.textual_content || '',
      visualContent: convertJsonToVisualContent(data.visual_content),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('Updated module content:', moduleContent);
    return moduleContent;
  } catch (error) {
    console.error('Exception in updateModuleContent:', error);
    return null;
  }
};

// Save module content (create or update)
export const saveModuleContent = async (
  moduleId: string,
  content: string,
  textualContent: string,
  visualContent: ModuleContent['visualContent']
): Promise<ModuleContent | null> => {
  try {
    console.log('Saving module content for module:', moduleId);
    
    // Use the helper function to get a valid content ID
    const contentId = getContentIdForModule(moduleId);
    
    // Check if content already exists
    const { data, error: fetchError } = await supabase
      .from('module_content')
      .select('id')
      .eq('module_id', contentId)
      .eq('user_id', (await getCurrentUserId()).valueOf()) // Ensure we only check content for the current user
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing module content:', fetchError);
      return null;
    }
    
    if (data) {
      // Update existing content
      return updateModuleContent(moduleId, content, textualContent, visualContent);
    } else {
      // Create new content
      return createModuleContent(moduleId, content, textualContent, visualContent);
    }
  } catch (error) {
    console.error('Exception in saveModuleContent:', error);
    return null;
  }
};
