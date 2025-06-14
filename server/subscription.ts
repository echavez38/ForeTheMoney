import type { User } from '@shared/schema';

export interface SubscriptionLimits {
  maxRoundsPerMonth: number;
  maxPlayersPerRound: number;
  availableCourses: string[];
  hasAdvancedBetting: boolean;
  hasMultiplayer: boolean;
  hasAnalytics: boolean;
  hasCloudBackup: boolean;
  hasAdsRemoved: boolean;
}

export class SubscriptionService {
  static getLimits(subscriptionType: string): SubscriptionLimits {
    switch (subscriptionType) {
      case 'premium':
        return {
          maxRoundsPerMonth: -1, // Unlimited
          maxPlayersPerRound: 6,
          availableCourses: ['Club Campestre de Puebla', 'La Vista Country Club'],
          hasAdvancedBetting: true,
          hasMultiplayer: true,
          hasAnalytics: true,
          hasCloudBackup: true,
          hasAdsRemoved: true,
        };
      case 'free':
      default:
        return {
          maxRoundsPerMonth: 3,
          maxPlayersPerRound: 4,
          availableCourses: ['Club Campestre de Puebla'],
          hasAdvancedBetting: false,
          hasMultiplayer: false,
          hasAnalytics: false,
          hasCloudBackup: false,
          hasAdsRemoved: false,
        };
    }
  }

  static isPremium(user: User): boolean {
    if (user.subscriptionType !== 'premium') return false;
    
    const now = new Date();
    if (user.subscriptionEndDate && now > user.subscriptionEndDate) {
      return false; // Subscription expired
    }
    
    return true;
  }

  static canCreateRound(user: User): { allowed: boolean; reason?: string } {
    const limits = this.getLimits(user.subscriptionType);
    
    // Check if premium subscription is expired
    if (user.subscriptionType === 'premium' && !this.isPremium(user)) {
      return {
        allowed: false,
        reason: 'Tu suscripción Premium ha expirado. Actualiza para continuar con acceso completo.'
      };
    }

    // Check monthly round limits for free users
    if (limits.maxRoundsPerMonth > 0) {
      const now = new Date();
      const lastReset = user.lastMonthReset || user.createdAt || now;
      const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
      
      // Reset counter if it's been more than 30 days
      if (daysSinceReset >= 30) {
        // This should be updated in the database
        return { allowed: true };
      }
      
      if (user.roundsThisMonth >= limits.maxRoundsPerMonth) {
        return {
          allowed: false,
          reason: `Has alcanzado el límite de ${limits.maxRoundsPerMonth} rondas por mes del plan gratuito. Actualiza a Premium para rondas ilimitadas.`
        };
      }
    }

    return { allowed: true };
  }

  static canUseMultiplayer(user: User): boolean {
    const limits = this.getLimits(user.subscriptionType);
    return limits.hasMultiplayer;
  }

  static canAccessCourse(user: User, courseName: string): boolean {
    const limits = this.getLimits(user.subscriptionType);
    return limits.availableCourses.includes(courseName);
  }

  static canUseAdvancedBetting(user: User): boolean {
    const limits = this.getLimits(user.subscriptionType);
    return limits.hasAdvancedBetting;
  }

  static getMaxPlayers(user: User): number {
    const limits = this.getLimits(user.subscriptionType);
    return limits.maxPlayersPerRound;
  }

  static getSubscriptionInfo(user: User) {
    const limits = this.getLimits(user.subscriptionType);
    const isPremium = this.isPremium(user);
    
    return {
      type: user.subscriptionType,
      isPremium,
      limits,
      daysUntilExpiry: user.subscriptionEndDate ? 
        Math.ceil((user.subscriptionEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
        null,
      roundsUsedThisMonth: user.roundsThisMonth,
    };
  }

  static getPricingInfo() {
    return {
      free: {
        name: 'Basic Golf',
        price: 0,
        currency: 'USD',
        period: 'Gratis',
        features: [
          '3 rondas por mes',
          'Hasta 4 jugadores',
          '1 campo de golf',
          'Betting básico (Stroke Play)',
          'Análisis de última ronda',
        ],
        limitations: [
          'Sin multiplayer en tiempo real',
          'Sin análisis histórico',
          'Con anuncios',
        ]
      },
      premium: {
        name: 'Pro Golfer',
        price: 4.99,
        currency: 'USD',
        period: 'mes',
        features: [
          'Rondas ilimitadas',
          'Hasta 6 jugadores',
          'Todos los campos disponibles',
          'Sistema completo de betting',
          'Multiplayer en tiempo real',
          'Análisis histórico completo',
          'Sistema de logros y badges',
          'Exportar a PDF',
          'Backup automático',
          'Sin anuncios',
          'Soporte prioritario',
        ]
      }
    };
  }
}

export const subscriptionService = new SubscriptionService();