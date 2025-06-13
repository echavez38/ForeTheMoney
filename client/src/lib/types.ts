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
    negras: number;    // Hombres - Más difícil
    azules: number;    // Hombres
    blancas: number;   // Hombres/Mujeres
    doradas: number;   // Hombres
    plateadas: number; // Hombres - Más fácil
    rojas: number;     // Mujeres - Más fácil
  };
}

export interface TeeSelection {
  color: 'negras' | 'azules' | 'blancas' | 'doradas' | 'plateadas' | 'rojas';
  name: string;
  description: string;
  gender: 'hombres' | 'mujeres' | 'ambos';
}

export interface BettingResult {
  type: 'skins' | 'oyeses' | 'foursomes';
  winner: string | null;
  amount: number;
  tied: boolean;
}

// Club Campestre de Puebla - Datos oficiales del campo
export const CAMPESTRE_PUEBLA_HOLES: HoleInfo[] = [
  { number: 1, par: 4, strokeIndex: 11, distances: { negras: 365, azules: 334, blancas: 310, doradas: 285, plateadas: 263, rojas: 285 } },
  { number: 2, par: 4, strokeIndex: 5, distances: { negras: 395, azules: 361, blancas: 334, doradas: 307, plateadas: 283, rojas: 320 } },
  { number: 3, par: 3, strokeIndex: 17, distances: { negras: 150, azules: 137, blancas: 127, doradas: 117, plateadas: 108, rojas: 115 } },
  { number: 4, par: 5, strokeIndex: 1, distances: { negras: 550, azules: 504, blancas: 467, doradas: 429, plateadas: 396, rojas: 440 } },
  { number: 5, par: 4, strokeIndex: 7, distances: { negras: 380, azules: 345, blancas: 319, doradas: 293, plateadas: 270, rojas: 295 } },
  { number: 6, par: 4, strokeIndex: 13, distances: { negras: 340, azules: 310, blancas: 287, doradas: 264, plateadas: 244, rojas: 270 } },
  { number: 7, par: 3, strokeIndex: 15, distances: { negras: 165, azules: 151, blancas: 140, doradas: 129, plateadas: 119, rojas: 125 } },
  { number: 8, par: 5, strokeIndex: 3, distances: { negras: 550, azules: 504, blancas: 467, doradas: 429, plateadas: 396, rojas: 440 } },
  { number: 9, par: 4, strokeIndex: 9, distances: { negras: 415, azules: 379, blancas: 351, doradas: 322, plateadas: 297, rojas: 330 } },
  { number: 10, par: 4, strokeIndex: 6, distances: { negras: 385, azules: 349, blancas: 323, doradas: 297, plateadas: 274, rojas: 305 } },
  { number: 11, par: 4, strokeIndex: 12, distances: { negras: 360, azules: 327, blancas: 303, doradas: 278, plateadas: 257, rojas: 285 } },
  { number: 12, par: 3, strokeIndex: 18, distances: { negras: 125, azules: 110, blancas: 102, doradas: 94, plateadas: 87, rojas: 95 } },
  { number: 13, par: 5, strokeIndex: 2, distances: { negras: 560, azules: 513, blancas: 475, doradas: 436, plateadas: 402, rojas: 450 } },
  { number: 14, par: 4, strokeIndex: 8, distances: { negras: 405, azules: 370, blancas: 342, doradas: 314, plateadas: 290, rojas: 325 } },
  { number: 15, par: 4, strokeIndex: 4, distances: { negras: 440, azules: 401, blancas: 371, doradas: 341, plateadas: 315, rojas: 350 } },
  { number: 16, par: 3, strokeIndex: 16, distances: { negras: 165, azules: 149, blancas: 138, doradas: 127, plateadas: 117, rojas: 130 } },
  { number: 17, par: 5, strokeIndex: 10, distances: { negras: 520, azules: 477, blancas: 441, doradas: 405, plateadas: 374, rojas: 415 } },
  { number: 18, par: 4, strokeIndex: 14, distances: { negras: 385, azules: 348, blancas: 322, doradas: 296, plateadas: 273, rojas: 305 } },
];

export const DEFAULT_HOLES = CAMPESTRE_PUEBLA_HOLES;

export const TEE_OPTIONS: TeeSelection[] = [
  { color: 'negras', name: 'Tees Negras', description: 'Hombres - Máxima dificultad', gender: 'hombres' },
  { color: 'azules', name: 'Tees Azules', description: 'Hombres - Alta dificultad', gender: 'hombres' },
  { color: 'blancas', name: 'Tees Blancas', description: 'Hombres/Mujeres - Estándar', gender: 'ambos' },
  { color: 'doradas', name: 'Tees Doradas', description: 'Hombres - Baja dificultad', gender: 'hombres' },
  { color: 'plateadas', name: 'Tees Plateadas', description: 'Hombres - Mínima dificultad', gender: 'hombres' },
  { color: 'rojas', name: 'Tees Rojas', description: 'Mujeres - Estándar', gender: 'mujeres' },
];
