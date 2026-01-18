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
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 p-6 md:p-10">

      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-orange-300/60 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-amber-200/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back Button */}
        <Link href="/protected" className="inline-flex items-center gap-2 text-orange-600 font-bold mb-4 hover:opacity-70 transition-opacity">
          <ArrowLeft size={18} />
          Back to Hub
        </Link>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-orange-950 tracking-tight text-shadow-sm">Family Share</h1>
          <p className="text-orange-800/60 font-medium italic">Create a new memory</p>
        </div>

        {/* Create Post Form */}
        {/* @ts-expect-error - Supabase type inference issue with nested select */}
        <CreatePostForm memberships={memberships || []} />

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-orange-600 font-black">
          Encrypted & Private
        </p>
      </div>
    </div>
  );
}