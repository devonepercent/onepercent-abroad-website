import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SALES_SYSTEM_PROMPT, STUDENT_SYSTEM_PROMPT } from "./prompt-system.ts";
import { SALES_USER_PROMPT, STUDENT_USER_PROMPT } from "./prompt-user.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4.1-mini";

async function runOpenAICompletion(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", errorText);
    throw new Error("OpenAI API error");
  }

  const completion = await response.json();
  const content =
    completion.choices?.[0]?.message?.content?.trim() ||
    "No report generated. Please review the prompts and try again.";

  return content as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY_SALES");
    if (!openaiKey) {
      console.error("Missing OPENAI_API_KEY_SALES");
      throw new Error("OpenAI key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase URL or service role key");
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { userId, userEmail, cvText, candidateName } = await req.json();

    if (!userId || !cvText) {
      throw new Error("Missing userId or cvText");
    }

    const userLabel = userEmail ? `${userEmail} (${userId})` : userId;
    console.log("Running sales evaluation for user:", userLabel);

    const studentUserPrompt = STUDENT_USER_PROMPT(cvText, candidateName);
    const salesUserPrompt = SALES_USER_PROMPT(cvText, candidateName);

    const [studentReport, salesReport] = await Promise.all([
      runOpenAICompletion(openaiKey, STUDENT_SYSTEM_PROMPT, studentUserPrompt),
      runOpenAICompletion(openaiKey, SALES_SYSTEM_PROMPT, salesUserPrompt),
    ]);

    const { data, error } = await supabase
      .from("sales_evaluations")
      .insert({
        user_id: userId,
        candidate_name: candidateName || null,
        report: studentReport,
        student_report: studentReport,
        sales_report: salesReport,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting sales evaluation:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        evaluation: data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("sales-evaluation-ai error:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

