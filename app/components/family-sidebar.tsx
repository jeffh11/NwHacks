"use client";

import Link from "next/link";
import { Users } from "lucide-react";

interface Profile {
  supabase_id: string;
  firstname: string;
  lastname: string;
}

interface FamilySidebarProps {
  profiles: Profile[];
  currentUserId: string;
  familyId: string;
}

export default function FamilySidebar({
  profiles,
  currentUserId,
}: FamilySidebarProps) {
  return (
    <div className="sticky top-8 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
      <h2 className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-slate-400">
        <Users size={16} className="text-orange-500" /> Family Circle
      </h2>

      <div className="space-y-6">
        {profiles.map((profile) => (
          <Link
            key={profile.supabase_id}
            href={`/protected/profile/${profile.supabase_id}`}
            className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-xl transition"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:border-orange-200 group-hover:text-orange-500 transition-all">
                {profile.firstname[0]}
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 group-hover:underline">
                  {profile.firstname} {profile.lastname}
                </span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                  {profile.supabase_id === currentUserId
                    ? "You"
                    : "Family Member"}
                </span>
              </div>
            </div>

            {profile.supabase_id === currentUserId && (
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
