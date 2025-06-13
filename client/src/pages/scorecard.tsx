import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayerCard } from '@/components/player-card';
import { StorageManager } from '@/lib/storage';
import { BettingCalculator } from '@/lib/betting';
import { Round, DEFAULT_HOLES, HoleInfo } from '@/lib/types';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Scorecard() {
  const [, setLocation] = useLocation();
  const [round, setRound] = useState<Round | null>(null);
  const [currentHoleInfo, setCurrentHoleInfo] = useState<HoleInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const currentRound = StorageManager.getCurrentRound();
    if (!currentRound) {
      setLocation('/dashboard');
      return;
    }
    
    setRound(currentRound);
    updateCurrentHoleInfo(currentRound);
  }, [setLocation]);

  const updateCurrentHoleInfo = (roundData: Round) => {
    const holes = DEFAULT_HOLES.slice(0, roundData.holes);
    const holeInfo = holes[roundData.currentHole - 1];
    setCurrentHoleInfo(holeInfo);
  };

  const handleScoreChange = (playerId: string, grossScore: number) => {
    if (!round || !currentHoleInfo) return;

    const updatedRound = { ...round };
    const playerIndex = updatedRound.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) return;

    const player = updatedRound.players[playerIndex];
    const netScore = BettingCalculator.calculateNetScore(
      grossScore,
      player.handicap,
      currentHoleInfo.strokeIndex
    );

    // Update or add score for current hole
    const existingScoreIndex = player.scores.findIndex(s => s.holeNumber === round.currentHole);
    const newScore = {
      holeNumber: round.currentHole,
      grossScore,
      netScore,
      par: currentHoleInfo.par,
      strokeIndex: currentHoleInfo.strokeIndex,
    };

    if (existingScoreIndex >= 0) {
      player.scores[existingScoreIndex] = newScore;
    } else {
      player.scores.push(newScore);
    }

    // Recalculate totals
    player.grossTotal = player.scores.reduce((sum, score) => sum + score.grossScore, 0);
    player.netTotal = player.scores.reduce((sum, score) => sum + score.netScore, 0);

    setRound(updatedRound);
    StorageManager.setCurrentRound(updatedRound);
  };

  const nextHole = () => {
    if (!round) return;

    // Check if all players have scores for current hole
    const allPlayersHaveScores = round.players.every(player => 
      player.scores.some(score => score.holeNumber === round.currentHole)
    );

    if (!allPlayersHaveScores) {
      toast({
        title: "Scores incompletos",
        description: "Todos los jugadores deben tener puntuación para este hoyo",
        variant: "destructive",
      });
      return;
    }

    if (round.currentHole < round.holes) {
      const updatedRound = { ...round, currentHole: round.currentHole + 1 };
      setRound(updatedRound);
      StorageManager.setCurrentRound(updatedRound);
      updateCurrentHoleInfo(updatedRound);
    } else {
      // Round completed - calculate final betting
      finishRound();
    }
  };

  const previousHole = () => {
    if (!round || round.currentHole <= 1) return;

    const updatedRound = { ...round, currentHole: round.currentHole - 1 };
    setRound(updatedRound);
    StorageManager.setCurrentRound(updatedRound);
    updateCurrentHoleInfo(updatedRound);
  };

  const finishRound = () => {
    if (!round) return;

    // Calculate final money balances
    const holes = DEFAULT_HOLES.slice(0, round.holes);
    const balances = BettingCalculator.calculateTotalBetting(round, holes);
    
    const finalRound = {
      ...round,
      completed: true,
      players: round.players.map(player => ({
        ...player,
        moneyBalance: balances.get(player.name) || 0,
      })),
    };

    StorageManager.saveRound(finalRound);
    StorageManager.setCurrentRound(null);
    
    toast({
      title: "¡Ronda completada!",
      description: "Ver resultados finales",
    });
    
    setLocation('/results');
  };

  const getCurrentHoleBetting = () => {
    if (!round || !currentHoleInfo) return [];

    return BettingCalculator.calculateHoleBetting(
      round.players,
      round.currentHole,
      currentHoleInfo,
      round.bettingOptions
    );
  };

  if (!round || !currentHoleInfo) return null;

  const bettingResults = getCurrentHoleBetting();

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Header */}
      <div className="bg-dark-surface px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/create-round')}
              className="p-2 rounded-lg hover:bg-dark-card text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-white">{round.course}</h1>
              <p className="text-sm text-gray-400">
                Hoyo {round.currentHole} de {round.holes}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">
              Par <span className="text-white font-semibold">{currentHoleInfo.par}</span>
            </p>
            <p className="text-xs text-gray-400">Handicap {currentHoleInfo.strokeIndex}</p>
          </div>
        </div>
      </div>

      {/* Hole Info */}
      <div className="bg-golf-green bg-opacity-20 px-4 py-3 border-b border-golf-green border-opacity-30">
        <div className="flex items-center justify-between text-sm text-white">
          <span>Metros: <span className="font-semibold">{currentHoleInfo.distance}m</span></span>
          <span>Stroke Index: <span className="font-semibold">#{currentHoleInfo.strokeIndex}</span></span>
        </div>
      </div>

      {/* Players Scorecard */}
      <div className="px-4 py-4 space-y-3">
        {round.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            currentHole={round.currentHole}
            onScoreChange={handleScoreChange}
          />
        ))}
      </div>

      {/* Betting Summary */}
      <div className="mx-4 mb-4">
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center text-white">
              <i className="fas fa-coins text-golf-green mr-2"></i>
              Apuestas del Hoyo
            </h3>
            <div className="space-y-2 text-sm">
              {bettingResults.map((result, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-300 capitalize">{result.type}:</span>
                  <span className={result.winner ? "text-golf-green font-semibold" : "text-gray-400"}>
                    {result.tied ? 'Empate' : result.winner ? `${result.winner} (+€${result.amount.toFixed(2)})` : 'Sin ganador'}
                  </span>
                </div>
              ))}
              {bettingResults.length === 0 && (
                <p className="text-gray-400">Completa las puntuaciones para ver las apuestas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-6 left-4 right-4 flex space-x-3">
        <Button
          onClick={previousHole}
          disabled={round.currentHole <= 1}
          variant="outline"
          className="flex-1 bg-dark-surface border-gray-600 text-white py-3 hover:bg-dark-card transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={nextHole}
          className="flex-1 bg-golf-green text-white py-3 hover:bg-golf-light transition-colors"
        >
          {round.currentHole >= round.holes ? 'Finalizar' : 'Siguiente'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
