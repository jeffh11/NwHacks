import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChevronLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default async function GalleryPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: memberships } = await supabase
        .from("family_members")
        .select("family")
        .eq("user", user.id);

    if (!memberships || memberships.length === 0) redirect("/protected");
    const familyIds = memberships.map((m) => m.family);

    // Fetch only posts that have images
    const { data: photos } = await supabase
        .from("posts")
        .select("*")
        .in("post_family", familyIds)
        .eq("type", "image")
        .not("media_url", "is", null)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/protected/feed" 
                            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900"
                        >
                            <ChevronLeft size={28} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Photo Folder</h1>
                            <p className="text-slate-500 font-medium">All shared family memories</p>
                        </div>
                    </div>
                    <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <ImageIcon size={16} />
                        {photos?.length || 0} Photos
                    </div>
                </div>

                {/* The Folder Grid */}
                {(!photos || photos.length === 0) ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-bold text-lg">Your folder is empty. Start sharing! 📸</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div 
                                key={photo.id} 
                                className="group relative aspect-square bg-white rounded-[2rem] overflow-hidden border-4 border-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <img 
                                    src={photo.media_url!} 
                                    alt="Family memory" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <p className="text-white text-xs font-bold truncate">
                                        {new Date(photo.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}