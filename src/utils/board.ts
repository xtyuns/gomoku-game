import { BoardState } from "@/types";

export function formatBoard(board: BoardState): string {
    const blacks = [];
    const whites = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === 'black') {
                blacks.push([i, j]);
            } else if (board[i][j] === 'white') {
                whites.push([i, j]);
            }
        }
    }

    let str = '黑方: ' + blacks.map(it => `(${it.join(',')})`).join(',')
    str += '\n白方: '+ whites.map(it => `(${it.join(',')})`).join(',')

    return str;
}

export function parseBotPosition(answerContent: string): [number, number, string] {
    const matched = answerContent.match(/<xy>(\d+),(\d+)<\/xy>([\s\S]*)/);
    const x = parseInt(matched!![1]);
    const y = parseInt(matched!![2]);
    const msg = matched!![3].trim();
    return [x, y, msg]
}
