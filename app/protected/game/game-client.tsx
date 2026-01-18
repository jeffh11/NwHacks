"use client";

import { useState, useTransition } from "react";
import MemoryMatchBoard from "./memory-match-board";
import { submitGameSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GameClient() {
  const [gameResult, setGameResult] = useState<{
    durationMs: number;
    mistakes: number;
    score: number;
  } | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleGameComplete = (durationMs: number, mistakes: number) => {
    const score = durationMs + mistakes * 1500;
    setGameResult({ durationMs, mistakes, score });
    setIsSubmitted(false);
  };

  const handleSubmitScore = () => {
    if (!gameResult) return;

    startTransition(async () => {
      try {
        await submitGameSession({
          durationMs: gameResult.durationMs,
          mistakes: gameResult.mistakes,
        });
        setIsSubmitted(true);
        // Refresh the page to update leaderboard
        setTimeout(() => {
          router.refresh();
        }, 500);
      } catch (error) {
        console.error("Failed to submit score:", error);
        alert("Failed to submit score. Please try again.");
      }
    });
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <MemoryMatchBoard onGameComplete={handleGameComplete} />

      {/* Game Result Modal */}
      {gameResult && (
        <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 shadow-lg">
          <div className="text-center mb-4">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-amber-600" />
            <h3 className="text-2xl font-black text-amber-900 mb-2">
              Game Complete!
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="font-medium text-slate-700">Time:</span>
              <span className="font-bold text-amber-900">
                {formatTime(gameResult.durationMs)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="font-medium text-slate-700">Mistakes:</span>
              <span className="font-bold text-amber-900">
                {gameResult.mistakes}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-100 rounded-lg border-2 border-amber-300">
              <span className="font-bold text-amber-900">Your Score:</span>
              <span className="text-2xl font-black text-amber-700">
                {gameResult.score.toLocaleString()}
              </span>
            </div>
          </div>

          {isSubmitted ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-100 rounded-lg border-2 border-green-300">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-bold text-green-800">
                Score submitted! Check the leaderboard.
              </span>
            </div>
          ) : (
            <Button
              onClick={handleSubmitScore}
              disabled={isSubmitting}
              className="w-full h-12 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? "Submitting..." : "Submit Score"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
