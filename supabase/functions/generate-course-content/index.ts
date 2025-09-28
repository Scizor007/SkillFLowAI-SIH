
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function saveModuleContent(moduleId, content, textualContent, visualContent) {
  try {
    const { data, error } = await supabase
      .from('module_content')
      .insert({
        module_id: moduleId,
        content: content,
        textual_content: textualContent,
        visual_content: visualContent
      })
      .select();
    
    if (error) {
      console.error('Error saving module content:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception saving module content:', error);
    return false;
  }
}

// Helper to extract JSON from Gemini responses
async function extractJsonFromGeminiResponse(response) {
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

export default async function handler(req) {
  const url = new URL(req.url);
  const moduleId = url.searchParams.get('moduleId');

  if (!moduleId) {
    return new Response('Module ID is required', { status: 400 });
  }

  try {
    // Extract the Bearer token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Authorization header is missing or invalid', { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and get the user details
    const { data: authenticatedUser, error: userError } = await supabase.auth.getUser(token);
    if (userError || !authenticatedUser) {
      console.error('Error verifying user token:', userError);
      return new Response('Failed to verify user token', { status: 401 });
    }

    const userId = authenticatedUser.user.id;
    
    // Fetch module details from the database
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, description, course_id')
      .eq('id', moduleId)
      .single();

    if (moduleError || !moduleData) {
      console.error('Error fetching module details:', moduleError);
      return new Response('Failed to fetch module details', { status: 500 });
    }

    const { title, description, course_id } = moduleData;
    
    // Fetch course details
    const { data: courseData, error: courseError } = await supabase
      .from('Courses_Table')
      .select('c_name, description')
      .eq('id', parseInt(course_id))
      .single();

    if (courseError || !courseData) {
      console.error('Error fetching course details:', courseError);
      return new Response('Failed to fetch course details', { status: 500 });
    }

    const c_name = courseData.c_name;

    // Fetch learner profile
    const { data: learnerProfileData, error: learnerProfileError } = await supabase
      .from('profiles')
      .select('visual_points, textual_points, skills')
      .eq('id', userId)
      .single();

    if (learnerProfileError || !learnerProfileData) {
      console.error('Error fetching learner profile:', learnerProfileError);
      return new Response('Failed to fetch learner profile', { status: 500 });
    }
    
    // Get API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response('Missing GEMINI_API_KEY environment variable', { status: 500 });
    }

    // Construct prompt for Gemini
    const prompt = `
      You are an expert content creator for educational modules. Create detailed educational content for the following module:
      
      Module Title: ${title}
      Module Description: ${description || ''}
      Course Title: ${c_name}
      Course Description: ${courseData.description || ""}
      
      User Learning Profile:
      - Visual Learning Score: ${learnerProfileData.visual_points || 0}
      - Textual Learning Score: ${learnerProfileData.textual_points || 0}
      - User Skills: ${JSON.stringify(learnerProfileData.skills || [])}
      
      Create a complete module with the following:
      
      1. "content": A brief introduction to the module topic (2-3 paragraphs)
      
      2. "textualContent": Detailed explanations of the topic (at least 300 words). Include examples, analogies, and references where appropriate.
      
      3. "visualContent": An array with at least 3 visual diagrams that help explain concepts from the module. Each diagram should have:
         - "type": Use "mermaid" (as this will be rendered)
         - "diagram": The actual mermaid diagram code (use proper mermaid syntax)
         - "title": A concise title for the diagram
         - "description": A brief explanation of what the diagram represents
      
      Make the content ${learnerProfileData.visual_points > learnerProfileData.textual_points ? 'more visual-oriented with detailed diagrams' : 'balanced between text and visuals with clear explanations'}.
      
      Return a valid JSON object with three fields: content, textualContent, and visualContent.
      Example format:
      {
        "content": "Introduction text here...",
        "textualContent": "Detailed content here...",
        "visualContent": [
          {
            "type": "mermaid",
            "diagram": "graph TD;\\n  A[Start] --> B[Process];\\n  B --> C[End];",
            "title": "Basic Process Flow",
            "description": "Shows the main steps in the process"
          },
          {
            "type": "mermaid",
            "diagram": "graph LR;\\n  X[Input] --> Y[Function];\\n  Y --> Z[Output];",
            "title": "Data Transformation",
            "description": "Illustrates how data is transformed in the system"
          }
        ]
      }
    `;

    // Make request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent', {
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
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return new Response(`Gemini API error: ${response.status} ${response.statusText}`, { status: 500 });
    }

    try {
      // Extract content from Gemini response
      const contentData = await extractJsonFromGeminiResponse(response);

      // Save the generated content to the database
      const saveSuccess = await saveModuleContent(
        moduleId,
        contentData.content,
        contentData.textualContent,
        contentData.visualContent
      );

      if (!saveSuccess) {
        return new Response('Failed to save module content', { status: 500 });
      }

      return new Response(JSON.stringify(contentData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error processing AI response:', error);
      return new Response('Failed to process AI response: ' + error.message, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return new Response('Failed to generate content: ' + error.message, { status: 500 });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if the request is for a specific function
  const url = new URL(req.url);
  if (url.pathname.endsWith('/generate-course-content') && url.searchParams.has('moduleId')) {
    return handler(req);
  }

  try {
    const { action, ...data } = await req.json();

    if (action === 'generateContent') {
      return await handler(req);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
