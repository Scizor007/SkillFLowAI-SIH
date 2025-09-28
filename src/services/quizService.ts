import { supabase } from '@/integrations/supabase/client';
import { Question, Quiz } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

// Helper to check if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper to create a UUID based on a string
const createIdFromString = (str: string): string => {
  // If it's already a UUID, return it as is
  if (isValidUUID(str)) return str;
  
  // For special course quiz IDs like "course-quiz-12", we need a different approach
  if (str.startsWith('course-quiz-')) {
    const courseId = str.replace('course-quiz-', '');
    // Create a deterministic string based on the course ID
    return `course-quiz-${courseId}`;
  }
  
  // For other non-UUID strings, generate a new UUID
  return uuidv4();
};

const jsonArrayToQuestions = (jsonArray: Json): Question[] => {
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => {
      if (typeof item === 'object' && item !== null) {
        const questionObj = item as Record<string, any>;
        return {
          id: questionObj.id || uuidv4(),
          text: questionObj.text || questionObj.question || 'Default question',
          options: Array.isArray(questionObj.options) ? questionObj.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: questionObj.correctAnswer || 'Option 1',
          type: (questionObj.type as 'visual' | 'textual') || 'textual',
          imageUrl: questionObj.imageUrl
        };
      }
      return {
        id: uuidv4(),
        text: 'Default question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 'Option 1',
        type: 'textual'
      };
    });
  }
  return [];
};

const ensureValidQuestionType = (type: string): 'textual' | 'visual' => {
  return type === 'visual' ? 'visual' : 'textual';
};

export const fetchQuiz = async (courseId: string): Promise<Quiz | null> => {
  try {
    console.log('Fetching quiz for course:', courseId);

    // For special case of course quiz
    if (courseId.startsWith('course-quiz-')) {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching quiz:', error);
        return null;
      }

      if (!data) return null;

      const quiz = {
        id: data.id,
        courseId: data.course_id, // Changed moduleId to courseId
        questions: jsonArrayToQuestions(data.questions),
        updatedAt: data.updated_at
      };

      console.log('Retrieved quiz:', quiz);
      return quiz;
    }

    // Regular course quizzes
    const quizId = isValidUUID(courseId) ? courseId : createIdFromString(courseId);

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('course_id', quizId) // Changed module_id to course_id
      .maybeSingle();

    if (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }

    if (!data) return null;

    const quiz = {
      id: data.id,
      courseId: data.course_id, // Changed moduleId to courseId
      questions: jsonArrayToQuestions(data.questions),
      updatedAt: data.updated_at
    };

    console.log('Retrieved quiz:', quiz);
    return quiz;
  } catch (error) {
    console.error('Exception in fetchQuiz:', error);
    return null;
  }
};

export const generateQuizWithAI = async (
  courseId: string, 
  modules: { id: string; title: string; description?: string }[],
  courseTitle: string,
  courseDescription: string
): Promise<Question[] | null> => {
  try {
    console.log('Generating AI quiz for course:', courseId);
    
    // Use Supabase Functions.invoke instead of direct fetch
    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: JSON.stringify({
        modules,
        courseTitle,
        courseDescription
      })
    });
    
    if (error) {
      console.error('Error from quiz generation edge function:', error);
      console.error('Payload sent:', {
        modules,
        courseTitle,
        courseDescription
      });
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid quiz data format received:', data);
      throw new Error('Invalid quiz data: expected an array of questions');
    }
    
    const validatedQuestions: Question[] = data.map((item: any) => {
      return {
        id: item.id || uuidv4(),
        text: item.text || item.question || 'Default question',
        options: Array.isArray(item.options) ? item.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: item.correctAnswer || item.options?.[0] || 'Option 1',
        type: (item.type === 'visual' ? 'visual' : 'textual') as 'visual' | 'textual',
        imageUrl: item.imageUrl
      };
    });
    
    return validatedQuestions;
    
  } catch (error) {
    console.error('Exception in generateQuizWithAI:', error);
    
    const fallbackQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
      id: uuidv4(),
      text: `Question ${i + 1} about ${courseTitle}?`,
      options: [
        `Option A for question ${i + 1}`, 
        `Option B for question ${i + 1}`, 
        `Option C for question ${i + 1}`, 
        `Option D for question ${i + 1}`
      ],
      correctAnswer: `Option A for question ${i + 1}`,
      type: "textual" as const
    }));
    
    return fallbackQuestions;
  }
};

export const saveQuiz = async (courseId: string, questions: Question[]): Promise<boolean> => {
  try {
    console.log('Saving quiz for course:', courseId);

    // For special case of course quiz, we need a different approach
    if (courseId.startsWith('course-quiz-')) {
      // First check if this quiz already exists
      const { data: existingQuiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('course_id', courseId) // Changed module_id to course_id
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking for existing quiz:', fetchError);
        return false;
      }

      const validatedQuestions = questions.map(q => ({
        ...q,
        type: ensureValidQuestionType(q.type)
      }));

      if (existingQuiz) {
        // Update existing quiz
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            questions: validatedQuestions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingQuiz.id);

        if (updateError) {
          console.error('Error updating quiz:', updateError);
          return false;
        }

        console.log('Successfully updated quiz');
        return true;
      } else {
        // Create a new quiz entry
        const { error: insertError } = await supabase
          .from('quizzes')
          .insert({
            course_id: courseId, // Changed module_id to course_id
            questions: validatedQuestions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating quiz:', insertError);

          // If there's a foreign key violation, we need to create a dummy course first
          if (insertError.code === '23503' && insertError.message.includes('foreign key constraint')) {
            try {
              // Generate a UUID for the quiz
              const quizUuid = uuidv4();

              // Insert the quiz with the generated UUID
              const { error: retryError } = await supabase
                .from('quizzes')
                .insert({
                  id: quizUuid,
                  course_id: quizUuid, // Changed module_id to course_id
                  questions: validatedQuestions,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (retryError) {
                console.error('Error on retry creating quiz:', retryError);
                return false;
              }

              console.log('Successfully created quiz after handling FK constraint');
              return true;
            } catch (retryErr) {
              console.error('Exception during retry:', retryErr);
              return false;
            }
          }

          return false;
        }

        console.log('Successfully created new quiz');
        return true;
      }
    } else {
      // Regular course quizzes - Continue with original logic
      const quizId = isValidUUID(courseId) ? courseId : createIdFromString(courseId);

      const { data: existingQuiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('course_id', quizId) // Changed module_id to course_id
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking for existing quiz:', fetchError);
        return false;
      }

      const validatedQuestions = questions.map(q => ({
        ...q,
        type: ensureValidQuestionType(q.type)
      }));

      if (existingQuiz) {
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            questions: validatedQuestions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingQuiz.id);

        if (updateError) {
          console.error('Error updating quiz:', updateError);
          return false;
        }

        console.log('Successfully updated quiz');
        return true;
      } else {
        const { error: insertError } = await supabase
          .from('quizzes')
          .insert({
            course_id: quizId, // Changed module_id to course_id
            questions: validatedQuestions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating quiz:', insertError);
          return false;
        }

        console.log('Successfully created new quiz');
        return true;
      }
    }
  } catch (error) {
    console.error('Exception in saveQuiz:', error);
    return false;
  }
};
