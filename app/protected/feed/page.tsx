import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import Post from "./Post"; // Import the client component you just created

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

                {/* FEED */}
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
                            // Pass data to the Client Component
                            return (
                                <Post 
                                    key={post.id} 
                                    post={post} 
                                    author={author} 
                                />
                            );
                        })
                    )}
                </div>

                {/* SIDEBAR */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <h2 className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-slate-400">
                            <Users size={16} className="text-orange-500" /> Family Circle
                        </h2>

                        <div className="space-y-6">
                            {profiles.map((profile) => (
                                <div key={profile.supabase_id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:border-orange-200 group-hover:text-orange-500 transition-all">
                                            {profile.firstname[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{profile.firstname} {profile.lastname}</span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                                {profile.supabase_id === user.id ? "Online Now" : "Family Member"}
                                            </span>
                                        </div>
                                    </div>
                                    {profile.supabase_id === user.id && (
                                        <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                            Invite Member
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}