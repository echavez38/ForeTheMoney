export interface User {
  id: string;
  name: string;
  pin: string;
  handicap: number;
}

export interface Round {
  id: string;
  course: string;
  holes: number;
  players: RoundPlayer[];
  currentHole: number;
  bettingOptions: BettingOptions;
  completed: boolean;
  createdAt: Date;
}

export interface RoundPlayer {
  id: string;
  name: string;
  handicap: number;
  scores: HoleScore[];
  grossTotal: number;
  netTotal: number;
  moneyBalance: number;
}

export interface HoleScore {
  holeNumber: number;
  grossScore: number;
  netScore: number;
  par: number;
  strokeIndex: number;
}

export interface BettingOptions {
  skins: boolean;
  oyeses: boolean;
  foursomes: boolean;
  unitPerHole: number;
}

export interface HoleInfo {
  number: number;
  par: number;
  strokeIndex: number;
  distance: number;
}

export interface BettingResult {
  type: 'skins' | 'oyeses' | 'foursomes';
  winner: string | null;
  amount: number;
  tied: boolean;
}

export const DEFAULT_HOLES: HoleInfo[] = [
  { number: 1, par: 4, strokeIndex: 7, distance: 385 },
  { number: 2, par: 3, strokeIndex: 13, distance: 165 },
  { number: 3, par: 5, strokeIndex: 1, distance: 520 },
  { number: 4, par: 4, strokeIndex: 9, distance: 410 },
  { number: 5, par: 3, strokeIndex: 17, distance: 180 },
  { number: 6, par: 4, strokeIndex: 5, distance: 395 },
  { number: 7, par: 4, strokeIndex: 11, distance: 365 },
  { number: 8, par: 5, strokeIndex: 3, distance: 485 },
  { number: 9, par: 4, strokeIndex: 15, distance: 370 },
  { number: 10, par: 4, strokeIndex: 8, distance: 375 },
  { number: 11, par: 3, strokeIndex: 14, distance: 170 },
  { number: 12, par: 5, strokeIndex: 2, distance: 510 },
  { number: 13, par: 4, strokeIndex: 10, distance: 400 },
  { number: 14, par: 3, strokeIndex: 18, distance: 155 },
  { number: 15, par: 4, strokeIndex: 6, distance: 390 },
  { number: 16, par: 4, strokeIndex: 12, distance: 360 },
  { number: 17, par: 5, strokeIndex: 4, distance: 495 },
  { number: 18, par: 4, strokeIndex: 16, distance: 380 },
];
