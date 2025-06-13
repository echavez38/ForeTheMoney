import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StorageManager } from '@/lib/storage';
import { Round } from '@/lib/types';
import { Home, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Results() {
  const [, setLocation] = useLocation();
  const [round, setRound] = useState<Round | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Try to get the most recent completed round
    const rounds = StorageManager.getRounds();
    const completedRounds = rounds.filter(r => r.completed);
    const latestRound = completedRounds.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    if (!latestRound) {
      setLocation('/dashboard');
      return;
    }

    setRound(latestRound);
  }, [setLocation]);

  const handleSaveRound = () => {
    if (!round) return;
    
    // Round is already saved, just show confirmation
    toast({
      title: "Ronda guardada",
      description: "Los resultados han sido guardados correctamente",
    });
  };

  const handleNewRound = () => {
    setLocation('/create-round');
  };

  const handleGoHome = () => {
    setLocation('/dashboard');
  };

  if (!round) return null;

  // Calculate betting breakdown
  const bettingBreakdown = {
    oyeses: { winner: '', amount: 0, holes: 0 },
    skins: { winner: '', amount: 0, holes: 0 },
  };

  // Find the player with highest money balance for each betting type
  const sortedByBalance = [...round.players].sort((a, b) => b.moneyBalance - a.moneyBalance);
  if (sortedByBalance.length > 0 && sortedByBalance[0].moneyBalance > 0) {
    bettingBreakdown.oyeses.winner = sortedByBalance[0].name;
    bettingBreakdown.oyeses.amount = Math.abs(sortedByBalance[0].moneyBalance);
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-6">
      {/* Header */}
      <div className="bg-dark-surface px-6 py-4 text-center">
        <h1 className="text-2xl font-bold text-white">Resultados Finales</h1>
        <p className="text-gray-400">
          {round.course} • {round.holes} hoyos • {new Date(round.createdAt).toLocaleDateString('es-ES')}
        </p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Money Summary */}
        <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Balance de Dinero</h2>
          <div className={`grid gap-6 ${
            round.players.length <= 2 ? 'grid-cols-2' : 
            round.players.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {round.players.map((player) => (
              <div key={player.id} className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-white text-sm">
                  {player.name.length > 8 ? `${player.name.substring(0, 8)}...` : player.name}
                </p>
                <p className={`text-xl font-bold ${
                  player.moneyBalance >= 0 ? 'text-white' : 'text-red-200'
                }`}>
                  {player.moneyBalance >= 0 ? '+' : ''}€{player.moneyBalance.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Scorecard */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Tarjeta de Puntuación</h3>
            
            {round.players.map((player) => {
              const totalToPar = player.grossTotal - (round.holes === 18 ? 72 : 36);
              
              return (
                <div key={player.id} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-golf-green rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-white">{player.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Handicap: {player.handicap}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 p-4 bg-dark-card rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{player.grossTotal}</p>
                      <p className="text-sm text-gray-400">Golpes Brutos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-golf-green">{player.netTotal}</p>
                      <p className="text-sm text-gray-400">Golpes Netos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {totalToPar > 0 ? '+' : ''}{totalToPar}
                      </p>
                      <p className="text-sm text-gray-400">Total al Par</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Betting Breakdown */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Desglose de Apuestas</h3>
            
            <div className="space-y-4">
              {round.bettingOptions.oyeses && (
                <div className="p-4 bg-dark-card rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center text-white">
                      <i className="fas fa-crown text-yellow-500 mr-2"></i>
                      Oyeses
                    </h4>
                    <span className="text-golf-green font-semibold">
                      €{(round.bettingOptions.unitPerHole * round.holes).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Unidad por hoyo: €{round.bettingOptions.unitPerHole}</span>
                      <span>{round.holes} hoyos</span>
                    </div>
                  </div>
                </div>
              )}

              {round.bettingOptions.skins && (
                <div className="p-4 bg-dark-card rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center text-white">
                      <i className="fas fa-fire text-orange-500 mr-2"></i>
                      Skins
                    </h4>
                    <span className="text-golf-green font-semibold">Variable</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Basado en golpes únicos ganadores por hoyo</p>
                  </div>
                </div>
              )}

              {!round.bettingOptions.oyeses && !round.bettingOptions.skins && (
                <div className="text-center text-gray-400 py-4">
                  <p>No se configuraron apuestas para esta ronda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleSaveRound}
            className="w-full bg-golf-green text-white py-4 rounded-xl font-semibold hover:bg-golf-light transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            Confirmar Guardado
          </Button>
          <Button
            onClick={handleNewRound}
            variant="outline"
            className="w-full bg-dark-surface border-gray-600 text-white py-4 rounded-xl font-semibold hover:bg-dark-card transition-colors"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Nueva Ronda
          </Button>
          <Button
            onClick={handleGoHome}
            variant="ghost"
            className="w-full text-gray-400 py-3 font-semibold hover:text-white"
          >
            <Home className="h-5 w-5 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
