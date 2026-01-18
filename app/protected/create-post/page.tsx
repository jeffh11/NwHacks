import { createClient } from "@/lib/supabase/server";
import { createPost } from "./actions"; // The server action we fixed
import { Camera, Video, Image as ImageIcon, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreatePostPage() {
  const supabase = await createClient();
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch the families this user actually belongs to
  const { data: memberships } = await supabase
    .from("family_members")
    .select(`
      family_id,
      families (
        id,
        name
      )
    `)
    .eq("user_id", user?.id);

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 p-6 md:p-10">
      
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-orange-300/60 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-amber-200/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back Button */}
        <Link href="/protected" className="inline-flex items-center gap-2 text-orange-600 font-bold mb-4 hover:opacity-70 transition-opacity">
          <ArrowLeft size={18} />
          Back to Hub
        </Link>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-orange-950 tracking-tight text-shadow-sm">Family Share</h1>
          <p className="text-orange-800/60 font-medium italic">Create a new memory</p>
        </div>

        {/* 3. Wrap in a Form with the Server Action */}
        <form action={createPost} className="relative bg-white/95 border border-orange-200 shadow-[0_20px_50px_rgba(255,138,0,0.15)] rounded-3xl overflow-hidden backdrop-blur-md">
          
          <div className="h-2 w-full bg-gradient-to-r from-orange-300 via-orange-500 to-amber-400" />
          
          <div className="p-6">
            {/* Family Selector */}
            <div className="mb-4">
              <label className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2 block">Posting to:</label>
              <select 
                name="familyId" 
                required
                className="w-full bg-orange-50 border border-orange-100 text-orange-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none transition-all cursor-pointer appearance-none"
              >
                {memberships?.map((m: any) => (
                  <option key={m.families.id} value={m.families.id}>
                    {m.families.name}
                  </option>
                ))}
                {(!memberships || memberships.length === 0) && (
                  <option disabled>No families found</option>
                )}
              </select>
            </div>

            {/* Text Input - Name matches the 'text' column in your SQL */}
            <textarea 
              name="content"
              required
              rows={5}
              className="w-full p-4 bg-transparent text-lg text-orange-950 placeholder:text-orange-200 border-none focus:ring-0 resize-none outline-none"
              placeholder="What's happening today?"
            />

            {/* Media Preview (Visual only for now) */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
               <div className="relative min-w-[100px] h-[100px] bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200 flex items-center justify-center text-orange-300/50">
                  <ImageIcon size={24} />
               </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-orange-100">
              <div className="flex gap-2">
                <button type="button" className="p-3 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button type="button" className="p-3 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                  <Video size={20} />
                </button>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95"
              >
                <span>Share Post</span>
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-orange-600 font-black">
          Encrypted & Private
        </p>
      </div>
    </div>
  );
}