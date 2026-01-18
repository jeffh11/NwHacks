"use client";

import { createPost } from "./actions";
import { Image as ImageIcon, Video, Send, X } from "lucide-react";
import { useState, useRef } from "react";

type Membership = {
  family: string;
  families: {
    id: string;
    name: string;
  } | null;
};

interface CreatePostFormProps {
  memberships: Membership[];
}

export function CreatePostForm({ memberships }: CreatePostFormProps) {
  const [selectedMedia, setSelectedMedia] = useState<{
    file: File;
    preview: string;
    type: "image" | "video";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Please select an image or video file");
      return;
    }

    const type = file.type.startsWith("image/") ? "image" : "video";
    const preview = URL.createObjectURL(file);

    setSelectedMedia({ file, preview, type });
  };

  const handleRemoveMedia = () => {
    if (selectedMedia?.preview) {
      URL.revokeObjectURL(selectedMedia.preview);
    }
    setSelectedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMediaButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
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
            {memberships?.map((m) => (
              m.families && (
                <option key={m.families.id} value={m.families.id}>
                  {m.families.name}
                </option>
              )
            ))}
            {(!memberships || memberships.length === 0) && (
              <option disabled>No families found</option>
            )}
          </select>
        </div>

        {/* Text Input */}
        <textarea 
          name="content"
          required
          rows={5}
          className="w-full p-4 bg-transparent text-lg text-orange-950 placeholder:text-orange-200 border-none focus:ring-0 resize-none outline-none"
          placeholder="What's happening today?"
        />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          name="media"
          accept="image/*,video/*"
          onChange={handleMediaSelect}
          className="hidden"
        />

        {/* Media Preview */}
        {selectedMedia && (
          <div className="relative mb-4 rounded-2xl overflow-hidden border-2 border-orange-200">
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.preview}
                alt="Preview"
                className="w-full max-h-[400px] object-contain"
              />
            ) : (
              <video
                src={selectedMedia.preview}
                controls
                className="w-full max-h-[400px]"
              />
            )}
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-orange-100">
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleMediaButtonClick}
              className="p-3 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            >
              <ImageIcon size={20} />
            </button>
            <button 
              type="button" 
              onClick={handleMediaButtonClick}
              className="p-3 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            >
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
  );
}
