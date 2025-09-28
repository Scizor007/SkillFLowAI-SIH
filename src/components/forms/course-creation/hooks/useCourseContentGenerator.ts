import { useState } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;

export const useCourseContentGenerator = () => {
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateCourseContent = async (
    moduleId: string,
    moduleTitle: string,
    moduleDescription: string,
    courseTitle: string,
    courseDescription: string,
    userId: string,
    visualPoints: number,
    textualPoints: number,
    userSkills: string[]
  ) => {
    try {
      setGeneratingStatus('Generating course content with AI...');
      setError(null);

      const prompt = `You are an AI Instructor. Create detailed course content for the following module:
      
      Module Title: ${moduleTitle}
      Module Description: ${moduleDescription}
      
      Course Title: ${courseTitle}
      Course Description: ${courseDescription}
      
      User Details:
      - User ID: ${userId}
      - Visual Points: ${visualPoints}
      - Textual Points: ${textualPoints}
      - User Skills: ${userSkills.join(', ')}
      
      Provide a JSON object with the following structure:
      {
        "content": "Main content text with markdown formatting",
        "visualContent": [
          { "type": "mermaid", "diagram": "graph TD; A-->B; A-->C;" },
          { "type": "url", "url": "https://example.com/diagram.png" }
        ],
        "textualContent": "Additional detailed text explanations if the user prefers textual learning"
      }
      
      Return ONLY the JSON object without any additional text or explanation.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract the JSON content from the response
      let contentText = '';
      if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts
      ) {
        contentText = data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }

      // Parse the JSON content
      const contentJson = JSON.parse(contentText);
      console.log('Generated course content:', contentJson);

      setGeneratingStatus('Course content generated successfully!');
      return contentJson;
    } catch (err) {
      console.error('Error generating course content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setGeneratingStatus('');
      throw err;
    }
  };

  return { generateCourseContent, generatingStatus, error };
};