import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Trophy, Target, Zap, Star, Crown, Medal, Award, 
  TrendingUp, Calendar, Users, Flag, MapPin, Clock,
  Share2, Lock, CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'scoring' | 'consistency' | 'social' | 'milestone' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  requirement: string;
}

interface AchievementCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  achievements: Achievement[];
}

interface UserStats {
  totalRounds: number;
  bestScore: number;
  totalEagles: number;
  totalBirdies: number;
  totalPars: number;
  holesInOne: number;
  handicapImprovement: number;
  streakBestRounds: number;
  totalWinnings: number;
  roundsWithFriends: number;
  coursesPlayed: string[];
}

interface AchievementsSystemProps {
  userStats: UserStats;
  className?: string;
}

export function AchievementsSystem({ userStats, className }: AchievementsSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('scoring');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Calculate achievements based on user stats
  const calculateAchievements = (): AchievementCategory[] => {
    return [
      {
        id: 'scoring',
        name: 'Puntuación',
        icon: Target,
        color: 'text-green-500',
        achievements: [
          {
            id: 'first_birdie',
            title: 'Primer Birdie',
            description: 'Consigue tu primer birdie',
            icon: Flag,
            category: 'scoring',
            difficulty: 'bronze',
            points: 50,
            unlocked: userStats.totalBirdies > 0,
            progress: Math.min(userStats.totalBirdies, 1),
            maxProgress: 1,
            requirement: 'Conseguir 1 birdie'
          },
          {
            id: 'birdie_master',
            title: 'Maestro de Birdies',
            description: 'Consigue 25 birdies en total',
            icon: Star,
            category: 'scoring',
            difficulty: 'silver',
            points: 200,
            unlocked: userStats.totalBirdies >= 25,
            progress: Math.min(userStats.totalBirdies, 25),
            maxProgress: 25,
            requirement: 'Conseguir 25 birdies'
          },
          {
            id: 'eagle_hunter',
            title: 'Cazador de Eagles',
            description: 'Consigue tu primer eagle',
            icon: Crown,
            category: 'scoring',
            difficulty: 'gold',
            points: 500,
            unlocked: userStats.totalEagles > 0,
            progress: Math.min(userStats.totalEagles, 1),
            maxProgress: 1,
            requirement: 'Conseguir 1 eagle'
          },
          {
            id: 'hole_in_one',
            title: 'Hoyo en Uno',
            description: 'El santo grial del golf',
            icon: Trophy,
            category: 'scoring',
            difficulty: 'platinum',
            points: 1000,
            unlocked: userStats.holesInOne > 0,
            progress: Math.min(userStats.holesInOne, 1),
            maxProgress: 1,
            requirement: 'Conseguir 1 hole-in-one'
          }
        ]
      },
      {
        id: 'consistency',
        name: 'Consistencia',
        icon: TrendingUp,
        color: 'text-blue-500',
        achievements: [
          {
            id: 'first_round',
            title: 'Primera Ronda',
            description: 'Completa tu primera ronda',
            icon: MapPin,
            category: 'consistency',
            difficulty: 'bronze',
            points: 25,
            unlocked: userStats.totalRounds > 0,
            progress: Math.min(userStats.totalRounds, 1),
            maxProgress: 1,
            requirement: 'Completar 1 ronda'
          },
          {
            id: 'dedicated_golfer',
            title: 'Golfista Dedicado',
            description: 'Completa 10 rondas',
            icon: Calendar,
            category: 'consistency',
            difficulty: 'silver',
            points: 150,
            unlocked: userStats.totalRounds >= 10,
            progress: Math.min(userStats.totalRounds, 10),
            maxProgress: 10,
            requirement: 'Completar 10 rondas'
          },
          {
            id: 'handicap_improver',
            title: 'Mejora Continua',
            description: 'Mejora tu handicap en 5 puntos',
            icon: TrendingUp,
            category: 'consistency',
            difficulty: 'gold',
            points: 300,
            unlocked: userStats.handicapImprovement >= 5,
            progress: Math.min(userStats.handicapImprovement, 5),
            maxProgress: 5,
            requirement: 'Mejorar handicap en 5 puntos'
          },
          {
            id: 'streak_master',
            title: 'Racha Imparable',
            description: 'Mejora tu mejor score 3 rondas seguidas',
            icon: Zap,
            category: 'consistency',
            difficulty: 'platinum',
            points: 500,
            unlocked: userStats.streakBestRounds >= 3,
            progress: Math.min(userStats.streakBestRounds, 3),
            maxProgress: 3,
            requirement: 'Mejorar score 3 rondas seguidas'
          }
        ]
      },
      {
        id: 'social',
        name: 'Social',
        icon: Users,
        color: 'text-purple-500',
        achievements: [
          {
            id: 'first_multiplayer',
            title: 'Jugador Social',
            description: 'Juega tu primera ronda multijugador',
            icon: Users,
            category: 'social',
            difficulty: 'bronze',
            points: 75,
            unlocked: userStats.roundsWithFriends > 0,
            progress: Math.min(userStats.roundsWithFriends, 1),
            maxProgress: 1,
            requirement: 'Jugar 1 ronda multijugador'
          },
          {
            id: 'team_player',
            title: 'Jugador de Equipo',
            description: 'Juega 5 rondas con amigos',
            icon: Users,
            category: 'social',
            difficulty: 'silver',
            points: 200,
            unlocked: userStats.roundsWithFriends >= 5,
            progress: Math.min(userStats.roundsWithFriends, 5),
            maxProgress: 5,
            requirement: 'Jugar 5 rondas multijugador'
          }
        ]
      },
      {
        id: 'milestone',
        name: 'Hitos',
        icon: Medal,
        color: 'text-yellow-500',
        achievements: [
          {
            id: 'big_winner',
            title: 'Gran Ganador',
            description: 'Gana $100 en apuestas',
            icon: Medal,
            category: 'milestone',
            difficulty: 'gold',
            points: 400,
            unlocked: userStats.totalWinnings >= 100,
            progress: Math.min(userStats.totalWinnings, 100),
            maxProgress: 100,
            requirement: 'Ganar $100 en apuestas'
          },
          {
            id: 'course_explorer',
            title: 'Explorador de Campos',
            description: 'Juega en ambos campos disponibles',
            icon: MapPin,
            category: 'milestone',
            difficulty: 'silver',
            points: 150,
            unlocked: userStats.coursesPlayed.length >= 2,
            progress: Math.min(userStats.coursesPlayed.length, 2),
            maxProgress: 2,
            requirement: 'Jugar en 2 campos diferentes'
          }
        ]
      }
    ];
  };

  const achievementCategories = calculateAchievements();
  const selectedCategoryData = achievementCategories.find(cat => cat.id === selectedCategory);
  
  const totalAchievements = achievementCategories.reduce((sum, cat) => sum + cat.achievements.length, 0);
  const unlockedAchievements = achievementCategories.reduce((sum, cat) => 
    sum + cat.achievements.filter(a => a.unlocked).length, 0);
  const totalPoints = achievementCategories.reduce((sum, cat) => 
    sum + cat.achievements.filter(a => a.unlocked).reduce((pts, a) => pts + a.points, 0), 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'text-amber-600 border-amber-600';
      case 'silver': return 'text-gray-500 border-gray-500';
      case 'gold': return 'text-yellow-500 border-yellow-500';
      case 'platinum': return 'text-purple-500 border-purple-500';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const shareAchievement = (achievement: Achievement) => {
    if (navigator.share) {
      navigator.share({
        title: `¡Logré el achievement "${achievement.title}"!`,
        text: `Acabo de conseguir "${achievement.title}" en Fore the Money Golf App: ${achievement.description}`,
        url: window.location.origin
      });
    } else {
      // Fallback for browsers without Web Share API
      const text = `¡Logré el achievement "${achievement.title}" en Fore the Money! ${achievement.description}`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <Card className="bg-dark-card border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Logros y Achievements
          </CardTitle>
          <CardDescription className="text-gray-400">
            Progreso general y badges conseguidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{unlockedAchievements}</div>
              <div className="text-sm text-gray-400">de {totalAchievements}</div>
              <div className="text-xs text-gray-500">Logros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{totalPoints}</div>
              <div className="text-xs text-gray-500">Puntos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {Math.round((unlockedAchievements / totalAchievements) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Completado</div>
            </div>
          </div>
          <Progress 
            value={(unlockedAchievements / totalAchievements) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {achievementCategories.map((category) => {
          const IconComponent = category.icon;
          const unlockedInCategory = category.achievements.filter(a => a.unlocked).length;
          
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'border-gray-600 text-white hover:bg-gray-800'
              }`}
            >
              <IconComponent className={`h-4 w-4 ${category.color}`} />
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {unlockedInCategory}/{category.achievements.length}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      {selectedCategoryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedCategoryData.achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
            
            return (
              <Dialog key={achievement.id}>
                <DialogTrigger asChild>
                  <Card className={`cursor-pointer transition-all hover:scale-105 ${
                    achievement.unlocked 
                      ? 'bg-dark-card border-green-600 shadow-green-600/20 shadow-lg' 
                      : 'bg-gray-900 border-gray-600'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-gray-800 text-gray-500'
                        }`}>
                          {achievement.unlocked ? (
                            <IconComponent className="h-6 w-6" />
                          ) : (
                            <Lock className="h-6 w-6" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              achievement.unlocked ? 'text-white' : 'text-gray-400'
                            }`}>
                              {achievement.title}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(achievement.difficulty)}`}
                            >
                              {achievement.difficulty}
                            </Badge>
                          </div>
                          
                          <p className={`text-sm mb-2 ${
                            achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {achievement.description}
                          </p>
                          
                          {!achievement.unlocked && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                                <span className="text-gray-400">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                              <Progress value={progressPercentage} className="h-1" />
                            </div>
                          )}
                          
                          {achievement.unlocked && (
                            <div className="flex items-center gap-2 text-xs text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>+{achievement.points} puntos</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="bg-dark-card border-gray-600">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <IconComponent className={`h-5 w-5 ${
                        achievement.unlocked ? 'text-green-400' : 'text-gray-500'
                      }`} />
                      {achievement.title}
                      <Badge className={getDifficultyColor(achievement.difficulty)}>
                        {achievement.difficulty}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {achievement.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-300 mb-2">Requisito:</div>
                      <div className="text-white">{achievement.requirement}</div>
                    </div>
                    
                    {achievement.unlocked ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>¡Logro desbloqueado!</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            Puntos ganados: <span className="text-yellow-500 font-semibold">{achievement.points}</span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareAchievement(achievement)}
                            className="border-gray-600 text-white hover:bg-gray-800"
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            Compartir
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progreso</span>
                          <span className="text-white">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-center">
                          {Math.round(progressPercentage)}% completado
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AchievementsSystem;