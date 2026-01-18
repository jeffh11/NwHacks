'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // Use corrected path
import { MessageCircle, Heart, Share2, Clock } from "lucide-react";

export default function Post({ post, author, currentUserId }: { post: any, author: any, currentUserId: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchLikes = async () => {
            // Get total count
            const { count } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id);
            setLikesCount(count || 0);

            // Check if user has liked it
            const { data } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', currentUserId)
                .maybeSingle();
            if (data) setIsLiked(true);
        };
        fetchLikes();
    }, [post.id, currentUserId, supabase]);

    const toggleLike = async () => {
        const previouslyLiked = isLiked;
        setIsLiked(!previouslyLiked);
        setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1);

        if (previouslyLiked) {
            await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', currentUserId);
        } else {
            await supabase.from('likes').insert({ post_id: post.id, user_id: currentUserId });
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7 transition-all hover:shadow-md">
            {/* Post Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {author.initial}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">{author.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-black tracking-widest uppercase">
                        <Clock size={12} />
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Post Body - Text */}
            <div className="text-slate-800 text-xl font-medium mb-4 leading-relaxed px-1">
                {post.text || post.content}
            </div>

            {/* RESTORED: Image Rendering */}
            {(post.image_url || post.post_image) && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100">
                    <img 
                        src={post.image_url || post.post_image} 
                        alt="Family moment" 
                        className="w-full h-auto object-cover max-h-[500px]"
                    />
                </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                <div className="flex gap-2">
                    <button 
                        onClick={toggleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                            isLiked ? "bg-rose-50 text-rose-500" : "text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                        }`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110" : ""} /> 
                        {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold text-sm">
                        <MessageCircle size={20} /> Comment
                    </button>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
    );
}