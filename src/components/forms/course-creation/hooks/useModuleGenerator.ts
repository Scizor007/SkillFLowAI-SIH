import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Get API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

export const useModuleGenerator = () => {
  const [creatingStatus, setCreatingStatus] = useState('');

  const generateModules = async (title: string, systemPrompt: string) => {
    try {
      setCreatingStatus('Generating course modules with AI...');
      
      // Step 1: Try to use Supabase function if available
      try {
        const { data, error } = await supabase.functions.invoke('generate-course-modules', {
          body: {
            courseTitle: title,
            courseDescription: systemPrompt
          }
        });
        
        if (!error && data && Array.isArray(data) && data.length > 0) {
          console.log("Generated modules with Supabase function:", data);
          
          // Format the modules from AI response
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const aiModules = data.map((item: any, index: number) => ({
            title: item.title || `Module ${index + 1}: ${title} Concepts`,
            description: item.description || `Learning about ${title}`
          }));
          
          // Limit to 10 modules
          const finalModules = aiModules.slice(0, 10);
          
          setCreatingStatus('Creating course in database...');
          return finalModules;
        }
        
        console.log("Supabase function didn't return usable data, trying direct API call");
      } catch (supabaseError) {
        console.error("Error with Supabase function:", supabaseError);
        console.log("Falling back to direct Gemini API call");
      }
      
      // Step 2: Try direct Gemini API call if Supabase function fails
      try {
        setCreatingStatus('Generating modules with Gemini API...');
        
        const prompt = `
        you are a processional AI teacher who has the power to generate textual and diagramatic content for the students, use feyman's technique to generate educational conetnt
        remember that your produced module title and descripltion will be used by ai further to generate the course content, so make sure that the title and description are very clear and concise
        Generate 10 educational modules for a course titled "${title}".
        
Course Description: ${systemPrompt || 'A comprehensive course on ' + title}

Create modules that progressively build knowledge from basic concepts to advanced applications.

Return ONLY a JSON array in this exact format (no additional text before or after):
[
  {"title": "Module Title 1", "description": "Detailed module description"},
  {"title": "Module Title 2", "description": "Detailed module description"}
]`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 32,
              topP: 1,
              maxOutputTokens: 2048,
            }
          })
        });

        if (response.ok) {
          const responseData = await response.json();
          const moduleText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          console.log("Raw Gemini response:", moduleText);
          
          // Extract JSON array from the response text
          // Using regex to find anything that looks like a JSON array
          const jsonMatch = moduleText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          
          if (jsonMatch) {
            try {
              const parsedModules = JSON.parse(jsonMatch[0]);
              console.log("Successfully parsed modules from Gemini:", parsedModules);
              
              if (Array.isArray(parsedModules) && parsedModules.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const aiModules = parsedModules.map((item: any) => ({
                  title: item.title || `Module about ${title}`,
                  description: item.description || `Learning about ${title}`
                }));
                
                // Limit to 10 modules
                const finalModules = aiModules.slice(0, 10);
                
                setCreatingStatus('Creating course in database...');
                return finalModules;
              }
            } catch (parseError) {
              console.error("Error parsing JSON from Gemini response:", parseError);
            }
          } else {
            console.error("Could not find JSON array in Gemini response");
          }
        } else {
          console.error("Gemini API error:", response.status, await response.text());
        }
      } catch (apiError) {
        console.error("Error with direct Gemini API call:", apiError);
      }
      
      // Step 3: Fallback to hardcoded modules as last resort
      console.log("Both AI methods failed. Using fallback hardcoded modules");
      const modules = [
        {
          title: `Introduction to ${title}`,
          description: `An overview of ${title} and its importance.`
        },
        {
          title: `Key Concepts in ${title}`,
          description: `Essential terminology and concepts related to ${title}.`
        },
        {
          title: `Foundational Principles of ${title}`,
          description: `Understanding the core principles that govern ${title}.`
        },
        {
          title: `Practical Applications of ${title}`,
          description: `Real-world applications and case studies of ${title}.`
        },
        {
          title: `Advanced Topics in ${title}`,
          description: `Deeper exploration of complex topics in ${title}.`
        },
        {
          title: `Problem Solving in ${title}`,
          description: `Strategies and techniques for solving problems related to ${title}.`
        },
        {
          title: `Industry Standards for ${title}`,
          description: `Current best practices and standards in ${title}.`
        },
        {
          title: `Future Trends in ${title}`,
          description: `Emerging technologies and future directions for ${title}.`
        },
        {
          title: `Career Paths in ${title}`,
          description: `Exploring professional opportunities related to ${title}.`
        },
        {
          title: `Mastering ${title}`,
          description: `Comprehensive review and advanced skills in ${title}.`
        }
      ];
      
      console.log("Using fallback modules:", modules);
      
      setCreatingStatus('Creating course in database...');
      return modules;
    } catch (error) {
      console.error('Error in generateModules:', error);
      toast.error('Failed to generate course modules');
      throw error;
    }
  };

  return {
    generateModules,
    creatingStatus
  };
};
