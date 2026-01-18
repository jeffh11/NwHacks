import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Clock } from "lucide-react";
import MemoryMatchBoard from "./memory-match-board";
import { getTodayLeaderboard, submitGameSession } from "./actions";
import GameClient from "./game-client";
import Avatar from "@/components/avatar";

export default async function GamePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is in a family
  const { data: memberships } = await supabase
    .from("family_members")
    .select("family")
    .eq("user", user.id);

  if (!memberships || memberships.length === 0) {
    redirect("/protected");
  }

  // Fetch leaderboard
  let leaderboard;
  try {
    leaderboard = await getTodayLeaderboard();
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    leaderboard = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-amber-900 mb-2">
            Daily Memory Match
          </h1>
          <p className="text-amber-700/80">
            Match all pairs as fast as you can! Lower score wins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-amber-900">
                  Play Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GameClient />
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <Card className="border-amber-200 shadow-lg sticky top-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-600" />
                  <CardTitle className="text-xl font-black text-amber-900">
                    Today&apos;s Leaderboard
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-amber-700/70">
                    <Users className="h-12 w-12 mx-auto mb-3 text-amber-300" />
                    <p className="font-medium">No scores yet today!</p>
                    <p className="text-sm mt-1">Be the first to play.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl transition-all
                          ${
                            index === 0
                              ? "bg-amber-100 border-2 border-amber-300 shadow-md"
                              : "bg-white border border-amber-100"
                          }
                        `}
                      >
                        <div className="flex-shrink-0">
                          {index === 0 ? (
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-sm">
                              🏆
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                              {entry.rank}
                            </div>
                          )}
                        </div>
                        <Avatar
                          name={`${entry.firstname} ${entry.lastname}`}
                          initial={entry.firstname[0]}
                          avatarUrl={entry.avatar_url || null}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {entry.firstname} {entry.lastname}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(entry.duration_ms / 1000)}s
                            </span>
                            {entry.mistakes > 0 && (
                              <span>{entry.mistakes} mistake{entry.mistakes !== 1 ? "s" : ""}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-amber-700">
                            {entry.score}
                          </div>
                          <div className="text-xs text-slate-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Rules */}
        <Card className="mt-6 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-amber-900 mb-3">How to Play</h3>
            <ul className="space-y-2 text-sm text-amber-800/80">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">1.</span>
                <span>Click tiles to flip them and find matching pairs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">2.</span>
                <span>Match all pairs to complete the game</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">3.</span>
                <span>Score = time + (mistakes × 1500ms) — lower is better!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">4.</span>
                <span>Your best score today will be saved automatically</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
