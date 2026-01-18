"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- TYPES ---

type CreateCommentInput = {
  postId: string;
  text: string;
};

type CommentResponse = {
  id: string;
  content: string;
  created_at: string;
  comment_user: string;
};

// --- ACTIONS ---

/**
 * Creates a new comment
 */
export async function createComment({ postId, text }: CreateCommentInput): Promise<CommentResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Comment cannot be empty.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      comment_post: postId,
      comment_user: user.id,
      content: trimmed,
      created_at: new Date().toISOString()
    })
    .select("id, content, created_at, comment_user")
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