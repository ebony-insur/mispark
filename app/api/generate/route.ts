import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { lessonText, studentProfile } = body;

    if (!lessonText) {
      return NextResponse.json({ error: "Lesson text is required." }, { status: 400 });
    }

    // Safely extract student traits if a profile was passed
    const nickname = studentProfile?.nickname || "the student";
    const grade = studentProfile?.grade || "General";
    const learningStyle = studentProfile?.learning_style || "Standard";
    const interests = studentProfile?.interests || "General fun";
    const sensoryNeeds = studentProfile?.sensory_needs || "None specified";
    const focusDuration = studentProfile?.focus_duration || "Standard pacing";

    // Build the dynamic instruction string
   const systemPrompt = `You are a master homeschool curriculum architect. Your job is to take a provided lesson schedule or text and transform it into a highly specific, engaging weekly plan tailored for a neurodivergent student.
    
    CRITICAL INSTRUCTIONS:
    1. BE HYPER-SPECIFIC: Never give generic advice like "Watch a video on Khan Academy." You must provide exact, specific titles (e.g., "Watch: Math Antics - Basic Division on YouTube").
    2. MEDIA & EXPLORATION: Provide exact search queries or exact channel names.
    3. FAMILY GAME NIGHT: Recommend 1-2 specific board games, card games, or verbal games (like the mental math game "6-7") that the family can play together to reinforce this week's concepts.
    4. CAR PODCASTS & AUDIOBOOKS: Recommend 1-2 specific audiobooks or story-based podcasts. Align them with the theme if possible, but prioritize great storytelling. Mention that they can be found for free via library apps (Libby/Hoopla) or via subscriptions (Audible/Amazon Kindle).
    
    You MUST output your response in JSON format.`;

    const jsonSchema = {
      type: "object",
      properties: {
        weekTheme: { type: "string" },
        studentProfile: { type: "string" },
        dailyFramework: {
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
        mediaLinks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              topicReference: { type: "string" },
              podcastName: { type: "string", description: "The EXACT specific video or podcast title." },
              youtubeSearchQuery: { type: "string", description: "The exact terms to type into YouTube to find this specific video." }
            },
            required: ["topicReference", "podcastName", "youtubeSearchQuery"]
          }
        },
        familyGameNight: {
          type: "array",
          items: {
            type: "object",
            properties: {
              gameName: { type: "string", description: "Specific board, card, or verbal game." },
              skillsReinforced: { type: "string" },
              description: { type: "string" }
            },
            required: ["gameName", "skillsReinforced", "description"]
          }
        },
        carPodcasts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Specific audiobook or podcast episode." },
              description: { type: "string" },
              whereToListen: { type: "string", description: "Recommend Libby/Hoopla for free, or Audible/Amazon." }
            },
            required: ["title", "description", "whereToListen"]
          }
        },
        catalysts: {
          type: "object",
          properties: {
            pantrySpark: {
              type: "object",
              properties: {
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                cost: { type: "string" }
              }
            },
            quickTripSpark: {
              type: "object",
              properties: {
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                cost: { type: "string" }
              }
            },
            capstoneSpark: {
              type: "object",
              properties: {
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                cost: { type: "string" }
              }
            }
          },
          required: ["pantrySpark", "quickTripSpark", "capstoneSpark"]
        },
        illuminations: {
          type: "array",
          items: { type: "string" }
        },
        kindling: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["weekTheme", "studentProfile", "dailyFramework", "mediaLinks", "familyGameNight", "carPodcasts", "catalysts", "illuminations", "kindling"]
    };
    // Call OpenAI using the fast and cheap gpt-4o-mini model
const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt}\n\nYou MUST use exactly this JSON schema to format your response:\n${JSON.stringify(jsonSchema)}` 
        },
        { 
          role: "user", 
          content: `Here is the curriculum text to analyze:\n\n${lessonText}` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const generatedText = completion.choices[0].message.content;

    if (!generatedText) {
      throw new Error("No content generated from OpenAI.");
    }

    const jsonData = JSON.parse(generatedText);

    return NextResponse.json({ data: jsonData }, { status: 200 });

  } catch (error: any) {
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: error.message || "Failed to generate schedule." }, { status: 500 });
  }
}