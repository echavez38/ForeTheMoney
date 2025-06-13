import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { GolfScorecard } from '@/components/golf-scorecard';
import { StorageManager } from '@/lib/storage';
import { Round } from '@/lib/types';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function GolfScorecardPage() {
  const [, setLocation] = useLocation();
  const [round, setRound] = useState<Round | null>(null);

  useEffect(() => {
    const currentRound = StorageManager.getCurrentRound();
    if (!currentRound) {
      setLocation('/dashboard');
      return;
    }
    setRound(currentRound);
  }, [setLocation]);

  const handleBackToScorecard = () => {
    setLocation('/scorecard');
  };

  const handleBackToDashboard = () => {
    setLocation('/dashboard');
  };

  if (!round) return null;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-dark-surface border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToScorecard}
            className="text-white hover:text-golf-green"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Juego
          </Button>
          <h1 className="text-lg font-semibold text-white">Tarjeta de Golf</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="text-white hover:text-golf-green"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scorecard Component */}
      <GolfScorecard round={round} />
    </div>
  );
}