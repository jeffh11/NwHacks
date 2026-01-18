"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const userId = formData.get("userId") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const avatarFile = formData.get("avatar") as File | null;

  // Only allow users to update their own profile
  if (userId !== user.id) {
    return { error: "Unauthorized" };
  }

  // Validate names
  if (!firstName?.trim() || !lastName?.trim()) {
    return { error: "First name and last name are required" };
  }

  let avatarUrl: string | null = null;

  // Handle avatar upload if present
  if (avatarFile instanceof File && avatarFile.size > 0 && avatarFile.name) {
    // Validate file type
    const mimeType = avatarFile.type;
    if (!mimeType.startsWith("image/")) {
      return { error: "Invalid file type. Only images are allowed." };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (avatarFile.size > maxSize) {
      return { error: "File size must be less than 5MB" };
    }

    // Get existing avatar URL to potentially delete old one
    const { data: existingProfile } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("supabase_id", user.id)
      .single();

    // Generate unique file path
    const fileExt = avatarFile.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (upsert: true to replace if exists)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError.message);
      return { error: `Failed to upload avatar: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    avatarUrl = urlData.publicUrl;

    // Delete old avatar if it exists and is different
    if (existingProfile?.avatar_url && existingProfile.avatar_url !== avatarUrl) {
      // Extract the path from the URL
      const oldPathMatch = existingProfile.avatar_url.match(/avatars\/(.+)$/);
      if (oldPathMatch) {
        await supabase.storage
          .from("avatars")
          .remove([oldPathMatch[1]]);
      }
    }
  }

  // Update profile in database
  const updateData: { firstname: string; lastname: string; avatar_url?: string | null } = {
    firstname: firstName.trim(),
    lastname: lastName.trim(),
  };

  // Only update avatar_url if a new file was uploaded, or explicitly set it to null if clearing
  if (avatarFile instanceof File && avatarFile.size > 0) {
    updateData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("supabase_id", user.id);

  if (error) {
    console.error("Supabase Error:", error.message);
    return { error: `Failed to update profile: ${error.message}` };
  }

  revalidatePath(`/protected/profile/${user.id}`);
  return {};
}
