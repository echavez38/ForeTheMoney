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
  { number: 1, par: 4, strokeIndex: 10, distances: { negras: 378, azules: 365, blancas: 353, doradas: 324, plateadas: 274, rojas: 299 } },
  { number: 2, par: 3, strokeIndex: 16, distances: { negras: 152, azules: 145, blancas: 135, doradas: 119, plateadas: 95, rojas: 100 } },
  { number: 3, par: 5, strokeIndex: 8, distances: { negras: 595, azules: 577, blancas: 567, doradas: 475, plateadas: 435, rojas: 456 } },
  { number: 4, par: 4, strokeIndex: 18, distances: { negras: 390, azules: 367, blancas: 339, doradas: 292, plateadas: 262, rojas: 270 } },
  { number: 5, par: 4, strokeIndex: 6, distances: { negras: 432, azules: 423, blancas: 375, doradas: 341, plateadas: 302, rojas: 320 } },
  { number: 6, par: 5, strokeIndex: 4, distances: { negras: 405, azules: 400, blancas: 395, doradas: 353, plateadas: 326, rojas: 329 } },
  { number: 7, par: 4, strokeIndex: 2, distances: { negras: 425, azules: 405, blancas: 388, doradas: 365, plateadas: 321, rojas: 330 } },
  { number: 8, par: 4, strokeIndex: 12, distances: { negras: 230, azules: 208, blancas: 195, doradas: 165, plateadas: 147, rojas: 147 } },
  { number: 9, par: 3, strokeIndex: 14, distances: { negras: 170, azules: 543, blancas: 500, doradas: 471, plateadas: 460, rojas: 404 } },
  { number: 10, par: 4, strokeIndex: 3, distances: { negras: 511, azules: 494, blancas: 436, doradas: 390, plateadas: 348, rojas: 348 } },
  { number: 11, par: 4, strokeIndex: 15, distances: { negras: 366, azules: 363, blancas: 354, doradas: 326, plateadas: 300, rojas: 300 } },
  { number: 12, par: 3, strokeIndex: 17, distances: { negras: 200, azules: 192, blancas: 160, doradas: 143, plateadas: 119, rojas: 489 } },
  { number: 13, par: 5, strokeIndex: 1, distances: { negras: 545, azules: 539, blancas: 526, doradas: 512, plateadas: 500, rojas: 116 } },
  { number: 14, par: 4, strokeIndex: 11, distances: { negras: 430, azules: 419, blancas: 402, doradas: 342, plateadas: 317, rojas: 319 } },
  { number: 15, par: 3, strokeIndex: 5, distances: { negras: 195, azules: 185, blancas: 175, doradas: 171, plateadas: 153, rojas: 153 } },
  { number: 16, par: 4, strokeIndex: 7, distances: { negras: 373, azules: 362, blancas: 340, doradas: 307, plateadas: 278, rojas: 278 } },
  { number: 17, par: 5, strokeIndex: 13, distances: { negras: 530, azules: 518, blancas: 493, doradas: 496, plateadas: 426, rojas: 281 } },
  { number: 18, par: 4, strokeIndex: 9, distances: { negras: 358, azules: 350, blancas: 324, doradas: 306, plateadas: 284, rojas: 306 } },
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
