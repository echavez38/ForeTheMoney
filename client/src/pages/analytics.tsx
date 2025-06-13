import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StorageManager } from '@/lib/storage';
import { User, Round } from '@/lib/types';
import { ArrowLeft, TrendingUp, TrendingDown, Target, BarChart3, Calendar, Trophy, Zap } from 'lucide-react';
import { BottomNavigation } from '@/components/bottom-navigation';

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);

  useEffect(() => {
    const userData = StorageManager.getUser();
    if (!userData) {
      setLocation('/');
      return;
    }
    
    setUser(userData);
    setRounds(StorageManager.getRounds());
  }, [setLocation]);

  if (!user) return null;

  const userRounds = rounds.filter(r => r.players.some(p => p.id === user.id));
  const last5Rounds = userRounds.slice(-5);
  const last10Rounds = userRounds.slice(-10);

  // Performance calculations
  const avgScore = last10Rounds.length > 0 ? 
    last10Rounds.reduce((sum, round) => {
      const userPlayer = round.players.find(p => p.id === user.id);
      return sum + (userPlayer?.netTotal || 72);
    }, 0) / last10Rounds.length : 72;

  const scoreImprovement = last10Rounds.length >= 5 ? 
    (last5Rounds.reduce((sum, round) => {
      const userPlayer = round.players.find(p => p.id === user.id);
      return sum + (userPlayer?.netTotal || 72);
    }, 0) / last5Rounds.length) - avgScore : 0;

  const winRate = userRounds.length > 0 ? 
    (userRounds.filter(round => {
      const userPlayer = round.players.find(p => p.id === user.id);
      return (userPlayer?.moneyBalance || 0) > 0;
    }).length / userRounds.length) * 100 : 0;

  const totalEarnings = userRounds.reduce((sum, round) => {
    const userPlayer = round.players.find(p => p.id === user.id);
    return sum + (userPlayer?.moneyBalance || 0);
  }, 0);

  const bestRound = userRounds.reduce((best, round) => {
    const userPlayer = round.players.find(p => p.id === user.id);
    const score = userPlayer?.netTotal || 100;
    if (!best || score < (best.players.find(p => p.id === user.id)?.netTotal || 100)) {
      return round;
    }
    return best;
  }, null as Round | null);

  const worstRound = userRounds.reduce((worst, round) => {
    const userPlayer = round.players.find(p => p.id === user.id);
    const score = userPlayer?.netTotal || 0;
    if (!worst || score > (worst.players.find(p => p.id === user.id)?.netTotal || 0)) {
      return round;
    }
    return worst;
  }, null as Round | null);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface px-6 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="text-white hover:bg-gray-700 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Análisis de Rendimiento</h1>
            <p className="text-sm text-gray-400">Estadísticas detalladas de tu juego</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Performance Summary */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Resumen de Rendimiento</h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-2">Score Promedio (Últimas 10)</h3>
                    <div className="text-3xl font-bold text-white">{avgScore.toFixed(1)}</div>
                    <div className="flex items-center mt-2">
                      {scoreImprovement < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-300 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-300 mr-1" />
                      )}
                      <span className={`text-sm ${scoreImprovement < 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {Math.abs(scoreImprovement).toFixed(1)} vs últimas 5
                      </span>
                    </div>
                  </div>
                  <Target className="h-12 w-12 text-white opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Metrics */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Métricas Clave</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-golf-green">{winRate.toFixed(0)}%</div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">${totalEarnings.toFixed(0)}</div>
                    <div className="text-sm text-gray-400">Ganancias Totales</div>
                  </div>
                  <Zap className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{userRounds.length}</div>
                    <div className="text-sm text-gray-400">Rondas Jugadas</div>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{user.handicap}</div>
                    <div className="text-sm text-gray-400">Handicap Actual</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Best/Worst Performance */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Mejores y Peores Rondas</h2>
          <div className="space-y-4">
            {bestRound && (
              <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Mejor Ronda</h3>
                      <p className="text-green-100 text-sm">{bestRound.course}</p>
                      <p className="text-green-200 text-xs">{new Date(bestRound.createdAt).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {bestRound.players.find(p => p.id === user.id)?.netTotal || 0}
                      </div>
                      <div className="text-green-100 text-sm">Score Neto</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {worstRound && (
              <Card className="bg-gradient-to-r from-red-600 to-red-700 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Ronda a Mejorar</h3>
                      <p className="text-red-100 text-sm">{worstRound.course}</p>
                      <p className="text-red-200 text-xs">{new Date(worstRound.createdAt).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {worstRound.players.find(p => p.id === user.id)?.netTotal || 0}
                      </div>
                      <div className="text-red-100 text-sm">Score Neto</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Trend */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Tendencia Reciente</h2>
          <Card className="bg-dark-surface border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {last5Rounds.slice().reverse().map((round, index) => {
                  const userPlayer = round.players.find(p => p.id === user.id);
                  const score = userPlayer?.netTotal || 72;
                  const earnings = userPlayer?.moneyBalance || 0;
                  const par = 72;
                  const scoreToPar = score - par;
                  
                  return (
                    <div key={round.id} className="flex items-center justify-between p-4 bg-dark-card rounded-xl border border-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-golf-blue to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">{5 - index}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{round.course}</p>
                          <p className="text-gray-400 text-xs">{new Date(round.createdAt).toLocaleDateString('es-ES')}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{round.players.length} jugadores</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{round.holes} hoyos</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{score}</div>
                        <div className={`text-sm font-medium ${
                          scoreToPar === 0 ? 'text-blue-400' : 
                          scoreToPar < 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {scoreToPar === 0 ? 'E' : (scoreToPar > 0 ? '+' : '')}{scoreToPar}
                        </div>
                        <div className={`text-sm ${earnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {earnings >= 0 ? '+' : ''}${earnings.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Estadísticas Detalladas</h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-white font-medium mb-4">Análisis de Handicap</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Handicap Actual</span>
                    <span className="text-white font-bold">{user.handicap}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Score Promedio (Últimas 10)</span>
                    <span className="text-white font-bold">{avgScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Diferencial Promedio</span>
                    <span className={`font-bold ${(avgScore - 72) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(avgScore - 72) > 0 ? '+' : ''}{(avgScore - 72).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-surface border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-white font-medium mb-4">Rendimiento Financiero</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Ganancias Totales</span>
                    <span className={`font-bold ${totalEarnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Promedio por Ronda</span>
                    <span className={`font-bold ${totalEarnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${userRounds.length > 0 ? (totalEarnings / userRounds.length).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rondas Ganadas</span>
                    <span className="text-white font-bold">
                      {userRounds.filter(round => {
                        const userPlayer = round.players.find(p => p.id === user.id);
                        return (userPlayer?.moneyBalance || 0) > 0;
                      }).length} / {userRounds.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}