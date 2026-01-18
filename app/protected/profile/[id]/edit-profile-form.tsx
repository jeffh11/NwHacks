"use client";

import { useState, useRef } from "react";
import { updateProfile } from "./actions";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import Avatar from "@/components/avatar";

interface EditProfileFormProps {
  userId: string;
  initialFirstName: string;
  initialLastName: string;
  initialAvatarUrl?: string | null;
}

export default function EditProfileForm({
  userId,
  initialFirstName,
  initialLastName,
  initialAvatarUrl,
}: EditProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());
    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      // Update local state with new avatar URL if available
      if (previewUrl) {
        setAvatarUrl(previewUrl);
      }
      // Clean up preview URL
      if (previewUrl && selectedFile) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsSubmitting(false);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar
            name={`${firstName} ${lastName}`}
            initial={firstName[0] || "?"}
            avatarUrl={previewUrl || avatarUrl}
            size="xl"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg"
          >
            <Camera size={16} />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="text-sm text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
          >
            <X size={14} />
            Remove image
          </button>
        )}
      </div>

      {/* Name Inputs */}
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-2">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-rose-500 font-semibold">{error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
