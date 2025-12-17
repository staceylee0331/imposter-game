export enum GamePhase {
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  REVEAL = 'REVEAL',
  PLAYING = 'PLAYING',
  VOTING = 'VOTING',
  GAME_OVER = 'GAME_OVER',
}

export interface Player {
  id: number;
  name: string;
  isImposter: boolean;
  role: string;
  isRevealed: boolean;
}

export interface GameData {
  location: string;
  roles: string[];
}

export interface GameSettings {
  playerCount: number;
  playerNames: string[];
  theme: string;
  roundDurationMinutes: number;
}