'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { MessageCircle, Heart, Share2, Clock } from "lucide-react";

export default function Post({ post, author, currentUserId }: { post: any, author: any, currentUserId: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        if (!post?.id || !currentUserId) return;

        const fetchLikes = async () => {
            // 1. Fetch total count for this post
            const { count, error: countError } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id);
            
            if (!countError) setLikesCount(count || 0);

            // 2. Check if the current user has already liked this post
            const { data, error: fetchError } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', currentUserId)
                .maybeSingle();
            
            if (data && !fetchError) setIsLiked(true);
        };

        fetchLikes();
    }, [post.id, currentUserId, supabase]);

    const toggleLike = async () => {
        if (!currentUserId) return;

        const previouslyLiked = isLiked;
        
        // Optimistic UI Update: Change the UI immediately for a fast feel
        setIsLiked(!previouslyLiked);
        setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1);

        if (previouslyLiked) {
            // Remove the like from the database
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', currentUserId);
            
            if (error) {
                console.error("Unlike error:", error);
                // Rollback if DB fails
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }
        } else {
            // Insert the like into the database
            const { error } = await supabase
                .from('likes')
                .insert({ 
                    post_id: post.id, 
                    user_id: currentUserId 
                });

            if (error) {
                console.error("Like error:", error);
                // Rollback if DB fails
                setIsLiked(false);
                setLikesCount(prev => prev - 1);
            }
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

            {/* Post Body */}
            <div className="text-slate-800 text-xl font-medium mb-4 leading-relaxed px-1">
                {post.text || post.content}
            </div>

            {/* Image Rendering */}
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
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110 transition-transform" : ""} /> 
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