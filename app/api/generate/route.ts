import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { MiSparkPayloadSchema } from '@/lib/schema';

// Initialize the OpenAI client using the key you just saved
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The strict Master System Prompt from the Blueprint
const SYSTEM_PROMPT = `You are the MiSpark Educational Engine, an expert homeschool curriculum architect.
Your job is to take a dry list of weekly digital lesson topics and transform them into engaging, hands-on, neurodivergent-friendly activities for a family.
Follow these strict generation rules:
1. MEDIA LINKS: For YouTube, provide an exact, highly-specific search query string. Recommend high-quality educational podcasts.
2. CATALYSTS: Generate exactly 3 hands-on activities based on the heaviest science/history topic. Pantry ($0-$3), Quick-Trip ($10-$15), Capstone ($25+).
3. ILLUMINATIONS: Provide 2 highly specific "rabbit hole" deep-dive questions.
4. KINDLING: Provide 2 casual dinner table conversation starters.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonText } = body;

    if (!lessonText) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Call OpenAI and force the output to match our schema
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Here is the weekly schedule to parse: \n\n${lessonText}` }
      ],
      response_format: zodResponseFormat(MiSparkPayloadSchema, "mispark_payload"),
    });

    const generatedPayload = completion.choices[0].message.parsed;

    return NextResponse.json({ 
      success: true, 
      message: "Schedule ignited successfully!",
      data: generatedPayload
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}