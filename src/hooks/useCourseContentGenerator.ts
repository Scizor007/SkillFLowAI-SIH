
import { useState, useCallback } from 'react';
import { ModuleContent, Module } from '@/types';
import { fetchModuleContent, saveModuleContent } from '@/services/contentService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseCourseContentGeneratorProps {
  onContentLoaded?: (content: ModuleContent) => void;
}

export function useCourseContentGenerator(props?: UseCourseContentGeneratorProps) {
  const { onContentLoaded } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleContent, setModuleContent] = useState<ModuleContent | null>(null);

  const getOrGenerateContent = useCallback(async (module: Module): Promise<ModuleContent | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Check if content already exists in the database
      const existingContent = await fetchModuleContent(module.id);
      
      if (existingContent) {
        // If content exists, use it
        setModuleContent(existingContent);
        onContentLoaded?.(existingContent);
        return existingContent;
      }
      
      // Step 2: Content doesn't exist, generate it using direct API call
      toast.info(`Generating content for module: ${module.title}`);
      
      // Direct call to Gemini API
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCmcMnSWDJqm_OA_9MiyVYxrXhg9iAcXT8'; // Fallback to the key in .env
      const apiUrl = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
      
      const prompt = `
        Generate educational content for a module titled "${module.title}" in a learning management system.
        
        Please provide:
        1. A comprehensive overview of the topic (10-20 paragraphs)
        2. Key concepts to understand (10-20 bullet points)
        3. An Example to understand the oncept using badminton explain like you are explaining to a kid
        4. A simple diagram or visual representation that could help explain the concept
        
        Format the response as JSON with these fields:
        {
          "content": "Brief overview of the content",
          "textualContent": "Detailed markdown formatted content with headers, paragraphs, and bullet points",
          "visualContent": [
            {
              "type": "mermaid",
              "diagram": "mermaid diagram code here",
              "title": "Diagram title",
              "description": "Brief description of the diagram"
            }
          ]
        }
      `;
      
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from Gemini API:', errorText);
        throw new Error(`Failed to generate content: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      
      // Extract the generated content from the Gemini response
      let generatedContent;
      try {
        const responseText = apiResponse.candidates[0].content.parts[0].text;
        // Try to parse JSON from the response text
        const jsonStartIdx = responseText.indexOf('{');
        const jsonEndIdx = responseText.lastIndexOf('}') + 1;
        if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
          const jsonStr = responseText.substring(jsonStartIdx, jsonEndIdx);
          generatedContent = JSON.parse(jsonStr);
        } else {
          // If no JSON found, create a basic structure
          generatedContent = {
            content: responseText.substring(0, 200) + "...",
            textualContent: responseText,
            visualContent: []
          };
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        generatedContent = {
          content: "Content generation error",
          textualContent: "Failed to parse the generated content.",
          visualContent: []
        };
      }
      
      // Step 3: Save the generated content to the database
      const moduleContent: ModuleContent = {
        id: crypto.randomUUID(),
        moduleId: module.id,
        content: generatedContent.content || '',
        textualContent: generatedContent.textualContent || '',
        visualContent: generatedContent.visualContent || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to database
      const savedContent = await saveModuleContent(
        module.id,
        moduleContent.content,
        moduleContent.textualContent,
        moduleContent.visualContent
      );
      
      if (savedContent) {
        setModuleContent(savedContent);
        onContentLoaded?.(savedContent);
        return savedContent;
      }
      
      // If database save failed, still return the generated content
      setModuleContent(moduleContent);
      onContentLoaded?.(moduleContent);
      return moduleContent;
    } catch (err) {
      console.error('Error in course content generation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating content';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If any error occurs, try to generate fallback content
      return generateFallbackContent(module);
    } finally {
      setIsLoading(false);
    }
  }, [onContentLoaded]);

  // Generate basic content when API fails
  const generateFallbackContent = async (module: Module): Promise<ModuleContent | null> => {
    try {
      const fallbackContent: ModuleContent = {
        id: crypto.randomUUID(),
        moduleId: module.id,
        content: `This is placeholder content for the module "${module.title}".`,
        textualContent: `
          ## ${module.title}
          
          This module would typically contain AI-generated content, but there was an issue with the content generation service.
          
          ### Key Concepts
          - Basic understanding of ${module.title}
          - Application of ${module.title} in real-world scenarios
          - Best practices for implementing ${module.title}
          
          ### Learning Objectives
          By the end of this module, you should be able to understand the fundamentals of ${module.title} and apply them in practice.
        `,
        visualContent: [
          {
            type: 'mermaid',
            diagram: 'graph TD;\n  A[Start] --> B[Learn];\n  B --> C[Practice];\n  C --> D[Master];\n  D --> E[End];',
            title: 'Learning Process',
            description: 'A simple diagram showing the learning process for this module'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Try to save the fallback content to the database
      try {
        const savedContent = await saveModuleContent(
          module.id,
          fallbackContent.content,
          fallbackContent.textualContent,
          fallbackContent.visualContent
        );
        
        if (savedContent) {
          setModuleContent(savedContent);
          onContentLoaded?.(savedContent);
          return savedContent;
        }
      } catch (saveError) {
        console.error('Error saving fallback content:', saveError);
        // Continue with the unsaved fallback content
      }
      
      // If saving failed, at least return the fallback content for display
      setModuleContent(fallbackContent);
      onContentLoaded?.(fallbackContent);
      return fallbackContent;
    } catch (fallbackErr) {
      console.error('Error generating fallback content:', fallbackErr);
      toast.error('Failed to create even fallback content');
      return null;
    }
  };

  return {
    isLoading,
    error,
    moduleContent,
    getOrGenerateContent,
    setModuleContent
  };
}
