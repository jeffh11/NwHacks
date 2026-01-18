"use client";

import { useState } from "react";

interface AvatarProps {
  name: string;
  initial: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Avatar({ 
  name, 
  initial, 
  avatarUrl, 
  size = "md",
  className = ""
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: "h-9 w-9 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-xl",
    xl: "h-20 w-20 text-2xl",
  };

  const showImage = avatarUrl && !imageError;

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      role="img"
      aria-label={name}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`w-full h-full object-cover ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          onLoad={() => setImageLoading(false)}
        />
      ) : null}
      {(!showImage || imageLoading) && (
        <div 
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-rose-400 text-white shadow-inner ${
            showImage && imageLoading ? "absolute" : ""
          }`}
        >
          {initial}
        </div>
      )}
    </div>
  );
}
