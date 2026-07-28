import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateRequestPayload {
  promptText?: string;
  lessonText?: string;
  studentId?: string;
  userId?: string;
  studentProfile?: {
    grade?: string;
    focus_duration?: string;
    state_residence?: string;
    zip_code?: string;
    interests?: string; 
    sensory_needs?: string; 
  };
  subscriptions?: string[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequestPayload;
    const { promptText, lessonText, studentId, studentProfile, subscriptions } = body;
    
    // Support both payload formats (Dashboard vs Legacy)
    const contentToAnalyze = promptText || lessonText || "";

    // --- FIX 1: The Vercel URL Sledgehammer ---
    // Clean the URL to ensure Vercel's '/rest/v1/' injection doesn't break Auth
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

    // 1. Authenticate the user safely
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing token." }, { status: 401 });
    }

    const supabaseAuth = createClient(
      cleanUrl, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    const user = authData?.user;

    if (!user || authError) {
      console.error("Backend Auth Error:", authError);
      return NextResponse.json({ error: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // 2. Initialize Admin Client to bypass RLS for guaranteed backend saves
    const supabaseAdmin = createClient(
      cleanUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Check Sparks Remaining
    const { data: profile } = await (supabaseAdmin.from('profiles') as any)
      .select('sparks_remaining, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!profile || profile.sparks_remaining <= 0) {
      return NextResponse.json({ error: "Out of Sparks. Please upgrade or purchase a Spark Pack to continue." }, { status: 403 });
    }

    // 4. Fetch Student Profile Data
    let activeStudentProfile: any = studentProfile || {};
    if (studentId) {
      const { data: studentData } = await (supabaseAdmin.from('children_profiles') as any)
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentData) {
        activeStudentProfile = studentData;
      }
    }

    const focusDuration = activeStudentProfile?.focus_duration || "20 mins";
    const stateResidence = activeStudentProfile?.state_residence || "General US";
    const zipCode = activeStudentProfile?.zip_code || "None provided";
    const grade = activeStudentProfile?.grade || "Elementary";
    const specialInterests = activeStudentProfile?.interests || "None specified";
    const sensoryNeeds = activeStudentProfile?.sensory_needs || "None specified";

    const activeSubsList = subscriptions && subscriptions.length > 0 
      ? subscriptions.join(", ") 
      : "None listed. Rely on free or public resources.";

    const jsonSchema = {
      type: "object",
      properties: {
        assessedFoundation: { type: "string", description: "Conversational explanation of applicable state standards." },
        outlinedStandards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              subject: { type: "string" },
              topic: { type: "string", description: "The standard being met." }
            },
            required: ["subject", "topic"]
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
        buyableTools: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: { type: "string", description: "Real, physical products that can be purchased in a store (e.g., Fraction Tiles, Magnatiles)." },
              howToUse: { type: "string", description: "How to use this physically in the lesson." },
              searchQuery: { type: "string", description: "Best Amazon search term for this item." }
            },
            required: ["item", "howToUse", "searchQuery"]
          }
        },
        letsPlay: {
          type: "array",
          items: {
            type: "object",
            properties: {
              gameName: { type: "string", description: "Board game or physical game." },
              modality: { type: "string" },
              skillsReinforced: { type: "string" },
              description: { type: "string" },
              isBuyable: { type: "boolean", description: "True if this is a real store-bought game. False if it is a made-up game." },
              searchQuery: { type: "string", description: "If buyable, the Amazon search term. If not, leave blank." }
            },
            required: ["gameName", "modality", "skillsReinforced", "description", "isBuyable"]
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
        householdExperiments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              materials: { type: "string", description: "Comma separated list of household supplies." },
              instructions: { type: "string", description: "Full, step-by-step instructions on how to do this." }
            },
            required: ["title", "materials", "instructions"]
          }
        },
        outAndAbout: {
          type: "object",
          properties: {
            title: { type: "string", description: "Must name a REAL local place near the zip code." },
            supplies: { type: "array", items: { type: "string" } },
            instructions: { type: "string", description: "Scavenger hunt or activity at the location." },
            extendedConversation: { type: "string" }
          },
          required: ["title", "supplies", "instructions", "extendedConversation"]
        },
        letsTalk: { type: "array", items: { type: "string" } },
        endOfWeekReview: {
          type: "object",
          properties: {
            estimatedDuration: { type: "string" },
            worksheetTitle: { type: "string" },
            questions: { type: "array", items: { type: "string" } }
          },
          required: ["estimatedDuration", "worksheetTitle", "questions"]
        }
      },
      required: [
        "assessedFoundation", "outlinedStandards", "readingList", "buyableTools", "letsPlay", 
        "lookAndLearn", "householdExperiments", "outAndAbout", "letsTalk", "endOfWeekReview"
      ]
    };

    const systemPrompt = `You are MiSpark, a master homeschool educator. You design flexible, highly engaging, and non-obvious lesson plans.

    CRITICAL INSTRUCTIONS:
    1. FLEXIBILITY OVER SCHEDULES: Homeschoolers hate strict schedules. Do NOT assign any tasks, worksheets, or standards to specific "days of the week". Everything is fluid.
    2. APPLICABLE STANDARDS: Map their topics to the closest applicable ${stateResidence} state standard for a ${grade} student. 
    3. AMAZON AFFILIATE RULES: For "buyableTools", ONLY include actual, real physical products that can be purchased in a store. Do NOT put made-up games here.
    4. HOUSEHOLD EXPERIMENTS: For "householdExperiments", provide FULL, detailed instructions so the parent knows exactly how to execute it without Googling.
    5. LOCAL FIELD TRIPS (Zip Code ${zipCode}): You MUST name a REAL, physical museum, park, historical site, or local business near this zip code. 
    6. NO FAKE URLS: Provide exact titles only for media.
    7. END OF WEEK REVIEW: Generate ONE comprehensive "End of Week Review" consisting of deep-thinking questions.
    
    🛡️ THE ACADEMIC AUTONOMY OVERRIDE:
    8. ACADEMIC OBJECTIVITY: The parent has absolute autonomy over their curriculum. You MUST generate comprehensive, objective lesson plans for ALL requested topics. Do not censor, moralize, or water down the academic content.
    9. NO DISCLAIMERS: You are strictly forbidden from generating trigger warnings, safety disclaimers, or conversational apologies.
    10. CONCISENESS OVERRIDE: Keep descriptions, prompts, and questions punchy and direct to conserve tokens.

    You MUST output ONLY valid JSON matching this exact schema:
    ${JSON.stringify(jsonSchema)}`;

    // Pass the AbortSignal from Next.js directly to Anthropic so the Stop Button works
    const msg = await anthropic.messages.create({
      // --- RESTORED: The correct current Anthropic model ---
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Here is the curriculum text to analyze:\n\n${contentToAnalyze}\n\nTarget Student Profile: ${JSON.stringify({ grade, specialInterests, sensoryNeeds, focusDuration })}\n\nOutput strictly valid JSON starting with { and ending with } with no preamble or conversational text.` 
        }
      ]
    }, { signal: req.signal });

    const textBlock = msg.content.find((block) => block.type === 'text');
    const responseText = textBlock && 'text' in textBlock ? textBlock.text : "";

    if (!responseText) throw new Error("No content generated.");

    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      console.error("Raw Claude Output (No JSON found):", responseText);
      throw new Error("Claude failed to format the response as JSON.");
    }

    const cleanJsonString = responseText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(cleanJsonString);
    
    // 5. Save to lesson_plans
    const { data: savedPlan, error: insertError } = await (supabaseAdmin.from('lesson_plans') as any)
      .insert({
        parent_id: user.id,
        student_id: studentId || null,
        original_prompt: contentToAnalyze,
        plan_data: parsedData,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      throw new Error("Failed to save the generated plan.");
    }

    // 6. Deduct exactly 1 Spark
    await (supabaseAdmin.from('profiles') as any)
      .update({ sparks_remaining: profile.sparks_remaining - 1 })
      .eq('id', user.id);

    // Return the generated data and the DB planId for redirecting
    return NextResponse.json({ data: parsedData, planId: savedPlan.id }, { status: 200 });
    
  } catch (error: any) {
    if (error.name === "AbortError" || error.message?.includes("aborted")) {
      return NextResponse.json({ error: "Generation stopped by user." }, { status: 499 });
    }
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
  }
}