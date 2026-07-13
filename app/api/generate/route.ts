import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. ADDED: TypeScript Interface for the incoming request payload
interface GenerateRequestPayload {
  lessonText: string;
  studentProfile?: {
    grade?: string;
    focus_duration?: string;
    math_mastery_level?: string;
    reading_mastery_level?: string;
    state_residence?: string;
    zip_code?: string;
  };
  subscriptions?: string[];
}

export async function POST(req: Request) {
  try {
    // 2. ADDED: Tell TypeScript exactly what shape the JSON body is
    const body = (await req.json()) as GenerateRequestPayload;
    
    // Safely destructure
    const { lessonText, studentProfile, subscriptions } = body;

    // Set up safe fallbacks so variables are never undefined
    const focusDuration = studentProfile?.focus_duration || "20 mins";
    const stateResidence = studentProfile?.state_residence || "General US";
    const zipCode = studentProfile?.zip_code || "None provided";

    // Format the subscriptions array into a readable string for the AI
    const activeSubsList = subscriptions && subscriptions.length > 0 
      ? subscriptions.join(", ") 
      : "None listed. Rely on free or public resources.";

    const systemPrompt = `You are miSpark, a personable, highly-skilled homeschool co-teacher and personal assistant. Your tone is encouraging, concise, time-saving, and empathetic to a busy parent. Your job is to transform a provided syllabus into a tailored, dynamic adventure.

    CRITICAL INSTRUCTIONS & EXCLUSIONS:
    1. PROGRESSIVE MASTERY & FOCUS: Align content to the student's level. You MUST strictly tailor the length of activities to fit the student's stated 'focus_duration' of ${focusDuration} minutes.
    2. ASSESSED FOUNDATION (State Standards): Using the provided state of residence (${stateResidence}), explain the targeted educational standards in plain, conversational English. Avoid bureaucratic jargon.

    // 📍 THE ROADSCHOOLING RULE (Hyper-Local Geolocation)
    3. LET'S EXPLORE (Illuminations): Provide specific, real-world field trip locations. 
       - You MUST use the provided physical zip code (${zipCode}) to recommend ACTUAL museums, historical sites, or local parks within a 30-mile radius.
       - DO NOT suggest generic locations like "a local park." Name the exact venue.

    // 🎒 THE DIGITAL BACKPACK RULE (Maximize Investment)
    4. LOOK & LEARN (Media): The parent currently subscribes to: [${activeSubsList}]. 
       - You MUST prioritize finding high-quality documentaries, shows, or educational media on THESE specific platforms first. 
       - Only suggest outside platforms if absolutely necessary, and note if they are free (like YouTube).

    // ✨ THE 1-SPARK SPARKLE RULE (Resource Expansion)
    5. RESOURCE EXPANSION: Identify exactly ONE world-class external resource (e.g., a specific KiwiCo crate, a highly relevant board game, or an exceptional documentary on a platform they DON'T have). 
       - It must be a perfect, mind-blowing match for the topic. 
       - Explain exactly WHY it is worth going out of their way to buy or subscribe to.

    6. HANDS-ON LEARNING (Catalysts): Provide 3 activities ("Around the House", "Out and About", "Big Ideas").
       - SUPPLY RULE: Restrict required supplies to common household or basic craft items. No obscure materials.
    
    7. RECOMMENDED READING (Free Tier): Provide 3 Fiction and 3 Non-Fiction books.
    
    8. WORKSHEETS: Provide questions ONLY. Do NOT leave blank spaces for answers.`;

    // 3. FIXED: Completely rebuilt the schema to perfectly match the Dashboard UI Types
    const jsonSchema = {
      type: "object",
      properties: {
        assessedFoundation: { type: "string", description: "Conversational explanation of state standards." },
        outlinedStandards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "string" },
              subject: { type: "string" },
              topic: { type: "string" }
            },
            required: ["day", "subject", "topic"]
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
        letsPlay: {
          type: "array",
          items: {
            type: "object",
            properties: {
              gameName: { type: "string" },
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
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                extendedConversation: { type: "string" }
              },
              required: ["title", "supplies", "instructions", "extendedConversation"]
            },
            bigIdeas: {
              type: "object",
              properties: {
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                extendedConversation: { type: "string" }
              },
              required: ["title", "supplies", "instructions", "extendedConversation"]
            }
          }
        },
        letsTalk: { type: "array", items: { type: "string" } },
        letsExplore: { type: "array", items: { type: "string" } },
        printableWorksheets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "string" },
              estimatedDuration: { type: "string" },
              worksheetTitle: { type: "string" },
              questions: { type: "array", items: { type: "string" } }
            },
            required: ["day", "estimatedDuration", "worksheetTitle", "questions"]
          }
        },
        resourceExpansion: {
          type: "object",
          properties: {
            title: { type: "string" },
            whyItsWorthIt: { type: "string" }
          },
          required: ["title", "whyItsWorthIt"]
        }
      },
      required: [
        "assessedFoundation", "outlinedStandards", "readingList", "letsPlay", 
        "lookAndLearn", "handsOnLearning", "letsTalk", "letsExplore", "printableWorksheets"
      ]
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt}\n\nYou MUST use exactly this JSON schema to format your response:\n${JSON.stringify(jsonSchema)}` 
        },
        { 
          role: "user", 
          content: `Here is the curriculum text to analyze:\n\n${lessonText}\n\nTarget Student Profile: ${studentProfile ? JSON.stringify(studentProfile) : 'None provided'}` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const generatedText = completion.choices[0].message.content;
    if (!generatedText) throw new Error("No content generated from OpenAI.");

    return NextResponse.json({ data: JSON.parse(generatedText) }, { status: 200 });
    
  // 4. FIXED: Removed "any" and added proper Error instance checking
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate schedule." }, 
      { status: 500 }
    );
  }
}