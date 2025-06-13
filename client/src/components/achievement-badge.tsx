import React from 'react';
import { Trophy, Target, TrendingUp, Zap, Star, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
}

export function AchievementBadge({ achievement, size = 'medium' }: AchievementBadgeProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  const iconSizes = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-10 w-10'
  };

  const Icon = achievement.icon;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center transition-all duration-300 ${
          achievement.unlocked
            ? `bg-gradient-to-br ${achievement.color} shadow-lg`
            : 'bg-gray-700 grayscale'
        }`}
      >
        <Icon className={`${iconSizes[size]} text-white`} />
      </div>
      
      {size !== 'small' && (
        <div className="text-center">
          <p className={`text-sm font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
            {achievement.title}
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-20 text-center">
            {achievement.description}
          </p>
          
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  achievement.unlocked ? 'bg-green-400' : 'bg-blue-400'
                }`}
                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function getAchievements(userStats: { totalWinnings: number; roundsPlayed: number }, recentRounds: any[]): Achievement[] {
  const winRate = userStats.roundsPlayed > 0 ? 
    (recentRounds.filter(round => {
      const userPlayer = round.players.find((p: any) => p.id);
      return (userPlayer?.moneyBalance || 0) > 0;
    }).length / userStats.roundsPlayed) * 100 : 0;

  return [
    {
      id: 'first_round',
      title: 'Primera Ronda',
      description: 'Completa tu primera ronda',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      unlocked: userStats.roundsPlayed >= 1,
    },
    {
      id: 'five_rounds',
      title: 'Jugador Regular',
      description: 'Completa 5 rondas',
      icon: Trophy,
      color: 'from-green-500 to-green-600',
      unlocked: userStats.roundsPlayed >= 5,
      progress: userStats.roundsPlayed,
      maxProgress: 5,
    },
    {
      id: 'profitable',
      title: 'En Números Verdes',
      description: 'Gana dinero por primera vez',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      unlocked: userStats.totalWinnings > 0,
    },
    {
      id: 'big_winner',
      title: 'Gran Ganador',
      description: 'Gana más de $100',
      icon: Award,
      color: 'from-yellow-500 to-yellow-600',
      unlocked: userStats.totalWinnings >= 100,
      progress: Math.min(userStats.totalWinnings, 100),
      maxProgress: 100,
    },
    {
      id: 'consistent',
      title: 'Consistente',
      description: 'Win rate del 60%+',
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      unlocked: winRate >= 60 && userStats.roundsPlayed >= 5,
      progress: Math.min(winRate, 60),
      maxProgress: 60,
    },
    {
      id: 'marathon',
      title: 'Maratonista',
      description: 'Juega 20 rondas',
      icon: Zap,
      color: 'from-red-500 to-red-600',
      unlocked: userStats.roundsPlayed >= 20,
      progress: userStats.roundsPlayed,
      maxProgress: 20,
    },
  ];
}