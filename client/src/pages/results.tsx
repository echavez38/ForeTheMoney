import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StorageManager } from '@/lib/storage';
import { Round, DEFAULT_HOLES } from '@/lib/types';
import { BettingCalculator } from '@/lib/betting';
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

  // Add backward compatibility for rounds without strokePlayBets
  const roundWithBets = {
    ...round,
    bettingOptions: {
      ...round.bettingOptions,
      strokePlayBets: round.bettingOptions.strokePlayBets || {
        frontNine: 10.0,
        backNine: 10.0,
        total: 20.0,
      },
      matchPlayBets: round.bettingOptions.matchPlayBets || {
        frontNine: 15.0,
        backNine: 15.0,
        total: 30.0,
      }
    }
  };

  // Calculate segment betting results
  const segmentResults = {
    frontNine: roundWithBets.bettingOptions.segments.frontNine ? 
      BettingCalculator.calculateSegmentBetting(roundWithBets, DEFAULT_HOLES, 'frontNine') : null,
    backNine: roundWithBets.bettingOptions.segments.backNine ? 
      BettingCalculator.calculateSegmentBetting(roundWithBets, DEFAULT_HOLES, 'backNine') : null,
    total: roundWithBets.bettingOptions.segments.total ? 
      BettingCalculator.calculateSegmentBetting(roundWithBets, DEFAULT_HOLES, 'total') : null,
  };

  const getSegmentWinner = (balances: Record<string, number>) => {
    const winner = Object.entries(balances).reduce((max, [id, amount]) => 
      amount > max[1] ? [id, amount] : max, ['', 0]);
    return winner[1] > 0 ? round.players.find(p => p.id === winner[0])?.name || '' : '';
  };

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

        {/* Game Format & Betting Summary */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Resumen de Apuestas</h3>
              <div className="flex gap-2">
                {round.gameFormats.strokePlay && (
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-sm text-white">Stroke Play</span>
                )}
                {round.gameFormats.matchPlay && (
                  <span className="px-3 py-1 bg-green-600 rounded-full text-sm text-white">Match Play</span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Front Nine Results */}
              {segmentResults.frontNine && (
                <div className="p-4 bg-dark-card rounded-lg">
                  <h4 className="font-medium text-white mb-3">Front Nine (Hoyos 1-9)</h4>
                  
                  {/* Stroke Play Results */}
                  {segmentResults.frontNine.strokePlay && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-400 font-medium">Stroke Play</span>
                        <span className="text-sm text-gray-400">€{segmentResults.frontNine.strokePlay.totalPot.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(segmentResults.frontNine.strokePlay.playerBalances).map(([playerId, amount]) => {
                          const player = round.players.find(p => p.id === playerId);
                          return player ? (
                            <div key={`stroke-${playerId}`} className="flex items-center justify-between">
                              <span className="text-white text-sm">{player.name}</span>
                              <span className={`text-sm font-medium ${
                                amount > 0 ? 'text-green-400' : amount < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {amount > 0 ? '+' : ''}€{amount.toFixed(2)}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Match Play Results */}
                  {segmentResults.frontNine.matchPlay && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-400 font-medium">Match Play</span>
                        <span className="text-sm text-gray-400">€{segmentResults.frontNine.matchPlay.totalPot.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(segmentResults.frontNine.matchPlay.playerBalances).map(([playerId, amount]) => {
                          const player = round.players.find(p => p.id === playerId);
                          return player ? (
                            <div key={`match-${playerId}`} className="flex items-center justify-between">
                              <span className="text-white text-sm">{player.name}</span>
                              <span className={`text-sm font-medium ${
                                amount > 0 ? 'text-green-400' : amount < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {amount > 0 ? '+' : ''}€{amount.toFixed(2)}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Back Nine Results */}
              {segmentResults.backNine && (
                <div className="p-4 bg-dark-card rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Back Nine (Hoyos 10-18)</h4>
                    <span className="text-sm text-gray-400">€{segmentResults.backNine.totalPot.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(segmentResults.backNine.playerBalances).map(([playerId, amount]) => {
                      const player = round.players.find(p => p.id === playerId);
                      return player ? (
                        <div key={playerId} className="flex items-center justify-between">
                          <span className="text-white text-sm">{player.name}</span>
                          <span className={`text-sm font-medium ${
                            amount > 0 ? 'text-green-400' : amount < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {amount > 0 ? '+' : ''}€{amount.toFixed(2)}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Total Results */}
              {segmentResults.total && (
                <div className="p-4 bg-dark-card rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Total (18 Hoyos)</h4>
                    <span className="text-sm text-gray-400">€{segmentResults.total.totalPot.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(segmentResults.total.playerBalances).map(([playerId, amount]) => {
                      const player = round.players.find(p => p.id === playerId);
                      return player ? (
                        <div key={playerId} className="flex items-center justify-between">
                          <span className="text-white text-sm">{player.name}</span>
                          <span className={`text-sm font-medium ${
                            amount > 0 ? 'text-green-400' : amount < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {amount > 0 ? '+' : ''}€{amount.toFixed(2)}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Individual Betting Options */}
              <div className="pt-4 border-t border-gray-600">
                <h4 className="font-medium text-white mb-3">Opciones Activas</h4>
                <div className="flex flex-wrap gap-2">
                  {round.bettingOptions.skins && (
                    <span className="px-3 py-1 bg-blue-600 rounded-full text-xs text-white">Skins</span>
                  )}
                  {round.bettingOptions.oyeses && (
                    <span className="px-3 py-1 bg-green-600 rounded-full text-xs text-white">Oyeses</span>
                  )}
                  {round.bettingOptions.foursomes && (
                    <span className="px-3 py-1 bg-purple-600 rounded-full text-xs text-white">Foursomes</span>
                  )}
                  <span className="px-3 py-1 bg-gray-600 rounded-full text-xs text-white">
                    €{round.bettingOptions.unitPerHole}/hoyo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tee Information */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Marcas de Salida Utilizadas</h3>
            
            <div className="space-y-3">
              {round.players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-golf-green rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-white">{player.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      player.selectedTee.color === 'negras' ? 'bg-black border border-gray-400' :
                      player.selectedTee.color === 'azules' ? 'bg-blue-500' :
                      player.selectedTee.color === 'blancas' ? 'bg-white border border-gray-400' :
                      player.selectedTee.color === 'blancas_f' ? 'bg-white border-2 border-pink-400' :
                      player.selectedTee.color === 'doradas' ? 'bg-yellow-400' :
                      player.selectedTee.color === 'plateadas' ? 'bg-gray-400' :
                      'bg-red-500'
                    }`} />
                    <span className="text-sm text-gray-300">{player.selectedTee.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex-1 border-gray-600 text-white hover:bg-gray-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Inicio
          </Button>
          <Button
            onClick={handleNewRound}
            className="flex-1 bg-golf-green text-white hover:bg-golf-light"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Nueva Ronda
          </Button>
        </div>
      </div>
    </div>
  );
}