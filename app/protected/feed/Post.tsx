'use client';

import { useState } from "react";
import { MessageCircle, Heart, Share2, Clock } from "lucide-react";

export default function Post({ post, author }: { post: any, author: any }) {
    // State to track if the heart is clicked
    const [isLiked, setIsLiked] = useState(false);

    const toggleLike = () => {
        setIsLiked(!isLiked);
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

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                <div className="flex gap-2">
                    {/* Like Button with Toggle Logic */}
                    <button 
                        onClick={toggleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-bold text-sm ${
                            isLiked 
                            ? "bg-rose-50 text-rose-500" 
                            : "text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                        }`}
                    >
                        <Heart 
                            size={20} 
                            fill={isLiked ? "currentColor" : "none"} 
                            className={isLiked ? "scale-110 transition-transform" : ""}
                        /> 
                        {isLiked ? "Liked" : "Like"}
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
}