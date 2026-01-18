'use client';

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Heart, Share2, Clock, Trash2, Mic, Square, Play, Pause, Volume2 } from "lucide-react";
import { createComment, toggleLike, deletePost } from "@/app/protected/feed/actions";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";

interface PostProps {
    post: {
        id: string;
        text: string | null;
        type: "text" | "image" | "video";
        media_url: string | null;
        created_at: string;
        post_user: string;
        post_family: string;
    };
    author: {
        name: string;
        initial: string;
        avatarUrl?: string | null;
    };
    comments: CommentData[];
    currentUser: {
        id: string;
        name: string;
        initial: string;
        avatarUrl?: string | null;
    };
    // New props to handle persistent state from the server
    initialLikesCount: number;
    initialIsLiked: boolean;
}

type CommentData = {
    id: string;
    content: string;
    created_at: string;
    comment_user: string;
    audio_url?: string | null;
    audio_duration_ms?: number | null;
    audio_mime?: string | null;
    author: {
        name: string;
        initial: string;
        avatarUrl?: string | null;
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
    // 1. Initialize state from server-side props
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

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);
    const recordingStartTimeRef = useRef<number>(0);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Audio playback state for comments
    const [playingCommentId, setPlayingCommentId] = useState<string | null>(null);
    const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
    const commentAudioRefs = useRef<Record<string, HTMLAudioElement>>({});

    // 2. Updated toggleLike with Database persistence
    const handleLikeToggle = async () => {
        // Optimistic UI: Update immediately for a snappy feel
        const nextLikedState = !isLiked;
        setIsLiked(nextLikedState);
        setLikesCount(prev => nextLikedState ? prev + 1 : prev - 1);

        try {
            // Call the Server Action (Passing current isLiked state to toggle it)
            // post.id is cast to Number because the DB uses bigint
            await toggleLike(Number(post.id), isLiked);
        } catch (error) {
            // Rollback UI state if the database update fails
            setIsLiked(isLiked);
            setLikesCount(likesCount);
            console.error("Failed to update like:", error);
        }
    };

    const handleCommentToggle = () => {
        setShowComments(prev => !prev);
        setCommentError(null);
        // Reset recording state when closing comments
        if (!showComments) {
            stopRecording();
            clearRecording();
        }
    };

    // Voice recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            recordingStartTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                const duration = Date.now() - recordingStartTimeRef.current;
                setRecordedAudio(audioBlob);
                setRecordingDuration(duration);
                const url = URL.createObjectURL(audioBlob);
                setAudioPreviewUrl(url);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Clear duration interval
                if (durationIntervalRef.current) {
                    clearInterval(durationIntervalRef.current);
                    durationIntervalRef.current = null;
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            // Update duration every 100ms for UI display
            durationIntervalRef.current = setInterval(() => {
                setRecordingDuration(Date.now() - recordingStartTimeRef.current);
            }, 100);
        } catch (error) {
            console.error("Error starting recording:", error);
            setCommentError("Failed to access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Clear duration interval
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
                durationIntervalRef.current = null;
            }
        }
    };

    const clearRecording = () => {
        if (audioPreviewUrl) {
            URL.revokeObjectURL(audioPreviewUrl);
        }
        if (previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current = null;
        }
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
        setRecordedAudio(null);
        setAudioPreviewUrl(null);
        setIsPlayingPreview(false);
        setRecordingDuration(0);
        audioChunksRef.current = [];
    };

    const togglePreviewPlayback = () => {
        if (!previewAudioRef.current && audioPreviewUrl) {
            const audio = new Audio(audioPreviewUrl);
            previewAudioRef.current = audio;
            audio.onended = () => {
                setIsPlayingPreview(false);
                previewAudioRef.current = null;
            };
        }

        if (previewAudioRef.current) {
            if (isPlayingPreview) {
                previewAudioRef.current.pause();
                setIsPlayingPreview(false);
            } else {
                previewAudioRef.current.play();
                setIsPlayingPreview(true);
            }
        }
    };

    // Upload audio to Supabase Storage
    const uploadAudio = async (audioBlob: Blob): Promise<string> => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Not authenticated");
        }

        // Generate unique file path
        const fileName = `${user.id}/${post.post_family}/comments/${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
            .from("comment-audio")
            .upload(fileName, audioBlob, {
                contentType: 'audio/webm;codecs=opus',
                upsert: false,
            });

        if (uploadError) {
            throw new Error(`Failed to upload audio: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("comment-audio")
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    };

    const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = commentText.trim();

        // Allow comments with either text or audio (or both)
        if (!trimmed && !recordedAudio) {
            setCommentError("Add text or record a voice note.");
            return;
        }

        startTransition(async () => {
            try {
                setIsUploading(true);
                let audioUrl: string | null = null;
                let audioDurationMs: number | null = null;
                let audioMime: string | null = null;

                // Upload audio if present
                if (recordedAudio && audioPreviewUrl) {
                    try {
                        // Use tracked recording duration (more reliable than audio.duration from blob)
                        audioDurationMs = recordingDuration;

                        // Validate audio duration (max 120 seconds = 120000 ms)
                        if (!audioDurationMs || audioDurationMs <= 0) {
                            setCommentError("Invalid recording duration. Please try recording again.");
                            setIsUploading(false);
                            return;
                        }

                        if (audioDurationMs > 120000) {
                            setCommentError("Voice notes must be 2 minutes or less.");
                            setIsUploading(false);
                            return;
                        }

                        audioUrl = await uploadAudio(recordedAudio);
                        audioMime = 'audio/webm;codecs=opus';
                    } catch (uploadError) {
                        setCommentError(uploadError instanceof Error ? uploadError.message : "Failed to upload audio.");
                        setIsUploading(false);
                        return;
                    }
                }

                const newComment = await createComment({
                    postId: post.id,
                    text: trimmed || '',
                    audioUrl,
                    audioDurationMs,
                    audioMime
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
                clearRecording();
                setCommentError(null);
                setShowComments(true);
                setIsUploading(false);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to post comment.";
                setCommentError(message);
                setIsUploading(false);
            }
        });
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioPreviewUrl) {
                URL.revokeObjectURL(audioPreviewUrl);
            }
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, [audioPreviewUrl]);

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
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7 transition-all hover:shadow-md">
            {/* Post Header */}
            <div className="flex items-center gap-4 mb-6">
                <Avatar
                    name={author.name}
                    initial={author.initial}
                    avatarUrl={author.avatarUrl}
                    size="lg"
                />
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">{author.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        <Clock size={12} />
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Post Body */}
            {post.text && (
                <div className="text-slate-800 text-xl font-medium mb-8 leading-relaxed px-1">
                    {post.text}
                </div>
            )}

            {post.type === "image" && post.media_url && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-slate-50">
                    <img
                        src={post.media_url}
                        alt="Post content"
                        className="w-full max-h-[600px] object-contain rounded-2xl"
                    />
                </div>
            )}

            {post.type === "video" && post.media_url && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-slate-50">
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
                        onClick={handleLikeToggle}
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
                        <span>
                            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                        </span>
                    </button>

                    <button
                        onClick={handleCommentToggle}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-bold text-sm"
                    >
                        <MessageCircle size={20} />
                        <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    {canDelete && (
                        <button
                            onClick={handleDeletePost}
                            disabled={isDeleting}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-label="Delete post"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {deleteError && (
                <p className="mt-3 text-xs text-rose-500 font-semibold">{deleteError}</p>
            )}

            {/* Comment Section */}
            <div className={`mt-6 space-y-5 ${showComments ? 'block' : 'hidden'}`}>
                {comments.length === 0 ? (
                    <p className="text-sm text-slate-400 font-semibold px-1">No comments yet. 💛</p>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <Avatar
                                    name={comment.author.name}
                                    initial={comment.author.initial}
                                    avatarUrl={comment.author.avatarUrl}
                                    size="sm"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                        <span className="text-slate-800">{comment.author.name}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {comment.content && (
                                        <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    )}
                                    {comment.audio_url && (
                                        <AudioPlayer
                                            commentId={comment.id}
                                            audioUrl={comment.audio_url}
                                            durationMs={comment.audio_duration_ms || 0}
                                            isPlaying={playingCommentId === comment.id}
                                            progress={audioProgress[comment.id] || 0}
                                            onPlayPause={(commentId: string) => {
                                                const audio = commentAudioRefs.current[commentId];

                                                // Toggle based on current isPlaying state to avoid race conditions
                                                const shouldPlay = playingCommentId !== commentId;

                                                // Stop any other playing audio
                                                Object.entries(commentAudioRefs.current).forEach(([id, otherAudio]) => {
                                                    if (id !== commentId && !otherAudio.paused) {
                                                        otherAudio.pause();
                                                        otherAudio.currentTime = 0;
                                                        setPlayingCommentId(null);
                                                    }
                                                });

                                                if (audio) {
                                                    if (shouldPlay) {
                                                        // Play this audio
                                                        audio.play().catch((err) => {
                                                            console.error("Error playing audio:", err);
                                                        });
                                                        setPlayingCommentId(commentId);
                                                    } else {
                                                        // Pause this audio
                                                        audio.pause();
                                                        setPlayingCommentId(null);
                                                    }
                                                }
                                            }}
                                            onProgressUpdate={(commentId: string, progress: number) => {
                                                setAudioProgress(prev => ({ ...prev, [commentId]: progress }));
                                            }}
                                            onEnded={(commentId: string) => {
                                                setPlayingCommentId(null);
                                                setAudioProgress(prev => ({ ...prev, [commentId]: 0 }));
                                            }}
                                            audioRef={(commentId: string, audioElement: HTMLAudioElement | null) => {
                                                if (audioElement) {
                                                    commentAudioRefs.current[commentId] = audioElement;
                                                } else {
                                                    delete commentAudioRefs.current[commentId];
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* New Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-3 pt-2">
                    <Avatar
                        name={currentUser.name}
                        initial={currentUser.initial}
                        avatarUrl={currentUser.avatarUrl}
                        size="md"
                    />
                    <div className="flex-1">
                        <textarea
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                            rows={2}
                            placeholder="Write a comment or record a voice note..."
                            className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                        />

                        {/* Voice Recording UI */}
                        <div className="mt-2 space-y-2">
                            {!recordedAudio ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isRecording
                                            ? "bg-rose-500 text-white hover:bg-rose-600"
                                            : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                            }`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <Square size={14} />
                                                <span>Stop</span>
                                            </>
                                        ) : (
                                            <>
                                                <Mic size={14} />
                                                <span>Record</span>
                                            </>
                                        )}
                                    </button>
                                    {isRecording && (
                                        <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                                            <span className="h-2 w-2 bg-rose-500 rounded-full animate-pulse"></span>
                                            Recording...
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={togglePreviewPlayback}
                                        className="p-1.5 rounded-lg bg-white text-orange-600 hover:bg-orange-100 transition-colors"
                                    >
                                        {isPlayingPreview ? (
                                            <Pause size={14} />
                                        ) : (
                                            <Play size={14} />
                                        )}
                                    </button>
                                    <span className="text-xs text-slate-600 flex-1">
                                        Voice note recorded
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearRecording}
                                        className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-rose-500 font-semibold">
                                {commentError ?? ""}
                            </span>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading || (commentText.trim().length === 0 && !recordedAudio)}
                                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                            >
                                {isUploading ? "Uploading..." : isSubmitting ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Custom Audio Player Component
function AudioPlayer({
    commentId,
    audioUrl,
    durationMs,
    isPlaying,
    progress,
    onPlayPause,
    onProgressUpdate,
    onEnded,
    audioRef
}: {
    commentId: string;
    audioUrl: string;
    durationMs: number;
    isPlaying: boolean;
    progress: number;
    onPlayPause: (commentId: string) => void;
    onProgressUpdate: (commentId: string, progress: number) => void;
    onEnded: (commentId: string) => void;
    audioRef: (commentId: string, audio: HTMLAudioElement | null) => void;
}) {
    const audioRefInternal = useRef<HTMLAudioElement | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [audioDuration, setAudioDuration] = useState<number>(durationMs / 1000);
    const [currentTime, setCurrentTime] = useState<number>(0);

    // Setup audio event listeners
    useEffect(() => {
        const audio = audioRefInternal.current;
        if (!audio) return;

        // Update ref callback
        audioRef(commentId, audio);

        const handleLoadedMetadata = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                setAudioDuration(audio.duration);
            }
        };

        const handleTimeUpdate = () => {
            if (audio.currentTime && !isNaN(audio.currentTime)) {
                setCurrentTime(audio.currentTime);
            }
            // Update progress through the callback
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                const progress = (audio.currentTime / audio.duration) * 100;
                onProgressUpdate(commentId, progress);
            }
        };

        const handleEnded = () => {
            onEnded(commentId);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        // Load metadata if not already loaded
        if (audio.readyState >= 1) {
            handleLoadedMetadata();
        }

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [commentId, audioRef, durationMs, onProgressUpdate, onEnded]);

    // Manage progress interval based on playing state
    useEffect(() => {
        const audio = audioRefInternal.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                const progress = (audio.currentTime / audio.duration) * 100;
                setCurrentTime(audio.currentTime);
                onProgressUpdate(commentId, progress);
            }
        };

        if (isPlaying && !audio.paused) {
            // Start interval for smooth progress updates
            progressIntervalRef.current = setInterval(updateProgress, 100);
        } else {
            // Clear interval when paused or stopped
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [isPlaying, commentId, onProgressUpdate]);

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Use state values with fallback to prop
    const displayCurrentTime = isNaN(currentTime) || !isFinite(currentTime) ? 0 : currentTime;
    const displayDuration = (audioDuration && isFinite(audioDuration)) ? audioDuration : (durationMs / 1000);

    return (
        <div className="mt-2 p-3 bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl border border-orange-100">
            <audio
                ref={audioRefInternal}
                src={audioUrl}
                preload="metadata"
            />

            <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                    type="button"
                    onClick={() => onPlayPause(commentId)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying
                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200'
                        : 'bg-white text-orange-600 hover:bg-orange-100 border-2 border-orange-200'
                        }`}
                >
                    {isPlaying ? (
                        <Pause size={18} fill="currentColor" />
                    ) : (
                        <Play size={18} className="ml-0.5" fill="currentColor" />
                    )}
                </button>

                {/* Progress Bar and Time */}
                <div className="flex-1 min-w-0">
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-white/60 rounded-full overflow-hidden mb-1.5">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-rose-400 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Time Display */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold">
                            {formatTime(displayCurrentTime)}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500">
                            <Volume2 size={12} />
                            <span>{formatTime(displayDuration)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
