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
    const systemPrompt = `
      You are a master homeschool curriculum planner and an expert in inclusive, multi-sensory education.
      Read the provided weekly lesson topics and generate a highly personalized, hands-on enrichment plan.

      TARGET STUDENT PROFILE:
      - Name: ${nickname}
      - Grade: ${grade}
      - Learning Style: ${learningStyle}
      - Current Interests: ${interests}
      - Sensory Needs/Accommodations: ${sensoryNeeds}
      - Focus/Attention Span: ${focusDuration}

      YOUR DIRECTIVES:
      1. Map the core topics to specific real-world resources (YouTube channels, household experiments).
      2. Weave the student's "Current Interests" into the themes of the experiments or questions whenever logically possible to boost engagement.
      3. STRICTLY adhere to the "Sensory Needs" (e.g., if they avoid messy textures, provide a clean/dry experiment; if they need movement, make the activity physical).
      4. Pace the suggested activities based on the "Focus/Attention Span".
      5. Output ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting like \`\`\`json.

      REQUIRED JSON STRUCTURE:
      {
        "weekTheme": "A catchy, engaging title for the week",
        "studentProfile": "Customized for ${nickname} (${grade}) - Accommodating ${learningStyle} learning",
        "dailyFramework": [
          { "day": "Monday", "subject": "Core Subject", "topic": "Extracted Topic" }
        ],
        "mediaLinks": [
          { "topicReference": "Topic Name", "podcastName": "Name of a highly-rated educational podcast/YouTube channel", "youtubeSearchQuery": "Specific YouTube search query for this topic" }
        ],
        "catalysts": {
          "pantrySpark": { 
            "title": "Low-prep household experiment", 
            "cost": "Free/Pantry", 
            "supplies": ["Item 1", "Item 2"], 
            "instructions": "Step-by-step, keeping sensory needs in mind." 
          },
          "quickTripSpark": { 
            "title": "Slightly more involved project", 
            "cost": "Under $15", 
            "supplies": ["Item 1"], 
            "instructions": "Step-by-step." 
          },
          "capstoneSpark": { 
            "title": "End-of-week major project", 
            "cost": "Varies", 
            "supplies": ["Item 1"], 
            "instructions": "Step-by-step." 
          }
        },
        "illuminations": ["Deep dive question 1", "Deep dive question 2"],
        "kindling": ["Dinner table starter 1", "Dinner table starter 2"]
      }
    `;

    // Call OpenAI using the fast and cheap gpt-4o-mini model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the curriculum text to analyze:\n\n${lessonText}` }
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