import { User, Round } from './types';

const STORAGE_KEYS = {
  USER: 'foreTheMoneyUser',
  ROUNDS: 'foreTheMoneyRounds',
  CURRENT_ROUND: 'foreTheMoneyCurrentRound',
} as const;

export class StorageManager {
  static saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  static clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  static saveRound(round: Round): void {
    const rounds = this.getRounds();
    const existingIndex = rounds.findIndex(r => r.id === round.id);
    
    if (existingIndex >= 0) {
      rounds[existingIndex] = round;
    } else {
      rounds.push(round);
    }
    
    localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(rounds));
  }

  static getRounds(): Round[] {
    const data = localStorage.getItem(STORAGE_KEYS.ROUNDS);
    return data ? JSON.parse(data) : [];
  }

  static getCurrentRound(): Round | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ROUND);
    return data ? JSON.parse(data) : null;
  }

  static setCurrentRound(round: Round | null): void {
    if (round) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROUND, JSON.stringify(round));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ROUND);
    }
  }

  static getRecentRounds(limit: number = 5): Round[] {
    const rounds = this.getRounds();
    return rounds
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  static getUserStats(): { totalWinnings: number; roundsPlayed: number } {
    const rounds = this.getRounds().filter(r => r.completed);
    const user = this.getUser();
    
    if (!user) return { totalWinnings: 0, roundsPlayed: 0 };

    const totalWinnings = rounds.reduce((total, round) => {
      const player = round.players.find(p => p.name === user.name);
      return total + (player?.moneyBalance || 0);
    }, 0);

    return {
      totalWinnings,
      roundsPlayed: rounds.length,
    };
  }
}
