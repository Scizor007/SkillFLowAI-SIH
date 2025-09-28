
import { GEMINI_API_KEY, GEMINI_API_URL, extractJsonFromGeminiResponse, createJsonResponse } from "./utils.ts";

interface GenerateModulesRequest {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  systemPrompt: string;
}

export async function generateModules(data: GenerateModulesRequest) {
  const { courseId, courseTitle, courseDescription, systemPrompt } = data;
  
  console.log(`Generating modules for course: ${courseTitle}`);
  
  // Create prompt for Gemini API
  const prompt = `
You are an AI educator that creates structured learning modules for courses.

Course Title: ${courseTitle}
Course Description: ${courseDescription}
System Context: ${systemPrompt}

Create 5 logical modules for this course. Each module should build upon the previous one in a coherent learning path.

Return ONLY a valid JSON object with this structure:
{
  "modules": [
    {
      "title": "Module title",
      "order": 1,
      "description": "Brief description of module content"
    },
    ...more modules
  ]
}
`;

  // Call Gemini API
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    })
  });

  const moduleData = await extractJsonFromGeminiResponse(response);
  console.log('Successfully generated modules:', moduleData.modules.length);
  
  return createJsonResponse(moduleData);
}
