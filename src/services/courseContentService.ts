
import { supabase } from '@/integrations/supabase/client';
import { Course, Module, ModuleContent, Question, Quiz } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { fetchCourseById, transformCourseData } from './courseService';
import { fetchModules, fetchModule, createModule, updateModule, deleteModule } from './moduleService';
import { fetchModuleContent, createModuleContent, updateModuleContent } from './contentService';
import { fetchQuiz, saveQuiz } from './quizService';
import { generateModules, generateModuleContent, generateQuiz } from './generationService';

// Expose the functions that are used by other modules
export {
  fetchCourseById,
  transformCourseData,
  fetchModules,
  fetchModule,
  createModule,
  updateModule,
  deleteModule,
  fetchModuleContent,
  createModuleContent,
  updateModuleContent,
  fetchQuiz,
  saveQuiz,
  generateModules,
  generateModuleContent,
  generateQuiz
};
