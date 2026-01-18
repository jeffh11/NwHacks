import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Image as ImageIcon, ArrowRight } from "lucide-react";
import FamilySidebar from "../../components/family-sidebar";
import Link from "next/link";
import Post from "./Post";

export default async function FeedPage() {
    const supabase = await createClient();

    // 1. Auth & Family Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: memberships } = await supabase
        .from("family_members")
        .select("family")
        .eq("user", user.id);

    if (!memberships || memberships.length === 0) redirect("/protected");
    const familyIds = memberships.map((m) => m.family);

    // 2. Fetch Profiles
    const { data: membersData } = await supabase
        .from("family_members")
        .select("user")
        .in("family", familyIds);

    const uniqueUserIds = Array.from(new Set(membersData?.map(m => m.user).filter(id => !!id)));

    const { data: profilesData } = await supabase
        .from("users")
        .select("supabase_id, firstname, lastname")
        .in("supabase_id", uniqueUserIds);

    const profiles = profilesData?.filter(p => p.firstname) || [];

    // 3. Fetch Posts
    const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .in("post_family", familyIds)
        .order("created_at", { ascending: false });

    const postIds = posts?.map((post) => post.id) ?? [];

    // --- FETCH LIKES & COMMENTS ---
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
            : Promise.resolve({ data: [] })
    ]);

    // 4. Gallery Logic: Filter for media only
    const galleryPosts = (posts ?? []).filter(p => p.type === "image" && p.media_url);

    const getAuthor = (userId: string) => {
        const found = profiles.find(p => p.supabase_id === userId);
        if (!found) return { name: "Family Member", initial: "F" };
        return { name: `${found.firstname} ${found.lastname}`, initial: found.firstname[0] };
    };

    const currentUser = { id: user.id, ...getAuthor(user.id) };

    const commentsByPostId = new Map<string, any[]>();
    (comments ?? []).forEach((comment) => {
        const entry = { ...comment, author: getAuthor(comment.comment_user) };
        const list = commentsByPostId.get(comment.comment_post.toString()) ?? [];
        list.push(entry);
        commentsByPostId.set(comment.comment_post.toString(), list);
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] flex justify-center p-4 md:p-8">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* MAIN FEED COLUMN */}
                <div className="lg:col-span-2 space-y-10">
                    <header className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Family Feed</h1>
                            <p className="text-slate-500 font-medium italic">Your latest family moments</p>
                        </div>
                        <div className="flex gap-2">
                            {/* NEW: Quick Access Gallery Button in Header */}
                            <Link
                                href="/protected/gallery"
                                title="Gallery"
                                className="bg-white border border-slate-200 text-slate-600 p-3 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center"
                            >
                                <ImageIcon size={24} />
                            </Link>
                            <Link
                                href="/protected/create-post"
                                className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl shadow-lg transition-transform active:scale-95 inline-flex items-center justify-center"
                            >
                                <Plus size={24} />
                            </Link>
                        </div>
                    </header>

                    {/* --- GALLERY SECTION --- */}
                    {galleryPosts.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <ImageIcon size={20} className="text-orange-500" />
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Photo Gallery</h2>
                                </div>
                                
                                {/* NEW: View All Folder Button */}
                                <Link 
                                    href="/protected/feed/gallery" 
                                    className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group transition-all"
                                >
                                    View Folder
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {galleryPosts.slice(0, 6).map((post) => (
                                    <div key={`gallery-${post.id}`} className="aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-sm hover:shadow-md transition-shadow">
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

                    {/* --- POSTS SECTION --- */}
                    <div className="space-y-6">
                        {(!posts || posts.length === 0) ? (
                            <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
                                <p className="text-slate-400 font-bold text-lg">No memories shared yet. 💛</p>
                            </div>
                        ) : (
                            posts.map((post) => {
                                const author = getAuthor(post.post_user);
                                const postComments = commentsByPostId.get(post.id.toString()) ?? [];
                                const postLikes = (likes ?? []).filter(l => l.post_id === post.id);
                                const isLikedByMe = postLikes.some(l => l.user_id === user.id);

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

                {/* SIDEBAR */}
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