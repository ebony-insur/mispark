import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TypeScript Interface for the incoming request payload
interface GenerateRequestPayload {
  lessonText: string;
  studentProfile?: {
    grade?: string;
    focus_duration?: string;
    math_mastery_level?: string;
    reading_mastery_level?: string;
    state_residence?: string;
    zip_code?: string;
    interests?: string; // 📍 Added to catch the new "Anything else" field we will build
    sensory_needs?: string; 
  };
  subscriptions?: string[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequestPayload;
    
    const { lessonText, studentProfile, subscriptions } = body;

    // Set up safe fallbacks
    const focusDuration = studentProfile?.focus_duration || "20 mins";
    const stateResidence = studentProfile?.state_residence || "General US";
    const zipCode = studentProfile?.zip_code || "None provided";
    const grade = studentProfile?.grade || "Elementary";
    const specialInterests = studentProfile?.interests || "None specified";
    const sensoryNeeds = studentProfile?.sensory_needs || "None specified";

    const activeSubsList = subscriptions && subscriptions.length > 0 
      ? subscriptions.join(", ") 
      : "None listed. Rely on free or public resources.";

    // 📍 THE MASTER EDUCATOR PROMPT OVERHAUL
    const systemPrompt = `You are miSpark, a master homeschool educator and curriculum designer with advanced degrees in education. You do not give generic, surface-level advice. You create highly engaging, age-appropriate, pedagogically sound, and non-obvious lesson plans. Your tone is that of an expert consulting with a parent—professional, insightful, and deeply practical.

    CRITICAL INSTRUCTIONS & EXCLUSIONS:
    1. NOVELTY & DEPTH: Do not rely on cliché examples (e.g., if the topic is 'Earth Science', do not just say 'make a baking soda volcano'). Provide highly specific, unique, and memorable angles. 
    2. PROGRESSIVE MASTERY & FOCUS: Align content perfectly to a ${grade} level student. You MUST strictly tailor the length of activities to fit the student's stated 'focus_duration' of ${focusDuration}.
    3. SPECIAL CONSIDERATIONS: Seamlessly weave the student's interests (${specialInterests}) and sensory needs (${sensoryNeeds}) into the activities.
    
    4. ASSESSED FOUNDATION (State Standards): Using the state of residence (${stateResidence}), explain the targeted educational standards in plain, conversational English. Avoid bureaucratic jargon, but be academically precise.

    // 📍 THE ROADSCHOOLING RULE (Hyper-Local Geolocation)
    5. LET'S EXPLORE (Illuminations): You MUST use the provided physical zip code (${zipCode}) to recommend ACTUAL real-world locations (museums, historical sites, parks) within a 30-mile radius. 
       - Write your response as actionable bullet points. 
       - You MUST include a specific mini-scavenger hunt or observational task for the location using the Who, What, When, Where, and How framework.
       - Connect the field trip directly to the 'Hands-On Learning' experiments.

    // 🎒 THE DIGITAL BACKPACK RULE (Maximize Investment)
    6. LOOK & LEARN (Media): The parent currently subscribes to: [${activeSubsList}]. 
       - You MUST prioritize finding high-quality documentaries or shows on THESE specific platforms first. Only suggest outside platforms if absolutely necessary (like free YouTube resources).

    7. LET'S TALK (Kindling): Provide EXACTLY three (3) deep-thinking, open-ended questions related to the topic. Do not provide 2, do not provide 4. Exactly 3.

    8. HANDS-ON LEARNING: Provide 3 activities ("Around the House", "Out and About", "Big Ideas"). Restrict required supplies to common household items. NEVER leave these blank.
    
    9. RECOMMENDED READING: Provide exactly 3 Fiction and 3 Non-Fiction books perfectly targeted to ${grade} reading level.
    
    10. WORKSHEETS: Provide questions ONLY. Do NOT leave blank spaces or underscores for answers.`;

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
        letsTalk: { type: "array", items: { type: "string", description: "Exactly 3 deep questions." } },
        letsExplore: { type: "array", items: { type: "string", description: "Specific location, scavenger hunt instructions, and experiment alignments." } },
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
          content: `${systemPrompt}\n\nYou MUST use exactly this JSON schema to format your response:\n${JSON.stringify(jsonSchema)}\n\nIMPORTANT: NEVER return empty arrays. If you cannot find a perfect match, synthesize a highly creative, viable alternative.` 
        },
        { 
          role: "user", 
          // Injecting a timestamp seed to force the AI to rethink if given the exact same prompt twice
          content: `Seed: ${Date.now()}\n\nHere is the curriculum text to analyze:\n\n${lessonText}\n\nTarget Student Profile: ${studentProfile ? JSON.stringify(studentProfile) : 'None provided'}` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.85, // Bumped up slightly to encourage more creative, non-generic ideas
    });

    const generatedText = completion.choices[0].message.content;
    if (!generatedText) throw new Error("No content generated from OpenAI.");

    const parsedData = JSON.parse(generatedText);

    // 📍 THE SPARK FAILSAFE
    // If the AI hallucinates and returns empty arrays for core sections, throw an error.
    // This returns a 500 status to the dashboard, which aborts the Spark deduction!
    if (
      !parsedData.assessedFoundation || 
      !parsedData.letsPlay || parsedData.letsPlay.length === 0 ||
      !parsedData.lookAndLearn || parsedData.lookAndLearn.length === 0 ||
      !parsedData.letsExplore || parsedData.letsExplore.length === 0 ||
      !parsedData.letsTalk || parsedData.letsTalk.length < 3
    ) {
      throw new Error("AI returned an incomplete dataset.");
    }

    return NextResponse.json({ data: parsedData }, { status: 200 });
    
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate schedule." }, 
      { status: 500 } // Dashboard catches this 500 and prevents Spark deduction
    );
  }
}
