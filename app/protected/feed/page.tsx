import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Image as ImageIcon, ArrowRight, Settings } from "lucide-react";
import FamilySidebar from "../../components/family-sidebar";
import Link from "next/link";
import Post from "./Post";
import QuestionOfTheDay from "./question-of-the-day";
import { getOrCreateFamilyQOTD } from "../../../utils/getqotd";


export default async function FeedPage() {
    const supabase = await createClient();

    /* 1️⃣ Auth & Family Check */
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: memberships } = await supabase
        .from("family_members")
        .select("family")
        .eq("user", user.id);

    if (!memberships || memberships.length === 0) redirect("/protected");
    const familyIds = memberships.map((m) => m.family);

    /* --- NEW: FETCH FAMILY NAME & DESCRIPTION --- */
    const { data: familyData } = await supabase
        .from("families")
        .select("name, description, owner")
        .in("id", familyIds)
        .single();

    /* 2️⃣ Fetch Profiles */
    const { data: membersData } = await supabase
        .from("family_members")
        .select("user")
        .in("family", familyIds);

    const uniqueUserIds = Array.from(
        new Set(membersData?.map((m) => m.user).filter(Boolean))
    );

    const { data: profilesData } = await supabase
        .from("users")
        .select("supabase_id, firstname, lastname, avatar_url")
        .in("supabase_id", uniqueUserIds);

    const profiles = profilesData?.filter((p) => p.firstname) || [];

    /* 3️⃣ Fetch Posts */
    const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .in("post_family", familyIds)
        .order("created_at", { ascending: false });

    const postIds = posts?.map((p) => p.id) ?? [];

    /* 4️⃣ Fetch Comments & Likes */
    const [{ data: comments }, { data: likes }] = await Promise.all([
        postIds.length
            ? supabase
                .from("comments")
                .select("id, content, created_at, comment_user, comment_post, audio_url, audio_duration_ms, audio_mime")
                .in("comment_post", postIds)
                .order("created_at", { ascending: true })
            : Promise.resolve({ data: [] }),
        postIds.length
            ? supabase.from("likes").select("post_id, user_id").in("post_id", postIds)
            : Promise.resolve({ data: [] }),
    ]);

    /* 5️⃣ Gallery Preview */
    const galleryPosts =
        posts?.filter((p) => p.type === "image" && p.media_url) ?? [];

    const getAuthor = (userId: string) => {
        const found = profiles.find((p) => p.supabase_id === userId);
        if (!found) return { name: "Family Member", initial: "F", avatarUrl: null };
        return {
            name: `${found.firstname} ${found.lastname}`,
            initial: found.firstname[0],
            avatarUrl: found.avatar_url || null,
        };
    };

    const currentUser = { id: user.id, ...getAuthor(user.id) };

    const commentsByPostId = new Map<string, any[]>();
    (comments ?? []).forEach((comment) => {
        const entry = { ...comment, author: getAuthor(comment.comment_user) };
        const list = commentsByPostId.get(comment.comment_post.toString()) ?? [];
        list.push(entry);
        commentsByPostId.set(comment.comment_post.toString(), list);
    });

    // QOTD: Fetch today's question and responses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDate = today.toISOString().split("T")[0];

    // Fetch today's question

    const qotdRow = await getOrCreateFamilyQOTD(familyIds[0]);

    if (!qotdRow) {
        throw new Error("Failed to load Question of the Day");
    }

    const qotdQuestion = qotdRow.question;


    const { data: qotdResponses } = await supabase
        .from("family_question_responses")
        .select(`
        id,
        user_id,
        response,
        created_at,
        users (
        firstname,
        lastname,
        avatar_url
        )
    `)
        .eq("family_id", familyIds[0])
        .eq("response_date", todayDate)
        .order("created_at", { ascending: true });



    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex justify-center p-4 md:p-8">
            <div className="max-w-[90rem] w-full grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* QUESTION OF THE DAY */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24">
                        <QuestionOfTheDay
                            question={qotdQuestion}
                            responses={qotdResponses || []}
                            currentUser={currentUser}
                            familyId={familyIds[0]}
                        />
                    </div>
                </div>

                {/* MAIN FEED */}
                <div className="lg:col-span-2 space-y-10">
                    <header className="bg-white rounded-xl shadow p-6 flex justify-between items-center mb-4 gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                {familyData?.name + " Feed" || "Family Feed"}
                            </h1>

                            <p className="text-slate-500 font-medium italic">
                                {familyData?.description || "Your latest family moments"}
                            </p>

                            {/* 🔑 JOIN CODE */}
                            <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase">
                                    Join Code
                                </span>
                                <span className="font-mono text-sm font-bold text-slate-800 tracking-wider">
                                    {familyIds[0]}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                            {familyData?.owner === user.id && (
                                <Link
                                    href="/protected/family/edit"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-amber-800 font-bold hover:bg-amber-50 transition-all border-2 border-amber-200 whitespace-nowrap"
                                    title="Edit Family"
                                >
                                    <Settings className="h-5 w-5 flex-shrink-0" />
                                    <span>Edit Family</span>
                                </Link>
                            )}
                            <Link
                                href="/protected/create-post"
                                className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl shadow-lg transition-transform active:scale-95 flex-shrink-0"
                            >
                                <Plus size={24} />
                            </Link>
                        </div>
                    </header>


                    {/* GALLERY PREVIEW */}
                    {galleryPosts.length > 0 && (
                        <section className="bg-white rounded-xl shadow p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ImageIcon size={20} className="text-orange-500" />
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
                                        Photo Gallery
                                    </h2>
                                </div>

                                <Link
                                    href="/protected/feed/gallery"
                                    className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
                                >
                                    View Folder
                                    <ArrowRight
                                        size={16}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {galleryPosts.slice(0, 6).map((post) => (
                                    <div
                                        key={post.id}
                                        className="aspect-square rounded-lg overflow-hidden shadow-sm"
                                    >
                                        <img
                                            src={post.media_url!}
                                            alt="Family memory"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <hr className="border-slate-200" />

                    {/* POSTS */}
                    <div className="space-y-6">
                        {!posts || posts.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
                                <p className="text-slate-400 font-bold text-lg">
                                    No memories shared yet. 💛
                                </p>
                            </div>
                        ) : (
                            posts.map((post) => {
                                const author = getAuthor(post.post_user);
                                const postComments =
                                    commentsByPostId.get(post.id.toString()) ?? [];
                                const postLikes =
                                    likes?.filter((l) => l.post_id === post.id) ?? [];
                                const isLikedByMe = postLikes.some(
                                    (l) => l.user_id === user.id
                                );

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
                </div>

                {/* FAMILY SIDEBAR */}
                <div className="lg:col-span-1">
                    <FamilySidebar
                        profiles={profiles}
                        familyId={familyIds[0]}
                        currentUserId={user.id}
                    />
                </div>
            </div>
        </div>
    );
}