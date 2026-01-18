import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { redirect, notFound } from "next/navigation";
import Post from "../../feed/Post";
import EditProfileForm from "./edit-profile-form";
import Avatar from "@/components/avatar";

interface ProfilePageProps {
  params: Promise<{ id: string }>
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
    .select("firstname, lastname, avatar_url")
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

  const [{ data: comments }, { data: likes }] = await Promise.all([
    postIds.length > 0
      ? supabase
        .from("comments")
        .select("id, content, created_at, comment_user, comment_post, audio_url, audio_duration_ms, audio_mime")
        .in("comment_post", postIds)
        .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
    postIds.length > 0
      ? supabase.from("likes").select("post_id, user_id").in("post_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const commenterIds = Array.from(
    new Set((comments ?? []).map((comment) => comment.comment_user))
  );

  const profileIds = Array.from(new Set([profileUserId, user.id, ...commenterIds]));

  const { data: profilesData } = profileIds.length > 0
    ? await supabase
      .from("users")
      .select("supabase_id, firstname, lastname, avatar_url")
      .in("supabase_id", profileIds)
    : { data: [] };

  const profiles = profilesData?.filter((profile) => profile.firstname) || [];

  const getAuthor = (userId: string) => {
    const found = profiles.find((profile) => profile.supabase_id === userId);
    if (!found) return { name: "Family Member", initial: "F", avatarUrl: null };
    return {
      name: `${found.firstname} ${found.lastname}`,
      initial: found.firstname[0],
      avatarUrl: found.avatar_url || null,
    };
  };

  const author = {
    name: `${profile.firstname} ${profile.lastname}`,
    initial: profile.firstname[0],
    avatarUrl: profile.avatar_url || null,
  };

  const currentUser = {
    id: user.id,
    ...getAuthor(user.id),
  };

  const isOwnProfile = user.id === profileUserId;

  const commentsByPostId = new Map<
    string,
    {
      id: string;
      content: string;
      created_at: string;
      comment_user: string;
      comment_post: string;
      audio_url?: string | null;
      audio_duration_ms?: number | null;
      audio_mime?: string | null;
      author: {
        name: string;
        initial: string;
        avatarUrl?: string | null;
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
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">

        {/* Profile header */}
        {!isOwnProfile && (
          <Card className="border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Avatar
                    name={`${profile.firstname} ${profile.lastname}`}
                    initial={profile.firstname[0]}
                    avatarUrl={profile.avatar_url || null}
                    size="xl"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">
                    {profile.firstname} {profile.lastname}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Family member
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Profile Form (only for own profile) */}
        {isOwnProfile && (
          <Card className="border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Profile</h2>
              <EditProfileForm
                userId={user.id}
                initialFirstName={profile.firstname}
                initialLastName={profile.lastname}
                initialAvatarUrl={profile.avatar_url}
              />
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        {!posts || posts.length === 0 ? (
          <Card className="border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <p className="text-center text-slate-500">
                No posts yet
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const postComments = commentsByPostId.get(post.id) ?? [];
            const postLikes = likes?.filter((l) => l.post_id === post.id) ?? [];
            const isLikedByMe = postLikes.some((l) => l.user_id === user.id);
            return (
              <Post
                key={post.id}
                post={post}
                author={author}
                comments={postComments}
                currentUser={currentUser}
                initialLikesCount={postLikes.length}
                initialIsLiked={isLikedByMe}
              />
            );
          })
        )}
      </div>
    </main>
  );
}
