"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateFamily(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const familyId = formData.get("familyId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Validate that user is the owner
  const { data: family } = await supabase
    .from("families")
    .select("owner")
    .eq("id", familyId)
    .single();

  if (!family) {
    return { error: "Family not found" };
  }

  if (family.owner !== user.id) {
    return { error: "Only the family owner can edit the family" };
  }

  // Validate name
  if (!name?.trim()) {
    return { error: "Family name is required" };
  }

  // Update family
  const { error } = await supabase
    .from("families")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
    })
    .eq("id", familyId);

  if (error) {
    return { error: `Failed to update family: ${error.message}` };
  }

  revalidatePath("/protected/feed");
  revalidatePath("/protected/family/edit");
  return {};
}

export async function removeMember(familyId: string, memberId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate that user is the owner
  const { data: family } = await supabase
    .from("families")
    .select("owner")
    .eq("id", familyId)
    .single();

  if (!family) {
    return { error: "Family not found" };
  }

  if (family.owner !== user.id) {
    return { error: "Only the family owner can remove members" };
  }

  // Prevent removing the owner
  if (memberId === family.owner) {
    return { error: "Cannot remove the family owner" };
  }

  // Remove member
  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("family", familyId)
    .eq("user", memberId);

  if (error) {
    return { error: `Failed to remove member: ${error.message}` };
  }

  revalidatePath("/protected/feed");
  revalidatePath("/protected/family/edit");
  return {};
}
