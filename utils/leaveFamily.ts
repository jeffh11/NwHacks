"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function leaveFamily(familyId: string) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await sb
    .from("family_members")
    .delete()
    .eq("family", familyId)
    .eq("user", user.id);

  if (error) {
    throw error;
  }

  redirect("/protected");
}
