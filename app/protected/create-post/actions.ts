"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export async function createPost(formData: FormData): Promise<void> {
  const supabase = await createClient();

  // 1. Get the current logged-in user from Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 2. Pull values from your form
  const content = formData.get("content") as string;
  const familyId = formData.get("familyId") as string;
  const mediaFile = formData.get("media") as File | null;

  let mediaUrl: string | null = null;
  let postType: "text" | "image" | "video" = "text";

  // 3. Handle media upload if present
  // Check if file exists and has content (empty file input returns File with size 0)
  if (mediaFile instanceof File && mediaFile.size > 0 && mediaFile.name) {
    // Validate file type
    const mimeType = mediaFile.type;
    if (!mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
      throw new Error(`Invalid file type: ${mimeType}. Only images and videos are allowed.`);
    }

    // Determine post type
    postType = mimeType.startsWith("image/") ? "image" : "video";

    // Generate unique file path
    const fileExt = mediaFile.name.split(".").pop();
    const fileName = `${user.id}/${familyId}/${randomUUID()}-${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await mediaFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError.message);
      throw new Error(`Failed to upload media: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(fileName);

    mediaUrl = urlData.publicUrl;
  }

  // 4. Insert into the database
  const { error } = await supabase.from("posts").insert({
    post_user: user.id,
    post_family: familyId,
    created_at: new Date().toISOString(),
    type: postType,
    text: content,
    media_url: mediaUrl,
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    throw new Error(`Failed to create post: ${error.message}`);
  }

  // 5. Redirect to dashboard on success
  redirect("/protected/feed");
}