
import { Json } from '@/integrations/supabase/types';

// Helper to convert Json array to string array
export const jsonArrayToStringArray = (jsonArray: Json | null): string[] => {
  if (!jsonArray) return [];
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => String(item));
  }
  return [];
};
