'use client';

import React, { useState, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';

type Player = 'black' | 'white';
type BoardState = (Player | null)[][];

interface GameProps {
  playerColor: Player;
  onReset: () => void;
}

const boardSize = 15;
const winCount = 5;

function Game({ playerColor, onReset }: GameProps) {
  const [board, setBoard] = useState<BoardState>(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [winner, setWinner] = useState<Player | null>(null);

  const checkWinner = useCallback((row: number, col: number, player: Player, board: BoardState) => {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1]  // horizontal, vertical, diagonal
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      // Check forward
      for (let i = 1; i < winCount; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow < 0 || newRow >= boardSize || 
          newCol < 0 || newCol >= boardSize || 
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      // Check backward
      for (let i = 1; i < winCount; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow < 0 || newRow >= boardSize || 
          newCol < 0 || newCol >= boardSize || 
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      if (count >= winCount) return true;
    }
    return false;
  }, []);

  const makeBotMove = useCallback(() => {
    // TODO: Implement bot logic
    // For now, just find the first empty cell
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (!board[i][j]) {
          const newBoard = board.map(row => [...row]);
          newBoard[i][j] = currentPlayer;
          setBoard(newBoard);
          
          if (checkWinner(i, j, currentPlayer, newBoard)) {
            setWinner(currentPlayer);
          } else {
            setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
          }
          return;
        }
      }
    }
  }, [board, currentPlayer, checkWinner]);

  const handleClick = (row: number, col: number) => {
    if (board[row][col] || winner || currentPlayer !== playerColor) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    if (checkWinner(row, col, currentPlayer, newBoard)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  };

  // Make bot move after player's turn
  React.useEffect(() => {
    if (currentPlayer !== playerColor && !winner) {
      const timer = setTimeout(makeBotMove, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, playerColor, winner, makeBotMove]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${currentPlayer === 'black' ? 'bg-black' : 'bg-white border-2 border-black'}`} />
          <span className="text-lg font-medium">
            {winner 
              ? `${winner === playerColor ? 'You' : 'Bot'} Win!` 
              : `${currentPlayer === playerColor ? 'Your' : 'Bot\'s'} Turn`}
          </span>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCcw size={16} />
          New Game
        </button>
      </div>

      <div className="grid grid-cols-board gap-px bg-gray-200 p-px rounded-lg">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleClick(rowIndex, colIndex)}
              disabled={!!winner || !!cell || currentPlayer !== playerColor}
              className={`
                w-full pt-[100%] relative bg-white
                hover:bg-gray-50 transition-colors
                ${rowIndex === 0 ? 'rounded-t-sm' : ''}
                ${rowIndex === (boardSize - 1) ? 'rounded-b-sm' : ''}
                ${colIndex === 0 ? 'rounded-l-sm' : ''}
                ${colIndex === (boardSize - 1) ? 'rounded-r-sm' : ''}
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
  );
}

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
      <div className="max-w-2xl w-full">
        <Game playerColor={playerColor} onReset={handleReset} />
      </div>
    </div>
  );
}
