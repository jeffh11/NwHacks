'use client';

import { Trophy, Medal, Star, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Leaderboard({ profiles }: { profiles: any[] }) {
  // Logic: Sort profiles by performance (simulated here by a 'score' or 'points' field)
  // To show best to worst performance, we sort descending
  const sortedMembers = [...profiles].sort((a, b) => (b.points || 0) - (a.points || 0));
  const topMembers = sortedMembers.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Header section */}
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <Trophy className="text-orange-500" size={20} />
          Wordle Ranks
        </h2>
        <Link 
          href="https://www.nytimes.com/games/wordle/index.html" 
          target="_blank"
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-green-100"
        >
          Play <ExternalLink size={12} />
        </Link>
      </div>

      {/* Leaderboard List: Best to Worst */}
      <div className="space-y-4">
        {topMembers.map((member, index) => (
          <div key={member.supabase_id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                  {member.firstname[0]}
                </div>
                {/* Ranking medals */}
                <div className="absolute -top-1 -left-1">
                  {index === 0 && <Medal size={16} className="text-yellow-500 animate-bounce" />}
                  {index === 1 && <Medal size={16} className="text-slate-400" />}
                  {index === 2 && <Medal size={16} className="text-amber-600" />}
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-800 leading-tight">
                    {member.firstname} {member.lastname?.charAt(0)}.
                </p>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                    {index === 0 ? "Daily Champion" : "Active Player"}
                </p>
              </div>
            </div>
            {/* Performance score */}
            <div className="flex items-center gap-1 text-orange-500 font-bold text-sm bg-orange-50 px-2 py-1 rounded-md">
              <Star size={12} fill="currentColor" />
              {member.points || (100 - (index * 12))} 
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-slate-400 font-medium italic">
        Scores update after daily family challenge 🏁
      </p>
    </div>
  );
}