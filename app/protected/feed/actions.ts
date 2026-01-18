"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
