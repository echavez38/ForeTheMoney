import React from 'react';

interface ScoreInputProps {
  selectedScore: number | null;
  onScoreSelect: (score: number) => void;
  maxScore?: number;
}

export function ScoreInput({ selectedScore, onScoreSelect, maxScore = 8 }: ScoreInputProps) {
  const scores = Array.from({ length: maxScore }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-8 gap-2">
      {scores.map(score => (
        <button
          key={score}
          onClick={() => onScoreSelect(score)}
          className={`aspect-square rounded-lg flex items-center justify-center font-semibold transition-colors ${
            selectedScore === score
              ? 'bg-golf-green text-white'
              : 'bg-dark-card text-white hover:bg-golf-green hover:text-white'
          }`}
        >
          {score === maxScore ? `${score}+` : score}
        </button>
      ))}
    </div>
  );
}
