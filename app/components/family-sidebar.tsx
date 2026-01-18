"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Users } from "lucide-react";

interface Profile {
  supabase_id: string;
  firstname: string;
  lastname: string;
}

interface FamilySidebarProps {
  profiles: Profile[];
  familyId: string;
  currentUserId: string;
}

export default function FamilySidebar({
  profiles,
  familyId,
  currentUserId,
}: FamilySidebarProps) {
  const supabase = createClient();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel(`family:${familyId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setOnlineIds(new Set(Object.keys(state)));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({});
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, currentUserId, supabase]);

  return (
    <div className="sticky top-8 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
      <h2 className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-slate-400">
        <Users size={16} className="text-orange-500" />
        Family Circle
      </h2>

      <div className="space-y-4">
        {profiles.map((profile) => {
          const isOnline = onlineIds.has(profile.supabase_id);
          const isYou = profile.supabase_id === currentUserId;

          return (
            <Link
              key={profile.supabase_id}
              href={`/protected/profile/${profile.supabase_id}`}
              className="flex items-center justify-between p-2 rounded-xl transition hover:bg-slate-50 group"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-slate-50 border flex items-center justify-center font-bold text-sm text-slate-400 group-hover:border-orange-200 group-hover:text-orange-500 transition">
                  {profile.firstname[0]}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 group-hover:underline">
                    {profile.firstname} {profile.lastname}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tight text-slate-300">
                    {isYou
                      ? "You"
                      : isOnline
                      ? "Online Now"
                      : "Offline"}
                  </span>
                </div>
              </div>

              {isOnline && (
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
