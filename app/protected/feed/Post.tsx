'use client';

import { useState, useTransition } from "react";
import { MessageCircle, Heart, Share2, Clock } from "lucide-react";
import { createComment } from "@/app/protected/feed/actions";

interface PostProps {
    post: {
        id: string;
        text: string | null;
        type: "text" | "image" | "video";
        media_url: string | null;
        created_at: string;
        post_user: string;
    };
    author: {
        name: string;
        initial: string;
    };
    comments: CommentData[];
    currentUser: {
        id: string;
        name: string;
        initial: string;
    };
}

type CommentData = {
    id: string;
    content: string;
    created_at: string;
    comment_user: string;
    author: {
        name: string;
        initial: string;
    };
};

export default function Post({ post, author, comments: initialComments, currentUser }: PostProps) {
    // 1. Track if the current user has liked it
    const [isLiked, setIsLiked] = useState(false);

    // 2. Track the total number of likes (starting at 0 for now)
    const [likesCount, setLikesCount] = useState(0);

    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState<string | null>(null);
    const [comments, setComments] = useState<CommentData[]>(initialComments);
    const [isSubmitting, startTransition] = useTransition();

    const toggleLike = () => {
        if (isLiked) {
            // If already liked, unlike it and decrease count
            setIsLiked(false);
            setLikesCount(prev => prev - 1);
        } else {
            // If not liked, like it and increase count
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
        }
        // Future: Call Supabase here to persist the data
    };

    const handleCommentToggle = () => {
        setShowComments(prev => !prev);
        setCommentError(null);
    };

    const handleCommentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = commentText.trim();
        if (!trimmed) {
            setCommentError("Write something before posting.");
            return;
        }

        startTransition(async () => {
            try {
                const newComment = await createComment({
                    postId: post.id,
                    text: trimmed
                });

                setComments(prev => [
                    ...prev,
                    {
                        ...newComment,
                        author: {
                            name: currentUser.name,
                            initial: currentUser.initial
                        }
                    }
                ]);
                setCommentText("");
                setCommentError(null);
                setShowComments(true);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to post comment.";
                setCommentError(message);
            }
        });
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
            {/* Text-only posts */}
            {post.type === "text" && post.text && (
                <div className="text-slate-800 text-xl font-medium mb-8 leading-relaxed px-1">
                    {post.text}
                </div>
            )}

            {/* Text for media posts (shown below media if text exists) */}
            {post.text && (post.type === "image" || post.type === "video") && (
                <div className="text-slate-800 text-xl font-medium mb-8 leading-relaxed px-1">
                    {post.text}
                </div>
            )}
            {/* Image Media */}
            {post.type === "image" && post.media_url && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                    <img
                        src={post.media_url}
                        alt="Post image"
                        className="w-full max-h-[600px] object-contain rounded-2xl"
                    />
                </div>
            )}


            {/* Video Media */}
            {post.type === "video" && post.media_url && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                    <video
                        src={post.media_url}
                        controls
                        className="w-full max-h-[600px] rounded-2xl"
                    />
                </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                <div className="flex gap-2">
                    <button
                        onClick={toggleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${isLiked
                            ? "bg-rose-50 text-rose-500"
                            : "text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                            }`}
                    >
                        <Heart
                            size={20}
                            fill={isLiked ? "currentColor" : "none"}
                            className={isLiked ? "scale-110 transition-transform" : ""}
                        />
                        {/* Display the like count and handle pluralization */}
                        <span>
                            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                        </span>
                    </button>

                    <button
                        onClick={handleCommentToggle}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-bold text-sm"
                    >
                        <MessageCircle size={20} />
                        {comments.length} {comments.length === 1 ? "comment" : "comments"}
                    </button>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <Share2 size={20} />
                </button>
            </div>

            {showComments && (
                <div className="mt-6 space-y-5">
                    {comments.length === 0 ? (
                        <p className="text-sm text-slate-400 font-semibold">No comments yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black uppercase">
                                        {comment.author.initial}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                            <span className="text-slate-800">{comment.author.name}</span>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleCommentSubmit} className="flex gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-300 to-rose-300 text-white flex items-center justify-center text-xs font-black uppercase">
                            {currentUser.initial}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                rows={2}
                                placeholder="Write a comment..."
                                className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-rose-500 font-semibold">
                                    {commentError ?? ""}
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || commentText.trim().length === 0}
                                    className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? "Posting..." : "Post"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}