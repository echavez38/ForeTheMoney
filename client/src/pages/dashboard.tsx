import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StorageManager } from '@/lib/storage';
import { User, Round } from '@/lib/types';
import { Plus, Users, History, BarChart3, Settings, LogOut } from 'lucide-react';

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
        </div>

        {/* Recent Rounds */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6 text-white">Rondas Recientes</h3>
          
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
                                {winnings >= 0 ? '+' : ''}€{winnings.toFixed(2)}
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
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  stats.totalWinnings >= 0 ? 'text-golf-green' : 'text-red-400'
                }`}>
                  {stats.totalWinnings >= 0 ? '+' : ''}€{stats.totalWinnings.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Ganancias Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.roundsPlayed}</p>
                <p className="text-sm text-gray-400">Rondas Jugadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-gray-700">
        <div className="flex">
          <button className="flex-1 py-4 text-center border-b-2 border-golf-green">
            <i className="fas fa-home text-golf-green mb-1 block"></i>
            <p className="text-xs text-golf-green">Inicio</p>
          </button>
          <button className="flex-1 py-4 text-center">
            <History className="h-4 w-4 text-gray-400 mb-1 mx-auto" />
            <p className="text-xs text-gray-400">Historial</p>
          </button>
          <button className="flex-1 py-4 text-center">
            <BarChart3 className="h-4 w-4 text-gray-400 mb-1 mx-auto" />
            <p className="text-xs text-gray-400">Stats</p>
          </button>
          <button className="flex-1 py-4 text-center">
            <Settings className="h-4 w-4 text-gray-400 mb-1 mx-auto" />
            <p className="text-xs text-gray-400">Config</p>
          </button>
        </div>
      </div>
    </div>
  );
}
