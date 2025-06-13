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
  gameFormats: {
    strokePlay: boolean;
    matchPlay: boolean;
  };
  bettingOptions: BettingOptions;
  completed: boolean;
  createdAt: Date;
}

export interface RoundPlayer {
  id: string;
  name: string;
  handicap: number;
  selectedTee: TeeSelection;
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
  segments: {
    frontNine: boolean;
    backNine: boolean;
    total: boolean;
  };
}

export interface HoleInfo {
  number: number;
  par: number;
  strokeIndex: {
    negras: number;    // Hombres - Más difícil
    azules: number;    // Hombres
    blancas: number;   // Hombres
    blancas_f: number; // Mujeres - Blancas
    doradas: number;   // Mujeres
    plateadas: number; // Mujeres
    rojas: number;     // Mujeres - Más fácil
  };
  distances: {
    negras: number;    // Hombres - Más difícil
    azules: number;    // Hombres
    blancas: number;   // Hombres/Mujeres
    blancas_f: number; // Mujeres - Blancas
    doradas: number;   // Mujeres
    plateadas: number; // Mujeres
    rojas: number;     // Mujeres - Más fácil
  };
}

export interface TeeSelection {
  color: 'negras' | 'azules' | 'blancas' | 'blancas_f' | 'doradas' | 'plateadas' | 'rojas';
  name: string;
  description: string;
  gender: 'hombres' | 'mujeres';
}

export interface BettingResult {
  type: 'skins' | 'oyeses' | 'foursomes';
  winner: string | null;
  amount: number;
  tied: boolean;
}

