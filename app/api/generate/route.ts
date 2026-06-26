import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { lessonText, studentProfile } = await req.json();

    const systemPrompt = `You are a master homeschool curriculum architect. Your job is to take a provided lesson schedule or text and transform it into a highly specific, engaging weekly plan tailored for a neurodivergent student.
    
    CRITICAL INSTRUCTIONS:
    1. ACADEMIC RIGOR (NO LAZY GENERALIZATIONS): You MUST match the exact complexity of the requested topic. If the prompt says "3-digit addition," your games and resources MUST be for 3-digit addition. Do not output basic single-digit math resources. If a grade level is provided in the student profile, ensure materials match it perfectly.
    2. BE HYPER-SPECIFIC: Never give generic advice. Provide exact, specific titles (e.g., "Math Antics - Basic Division").
    3. FAMILY GAME NIGHT: Recommend 1-2 exact board games, card games, or verbal games. We need the exact commercial name of the game if it is something they can buy (e.g., "Proof! Math Game").
    4. CAR PODCASTS & AUDIOBOOKS: Recommend 1-2 specific audiobooks or podcasts. Prioritize major titles found on Audible or Libby.
    
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
              youtubeSearchQuery: { type: "string", description: "Exact terms to type into YouTube to find this specific video." }
            },
            required: ["topicReference", "podcastName", "youtubeSearchQuery"]
          }
        },
        familyGameNight: {
          type: "array",
          items: {
            type: "object",
            properties: {
              gameName: { type: "string", description: "Specific commercial board, card, or verbal game." },
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
        illuminations: { type: "array", items: { type: "string" } },
        kindling: { type: "array", items: { type: "string" } }
      },
      required: ["weekTheme", "studentProfile", "dailyFramework", "mediaLinks", "familyGameNight", "carPodcasts", "catalysts", "illuminations", "kindling"]
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
  } catch (error: any) {
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: error.message || "Failed to generate schedule." }, { status: 500 });
  }
}