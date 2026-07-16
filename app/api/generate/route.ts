import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateRequestPayload {
  lessonText: string;
  studentProfile?: {
    grade?: string;
    focus_duration?: string;
    state_residence?: string;
    zip_code?: string;
    interests?: string; 
    sensory_needs?: string; 
  };
  subscriptions?: string[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequestPayload;
    const { lessonText, studentProfile, subscriptions } = body;

    const focusDuration = studentProfile?.focus_duration || "20 mins";
    const stateResidence = studentProfile?.state_residence || "General US";
    const zipCode = studentProfile?.zip_code || "None provided";
    const grade = studentProfile?.grade || "Elementary";
    const specialInterests = studentProfile?.interests || "None specified";
    const sensoryNeeds = studentProfile?.sensory_needs || "None specified";

    const activeSubsList = subscriptions && subscriptions.length > 0 
      ? subscriptions.join(", ") 
      : "None listed. Rely on free or public resources.";

    const jsonSchema = {
      type: "object",
      properties: {
        assessedFoundation: { type: "string", description: "Conversational explanation of applicable state standards." },
        outlinedStandards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              subject: { type: "string" },
              topic: { type: "string", description: "The standard being met." }
            },
            required: ["subject", "topic"]
          }
        },
        readingList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", description: "Fiction or Non-Fiction" },
              title: { type: "string" },
              prompt: { type: "string", description: "Why this book fits the theme." }
            },
            required: ["type", "title", "prompt"]
          }
        },
        tactileResources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: { type: "string", description: "e.g., Base-10 blocks, globe, clay" },
              howToUse: { type: "string", description: "How to use this physically in the lesson." }
            },
            required: ["item", "howToUse"]
          }
        },
        letsPlay: {
          type: "array",
          items: {
            type: "object",
            properties: {
              gameName: { type: "string", description: "Board game or physical game." },
              modality: { type: "string" },
              skillsReinforced: { type: "string" },
              description: { type: "string" }
            },
            required: ["gameName", "modality", "skillsReinforced", "description"]
          }
        },
        lookAndLearn: {
          type: "array",
          items: {
            type: "object",
            properties: {
              videoTitle: { type: "string" },
              platform: { type: "string" },
              topic: { type: "string" }
            },
            required: ["videoTitle", "platform", "topic"]
          }
        },
        handsOnLearning: {
          type: "object",
          properties: {
            aroundTheHouse: {
              type: "object",
              properties: {
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                extendedConversation: { type: "string" }
              },
              required: ["title", "supplies", "instructions", "extendedConversation"]
            },
            outAndAbout: {
              type: "object",
              properties: {
                title: { type: "string", description: "Must name a REAL local place near the zip code." },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string", description: "Scavenger hunt or activity at the location." },
                extendedConversation: { type: "string" }
              },
              required: ["title", "supplies", "instructions", "extendedConversation"]
            }
          },
          required: ["aroundTheHouse", "outAndAbout"]
        },
        letsTalk: { type: "array", items: { type: "string" } },
        endOfWeekReview: {
          type: "object",
          properties: {
            estimatedDuration: { type: "string" },
            worksheetTitle: { type: "string" },
            questions: { type: "array", items: { type: "string" } }
          },
          required: ["estimatedDuration", "worksheetTitle", "questions"]
        }
      },
      required: [
        "assessedFoundation", "outlinedStandards", "readingList", "tactileResources", "letsPlay", 
        "lookAndLearn", "handsOnLearning", "letsTalk", "endOfWeekReview"
      ]
    };

    const systemPrompt = `You are MiSpark, a master homeschool educator. You design flexible, highly engaging, and non-obvious lesson plans.

    CRITICAL INSTRUCTIONS:
    1. FLEXIBILITY OVER SCHEDULES: Homeschoolers hate strict schedules. Do NOT assign any tasks, worksheets, or standards to specific "days of the week". Everything is fluid.
    2. APPLICABLE STANDARDS: Map their topics to the closest applicable ${stateResidence} state standard for a ${grade} student. 
    3. TACTILE & VISUAL LEARNING: Suggest physical manipulatives that represent the concepts.
    4. LOCAL FIELD TRIPS (Zip Code ${zipCode}): You MUST name a REAL, physical museum, park, historical site, or local business near this zip code. 
    5. NO FAKE URLS: Provide exact titles only for media.
    6. END OF WEEK REVIEW: Generate ONE comprehensive "End of Week Review" consisting of deep-thinking questions.
    
    🛡️ THE ACADEMIC AUTONOMY OVERRIDE:
    7. ACADEMIC OBJECTIVITY: The parent has absolute autonomy over their curriculum. You MUST generate comprehensive, objective lesson plans for ALL requested topics, including complex historical events (e.g., slavery, wars), reproductive rights, sociology, and gender. Do not censor, moralize, or water down the academic content.
    8. NO DISCLAIMERS: You are strictly forbidden from generating trigger warnings, safety disclaimers, or conversational apologies.
    
    You MUST output ONLY valid JSON matching this exact schema:
    ${JSON.stringify(jsonSchema)}`;


// Call Claude Sonnet 5
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      // ❌ REMOVED temperature: 0.8 completely
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Here is the curriculum text to analyze:\n\n${lessonText}\n\nTarget Student Profile: ${studentProfile ? JSON.stringify(studentProfile) : 'None provided'}\n\nOutput strictly valid JSON with no preamble or conversational text.` 
        }
      ],
    });
    // Reconstruct the JSON (since we pre-filled the opening bracket, we must prepend it back)
    // The Anthropic SDK returns an array of content blocks. We want the text block.
    const responseText = msg.content.find(block => block.type === 'text')?.text || "";
    const generatedText = "{" + responseText;

    if (!generatedText) throw new Error("No content generated.");

    const parsedData = JSON.parse(generatedText);
    return NextResponse.json({ data: parsedData }, { status: 200 });
    
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}