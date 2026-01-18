import { createClient } from "@/lib/supabase/server";
import Card from "../../../components/card";
import { redirect, notFound } from "next/navigation";
import Post from "../../feed/Post";

interface ProfilePageProps {
  params: Promise<{id:string}>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient();
  const profileUserId = (await params).id;

  /* 1️⃣ Auth check */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  /* 2️⃣ Fetch profile info */
  const { data: profile } = await supabase
    .from("users")
    .select("firstname, lastname")
    .eq("supabase_id", profileUserId)
    .single();

  if (!profile) notFound();

  /* 3️⃣ Fetch user's posts (NO JOIN) */
  const { data: posts } = await supabase
    .from("posts")
    .select("id, type, text, media_url, created_at, post_user")
    .eq("post_user", profileUserId)
    .order("created_at", { ascending: false });

  const author = {
    name: `${profile.firstname} ${profile.lastname}`,
    initial: profile.firstname[0],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">

        {/* Profile header */}
        <Card>
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-800">
              {profile.firstname} {profile.lastname}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Family member
            </p>
          </div>
        </Card>

        {/* Posts */}
        {!posts || posts.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">
              No posts yet
            </p>
          </Card>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              author={author}
            />
          ))
        )}
      </div>
    </main>
  );
}
