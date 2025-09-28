
import { v4 as uuidv4 } from 'uuid';
import { Module, ModuleContent, Question, VisualContent } from '@/types';
import { createModule } from './moduleService';
import { createModuleContent } from './contentService';
import { saveQuiz } from './quizService';

// Generate module structure for a course
export const generateModules = async (courseId: string, moduleTitles: string[]): Promise<Module[]> => {
  const modules: Module[] = [];
  
  for (let i = 0; i < moduleTitles.length; i++) {
    const moduleType: 'visual' | 'textual' | 'mixed' = i % 2 === 0 ? 'visual' : 'textual';
    const module = await createModule(courseId, moduleTitles[i], i + 1, moduleType);
    
    if (module) {
      modules.push(module);
    }
  }
  
  return modules;
};

// Create simple placeholder content for a module
export const generateModuleContent = async (
  moduleId: string, 
  moduleTitle: string,
  moduleTopic: string,
  moduleType: 'visual' | 'textual' | 'mixed' = 'mixed'
): Promise<ModuleContent | null> => {
  try {
    // Create simple placeholder content
    const content = `Content for ${moduleTitle}: ${moduleTopic}`;
    const textualContent = `This is placeholder content for ${moduleTitle}. Real content would be added by course creators.`;
    
    // Create proper VisualContent array
    const visualContent: VisualContent[] = [
      {
        type: 'url',
        url: `https://placehold.co/600x400?text=${encodeURIComponent(moduleTitle)}`,
        title: `${moduleTitle} Placeholder`,
        description: 'Placeholder image for this module'
      }
    ];
    
    return createModuleContent(moduleId, content, textualContent, visualContent);
  } catch (error) {
    console.error('Error generating module content:', error);
    return null;
  }
};

// Create simple placeholder quiz for a module
export const generateQuiz = async (moduleId: string, moduleTitle: string): Promise<boolean> => {
  try {
    // Create placeholder questions
    const questions: Question[] = [
      {
        id: uuidv4(),
        text: `What is the main topic of ${moduleTitle}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        type: 'textual'
      },
      {
        id: uuidv4(),
        text: `What are the key concepts covered in ${moduleTitle}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option B',
        type: 'textual'
      }
    ];
    
    return saveQuiz(moduleId, questions);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return false;
  }
};
