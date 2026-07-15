
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequestPayload {
  lessonText: string;
  studentProfile?: {
    grade?: string;
    focus_duration?: string;
    math_mastery_level?: string;
    reading_mastery_level?: string;
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

    const systemPrompt = `You are MiSpark, a master homeschool educator. You design flexible, highly engaging, and non-obvious lesson plans.

    CRITICAL INSTRUCTIONS & EXCLUSIONS:
    1. FLEXIBILITY OVER SCHEDULES: Homeschoolers hate strict schedules. Do NOT assign any tasks, worksheets, or standards to specific "days of the week". Everything is fluid.
    2. APPLICABLE STANDARDS: Look at the parent's provided text. Map their topics to the closest applicable ${stateResidence} state standard for a ${grade} student. If the parent's topic is clearly above or below grade level, gently note that in the explanation. Only pull standards applicable to what they entered.
    3. TACTILE & VISUAL LEARNING: Suggest physical manipulatives (e.g., abacus, base-10 blocks, globes, clay, measuring cups) that physically represent the concepts being taught.
    4. LOCAL FIELD TRIPS (Zip Code ${zipCode}): You MUST use your spatial knowledge to name a REAL, physical museum, park, historical site, or local business near this zip code. Do not suggest generic ideas. Name the actual place.
    5. NO FAKE URLS: Do NOT generate URLs for media or books. Provide the exact title and platform so the parent can search it.
    6. END OF WEEK REVIEW: Instead of daily worksheets, generate exactly ONE comprehensive "End of Week Review" consisting of deep-thinking questions.
    
    You MUST output valid JSON matching the schema provided.`;

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt}\n\nYou MUST use exactly this JSON schema:\n${JSON.stringify(jsonSchema)}\n\nIMPORTANT: Never use the word "Day 1" or assign schedules.` 
        },
        { 
          role: "user", 
          content: `Here is the curriculum text to analyze:\n\n${lessonText}\n\nTarget Student Profile: ${studentProfile ? JSON.stringify(studentProfile) : 'None provided'}` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const generatedText = completion.choices[0].message.content;
    if (!generatedText) throw new Error("No content generated.");

    const parsedData = JSON.parse(generatedText);
    return NextResponse.json({ data: parsedData }, { status: 200 });
    
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
