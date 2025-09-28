
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

// Helper to extract JSON from Gemini responses
export async function extractJsonFromGeminiResponse(response: Response) {
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
    const parsedJson = JSON.parse(jsonStr);

    // Validate the structure of the parsed JSON
    if (
      !parsedJson.content ||
      !Array.isArray(parsedJson.visualContent) ||
      typeof parsedJson.textualContent !== 'string'
    ) {
      throw new Error('Invalid JSON structure in Gemini response');
    }

    return parsedJson;
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse data from AI response');
  }
}

// Helper to create a standardized response
export function createJsonResponse(data: Record<string, unknown>) {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
