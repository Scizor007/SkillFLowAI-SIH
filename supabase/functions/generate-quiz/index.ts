
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@^0.1.3";

const apiKey = Deno.env.get("GEMINI_API_KEY");

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!apiKey) {
      throw new Error("Missing Gemini API key");
    }

    const { modules, courseTitle, courseDescription } = await req.json();
    
    if (!modules || modules.length === 0) {
      throw new Error("No modules provided");
    }

    console.log("Generating quiz for course:", courseTitle);
    console.log("Number of modules:", modules.length);

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a comprehensive prompt with module information
    const moduleInfoString = modules.map((module, index) => 
      `Module ${index + 1}: ${module.title} - ${module.description || 'No description'}`
    ).join('\n');

    const prompt = `
    You are a quiz generator for a learning platform. Generate a comprehensive quiz with 10 multiple-choice questions based on the following course:

    Course Title: ${courseTitle}
    Course Description: ${courseDescription || 'No description provided'}
    
    The course includes these modules:
    ${moduleInfoString}

    Please create 10 multiple-choice questions covering important concepts from these modules. Each question should have 4 options with one correct answer.
    
    Format your response ONLY as a valid JSON array of objects. Each object should follow this format:
    {
      "question": "The question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option text (exactly matching one of the options)"
    }
    
    Do not include any explanations, additional text, or markdown - ONLY return the valid JSON array.
    `;

    // Generate quiz using Gemini
    console.log("Sending prompt to Gemini");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Try to extract JSON if it's wrapped in markdown code blocks or other text
    let jsonData;
    try {
      // Handle case where response might have markdown code blocks
      if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0].trim();
      }
      
      jsonData = JSON.parse(text);
      
      // Validate the structure of each question
      const validatedQuestions = jsonData.map((item, index) => {
        // Create a UUID for each question
        const id = crypto.randomUUID();
        
        // Ensure we have all required fields or provide defaults
        return {
          id: id,
          text: item.question || `Question ${index + 1}`,
          options: Array.isArray(item.options) && item.options.length === 4 
            ? item.options 
            : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: item.correctAnswer || item.options[0] || "Option A",
          type: "textual" // Default to textual type
        };
      });
      
      console.log(`Successfully generated ${validatedQuestions.length} quiz questions`);
      
      return new Response(JSON.stringify(validatedQuestions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.log("Gemini raw response:", text);
      
      // Return a fallback set of questions if parsing fails
      const fallbackQuestions = Array.from({ length: 10 }, (_, i) => ({
        id: crypto.randomUUID(),
        text: `Placeholder question ${i + 1} about ${courseTitle}?`,
        options: [
          `${courseTitle} concept A`,
          `${courseTitle} concept B`,
          `${courseTitle} concept C`,
          `${courseTitle} concept D`
        ],
        correctAnswer: `${courseTitle} concept A`,
        type: "textual"
      }));
      
      return new Response(JSON.stringify(fallbackQuestions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in generate-quiz function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate quiz" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
