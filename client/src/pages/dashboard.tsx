import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StorageManager } from '@/lib/storage';
import { User, Round } from '@/lib/types';
import { Plus, Users, History, BarChart3, Settings, LogOut, ChevronRight, TrendingUp, Target, Trophy, Calendar } from 'lucide-react';
import { AchievementBadge, getAchievements } from '@/components/achievement-badge';
import { BottomNavigation } from '@/components/bottom-navigation';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [recentRounds, setRecentRounds] = useState<Round[]>([]);
  const [stats, setStats] = useState({ totalWinnings: 0, roundsPlayed: 0 });

  useEffect(() => {
    const userData = StorageManager.getUser();
    if (!userData) {
      setLocation('/');
      return;
    }
    
    setUser(userData);
    setRecentRounds(StorageManager.getRecentRounds(3));
    setStats(StorageManager.getUserStats());
  }, [setLocation]);

  const handleLogout = () => {
    StorageManager.clearUser();
    setLocation('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface px-6 py-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-golf-blue rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-white text-lg">{user.name}</p>
              <p className="text-sm text-secondary">Handicap {user.handicap}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="p-3 rounded-xl hover:bg-dark-card text-secondary hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Button
            onClick={() => setLocation('/create-round')}
            className="bg-golf-blue p-8 h-auto rounded-2xl text-center hover:bg-golf-blue-dark transition-all duration-200 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg text-white">Nueva Ronda</p>
                <p className="text-sm text-blue-200">Comenzar nueva partida de golf</p>
              </div>
            </div>
            <div className="text-white opacity-50">
              <ChevronRight className="h-6 w-6" />
            </div>
          </Button>
          
          <Button
            onClick={() => setLocation('/analytics')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 h-auto rounded-2xl text-center hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Análisis de Rendimiento</p>
                <p className="text-sm text-purple-100">Estadísticas detalladas y tendencias</p>
              </div>
            </div>
            <div className="text-white opacity-50">
              <ChevronRight className="h-5 w-5" />
            </div>
          </Button>
        </div>

        {/* Performance Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6 text-white">Resumen de Rendimiento</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-5 w-5 text-white mr-2" />
                  <span className="text-sm font-medium text-white">Balance Total</span>
                </div>
                <div className="text-2xl font-bold text-white">${stats.totalWinnings.toFixed(2)}</div>
                <div className="text-xs text-green-100 mt-1">Últimas rondas</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-white mr-2" />
                  <span className="text-sm font-medium text-white">Handicap</span>
                </div>
                <div className="text-2xl font-bold text-white">{user.handicap}</div>
                <div className="text-xs text-blue-100 mt-1">Índice actual</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-white">{stats.roundsPlayed}</div>
                    <div className="text-xs text-gray-400">Rondas Jugadas</div>
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-golf-green">
                      {stats.roundsPlayed > 0 ? (stats.totalWinnings / stats.roundsPlayed).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-xs text-gray-400">$/Ronda</div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-golf-green" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {recentRounds.length > 0 ? 
                        Math.round(recentRounds.reduce((avg, round) => {
                          const userPlayer = round.players.find(p => p.id === user.id);
                          return avg + (userPlayer?.netTotal || 72);
                        }, 0) / recentRounds.length) : 72
                      }
                    </div>
                    <div className="text-xs text-gray-400">Score Promedio</div>
                  </div>
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-yellow-400">
                      {recentRounds.length > 0 ? 
                        Math.round((recentRounds.filter(round => {
                          const userPlayer = round.players.find(p => p.id === user.id);
                          return (userPlayer?.moneyBalance || 0) > 0;
                        }).length / recentRounds.length) * 100) : 0
                      }%
                    </div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                  <Trophy className="h-4 w-4 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6 text-white">Logros</h3>
          <div className="grid grid-cols-3 gap-4">
            {getAchievements(stats, recentRounds).slice(0, 6).map(achievement => (
              <AchievementBadge 
                key={achievement.id} 
                achievement={achievement} 
                size="small"
              />
            ))}
          </div>
        </div>

        {/* Recent Rounds */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6 text-white">Actividad Reciente</h3>
          
          {recentRounds.length > 0 ? (
            <div className="space-y-4">
              {recentRounds.map((round) => {
                const userPlayer = round.players.find(p => p.name === user.name);
                const winnings = userPlayer?.moneyBalance || 0;
                
                return (
                  <Card key={round.id} className="bg-dark-surface border-gray-700 rounded-2xl shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-golf-blue bg-opacity-20 rounded-xl flex items-center justify-center">
                            <span className="text-golf-blue font-bold">⛳</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white text-lg">{round.course}</p>
                            <p className="text-sm text-secondary">
                              {new Date(round.createdAt).toLocaleDateString('es-ES')} • {round.holes} hoyos
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-secondary flex items-center">
                                <Users className="h-4 w-4 text-golf-blue mr-1" />
                                {round.players.length} jugadores
                              </span>
                              <span className={`text-sm font-bold ${
                                winnings >= 0 ? 'text-golf-green' : 'text-red-400'
                              }`}>
                                {winnings >= 0 ? '+' : ''}${winnings.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-secondary" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-dark-surface border-gray-700 rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-dark-card rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⛳</span>
                </div>
                <p className="text-white font-semibold mb-2">No hay rondas recientes</p>
                <p className="text-sm text-secondary">Comienza tu primera partida de golf</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Statistics */}
        <Card className="bg-dark-surface border-gray-700 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6 text-white">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-dark-card rounded-xl">
                <div className="w-12 h-12 bg-golf-green bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-golf-green text-xl">$</span>
                </div>
                <p className={`text-2xl font-bold ${
                  stats.totalWinnings >= 0 ? 'text-golf-green' : 'text-red-400'
                }`}>
                  {stats.totalWinnings >= 0 ? '+' : ''}${stats.totalWinnings.toFixed(2)}
                </p>
                <p className="text-sm text-secondary mt-1">Ganancias Totales</p>
              </div>
              <div className="text-center p-4 bg-dark-card rounded-xl">
                <div className="w-12 h-12 bg-golf-blue bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-golf-blue text-xl">🏆</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.roundsPlayed}</p>
                <p className="text-sm text-secondary mt-1">Rondas Jugadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
