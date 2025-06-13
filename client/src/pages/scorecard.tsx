import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ModernScorecard } from '@/components/modern-scorecard';
import { StorageManager } from '@/lib/storage';
import { BettingCalculator } from '@/lib/betting';
import { Round, DEFAULT_HOLES, HoleInfo } from '@/lib/types';
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
    const holeStrokeIndex = currentHoleInfo.strokeIndex[round.selectedTees.color];
    const netScore = BettingCalculator.calculateNetScore(
      grossScore,
      player.handicap,
      holeStrokeIndex
    );

    // Update or add score for current hole
    const existingScoreIndex = player.scores.findIndex(s => s.holeNumber === round.currentHole);
    const newScore = {
      holeNumber: round.currentHole,
      grossScore,
      netScore,
      par: currentHoleInfo.par,
      strokeIndex: holeStrokeIndex,
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

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!round) return;

    if (direction === 'next') {
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
    } else if (direction === 'prev') {
      if (round.currentHole <= 1) return;
      
      const updatedRound = { ...round, currentHole: round.currentHole - 1 };
      setRound(updatedRound);
      StorageManager.setCurrentRound(updatedRound);
      updateCurrentHoleInfo(updatedRound);
    }
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

  return (
    <ModernScorecard
      players={round.players}
      currentHole={round.currentHole}
      holeInfo={currentHoleInfo}
      selectedTees={round.selectedTees}
      onScoreChange={handleScoreChange}
      onNavigate={handleNavigation}
      canGoNext={true}
      canGoPrev={round.currentHole > 1}
    />
  );
}
