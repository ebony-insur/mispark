import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file was found in the request." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // --- 1. PDF EXTRACTION ---
    if (file.type === "application/pdf") {
      // THE BYPASS: Require the library directly at runtime to skip strict build checks
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } 
    
    // --- 2. RAW TEXT EXTRACTION ---
    else if (file.type === "text/plain") {
      extractedText = buffer.toString("utf-8");
    } 
    
    // --- 3. AI VISION EXTRACTION (IMAGES) ---
    else if (file.type.startsWith("image/")) {
      const base64Image = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64Image}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "You are an OCR extraction tool. Extract all the text from this image accurately. Return ONLY the raw extracted text. Do not include any conversational filler, markdown formatting, or introductory sentences." 
              },
              {
                type: "image_url",
                image_url: { url: dataUri },
              },
            ],
          },
        ],
      });

      extractedText = response.choices[0].message.content || "";
    } 
    
    // --- 4. UNSUPPORTED FILES ---
    else {
      return NextResponse.json(
        { error: "File type not supported. Please upload a PDF, TXT, JPG, or PNG." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: extractedText }, { status: 200 });

  } catch (error: any) {
    console.error("Extraction Error:", error);
    
    if (error.message && error.message.includes("API key")) {
      return NextResponse.json({ error: "Server configuration error: Missing AI API Key." }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Our servers failed to read this file. Ensure the image is clear or the PDF is not password-protected." },
      { status: 500 }
    );
  }
}