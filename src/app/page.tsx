'use client';

import React, { useState, useCallback } from 'react';
import { Brain, RefreshCcw } from 'lucide-react';
import { Player, BoardState, ThinkingLog } from '@/types';
import { formatBoard, parseBotPosition } from '@/utils/board';

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
  const [thinkingLogs, setThinkingLogs] = useState<ThinkingLog[]>([]);

  const addThinkingLog = (message: string) => {
    setThinkingLogs(prev => [...prev, { message, timestamp: Date.now() }]);
  };

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

  const makeBotMove = useCallback(async () => {
    addThinkingLog('正在分析棋盘信息...')
    const currentBoard = formatBoard(board);
    const [i, j, msg] = await botMove(currentPlayer, currentBoard);
    if(msg) {
      addThinkingLog(msg)
    }
    const newBoard = board.map(row => [...row]);
    newBoard[i][j] = currentPlayer;
    setBoard(newBoard);

    if (checkWinner(i, j, currentPlayer, newBoard)) {
      setWinner(currentPlayer);
    } else {
      addThinkingLog("等待玩家移动...");
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
    return;
  }, [currentPlayer, checkWinner]);

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
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white rounded-xl shadow-lg p-6">
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
            onClick={() => {
              setThinkingLogs([]);
              onReset();
            }}
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

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-gray-600" size={20} />
          <h2 className="text-lg font-semibold">Bot's Thinking Log</h2>
        </div>
        <div className="h-[800px] overflow-y-auto">
          {thinkingLogs.length === 0 ? (
            <p className="text-gray-500 text-center italic">No thoughts yet...</p>
          ) : (
            <div className="space-y-3">
              {thinkingLogs.map((log, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
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
      <div className="max-w-[1200px] w-full">
        <Game playerColor={playerColor} onReset={handleReset} />
      </div>
    </div>
  );
}

async function botMove(playerSide: Player, currentBoard: string): Promise<[number, number, string]> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      "model": "deepseek-chat",
      "messages": [
        {
          "role": "system",
          "content": `你是 Gomer, 一位专家级的人工智能助理和出色的五子棋对战玩家，拥有丰富的棋牌类游戏对战经验。

<system_constraints>
你将在一个 15x15 的棋盘上与其他玩家对战，在对局中，执黑先行，执白后行，你的对手将随机落子，你需要根据对手的落子位置，合理地落子，以实现 5 子连珠，赢得对局。
在本局游戏中，你作为 ${playerSide} 方执棋。
</system_constraints>

<response_format>
你需要返回在棋盘上的一个合法的落子位置，格式为 <xy>x,y</xy>，其中 x 为横坐标，y 为纵坐标，开始坐标都为 0 且坐标值均为整数。
</response_format>`
        },
        {
          "role": "user",
          "content": `现在到你落子了，不要忘记你的目标，当前棋盘状态如下:
          ${currentBoard}`
        }
      ],
      "stream": false
    })
  });

  const data = await response.json();
  console.debug(data);

  const answerContent = data.choices[0].message.content;
  return parseBotPosition(answerContent);
}
