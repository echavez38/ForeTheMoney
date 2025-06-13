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

// Club Campestre de Puebla - Datos de la tarjeta oficial
export const CAMPESTRE_PUEBLA_HOLES: HoleInfo[] = [
  { number: 1, par: 4, strokeIndex: 12, distances: { doradas: 326, azules: 356, blancas: 393, rojas: 417 } },
  { number: 2, par: 4, strokeIndex: 6, distances: { doradas: 329, azules: 354, blancas: 383, rojas: 404 } },
  { number: 3, par: 4, strokeIndex: 14, distances: { doradas: 248, azules: 279, blancas: 315, rojas: 347 } },
  { number: 4, par: 3, strokeIndex: 16, distances: { doradas: 115, azules: 137, blancas: 159, rojas: 184 } },
  { number: 5, par: 4, strokeIndex: 4, distances: { doradas: 278, azules: 312, blancas: 350, rojas: 378 } },
  { number: 6, par: 5, strokeIndex: 10, distances: { doradas: 424, azules: 463, blancas: 510, rojas: 545 } },
  { number: 7, par: 3, strokeIndex: 18, distances: { doradas: 125, azules: 142, blancas: 162, rojas: 185 } },
  { number: 8, par: 4, strokeIndex: 2, distances: { doradas: 284, azules: 319, blancas: 358, rojas: 387 } },
  { number: 9, par: 5, strokeIndex: 8, distances: { doradas: 424, azules: 463, blancas: 510, rojas: 545 } },
  { number: 10, par: 4, strokeIndex: 3, distances: { doradas: 315, azules: 342, blancas: 374, rojas: 396 } },
  { number: 11, par: 5, strokeIndex: 7, distances: { doradas: 417, azules: 449, blancas: 488, rojas: 517 } },
  { number: 12, par: 3, strokeIndex: 17, distances: { doradas: 113, azules: 135, blancas: 159, rojas: 182 } },
  { number: 13, par: 4, strokeIndex: 1, distances: { doradas: 298, azules: 323, blancas: 354, rojas: 378 } },
  { number: 14, par: 4, strokeIndex: 15, distances: { doradas: 283, azules: 310, blancas: 342, rojas: 368 } },
  { number: 15, par: 5, strokeIndex: 9, distances: { doradas: 407, azules: 439, blancas: 478, rojas: 507 } },
  { number: 16, par: 3, strokeIndex: 13, distances: { doradas: 134, azules: 155, blancas: 178, rojas: 201 } },
  { number: 17, par: 4, strokeIndex: 5, distances: { doradas: 301, azules: 328, blancas: 359, rojas: 383 } },
  { number: 18, par: 4, strokeIndex: 11, distances: { doradas: 302, azules: 329, blancas: 360, rojas: 384 } },
];

export const DEFAULT_HOLES = CAMPESTRE_PUEBLA_HOLES;

export const TEE_OPTIONS: TeeSelection[] = [
  { color: 'doradas', name: 'Tees Doradas', description: 'Senior Ladies - Más cortas' },
  { color: 'azules', name: 'Tees Azules', description: 'Ladies - Distancia media' },
  { color: 'blancas', name: 'Tees Blancas', description: 'Senior Men - Estándar' },
  { color: 'rojas', name: 'Tees Rojas', description: 'Championship - Máxima distancia' },
];
