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
    <form action={createPost} className="bg-white rounded-xl shadow p-6 space-y-4">
      {/* Family Selector */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Posting to:</label>
        <select 
          name="familyId" 
          required
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
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
      <div>
        <textarea 
          name="content"
          required
          rows={5}
          className="w-full p-4 bg-slate-50 border border-slate-200 text-base text-slate-900 placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none outline-none transition-all"
          placeholder="What's happening today?"
        />
      </div>

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
        <div className="relative rounded-lg overflow-hidden border-2 border-slate-200">
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
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={handleMediaButtonClick}
            className="p-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          <button 
            type="button" 
            onClick={handleMediaButtonClick}
            className="p-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Video size={20} />
          </button>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold shadow transition-colors"
        >
          <span>Share Post</span>
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
