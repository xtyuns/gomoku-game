'use client';

import React, { useState } from 'react';
import { Player } from '@/types';
import Game from '@/components/Game';
export default function Home() {
  const [playerColor, setPlayerColor] = useState<Player | null>(null);
  const handleReset = () => {
    setPlayerColor(null);
  };

  if (!playerColor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-8">Choose Your Piece</h1>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPlayerColor('black')}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-black transition-colors"
              >
                <div className="w-12 h-12 bg-black rounded-full" />
                <span className="font-medium">Black (First)</span>
              </button>
              <button
                onClick={() => setPlayerColor('white')}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-black transition-colors"
              >
                <div className="w-12 h-12 rounded-full border-2 border-black" />
                <span className="font-medium">White (Second)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-[1200px] w-full">
        <Game playerColor={playerColor} onReset={handleReset} />
      </div>
    </div>
  );
}
