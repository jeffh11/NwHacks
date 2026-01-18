"use server";

import { createClient } from "@/lib/supabase/server";
import { QUESTION_BANK } from "@/lib/qotd-questions";

export async function getOrCreateFamilyQOTD(familyId: string) {
  const supabase = await createClient(); // ✅ FIX

  const today = new Date().toISOString().split("T")[0];

  // 1️⃣ Try to fetch today's QOTD
  const { data: existingQOTD, error } = await supabase
    .from("family_daily_questions")
    .select("*")
    .eq("family_id", familyId)
    .eq("created_at", today)
    .single();

  if (existingQOTD) {
    return existingQOTD;
  }

  // Ignore "no rows" error
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  // 2️⃣ Pick random question
  const randomQuestion =
    QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];

  // 3️⃣ Insert new QOTD
  const { data: newQOTD, error: insertError } = await supabase
    .from("family_daily_questions")
    .insert({
      family_id: familyId,
      question: randomQuestion,
      created_at: today,
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newQOTD;
}
