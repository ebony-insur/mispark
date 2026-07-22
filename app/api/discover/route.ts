import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { grade, interest } = await req.json();

    if (!grade || !interest) {
      return NextResponse.json({ error: "Missing grade or interest." }, { status: 400 });
    }

    const systemPrompt = `You are an educational curator. The user is a homeschool parent looking for educational resources for a ${grade} student interested in: ${interest}.
    
    You must respond ONLY with a raw, valid JSON object exactly matching this structure. Do not include markdown formatting, backticks, or intro text.
    {
      "books": [
        { "title": "Exact Book Title", "reason": "1 short sentence why it's great" },
        { "title": "Exact Book Title", "reason": "1 short sentence why it's great" },
        { "title": "Exact Book Title", "reason": "1 short sentence why it's great" }
      ],
      "toys": [
        { "name": "Specific tactile educational toy or board game", "reason": "1 short sentence on what skill it builds" },
        { "name": "Specific tactile educational toy or board game", "reason": "1 short sentence on what skill it builds" },
        { "name": "Specific tactile educational toy or board game", "reason": "1 short sentence on what skill it builds" }
      ]
    }`;

    // Call Claude (using the fast, cheap Haiku model for this simple task)
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: `Generate resources for ${grade} learning about ${interest}.` }],
    });

    // Parse the JSON out of Claude's response
    const rawText = (response.content[0] as any).text;
    
    // Clean up just in case Claude added markdown backticks
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedText);

    return NextResponse.json({ results: resultJson }, { status: 200 });

  } catch (error: any) {
    console.error("Discover API Error:", error);
    return NextResponse.json({ error: "Failed to generate ideas." }, { status: 500 });
  }
}
