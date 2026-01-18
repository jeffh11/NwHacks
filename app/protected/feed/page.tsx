import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageCircle, Heart, Share2, Users, Clock, Plus } from "lucide-react";
import FamilySidebar from "../../components/family-sidebar";
import Link from "next/link";

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

    // 2. Fetch Members & Profiles
    const { data: membersData } = await supabase
        .from("family_members")
        .select("user")
        .in("family", familyIds);

    // Clean IDs: removes nulls or undefined values
    const uniqueUserIds = Array.from(new Set(membersData?.map(m => m.user).filter(id => !!id)));

    const { data: profilesData } = await supabase
        .from("users")
        .select("supabase_id, firstname, lastname")
        .in("supabase_id", uniqueUserIds);

    // CRITICAL FIX: Filter out any profiles that are missing names to stop the blank circles
    const profiles = profilesData?.filter(p => p.firstname) || [];

    // 3. Fetch Posts
    const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .in("post_family", familyIds)
        .order("created_at", { ascending: false });

    // 4. Helper to find a name with a fallback
    const getAuthor = (userId: string) => {
        const found = profiles.find(p => p.supabase_id === userId);
        if (!found) return { name: "Family Member", initial: "F" };
        return {
            name: `${found.firstname} ${found.lastname}`,
            initial: found.firstname[0]
        };
    };


    return (
        <div className="min-h-screen bg-[#f8fafc] flex justify-center p-4 md:p-8">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* FEED (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <header className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Family Feed</h1>
                            <p className="text-slate-500 font-medium italic">Your latest family moments</p>
                        </div>
                        <Link
                            href="/protected/create-post"
                            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl shadow-lg transition-transform active:scale-95 inline-flex items-center justify-center"
                        >
                            <Plus size={24} />
                        </Link>
                    </header>

                    {(!posts || posts.length === 0) ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
                            <p className="text-slate-400 font-bold text-lg">No memories shared yet. 💛</p>
                        </div>
                    ) : (
                        posts.map((post) => {
                            const author = getAuthor(post.post_user);
                            return (
                                <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7 transition-all hover:shadow-md">
                                    {/* Post Header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                                            {author.initial}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{author.name}</h3>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                                <Clock size={12} />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post Body */}
                                    <div className="text-slate-800 text-xl font-medium mb-8 leading-relaxed px-1">
                                        {post.text}
                                    </div>

                                    {/* Interaction Buttons (Visual for now to avoid extra libraries) */}
                                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors font-bold text-sm">
                                                <Heart size={20} /> Like
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-bold text-sm">
                                                <MessageCircle size={20} /> Comment
                                            </button>
                                        </div>
                                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* SIDEBAR (1/3) */}
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