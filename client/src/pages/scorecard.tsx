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
    const holeStrokeIndex = currentHoleInfo.strokeIndex[player.selectedTee.color];
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

    // Calculate final money balances using the corrected betting system
    const frontNineResults = BettingCalculator.calculateSegmentBetting(round, 'frontNine');
    const backNineResults = BettingCalculator.calculateSegmentBetting(round, 'backNine');
    const totalResults = BettingCalculator.calculateSegmentBetting(round, 'total');
    
    // Combine all betting results
    const finalBalances: Record<string, number> = {};
    round.players.forEach(player => {
      finalBalances[player.id] = 
        (frontNineResults.playerBalances[player.id] || 0) + 
        (backNineResults.playerBalances[player.id] || 0) + 
        (totalResults.playerBalances[player.id] || 0);
    });
    
    const finalRound = {
      ...round,
      completed: true,
      players: round.players.map(player => ({
        ...player,
        moneyBalance: finalBalances[player.id] || 0,
      })),
    };

    StorageManager.saveRound(finalRound);
    StorageManager.setCurrentRound(null);
    
    toast({
      title: "¡Ronda completada!",
      description: "Ver resultados finales",
    });
    
    setLocation('/round-debrief');
  };

  const handleViewScorecard = () => {
    setLocation('/golf-scorecard');
  };

  const handleAbandonRound = () => {
    if (!round) return;

    // Clear the current round from storage
    StorageManager.setCurrentRound(null);
    
    toast({
      title: "Ronda abandonada",
      description: "Has salido de la ronda actual",
    });
    
    setLocation('/dashboard');
  };

  const handleOyesesWinnerChange = (winnerId: string) => {
    if (!round || !currentHoleInfo) return;

    const updatedRound = {
      ...round,
      players: round.players.map(player => ({
        ...player,
        scores: player.scores.map(score => {
          if (score.holeNumber === round.currentHole) {
            // Clear previous winner and set new winner
            return {
              ...score,
              oyesesWinner: player.id === winnerId ? winnerId : undefined
            };
          }
          return score;
        })
      }))
    };

    setRound(updatedRound);
    StorageManager.setCurrentRound(updatedRound);
    
    const winnerName = round.players.find(p => p.id === winnerId)?.name;
    toast({
      title: "Oyeses registrado",
      description: `${winnerName} ganó closest to pin`,
    });
  };

  const getCurrentHoleBetting = () => {
    if (!round || !currentHoleInfo) return [];

    return BettingCalculator.calculateHoleBetting(
      round.players,
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
      onScoreChange={handleScoreChange}
      onNavigate={handleNavigation}
      canGoNext={true}
      canGoPrev={round.currentHole > 1}
      onViewScorecard={handleViewScorecard}
      onAbandonRound={handleAbandonRound}
      onOyesesWinnerChange={handleOyesesWinnerChange}
      gameFormats={round.gameFormats}
      bettingOptions={{
        oyeses: round.bettingOptions.oyeses,
        unitPerHole: round.bettingOptions.unitPerHole
      }}
    />
  );
}
