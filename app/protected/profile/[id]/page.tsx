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

  const postIds = posts?.map((post) => post.id) ?? [];

  const { data: comments } = postIds.length > 0
    ? await supabase
        .from("comments")
        .select("id, content, created_at, comment_user, comment_post")
        .in("comment_post", postIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const commenterIds = Array.from(
    new Set((comments ?? []).map((comment) => comment.comment_user))
  );

  const profileIds = Array.from(new Set([profileUserId, user.id, ...commenterIds]));

  const { data: profilesData } = profileIds.length > 0
    ? await supabase
        .from("users")
        .select("supabase_id, firstname, lastname")
        .in("supabase_id", profileIds)
    : { data: [] };

  const profiles = profilesData?.filter((profile) => profile.firstname) || [];

  const getAuthor = (userId: string) => {
    const found = profiles.find((profile) => profile.supabase_id === userId);
    if (!found) return { name: "Family Member", initial: "F" };
    return {
      name: `${found.firstname} ${found.lastname}`,
      initial: found.firstname[0],
    };
  };

  const author = {
    name: `${profile.firstname} ${profile.lastname}`,
    initial: profile.firstname[0],
  };

  const currentUser = {
    id: user.id,
    ...getAuthor(user.id),
  };

  const commentsByPostId = new Map<
    string,
    {
      id: string;
      content: string;
      created_at: string;
      comment_user: string;
      comment_post: string;
      author: {
        name: string;
        initial: string;
      };
    }[]
  >();

  (comments ?? []).forEach((comment) => {
    const entry = {
      ...comment,
      author: getAuthor(comment.comment_user),
    };
    const list = commentsByPostId.get(comment.comment_post) ?? [];
    list.push(entry);
    commentsByPostId.set(comment.comment_post, list);
  });

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
          posts.map((post) => {
            const postComments = commentsByPostId.get(post.id) ?? [];
            return (
              <Post
                key={post.id}
                post={post}
                author={author}
                comments={postComments}
                currentUser={currentUser}
              />
            );
          })
        )}
      </div>
    </main>
  );
}
