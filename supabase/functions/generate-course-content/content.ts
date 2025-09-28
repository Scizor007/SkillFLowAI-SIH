
import { GEMINI_API_KEY, GEMINI_API_URL, extractJsonFromGeminiResponse, createJsonResponse } from "./utils.ts";

interface GenerateContentRequest {
  moduleId: string;
  moduleTitle: string;
  moduleDescription: string;
  courseTitle: string;
  courseDescription: string;
  userId: string;
  visualPoints: number;
  textualPoints: number;
  userSkills: string[];
}

export async function generateContent(data: GenerateContentRequest) {
  const { 
    moduleId, 
    moduleTitle, 
    moduleDescription,
    courseTitle, 
    courseDescription, 
    userId,
    visualPoints,
    textualPoints,
    userSkills 
  } = data;
  
  console.log(`Generating content for module: ${moduleTitle}`);
  console.log(`User ID: ${userId}, Visual: ${visualPoints}, Textual: ${textualPoints}`);
  
  // Determine learning preference
  const isVisualLearner = visualPoints >= textualPoints;
  const learningStyle = isVisualLearner ? 'visual' : 'textual';
  
  // Create prompt for Gemini API
  const prompt = `
You are an AI educator that creates personalized learning content.

Course: ${courseTitle}
Course Description: ${courseDescription}
Module: ${moduleTitle}
Module description: ${moduleDescription || 'No specific description provided'}
User Skills: ${userSkills.join(', ')}
Learning Style: ${learningStyle} (${isVisualLearner ? 'Prefers diagrams and visual examples' : 'Prefers detailed text explanations'})

Create comprehensive learning content for this module. The content should be:
1. Informative and educational
2. Tailored to the user's learning style (${isVisualLearner ? 'more visual content with diagrams' : 'more textual content with detailed explanations'})
3. Well-structured for online learning

The content must include:
1. A comprehensive main content summary (at least 150 words)
2. Detailed textual explanation (at least 400 words with proper formatting, paragraphs, and bullet points where appropriate)
3. At least 4 detailed mermaid diagrams that visualize key concepts from the topic

For the mermaid diagrams:
- Each diagram MUST be distinctly different and cover different aspects of the topic
- Provide a descriptive title and detailed explanation for each diagram (at least a paragraph, 50+ words)
- Use advanced mermaid features where appropriate (colors, styles, etc.)
- Make the diagrams detailed but clear, with at least 15 nodes/elements each
- Do not use placeholder or generic diagrams - make them specific to the topic

Return ONLY a valid JSON object with this structure:
{
  "content": "Main content summary here...",
  "textualContent": "Detailed textual explanation here (at least 400 words)...",
  "visualContent": [
    {
      "type": "mermaid",
      "title": "Diagram 1 Title",
      "description": "Detailed explanation of diagram 1 (at least a paragraph)",
      "diagram": "graph TD\\nA[Start] --> B[Process]\\nB --> C[End]"
    },
    {
      "type": "mermaid",
      "title": "Diagram 2 Title",
      "description": "Detailed explanation of diagram 2 (at least a paragraph)",
      "diagram": "sequenceDiagram\\nAlice->>Bob: Hello Bob\\nBob-->>Alice: Hi Alice"
    },
    {
      "type": "mermaid",
      "title": "Diagram 3 Title",
      "description": "Detailed explanation of diagram 3 (at least a paragraph)",
      "diagram": "flowchart LR\\nA[Start] --> B{Decision}\\nB -->|Yes| C[Process 1]\\nB -->|No| D[Process 2]"
    },
    {
      "type": "mermaid",
      "title": "Diagram 4 Title",
      "description": "Detailed explanation of diagram 4 (at least a paragraph)",
      "diagram": "classDiagram\\nClass01 <|-- AveryLongClass : Cool\\nClass03 *-- Class04\\nClass05 o-- Class06"
    }
  ]
}

${isVisualLearner ? 'Include 5-6 detailed diagrams with at least 15 nodes each and comprehensive textualContent' : 'Include at least 4 detailed diagrams and very extensive textualContent (at least 500 words)'}

Make sure ALL diagrams are properly escaped for JSON (double backslashes for newlines, etc.) and are syntactically valid mermaid syntax. Each diagram should be distinct and cover different concepts related to the topic.
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
        maxOutputTokens: 8192, // Increased for more detailed content
      }
    })
  });

  const contentData = await extractJsonFromGeminiResponse(response);
  console.log('Successfully generated content');
  
  // Enhance the diagrams by marking them as excalidraw type
  // In a full implementation, we would convert mermaid to excalidraw here
  if (contentData.visualContent && Array.isArray(contentData.visualContent)) {
    contentData.visualContent = contentData.visualContent.map(visual => {
      if (visual.type === 'mermaid' && visual.diagram) {
        return {
          ...visual,
          type: 'excalidraw', // Mark for Excalidraw rendering
          // Keep the original diagram for now
        };
      }
      return visual;
    });
  }
  
  return createJsonResponse(contentData);
}
