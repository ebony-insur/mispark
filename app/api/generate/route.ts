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
  weekAssigned?: string;
  weekStartDate?: string;
  weekEndDate?: string;
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
    const { promptText, lessonText, studentId, studentProfile, subscriptions, weekAssigned, weekStartDate, weekEndDate } = body;
    
    const contentToAnalyze = promptText || lessonText || "";

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

    // 2. Initialize Admin Client to bypass RLS
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

    // --- STUDENT MEMORY & PLAN REVIEW DISLIKES INJECTION ---
    let studentMemoryContext = "";
    let studentDislikes = "None specified";

    if (studentId) {
      const { data: pastArtifacts } = await (supabaseAdmin.from('portfolio_artifacts') as any)
        .select('standard_text, rating, notes, feedback_history')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(15);

      const { data: pastPlans } = await (supabaseAdmin.from('lesson_plans') as any)
        .select('plan_data, status, dislikes')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(15);

      if (pastArtifacts && pastArtifacts.length > 0) {
        studentMemoryContext += "\n\nPAST STUDENT PERFORMANCE & EDUCATOR FEEDBACK HISTORY:\n";
        pastArtifacts.forEach((art: any) => {
          studentMemoryContext += `- Standard/Topic: "${art.standard_text}" | Mastery Rating (1-5): ${art.rating || 'N/A'} | Notes/Feedback: "${art.notes || 'None'}"\n`;
        });
      }

      if (pastPlans && pastPlans.length > 0) {
        const allDislikes = pastPlans
          .map((p: any) => p.dislikes)
          .filter(Boolean)
          .join(", ");
        
        if (allDislikes) {
          studentDislikes = allDislikes;
        }

        const skippedPlans = pastPlans.filter((p: any) => p.status === 'skipped');
        if (skippedPlans.length > 0) {
          studentMemoryContext += "\nSKIPPED / DID NOT ATTEMPT PLANS (Avoid over-indexing on these topics):\n";
          skippedPlans.forEach((p: any) => {
            studentMemoryContext += `- Skipped Topic/Theme: "${p.plan_data?.weekAssigned || p.plan_data?.weekTheme || 'General Plan'}"\n`;
          });
        }
      }
    }

    const focusDuration = activeStudentProfile?.focus_duration || "20 mins";
    const stateResidence = activeStudentProfile?.state_residence || "General US";
    const zipCode = activeStudentProfile?.zip_code || "None provided";
    const grade = activeStudentProfile?.grade || "Elementary";
    const specialInterests = activeStudentProfile?.interests || "None specified";
    const sensoryNeeds = activeStudentProfile?.sensory_needs || "None specified";

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
              item: { type: "string", description: "Real, physical products that can be purchased in a store." },
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
              isBuyable: { type: "boolean" },
              searchQuery: { type: "string" }
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
              instructions: { type: "string", description: "Full, step-by-step instructions." }
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

    STUDENT LEARNING PROFILE & PREFERENCES:
    Grade: ${grade}
    Focus Duration: ${focusDuration}
    State Compliance Standard: ${stateResidence}
    Interests: ${specialInterests}
    Sensory Needs: ${sensoryNeeds}
    STRICTLY FORBIDDEN TOPICS / DISLIKES (Do NOT recommend these books, games, topics, or activities under any circumstances): ${studentDislikes}
    ${studentMemoryContext}

    CRITICAL INSTRUCTIONS:
    1. ABSOLUTE EXCLUSION: Never suggest anything matching or related to the student's DISLIKES list above.
    2. ADAPT TO PAST PERFORMANCE: Review past mastery ratings and educator feedback notes to scaffold or deepen content appropriately.
    3. FLEXIBILITY OVER SCHEDULES: Do NOT assign tasks to specific days of the week.
    4. APPLICABLE STANDARDS: Map topics to the closest applicable ${stateResidence} state standard. 
    5. AMAZON AFFILIATE RULES: For "buyableTools" and games, ONLY include real physical products.
    6. HOUSEHOLD EXPERIMENTS: Provide full, detailed instructions.
    7. LOCAL FIELD TRIPS (Zip Code ${zipCode}): Name a REAL local business, museum, or park near this zip code.
    8. END OF WEEK REVIEW: Generate ONE comprehensive review with deep-thinking questions.
    
    ACADEMIC AUTONOMY:
    9. Generate comprehensive, objective lesson plans without disclaimers or apologies.
    10. Keep descriptions and prompts direct and punchy.

    You MUST output ONLY valid JSON matching this exact schema:
    ${JSON.stringify(jsonSchema)}`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Here is the new curriculum text to analyze:\n\n${contentToAnalyze}\n\nOutput strictly valid JSON starting with { and ending with } with no preamble.` 
        }
      ]
    }, { signal: req.signal });

    const textBlock = msg.content.find((block) => block.type === 'text');
    const responseText = textBlock && 'text' in textBlock ? textBlock.text : "";

    if (!responseText) throw new Error("No content generated.");

    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Claude failed to format the response as JSON.");
    }

    const cleanJsonString = responseText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(cleanJsonString);
    
    parsedData.weekAssigned = weekAssigned || "General Weekly Assignments";
    parsedData.weekStartDate = weekStartDate || new Date().toISOString().split('T')[0];
    parsedData.weekEndDate = weekEndDate || new Date().toISOString().split('T')[0];
    
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

    return NextResponse.json({ data: parsedData, planId: savedPlan.id }, { status: 200 });
    
  } catch (error: any) {
    if (error.name === "AbortError" || error.message?.includes("aborted")) {
      return NextResponse.json({ error: "Generation stopped by user." }, { status: 499 });
    }
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
  }
}