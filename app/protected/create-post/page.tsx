import { createClient } from "@/lib/supabase/server";
import { CreatePostForm } from "./create-post-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreatePostPage() {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch the families this user actually belongs to
  const { data: memberships } = await supabase
    .from("family_members")
    .select(`
      family,
      families (
        id,
        name
      )
    `)
    .eq("user", user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex justify-center px-6 py-8">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Link href="/protected/feed" className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-6 hover:text-orange-700 transition-colors">
          <ArrowLeft size={18} />
          Back to Feed
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create a Post</h1>
          <p className="text-slate-600">Share a memory with your family</p>
        </div>

        {/* Create Post Form */}
        {/* @ts-expect-error - Supabase type inference issue with nested select */}
        <CreatePostForm memberships={memberships || []} />
      </div>
    </div>
  );
}