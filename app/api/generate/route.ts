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
    1. ACADEMIC RIGOR: Match exact complexity. If "3-digit addition," games and worksheets MUST be 3-digit.
    2. GAMES (4 EXACT): Recommend exactly 4 games with varying modalities (board, card, drawing, verbal).
    3. READING LIST (3 BOOKS): Recommend exactly 3 books perfectly matching the student's reading_grade. Give Title and Author.
    4. WRITING PROMPT: 1 highly engaging writing prompt tailored exactly to the student.
    5. WORKSHEET VOLUME TO TIME ALIGNMENT: Generate ONE printable worksheet for EACH day. You MUST scale the actual volume of questions to the student's 'focus_duration'. If focus is 45 minutes, provide 20-30 problems or a long multi-step project. If focus is 10 minutes, provide 3-5 quick problems. Do NOT give 5 problems for a 45-minute block.
    6. CATALYSTS: Provide all three (Pantry, Quick-Trip, Capstone).
    7. NO OMITTED DATA: You MUST generate the Illuminations and Kindling arrays. Do not leave them empty.
    
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
        readingList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Exact book title." },
              author: { type: "string" },
              description: { type: "string", description: "Why this book fits the theme and reading level." }
            },
            required: ["title", "author", "description"]
          }
        },
        writingPrompt: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The actual writing prompt text for the student." },
            tipsForParent: { type: "string", description: "How the parent can help them execute this." }
          },
          required: ["prompt", "tipsForParent"]
        },
        printableWorksheets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "string", description: "The day of the week this matches." },
              worksheetTitle: { type: "string" },
              estimatedDuration: { type: "string", description: "e.g., '15 minutes' matching the student's profile." },
              content: { 
                type: "array", 
                items: { type: "string" },
                description: "An array of questions, word problems, or sentences tailored in length to their focus duration."
              }
            },
            required: ["day", "worksheetTitle", "estimatedDuration", "content"]
          }
        },
        familyGameNight: {
          type: "array",
          items: {
            type: "object",
            properties: {
              gameName: { type: "string", description: "Specific commercial board, card, or verbal game." },
              modality: { type: "string", description: "e.g., Card Game, Board Game, Drawing, Verbal, Physical" },
              skillsReinforced: { type: "string" },
              description: { type: "string" }
            },
            required: ["gameName", "modality", "skillsReinforced", "description"]
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
              },
              required: ["title", "supplies", "instructions", "cost"]
            },
            quickTripSpark: {
              type: "object",
              properties: {
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                cost: { type: "string" }
              },
              required: ["title", "supplies", "instructions", "cost"]
            },
            capstoneSpark: {
              type: "object",
              properties: {
                title: { type: "string" },
                supplies: { type: "array", items: { type: "string" } },
                instructions: { type: "string" },
                cost: { type: "string" }
              },
              required: ["title", "supplies", "instructions", "cost"]
            }
          },
          required: ["pantrySpark", "quickTripSpark", "capstoneSpark"]
        },
        illuminations: { type: "array", items: { type: "string" } },
        kindling: { type: "array", items: { type: "string" } }
      },
      required: ["weekTheme", "studentProfile", "dailyFramework", "mediaLinks", "readingList", "writingPrompt", "printableWorksheets", "familyGameNight", "carPodcasts", "catalysts", "illuminations", "kindling"]
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