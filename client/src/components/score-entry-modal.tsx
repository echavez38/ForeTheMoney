import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Minus, Plus, Target, Zap, Award, TrendingUp, TrendingDown, X } from 'lucide-react';
import { RoundPlayer, HoleInfo } from '@/lib/types';

interface ScoreEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: RoundPlayer;
  holeInfo: HoleInfo;
  onScoreSubmit: (score: number) => void;
  currentScore?: number;
}

export function ScoreEntryModal({ 
  isOpen, 
  onClose, 
  player, 
  holeInfo, 
  onScoreSubmit,
  currentScore 
}: ScoreEntryModalProps) {
  const [selectedScore, setSelectedScore] = useState<number>(currentScore || holeInfo.par);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedScore(currentScore || holeInfo.par);
    }
  }, [isOpen, currentScore, holeInfo.par]);

  // Calculate expected score based on handicap
  const strokesReceived = player.handicap <= 0 ? 0 : 
    player.handicap <= 18 ? (holeInfo.strokeIndex[player.selectedTee.color] <= player.handicap ? 1 : 0) :
    holeInfo.strokeIndex[player.selectedTee.color] <= (player.handicap - 18) ? 2 : 1;
  
  const expectedScore = holeInfo.par + strokesReceived;
  
  // Score analysis
  const getScoreAnalysis = (score: number) => {
    const toPar = score - holeInfo.par;
    const toExpected = score - expectedScore;
    
    let result = {
      name: '',
      color: '',
      icon: null as any,
      description: ''
    };

    if (toPar <= -3) {
      result = { name: 'Albatross', color: 'bg-purple-500', icon: Award, description: 'Increíble!' };
    } else if (toPar === -2) {
      result = { name: 'Eagle', color: 'bg-yellow-500', icon: Award, description: 'Excelente!' };
    } else if (toPar === -1) {
      result = { name: 'Birdie', color: 'bg-green-500', icon: Target, description: 'Muy bien!' };
    } else if (toPar === 0) {
      result = { name: 'Par', color: 'bg-blue-500', icon: Zap, description: 'Sólido' };
    } else if (toPar === 1) {
      result = { name: 'Bogey', color: 'bg-orange-500', icon: TrendingUp, description: 'No está mal' };
    } else if (toPar === 2) {
      result = { name: 'Double', color: 'bg-red-500', icon: TrendingDown, description: 'Siguiente hoyo' };
    } else {
      result = { name: `+${toPar}`, color: 'bg-red-600', icon: TrendingDown, description: 'Sigue intentando' };
    }

    result.description += toExpected === 0 ? ' (Como esperado)' :
                         toExpected < 0 ? ` (${Math.abs(toExpected)} mejor!)` :
                         ` (${toExpected} sobre esperado)`;

    return result;
  };

  const analysis = getScoreAnalysis(selectedScore);
  const Icon = analysis.icon;

  const adjustScore = (delta: number) => {
    setSelectedScore(prev => Math.max(1, Math.min(15, prev + delta)));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // Smooth animation
    onScoreSubmit(selectedScore);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto bg-dark-surface border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Hoyo {holeInfo.number}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Hole and Player Info */}
          <div className="flex items-center justify-between p-4 bg-dark-card rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{player.name}</h3>
              <p className="text-sm text-gray-400">
                Par {holeInfo.par} • HCP {player.handicap}
                {strokesReceived > 0 && (
                  <span className="text-green-400"> (+{strokesReceived})</span>
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Esperado</div>
              <div className="text-xl font-bold text-white">{expectedScore}</div>
            </div>
          </div>
        </DialogHeader>

        {/* Score Display */}
        <div className="space-y-6">
          {/* Current Score with Analysis */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-white">{selectedScore}</div>
            
            <Badge className={`${analysis.color} text-white text-lg px-4 py-2`}>
              <div className="flex items-center space-x-2">
                {Icon && <Icon className="h-5 w-5" />}
                <span>{analysis.name}</span>
              </div>
            </Badge>
            
            <p className="text-sm text-gray-400">{analysis.description}</p>
          </div>

          {/* +/- Controls */}
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => adjustScore(-1)}
              disabled={selectedScore <= 1}
              className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-30"
            >
              <Minus className="h-8 w-8" />
            </Button>
            
            <div className="text-center space-y-1">
              <div className="text-lg font-semibold text-white">
                {selectedScore === holeInfo.par ? 'Par' :
                 selectedScore < holeInfo.par ? `${holeInfo.par - selectedScore} bajo par` :
                 `${selectedScore - holeInfo.par} sobre par`}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => adjustScore(+1)}
              disabled={selectedScore >= 15}
              className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white disabled:opacity-30"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>

          {/* Quick Score Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 text-center">Acceso Rápido</h4>
            <div className="grid grid-cols-4 gap-3">
              {[holeInfo.par - 1, holeInfo.par, holeInfo.par + 1, holeInfo.par + 2].map(score => {
                if (score < 1) return null;
                const quickAnalysis = getScoreAnalysis(score);
                const QuickIcon = quickAnalysis.icon;
                
                return (
                  <Button
                    key={score}
                    onClick={() => setSelectedScore(score)}
                    variant={selectedScore === score ? "default" : "outline"}
                    className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                      selectedScore === score 
                        ? 'bg-golf-green text-white border-golf-green' 
                        : 'bg-dark-card border-gray-600 text-white hover:bg-golf-green/20'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {QuickIcon && <QuickIcon className="h-3 w-3" />}
                      <span className="font-bold text-lg">{score}</span>
                    </div>
                    <span className="text-xs opacity-75">{quickAnalysis.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Number Pad */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 text-center">Otros Scores</h4>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(score => (
                <Button
                  key={score}
                  onClick={() => setSelectedScore(score)}
                  variant={selectedScore === score ? "default" : "outline"}
                  className={`aspect-square ${
                    selectedScore === score 
                      ? 'bg-golf-green text-white' 
                      : 'bg-dark-card border-gray-600 text-white hover:bg-golf-green/20'
                  }`}
                >
                  {score}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 bg-golf-green text-white text-lg font-semibold hover:bg-golf-light disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : currentScore ? 'Actualizar Score' : 'Confirmar Score'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}