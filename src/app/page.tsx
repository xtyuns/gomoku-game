'use client';

import React, { useState, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';

type Player = 'black' | 'white';
type BoardState = (Player | null)[][];

export default function Home() {
  const [board, setBoard] = useState<BoardState>(Array(15).fill(null).map(() => Array(15).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [winner, setWinner] = useState<Player | null>(null);

  const checkWinner = useCallback((row: number, col: number, player: Player, board: BoardState) => {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1]  // horizontal, vertical, diagonal
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      // Check forward
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow < 0 || newRow >= 15 || 
          newCol < 0 || newCol >= 15 || 
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      // Check backward
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow < 0 || newRow >= 15 || 
          newCol < 0 || newCol >= 15 || 
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      if (count >= 5) return true;
    }
    return false;
  }, []);

  const handleClick = (row: number, col: number) => {
    if (board[row][col] || winner) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    if (checkWinner(row, col, currentPlayer, newBoard)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  };

  const resetGame = () => {
    setBoard(Array(15).fill(null).map(() => Array(15).fill(null)));
    setCurrentPlayer('black');
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${currentPlayer === 'black' ? 'bg-black' : 'bg-white border-2 border-black'}`} />
              <span className="text-lg font-medium">
                {winner 
                  ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!` 
                  : `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`}
              </span>
            </div>
            <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCcw size={16} />
              Reset Game
            </button>
          </div>

          <div className="grid grid-cols-15 gap-px bg-gray-200 p-px rounded-lg">
            {board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleClick(rowIndex, colIndex)}
                  disabled={!!winner || !!cell}
                  className={`
                    w-full pt-[100%] relative bg-white
                    hover:bg-gray-50 transition-colors
                    ${rowIndex === 0 ? 'rounded-t-sm' : ''}
                    ${rowIndex === 14 ? 'rounded-b-sm' : ''}
                    ${colIndex === 0 ? 'rounded-l-sm' : ''}
                    ${colIndex === 14 ? 'rounded-r-sm' : ''}
                  `}
                >
                  {cell && (
                    <div 
                      className={`
                        absolute inset-2
                        rounded-full
                        ${cell === 'black' ? 'bg-black' : 'bg-white border-2 border-black'}
                      `}
                    />
                  )}
                </button>
              ))
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