// Club Campestre de Puebla - Datos oficiales del campo
export const CAMPESTRE_PUEBLA_HOLES: HoleInfo[] = [
  { number: 1, par: 4, strokeIndex: { negras: 9, azules: 9, blancas: 9, blancas_f: 7, doradas: 5, plateadas: 11, rojas: 5 }, distances: { negras: 378, azules: 365, blancas: 353, blancas_f: 353, doradas: 324, plateadas: 274, rojas: 299 } },
  { number: 2, par: 3, strokeIndex: { negras: 17, azules: 17, blancas: 15, blancas_f: 17, doradas: 11, plateadas: 5, rojas: 17 }, distances: { negras: 152, azules: 145, blancas: 135, blancas_f: 135, doradas: 119, plateadas: 95, rojas: 100 } },
  { number: 3, par: 5, strokeIndex: { negras: 5, azules: 5, blancas: 5, blancas_f: 3, doradas: 15, plateadas: 13, rojas: 7 }, distances: { negras: 595, azules: 577, blancas: 567, blancas_f: 567, doradas: 475, plateadas: 435, rojas: 456 } },
  { number: 4, par: 4, strokeIndex: { negras: 13, azules: 15, blancas: 17, blancas_f: 13, doradas: 17, plateadas: 15, rojas: 15 }, distances: { negras: 390, azules: 367, blancas: 339, blancas_f: 339, doradas: 292, plateadas: 262, rojas: 270 } },
  { number: 5, par: 4, strokeIndex: { negras: 1, azules: 7, blancas: 7, blancas_f: 9, doradas: 9, plateadas: 9, rojas: 9 }, distances: { negras: 432, azules: 423, blancas: 375, blancas_f: 375, doradas: 341, plateadas: 302, rojas: 320 } },
  { number: 6, par: 5, strokeIndex: { negras: 7, azules: 1, blancas: 1, blancas_f: 1, doradas: 1, plateadas: 1, rojas: 1 }, distances: { negras: 405, azules: 400, blancas: 395, blancas_f: 395, doradas: 353, plateadas: 326, rojas: 329 } },
  { number: 7, par: 4, strokeIndex: { negras: 3, azules: 3, blancas: 3, blancas_f: 5, doradas: 3, plateadas: 3, rojas: 3 }, distances: { negras: 425, azules: 405, blancas: 388, blancas_f: 388, doradas: 365, plateadas: 321, rojas: 330 } },
  { number: 8, par: 4, strokeIndex: { negras: 15, azules: 11, blancas: 11, blancas_f: 15, doradas: 7, plateadas: 3, rojas: 13 }, distances: { negras: 230, azules: 208, blancas: 195, blancas_f: 195, doradas: 165, plateadas: 147, rojas: 147 } },
  { number: 9, par: 3, strokeIndex: { negras: 11, azules: 13, blancas: 13, blancas_f: 11, doradas: 13, plateadas: 17, rojas: 11 }, distances: { negras: 170, azules: 543, blancas: 500, blancas_f: 500, doradas: 471, plateadas: 460, rojas: 404 } },
  { number: 10, par: 4, strokeIndex: { negras: 4, azules: 4, blancas: 6, blancas_f: 4, doradas: 4, plateadas: 6, rojas: 4 }, distances: { negras: 511, azules: 494, blancas: 436, blancas_f: 436, doradas: 390, plateadas: 348, rojas: 348 } },
  { number: 11, par: 4, strokeIndex: { negras: 16, azules: 16, blancas: 14, blancas_f: 14, doradas: 14, plateadas: 14, rojas: 14 }, distances: { negras: 366, azules: 363, blancas: 354, blancas_f: 354, doradas: 326, plateadas: 300, rojas: 300 } },
  { number: 12, par: 3, strokeIndex: { negras: 10, azules: 8, blancas: 8, blancas_f: 8, doradas: 10, plateadas: 16, rojas: 8 }, distances: { negras: 200, azules: 192, blancas: 160, blancas_f: 160, doradas: 143, plateadas: 119, rojas: 489 } },
  { number: 13, par: 5, strokeIndex: { negras: 8, azules: 14, blancas: 12, blancas_f: 18, doradas: 12, plateadas: 16, rojas: 18 }, distances: { negras: 545, azules: 539, blancas: 526, blancas_f: 526, doradas: 512, plateadas: 500, rojas: 116 } },
  { number: 14, par: 4, strokeIndex: { negras: 2, azules: 2, blancas: 2, blancas_f: 2, doradas: 6, plateadas: 2, rojas: 10 }, distances: { negras: 430, azules: 419, blancas: 402, blancas_f: 402, doradas: 342, plateadas: 317, rojas: 319 } },
  { number: 15, par: 3, strokeIndex: { negras: 18, azules: 18, blancas: 18, blancas_f: 10, doradas: 18, plateadas: 18, rojas: 6 }, distances: { negras: 195, azules: 185, blancas: 175, blancas_f: 175, doradas: 171, plateadas: 153, rojas: 153 } },
  { number: 16, par: 4, strokeIndex: { negras: 6, azules: 6, blancas: 6, blancas_f: 6, doradas: 2, plateadas: 8, rojas: 6 }, distances: { negras: 373, azules: 362, blancas: 340, blancas_f: 340, doradas: 307, plateadas: 278, rojas: 278 } },
  { number: 17, par: 5, strokeIndex: { negras: 12, azules: 10, blancas: 10, blancas_f: 16, doradas: 8, plateadas: 4, rojas: 12 }, distances: { negras: 530, azules: 518, blancas: 493, blancas_f: 493, doradas: 496, plateadas: 426, rojas: 281 } },
  { number: 18, par: 4, strokeIndex: { negras: 14, azules: 12, blancas: 12, blancas_f: 12, doradas: 16, plateadas: 12, rojas: 16 }, distances: { negras: 358, azules: 350, blancas: 324, blancas_f: 324, doradas: 306, plateadas: 284, rojas: 306 } },
];

export const DEFAULT_HOLES = CAMPESTRE_PUEBLA_HOLES;

export const TEE_OPTIONS: TeeSelection[] = [
  { color: 'negras', name: 'Tees Negras', description: 'Hombres - Máxima dificultad', gender: 'hombres' },
  { color: 'azules', name: 'Tees Azules', description: 'Hombres - Alta dificultad', gender: 'hombres' },
  { color: 'blancas', name: 'Tees Blancas (H)', description: 'Hombres - Estándar', gender: 'hombres' },
  { color: 'blancas_f', name: 'Tees Blancas (M)', description: 'Mujeres - Estándar', gender: 'mujeres' },
  { color: 'doradas', name: 'Tees Doradas', description: 'Mujeres - Media distancia', gender: 'mujeres' },
  { color: 'plateadas', name: 'Tees Plateadas', description: 'Mujeres - Corta distancia', gender: 'mujeres' },
  { color: 'rojas', name: 'Tees Rojas', description: 'Mujeres - Mínima dificultad', gender: 'mujeres' },
];
