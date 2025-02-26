export type Player = 'black' | 'white';
export type BoardState = (Player | null)[][];
export type ThinkingLog = { message: string; timestamp: number };