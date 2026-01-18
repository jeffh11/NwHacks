import { createClient } from "@/lib/supabase/server";
import Card from "../../components/card";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const supabase = await createClient();

  /* 1️⃣ Auth */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  /* 2️⃣ Find user's family */
  const { data: membership, error: membershipError } = await supabase
    .from("family_members")
    .select("family")
    .eq("user", user.id)
    .single();

  if (!membership || membershipError) {
    redirect("/protected");
  }

  const familyCode = membership.family;

  /* 3️⃣ Fetch family info */
  const { data: family } = await supabase
    .from("families")
    .select("name, description")
    .eq("id", familyCode)
    .single();

  /* 4️⃣ Fetch posts for family */
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id,
      type,
      text,
      media_url,
      created_at,
      post_user,
      users:post_user (
        firstname,
        lastname
      )
    `
    )
    .eq("post_family", familyCode)
    .order("created_at", { ascending: false });

    console.log(posts)

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">

        {/* Family header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-800">
            {family?.name ?? "Family Feed"}
          </h1>
          {family?.description && (
            <p className="text-sm text-gray-500 mt-1">
              {family.description}
            </p>
          )}
        </div>

        {/* Feed */}
        {!posts || posts.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">
              No posts yet 💛
            </p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              {/* Author */}
              <p className="text-sm font-medium text-gray-700 mb-2">
                {post.users?.firstname} {post.users?.lastname}
              </p>

              {/* Text post */}
              {post.type === "text" && (
                <p className="text-gray-800">{post.text}</p>
              )}

              {/* Media post */}
              {post.type === "media" && post.media_url && (
                <img
                  src={post.media_url}
                  alt="Family post"
                  className="rounded-lg w-full object-cover"
                />
              )}

              {/* Audio post */}
              {post.type === "audio" && post.media_url && (
                <audio controls className="w-full">
                  <source src={post.media_url} />
                </audio>
              )}

              <p className="text-xs text-gray-400 mt-3">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
