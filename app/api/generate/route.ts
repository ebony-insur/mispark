import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { lessonText, studentProfile } = await req.json();

   const systemPrompt = `You are miSpark, a personable, highly-skilled homeschool co-teacher and personal assistant. Your tone is encouraging, concise, and time-saving. Your job is to transform a provided syllabus into a tailored, dynamic adventure.

    CRITICAL INSTRUCTIONS & EXCLUSIONS:
    1. EXCLUSIONS: Do NOT suggest any materials from MiAcademy or MiPrep. If the student uses a specific 'current_curriculum', do NOT suggest resources that are already included in that curriculum.
    2. PROGRESSIVE MASTERY: You MUST align content to the student's mastery levels provided. Do not regress.
    3. ASSESSED FOUNDATION: Start by telling the parent exactly what state standards and educational foundations you have assessed from their text so they understand the goal.
    4. RECOMMENDED READING (6 Books): Provide exactly 3 Fiction and 3 Non-Fiction books. For EACH book, include 1-2 subject tags (e.g., "Math", "History", "Science") and an accompanying Writing Prompt tailored to that specific book.
    5. LOOK & LEARN (Media): Provide specific platforms (e.g., Disney+, Netflix, National Geographic). Include this exact note: "Parent Tip: Pay close attention to the chapter match sections in these videos."
    6. HANDS-ON LEARNING (Catalysts): Provide exactly 3 activities: "Around the House", "Out and About" (neighborhood/local), and "Big Ideas" (capstone). EACH MUST include an "Extended Conversation" section detailing how parents can dive deeper (e.g., discussing fractions while eating the fruit salad).
    7. LET'S EXPLORE (Illuminations): Provide specific online games/apps (e.g., Prodigy, ABCmouse, Khan Academy) or specific types of local museums to tour.
    8. LET'S TALK (Kindling): Provide themed songs, and fully equip the parent with the historical context and foundations needed to lead family discussions on the topic. 
    9. WORKSHEETS: Provide questions ONLY. Do NOT leave blank spaces or lines for answers. Do NOT include numbers in your strings (the UI will handle numbered bullets). Align questions directly to the "Look & Learn" and "Hands-on" activities.
    
    You MUST output your response in the following JSON format:
    {
      "assessedFoundation": "A concise paragraph explaining the foundation and state standards targeted...",
      "outlinedStandards": [{"day": "Monday", "subject": "Math", "topic": "Fractions"}],
      "readingList": [
        {
          "title": "Book Title",
          "author": "Author",
          "type": "Fiction | Non-Fiction",
          "subjects": ["Math", "History"],
          "description": "Short description.",
          "writingPrompt": "Prompt related to this book."
        }
      ],
      "lookAndLearn": [{"topic": "...", "videoTitle": "...", "platform": "Disney+, Netflix, etc."}],
      "handsOnLearning": {
        "aroundTheHouse": {"title": "...", "supplies": ["..."], "instructions": "...", "extendedConversation": "..."},
        "outAndAbout": {"title": "...", "supplies": ["..."], "instructions": "...", "extendedConversation": "..."},
        "bigIdeas": {"title": "...", "supplies": ["..."], "instructions": "...", "extendedConversation": "..."}
      },
      "letsPlay": [{"gameName": "...", "modality": "...", "skillsReinforced": "...", "description": "..."}],
      "listenAndLearn": [{"title": "...", "description": "..."}],
      "letsExplore": ["Specific app or museum link/idea 1", "Idea 2"],
      "letsTalk": ["Themed song or historical discussion point 1", "Point 2"],
      "printableWorksheets": [
        {
          "day": "Monday",
          "worksheetTitle": "...",
          "estimatedDuration": "...",
          "questions": ["Question text without a number", "Question text without a number"]
        }
      ]
    }`;

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