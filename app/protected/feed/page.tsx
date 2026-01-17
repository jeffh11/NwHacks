import { createClient } from "@/lib/supabase/server";
import Card from "../../components/card";

export default async function FamilyFeedPage() {
  const supabase = await createClient();

  // 1️⃣ Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Not authenticated</p>;
  }

  // 2️⃣ Get family membership (just grab the first one)
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Card>
          <h2 className="text-xl font-semibold mb-2">No family yet</h2>
          <p className="text-gray-500">
            Join or create a family to see your feed.
          </p>
        </Card>
      </main>
    );
  }

  const familyId = membership.family_id;

  // 3️⃣ Fetch posts for that family
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold text-center">
          Family Feed
        </h1>

        {!posts || posts.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">
              No posts yet. Check back soon 💛
            </p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <p className="text-gray-800 mb-2">{post.content}</p>
              <p className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
