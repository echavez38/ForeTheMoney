import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Target, Zap, Award } from 'lucide-react';

interface ModernScoreInputProps {
  selectedScore: number | null;
  onScoreSelect: (score: number) => void;
  par: number;
  playerName: string;
  handicap: number;
  strokeIndex: number;
  maxScore?: number;
}

export function ModernScoreInput({ 
  selectedScore, 
  onScoreSelect, 
  par, 
  playerName, 
  handicap,
  strokeIndex,
  maxScore = 8 
}: ModernScoreInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate expected score based on handicap
  const strokesReceived = handicap <= 0 ? 0 : 
    handicap <= 18 ? (strokeIndex <= handicap ? 1 : 0) :
    strokeIndex <= (handicap - 18) ? 2 : 1;
  
  const expectedScore = par + strokesReceived;
  
  // Score relative to par
  const getScoreRelation = (score: number) => {
    const diff = score - par;
    if (diff <= -2) return { text: 'Eagle', color: 'bg-yellow-500', icon: Award };
    if (diff === -1) return { text: 'Birdie', color: 'bg-green-500', icon: Target };
    if (diff === 0) return { text: 'Par', color: 'bg-blue-500', icon: Zap };
    if (diff === 1) return { text: 'Bogey', color: 'bg-orange-500', icon: null };
    if (diff === 2) return { text: 'Double', color: 'bg-red-500', icon: null };
    return { text: '+' + diff, color: 'bg-red-600', icon: null };
  };

  // Quick score buttons (common scores around par)
  const quickScores = [par - 1, par, par + 1, par + 2].filter(s => s >= 1 && s <= maxScore);
  
  // All available scores
  const allScores = Array.from({ length: maxScore }, (_, i) => i + 1);

  const handleScoreSelect = (score: number) => {
    onScoreSelect(score);
    setIsExpanded(false);
  };

  const adjustScore = (delta: number) => {
    const newScore = Math.max(1, Math.min(maxScore, (selectedScore || par) + delta));
    onScoreSelect(newScore);
  };

  return (
    <div className="space-y-3">
      {/* Player Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{playerName}</h3>
          <p className="text-sm text-gray-400">Par {par} • HCP {handicap}</p>
        </div>
        {selectedScore && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{selectedScore}</div>
            <Badge className={`${getScoreRelation(selectedScore).color} text-white text-xs`}>
              {getScoreRelation(selectedScore).text}
            </Badge>
          </div>
        )}
      </div>

      {/* Current Score Display with +/- Controls */}
      {selectedScore && (
        <div className="flex items-center justify-center space-x-4 bg-dark-card rounded-lg p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustScore(-1)}
            disabled={selectedScore <= 1}
            className="h-10 w-10 rounded-full border-gray-600 text-white hover:bg-red-500"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{selectedScore}</div>
            <div className="text-sm text-gray-400">
              {selectedScore === expectedScore ? 'Expected' : 
               selectedScore < expectedScore ? `${expectedScore - selectedScore} better` :
               `${selectedScore - expectedScore} over`}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustScore(+1)}
            disabled={selectedScore >= maxScore}
            className="h-10 w-10 rounded-full border-gray-600 text-white hover:bg-green-500"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Quick Score Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {quickScores.map(score => {
          const relation = getScoreRelation(score);
          const Icon = relation.icon;
          
          return (
            <Button
              key={score}
              onClick={() => handleScoreSelect(score)}
              variant={selectedScore === score ? "default" : "outline"}
              className={`h-12 flex flex-col items-center justify-center space-y-1 ${
                selectedScore === score 
                  ? 'bg-golf-green text-white' 
                  : 'bg-dark-card border-gray-600 text-white hover:bg-golf-green/20'
              }`}
            >
              <div className="flex items-center space-x-1">
                {Icon && <Icon className="h-3 w-3" />}
                <span className="font-bold">{score}</span>
              </div>
              <span className="text-xs opacity-75">{relation.text}</span>
            </Button>
          );
        })}
      </div>

      {/* Expand for More Scores */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-gray-400 hover:text-white"
      >
        {isExpanded ? 'Mostrar menos' : 'Más opciones...'}
      </Button>

      {/* Expanded Score Grid */}
      {isExpanded && (
        <div className="grid grid-cols-6 gap-2">
          {allScores.map(score => (
            <Button
              key={score}
              onClick={() => handleScoreSelect(score)}
              variant={selectedScore === score ? "default" : "outline"}
              className={`aspect-square ${
                selectedScore === score 
                  ? 'bg-golf-green text-white' 
                  : 'bg-dark-card border-gray-600 text-white hover:bg-golf-green/20'
              }`}
            >
              {score === maxScore ? `${score}+` : score}
            </Button>
          ))}
        </div>
      )}

      {/* Expected Score Hint */}
      {!selectedScore && (
        <div className="text-center p-3 bg-dark-surface rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400">
            Tu score esperado: <span className="text-white font-semibold">{expectedScore}</span>
            {strokesReceived > 0 && (
              <span className="text-green-400"> (+{strokesReceived} stroke{strokesReceived > 1 ? 's' : ''})</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}