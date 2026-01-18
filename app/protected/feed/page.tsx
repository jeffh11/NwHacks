import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageCircle, Heart, Share2, Users, Clock, Plus } from "lucide-react";

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

  // 2. Fetch Members & Profiles separately for stability
  const { data: membersData } = await supabase
    .from("family_members")
    .select("user")
    .in("family", familyIds);
  
  const uniqueUserIds = Array.from(new Set(membersData?.map(m => m.user)));
  
  const { data: profiles } = await supabase
    .from("users")
    .select("supabase_id, firstname, lastname")
    .in("supabase_id", uniqueUserIds);

  // 3. Fetch Posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .in("post_family", familyIds)
    .order("created_at", { ascending: false });

  // 4. Helper to find a name from a user ID
  const getAuthor = (userId: string) => {
    return profiles?.find(p => p.supabase_id === userId) || { firstname: "Family", lastname: "Member" };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FEED (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Family Feed</h1>
            <p className="text-slate-500 font-medium italic">Your latest family moments</p>
          </header>

          {(!posts || posts.length === 0) ? (
            <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
              <p className="text-slate-400 font-bold">No memories shared yet. 💛</p>
            </div>
          ) : (
            posts.map((post) => {
              const author = getAuthor(post.post_user);
              return (
                <div key={post.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-orange-400 flex items-center justify-center text-white font-bold text-lg">
                      {author.firstname[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{author.firstname} {author.lastname}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-800 text-xl font-medium mb-6">{post.text}</div>
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-rose-500"><Heart size={18} /> Like</button>
                    <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-900"><MessageCircle size={18} /> Comment</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SIDEBAR (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="flex items-center gap-2 font-black uppercase tracking-widest text-xs mb-8 text-slate-900">
              <Users size={18} className="text-orange-500" /> Family Circle
            </h2>
            <div className="space-y-5">
              {profiles?.map((profile) => (
                <div key={profile.supabase_id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm">
                    {profile.firstname[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{profile.firstname} {profile.lastname}</span>
                    <span className="text-[10px] font-medium text-slate-400">{profile.supabase_id === user.id ? "You" : "Member"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}