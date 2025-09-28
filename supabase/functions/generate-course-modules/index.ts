
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to extract JSON from Gemini responses
async function extractJsonFromGeminiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.text();
    console.error('Gemini API error:', errorData);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  try {
    const geminiResponse = await response.json();

    // Ensure the response contains the expected structure
    if (!geminiResponse.candidates || geminiResponse.candidates.length === 0) {
      throw new Error('No candidates found in Gemini response');
    }

    const textContent = geminiResponse.candidates[0].content.parts[0].text;

    // Extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                      textContent.match(/```\n([\s\S]*?)\n```/) ||
                      [null, textContent];

    if (!jsonMatch[1]) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const jsonStr = jsonMatch[1].trim();

    // Parse the JSON string
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse data from AI response');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, systemPrompt, skills } = await req.json();
    
    // Get API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    
    // Construct prompt for Gemini
    const prompt = `
      You are a course content creator AI. Generate 10 modules for a course with the following details:
      
      Course Title: ${title}
      Course Description: ${description}
      Course Skills: ${skills ? skills.join(', ') : ''}
      Additional Details: ${systemPrompt}
      
      Return a JSON array with exactly 10 modules. Each module should have:
      1. "title": The name of the module (make these relevant and engaging)
      2. "description": A 1-2 sentence description of what this module will cover
      
      Format the response as a valid JSON array without any markdown formatting or explanations.
      Example format: 
      [
        {
          "title": "Module Title",
          "description": "Module description that explains the content..."
        },
        ...
      ]
    `;
    
    console.log("Sending request to Gemini API with prompt:", prompt);
    
    // Make request to Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }),
      }
    );
    
    // Extract JSON from response
    const modules = await extractJsonFromGeminiResponse(response);
    
    // Return the generated modules
    return new Response(
      JSON.stringify({ modules }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
