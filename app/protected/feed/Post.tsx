'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Heart, Share2, Clock, Trash2, Send } from "lucide-react";
import { createComment, toggleLike, deletePost } from "@/app/protected/feed/actions";

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
    initialLikesCount: number;
    initialIsLiked: boolean;
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

export default function Post({ 
    post, 
    author, 
    comments: initialComments, 
    currentUser,
    initialLikesCount,
    initialIsLiked 
}: PostProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState<string | null>(null);
    const [comments, setComments] = useState<CommentData[]>(initialComments);
    const [isSubmitting, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const router = useRouter();

    const handleLikeToggle = async () => {
        const nextLikedState = !isLiked;
        setIsLiked(nextLikedState);
        setLikesCount(prev => nextLikedState ? prev + 1 : prev - 1);

        try {
            await toggleLike(Number(post.id), isLiked);
        } catch (error) {
            setIsLiked(isLiked);
            setLikesCount(likesCount);
            console.error("Failed to update like:", error);
        }
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

    const handleDeletePost = () => {
        if (isDeleting) return;
        const confirmed = window.confirm("Delete this post? This cannot be undone.");
        if (!confirmed) return;

        startDeleteTransition(async () => {
            try {
                await deletePost({ postId: post.id });
                setDeleteError(null);
                router.refresh();
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to delete post.";
                setDeleteError(message);
            }
        });
    };

    const canDelete = currentUser.id === post.post_user;

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)] group">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[1.2rem] bg-gradient-to-tr from-orange-500 to-rose-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-200">
                        {author.initial}
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg tracking-tight">{author.name}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-orange-500/60 uppercase font-black tracking-[0.15em]">
                            <Clock size={12} strokeWidth={3} />
                            {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>
                
                {canDelete && (
                    <button
                        onClick={handleDeletePost}
                        disabled={isDeleting}
                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all disabled:opacity-60"
                        aria-label="Delete post"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            {/* Post Body */}
            {post.text && (
                <div className="text-slate-700 text-lg font-medium mb-6 leading-relaxed px-1">
                    {post.text}
                </div>
            )}

            {/* Media with "Polaroid" style border effect */}
            {(post.type === "image" || post.type === "video") && post.media_url && (
                <div className="mb-6 rounded-[2rem] overflow-hidden border-[8px] border-slate-50 shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                    {post.type === "image" ? (
                        <img
                            src={post.media_url}
                            alt="Post content"
                            className="w-full max-h-[550px] object-cover"
                        />
                    ) : (
                        <video
                            src={post.media_url}
                            controls
                            className="w-full max-h-[550px] bg-black"
                        />
                    )}
                </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between pt-4">
                <div className="flex gap-3">
                    <button
                        onClick={handleLikeToggle}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-wider ${
                            isLiked
                                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                                : "bg-slate-50 text-slate-500 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                        <Heart
                            size={18}
                            fill={isLiked ? "currentColor" : "none"}
                            className={isLiked ? "animate-bounce" : ""}
                        />
                        <span>{likesCount}</span>
                    </button>

                    <button
                        onClick={handleCommentToggle}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-black text-xs uppercase tracking-wider"
                    >
                        <MessageCircle size={18} />
                        <span>{comments.length}</span>
                    </button>
                </div>
                
                <button className="p-3 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all">
                    <Share2 size={20} />
                </button>
            </div>

            {deleteError && (
                <p className="mt-3 text-xs text-rose-500 font-bold bg-rose-50 p-2 rounded-lg text-center">{deleteError}</p>
            )}

            {/* Comment Section */}
            {showComments && (
                <div className="mt-8 pt-8 border-t-2 border-slate-50 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
                        {comments.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-slate-400 font-bold italic">No stories here yet... be the first! ✨</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 items-start group/comment">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black uppercase border-2 border-white shadow-sm">
                                        {comment.author.initial}
                                    </div>
                                    <div className="bg-slate-50/80 rounded-2xl rounded-tl-none px-4 py-3 flex-1 transition-colors group-hover/comment:bg-orange-50/50">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-black text-slate-800">{comment.author.name}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-snug">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* New Comment Input */}
                    <form onSubmit={handleCommentSubmit} className="relative mt-4">
                        <textarea
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                            rows={1}
                            placeholder="Add a family note..."
                            className="w-full resize-none rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 pr-14 text-sm text-slate-700 placeholder:text-slate-400 placeholder:font-bold focus:outline-none focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || commentText.trim().length === 0}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-orange-500 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-100"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={18} strokeWidth={3} />
                            )}
                        </button>
                        {commentError && (
                            <p className="absolute -bottom-5 left-2 text-[10px] text-rose-500 font-black uppercase tracking-tight">
                                {commentError}
                            </p>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
} 