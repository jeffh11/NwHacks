"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const content = formData.get("content") as string;
  const familyId = formData.get("familyId") as string;

  const { error } = await supabase.from("posts").insert({
    post_user: user.id,
    post_family: familyId,
    text: content, 
    type: "text",
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    return; // Don't redirect if there is an error
  }

  // Redirect only on success
  redirect("/protected/dashboard");
}