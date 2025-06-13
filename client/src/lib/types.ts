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
  selectedTees: TeeSelection;
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
  distances: {
    doradas: number; // Senior Ladies
    azules: number;  // Ladies
    blancas: number; // Senior Men
    rojas: number;   // Championship/Back tees
  };
}

export interface TeeSelection {
  color: 'doradas' | 'azules' | 'blancas' | 'rojas';
  name: string;
  description: string;
}

export interface BettingResult {
  type: 'skins' | 'oyeses' | 'foursomes';
  winner: string | null;
  amount: number;
  tied: boolean;
}

// Club Campestre de Puebla - Datos oficiales del campo
export const CAMPESTRE_PUEBLA_HOLES: HoleInfo[] = [
  { number: 1, par: 4, strokeIndex: 11, distances: { doradas: 263, azules: 285, blancas: 310, rojas: 334 } },
  { number: 2, par: 4, strokeIndex: 5, distances: { doradas: 283, azules: 307, blancas: 334, rojas: 361 } },
  { number: 3, par: 3, strokeIndex: 17, distances: { doradas: 108, azules: 117, blancas: 127, rojas: 137 } },
  { number: 4, par: 5, strokeIndex: 1, distances: { doradas: 396, azules: 429, blancas: 467, rojas: 504 } },
  { number: 5, par: 4, strokeIndex: 7, distances: { doradas: 270, azules: 293, blancas: 319, rojas: 345 } },
  { number: 6, par: 4, strokeIndex: 13, distances: { doradas: 244, azules: 264, blancas: 287, rojas: 310 } },
  { number: 7, par: 3, strokeIndex: 15, distances: { doradas: 119, azules: 129, blancas: 140, rojas: 151 } },
  { number: 8, par: 5, strokeIndex: 3, distances: { doradas: 396, azules: 429, blancas: 467, rojas: 504 } },
  { number: 9, par: 4, strokeIndex: 9, distances: { doradas: 297, azules: 322, blancas: 351, rojas: 379 } },
  { number: 10, par: 4, strokeIndex: 6, distances: { doradas: 274, azules: 297, blancas: 323, rojas: 349 } },
  { number: 11, par: 4, strokeIndex: 12, distances: { doradas: 257, azules: 278, blancas: 303, rojas: 327 } },
  { number: 12, par: 3, strokeIndex: 18, distances: { doradas: 87, azules: 94, blancas: 102, rojas: 110 } },
  { number: 13, par: 5, strokeIndex: 2, distances: { doradas: 402, azules: 436, blancas: 475, rojas: 513 } },
  { number: 14, par: 4, strokeIndex: 8, distances: { doradas: 290, azules: 314, blancas: 342, rojas: 370 } },
  { number: 15, par: 4, strokeIndex: 4, distances: { doradas: 315, azules: 341, blancas: 371, rojas: 401 } },
  { number: 16, par: 3, strokeIndex: 16, distances: { doradas: 117, azules: 127, blancas: 138, rojas: 149 } },
  { number: 17, par: 5, strokeIndex: 10, distances: { doradas: 374, azules: 405, blancas: 441, rojas: 477 } },
  { number: 18, par: 4, strokeIndex: 14, distances: { doradas: 273, azules: 296, blancas: 322, rojas: 348 } },
];

export const DEFAULT_HOLES = CAMPESTRE_PUEBLA_HOLES;

export const TEE_OPTIONS: TeeSelection[] = [
  { color: 'doradas', name: 'Tees Doradas', description: 'Senior Ladies - Más cortas' },
  { color: 'azules', name: 'Tees Azules', description: 'Ladies - Distancia media' },
  { color: 'blancas', name: 'Tees Blancas', description: 'Senior Men - Estándar' },
  { color: 'rojas', name: 'Tees Rojas', description: 'Championship - Máxima distancia' },
];
