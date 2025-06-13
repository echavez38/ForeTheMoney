import React from 'react';
import { RoundPlayer } from '../lib/types';
import { ScoreInput } from './score-input';

interface PlayerCardProps {
  player: RoundPlayer;
  currentHole: number;
  onScoreChange: (playerId: string, score: number) => void;
  showNetScore?: boolean;
}

export function PlayerCard({ 
  player, 
  currentHole, 
  onScoreChange, 
  showNetScore = true 
}: PlayerCardProps) {
  const currentScore = player.scores.find(s => s.holeNumber === currentHole);
  const totalScore = player.grossTotal > 0 ? 
    (player.grossTotal > 72 ? `+${player.grossTotal - 72}` : `${player.grossTotal - 72}`) : 
    'E';

  return (
    <div className="bg-dark-surface rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-golf-green rounded-full flex items-center justify-center">
            <span className="font-semibold text-white">
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white">{player.name}</p>
            <p className="text-sm text-gray-400">Handicap: {player.handicap}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{totalScore}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>

      <ScoreInput
        selectedScore={currentScore?.grossScore || null}
        onScoreSelect={(score) => onScoreChange(player.id, score)}
      />

      {showNetScore && currentScore && (
        <div className="mt-3 p-3 bg-dark-card rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Golpes Brutos:</span>
            <span className="font-semibold text-white">{currentScore.grossScore}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Golpes Netos:</span>
            <span className="font-semibold text-golf-green">{currentScore.netScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}
