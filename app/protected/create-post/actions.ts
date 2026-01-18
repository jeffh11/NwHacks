"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData): Promise<void> {
  const supabase = await createClient();

  // 1. Get the current logged-in user from Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 2. Pull values from your form
  const content = formData.get("content") as string;
  const familyId = formData.get("familyId") as string;

  // 3. Insert into the database
  const { error } = await supabase.from("posts").insert({
    post_user: user.id,            // Use user.id (this is the UUID from Auth)
    post_family: familyId,         
    created_at: new Date().toISOString(),
    type: "text",                  
    text: content,                 
    media_url: null                
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    return; 
  }

  // 4. Redirect to dashboard on success
  redirect("/protected/dashboard");
}