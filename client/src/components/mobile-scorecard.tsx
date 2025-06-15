import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Save, Target, Trophy, Zap, Plus, Minus } from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { BettingCalculator } from '@/lib/betting';
import { GOLF_COURSES } from '@/lib/types';

interface MobileScorecardProps {
  roundData: any;
  onSave: (data: any) => void;
  onExit: () => void;
}

export function MobileScorecard({ roundData, onSave, onExit }: MobileScorecardProps) {
  const { toast } = useToast();
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<{ [playerId: string]: number[] }>({});
  const [oyesesWinners, setOyesesWinners] = useState<{ [hole: number]: string }>({});
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const course = GOLF_COURSES.find(c => c.id === roundData.courseId);
  const holeData = course?.holes[currentHole - 1];
  const isPar3 = holeData?.par === 3;

  useEffect(() => {
    // Initialize scores
    const initialScores: { [playerId: string]: number[] } = {};
    roundData.players.forEach((player: any) => {
      initialScores[player.id] = Array(18).fill(0);
    });
    setScores(initialScores);
  }, [roundData]);

  const updateScore = (playerId: string, delta: number) => {
    setScores(prev => {
      const newScores = { ...prev };
      const currentScore = newScores[playerId][currentHole - 1];
      const newScore = Math.max(0, currentScore + delta);
      newScores[playerId][currentHole - 1] = newScore;
      return newScores;
    });
  };

  const setScore = (playerId: string, score: number) => {
    setScores(prev => {
      const newScores = { ...prev };
      newScores[playerId][currentHole - 1] = score;
      return newScores;
    });
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (score === 0) return 'text-gray-400';
    if (diff <= -2) return 'text-purple-400'; // Eagle o mejor
    if (diff === -1) return 'text-blue-400';  // Birdie
    if (diff === 0) return 'text-green-400';  // Par
    if (diff === 1) return 'text-yellow-400'; // Bogey
    return 'text-red-400'; // Double bogey o peor
  };

  const getScoreLabel = (score: number, par: number) => {
    if (score === 0) return '-';
    const diff = score - par;
    if (diff <= -3) return 'ACE';
    if (diff === -2) return 'EAGLE';
    if (diff === -1) return 'BIRDIE';
    if (diff === 0) return 'PAR';
    if (diff === 1) return 'BOGEY';
    if (diff === 2) return 'DOUBLE';
    return '+' + diff;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // Solo si es un swipe horizontal y no vertical
    if (Math.abs(deltaX) > 50 && deltaY < 30) {
      if (deltaX > 0 && currentHole > 1) {
        setCurrentHole(currentHole - 1);
      } else if (deltaX < 0 && currentHole < 18) {
        setCurrentHole(currentHole + 1);
      }
    }
    setTouchStart(null);
  };

  const quickScoreButtons = [3, 4, 5, 6, 7, 8];

  const saveRound = () => {
    // Calculate betting results
    const playerData = roundData.players.map((player: any) => ({
      ...player,
      scores: scores[player.id] || Array(18).fill(0),
    }));

    const bettingResults = BettingCalculator.calculateAll(
      playerData,
      roundData.bettingConfig,
      course!,
      roundData.selectedTees,
      oyesesWinners
    );

    const roundResult = {
      ...roundData,
      scores,
      oyesesWinners,
      bettingResults,
      completedAt: new Date().toISOString(),
    };

    StorageManager.saveRound(roundResult);
    onSave(roundResult);
    
    toast({
      title: "Ronda guardada",
      description: "La ronda se ha guardado exitosamente",
    });
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 pb-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="sticky top-0 bg-green-900/95 backdrop-blur p-4 border-b border-green-700">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={onExit} className="text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">Hoyo {currentHole}</h1>
            <p className="text-sm text-green-200">{course?.name}</p>
          </div>
          <Button onClick={saveRound} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4" />
          </Button>
        </div>

        {/* Hole Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
            disabled={currentHole === 1}
            className="text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Par {holeData?.par} • {holeData?.distance?.[roundData.selectedTees] || 0}m
            </Badge>
            {isPar3 && roundData.bettingConfig.oyeses && (
              <div className="flex items-center justify-center mt-1">
                <Target className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-xs text-yellow-400">Oyeses</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentHole(Math.min(18, currentHole + 1))}
            disabled={currentHole === 18}
            className="text-white"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentHole / 18) * 100}%` }}
          />
        </div>
        <div className="text-center mt-1">
          <span className="text-xs text-gray-400">{currentHole} de 18 hoyos</span>
        </div>
      </div>

      {/* Quick Score Buttons */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300 mb-2 text-center">Scores rápidos:</p>
        <div className="grid grid-cols-6 gap-2">
          {quickScoreButtons.map(score => (
            <Button
              key={score}
              variant="outline"
              size="sm"
              className="h-8 text-xs border-gray-600 text-white hover:bg-green-700"
              onClick={() => {
                roundData.players.forEach((player: any) => {
                  setScore(player.id, score);
                });
              }}
            >
              {score}
            </Button>
          ))}
        </div>
      </div>

      {/* Players Scores */}
      <div className="px-4 space-y-3">
        {roundData.players.map((player: any) => {
          const currentScore = scores[player.id]?.[currentHole - 1] || 0;
          const par = holeData?.par || 4;
          
          return (
            <Card key={player.id} className="bg-dark-card border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{player.name}</h3>
                    <p className="text-sm text-gray-400">HCP {player.handicap}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(currentScore, par)}`}>
                      {currentScore || '-'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getScoreLabel(currentScore, par)}
                    </div>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateScore(player.id, -1)}
                    disabled={currentScore <= 0}
                    className="w-12 h-12 rounded-full border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>

                  <div className="flex space-x-1">
                    {[3, 4, 5, 6, 7].map(score => (
                      <Button
                        key={score}
                        variant={currentScore === score ? "default" : "outline"}
                        size="sm"
                        onClick={() => setScore(player.id, score)}
                        className={`w-10 h-10 text-sm ${
                          currentScore === score 
                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                            : 'border-gray-600 text-gray-300'
                        }`}
                      >
                        {score}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateScore(player.id, 1)}
                    className="w-12 h-12 rounded-full border-green-500 text-green-400 hover:bg-green-500/10"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* Special Achievements */}
                {currentScore > 0 && (
                  <div className="mt-3 flex justify-center space-x-2">
                    {currentScore - par <= -2 && (
                      <Badge className="bg-purple-600 text-white">
                        <Trophy className="h-3 w-3 mr-1" />
                        {currentScore - par === -2 ? 'Eagle' : 'Albatros'}
                      </Badge>
                    )}
                    {currentScore - par === -1 && (
                      <Badge className="bg-blue-600 text-white">
                        <Target className="h-3 w-3 mr-1" />
                        Birdie
                      </Badge>
                    )}
                    {currentScore === 1 && par === 3 && (
                      <Badge className="bg-gold-600 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Hole in One!
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Oyeses Selection for Par 3 */}
      {isPar3 && roundData.bettingConfig.oyeses && (
        <div className="px-4 mt-4">
          <Card className="bg-yellow-900/20 border-yellow-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-400 text-center flex items-center justify-center">
                <Target className="h-5 w-5 mr-2" />
                Oyeses - Más Cerca al Pin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {roundData.players.map((player: any) => (
                  <Button
                    key={player.id}
                    variant={oyesesWinners[currentHole] === player.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOyesesWinners(prev => ({
                      ...prev,
                      [currentHole]: player.id
                    }))}
                    className={
                      oyesesWinners[currentHole] === player.id
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'border-yellow-600 text-yellow-400'
                    }
                  >
                    {player.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Swipe Hint */}
      <div className="text-center mt-4 px-4">
        <p className="text-xs text-gray-500">
          💡 Desliza izquierda/derecha para cambiar de hoyo
        </p>
      </div>
    </div>
  );
}