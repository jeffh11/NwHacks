"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- TYPES ---

type CreateCommentInput = {
  postId: string;
  text: string;
  audioUrl?: string | null;
  audioDurationMs?: number | null;
  audioMime?: string | null;
};

type CommentResponse = {
  id: string;
  content: string;
  created_at: string;
  comment_user: string;
  audio_url: string | null;
  audio_duration_ms: number | null;
  audio_mime: string | null;
};

type DeletePostInput = {
  postId: string;
};

const MEDIA_PUBLIC_PREFIX = "/storage/v1/object/public/media/";

const getStoragePathFromUrl = (mediaUrl: string) => {
  try {
    const url = new URL(mediaUrl);
    const idx = url.pathname.indexOf(MEDIA_PUBLIC_PREFIX);
    if (idx === -1) return null;
    return url.pathname.slice(idx + MEDIA_PUBLIC_PREFIX.length);
  } catch {
    return null;
  }
};

// --- ACTIONS ---

/**
 * Creates a new comment
 */
export async function createComment({ 
  postId, 
  text, 
  audioUrl, 
  audioDurationMs, 
  audioMime 
}: CreateCommentInput): Promise<CommentResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const trimmed = text.trim();
  
  // Allow comments with either text or audio (or both)
  if (!trimmed && !audioUrl) {
    throw new Error("Comment must have either text or audio.");
  }

  // Validate audio metadata if audio URL is provided
  if (audioUrl && (!audioDurationMs || !audioMime)) {
    throw new Error("Audio metadata is required when audio URL is provided.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      comment_post: postId,
      comment_user: user.id,
      content: trimmed || null,
      audio_url: audioUrl || null,
      audio_duration_ms: audioDurationMs || null,
      audio_mime: audioMime || null,
      created_at: new Date().toISOString()
    })
    .select("id, content, created_at, comment_user, audio_url, audio_duration_ms, audio_mime")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create comment.");
  }

  revalidatePath("/protected/feed");
  return data;
}

/**
 * Toggles a like (Inserts if not liked, Deletes if already liked)
 */
export async function toggleLike(postId: number, isCurrentlyLiked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (isCurrentlyLiked) {
    // Remove the like
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
  } else {
    // Add the like
    const { error } = await supabase
      .from("likes")
      .insert({
        post_id: postId,
        user_id: user.id
      });

    if (error) throw new Error(error.message);
  }

  revalidatePath("/protected/feed");
}

/**
 * Deletes a post and its related data
 */
export async function deletePost({ postId }: DeletePostInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, post_user, media_url")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    throw new Error(postError?.message ?? "Post not found.");
  }

  if (post.post_user !== user.id) {
    throw new Error("You do not have permission to delete this post.");
  }

  const { error: postDeleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (postDeleteError) {
    throw new Error(postDeleteError.message);
  }

  if (post.media_url) {
    const storagePath = getStoragePathFromUrl(post.media_url);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([storagePath]);

      if (storageError) {
        console.warn("Failed to delete media:", storageError.message);
      }
    }
  }

  revalidatePath("/protected/feed");
}