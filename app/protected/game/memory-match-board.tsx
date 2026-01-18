"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Clock, XCircle } from "lucide-react";

interface Tile {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchBoardProps {
  onGameComplete: (durationMs: number, mistakes: number) => void;
}

export default function MemoryMatchBoard({ onGameComplete }: MemoryMatchBoardProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize game with shuffled pairs
  const initializeGame = useCallback(() => {
    const pairs = [1, 2, 3, 4, 5, 6, 7, 8];
    const tileValues = [...pairs, ...pairs];

    // Shuffle the tiles
    for (let i = tileValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileValues[i], tileValues[j]] = [tileValues[j], tileValues[i]];
    }

    const newTiles: Tile[] = tileValues.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));

    setTiles(newTiles);
    setFlippedTiles([]);
    setIsGameStarted(false);
    setIsGameComplete(false);
    setStartTime(null);
    setDuration(0);
    setMistakes(0);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    if (!isGameStarted || isGameComplete || !startTime) return;

    const interval = setInterval(() => {
      setDuration(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isGameStarted, isGameComplete, startTime]);

  const handleTileClick = (tileId: number) => {
    if (isProcessing || isGameComplete) return;

    const tile = tiles[tileId];
    if (tile.isFlipped || tile.isMatched) return;

    // Start game on first click
    if (!isGameStarted) {
      setIsGameStarted(true);
      setStartTime(Date.now());
    }

    // Don't allow clicking more than 2 tiles at once
    if (flippedTiles.length >= 2) return;

    // Flip the tile
    const newTiles = [...tiles];
    newTiles[tileId] = { ...newTiles[tileId], isFlipped: true };
    setTiles(newTiles);
    setFlippedTiles([...flippedTiles, tileId]);

    // Check for match when 2 tiles are flipped
    if (flippedTiles.length === 1) {
      setIsProcessing(true);
      const firstTile = tiles[flippedTiles[0]];
      const secondTile = newTiles[tileId];

      setTimeout(() => {
        const isMatch = firstTile.value === secondTile.value;
        let newMistakes = mistakes;

        if (isMatch) {
          // Match found
          newTiles[flippedTiles[0]] = { ...firstTile, isMatched: true, isFlipped: true };
          newTiles[tileId] = { ...secondTile, isMatched: true, isFlipped: true };
        } else {
          // No match
          newTiles[flippedTiles[0]] = { ...firstTile, isFlipped: false };
          newTiles[tileId] = { ...secondTile, isFlipped: false };
          newMistakes = mistakes + 1;
          setMistakes(newMistakes);
        }

        setTiles(newTiles);
        setFlippedTiles([]);
        setIsProcessing(false);

        // Check if game is complete
        const allMatched = newTiles.every((t) => t.isMatched);
        if (allMatched) {
          setIsGameComplete(true);
          const finalDuration = Date.now() - (startTime || Date.now());
          onGameComplete(finalDuration, newMistakes);
        }
      }, 1000);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Game Stats */}
      <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-base font-bold text-amber-900">
            {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-base font-bold text-slate-700">
            {mistakes}
          </span>
        </div>
        {isGameComplete && (
          <div className="flex items-center gap-2 text-green-600">
            <Trophy className="h-4 w-4" />
            <span className="text-base font-bold">Done!</span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            disabled={isProcessing || tile.isFlipped || tile.isMatched}
            className={`
              aspect-square rounded-lg border-2 transition-all duration-300
              ${tile.isMatched
                ? "bg-green-100 border-green-300 cursor-default"
                : tile.isFlipped
                  ? "bg-amber-100 border-amber-400 cursor-default"
                  : "bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50 active:scale-95"
              }
              ${isProcessing ? "cursor-wait" : ""}
              flex items-center justify-center text-2xl font-black
              ${tile.isFlipped || tile.isMatched ? "text-amber-900" : "text-transparent"}
            `}
          >
            {tile.isFlipped || tile.isMatched ? tile.value : "?"}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={initializeGame}
        className="w-full py-2 px-4 rounded-xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold hover:bg-amber-200 transition-all active:scale-95 text-sm"
      >
        {isGameComplete ? "Play Again" : "Reset Game"}
      </button>
    </div>
  );
}
