import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RoundPlayer, HoleInfo, TeeSelection } from '@/lib/types';
import { ChevronLeft, ChevronRight, RotateCw, Target, TrendingUp, CreditCard } from 'lucide-react';

interface ModernScorecardProps {
  players: RoundPlayer[];
  currentHole: number;
  holeInfo: HoleInfo;
  onScoreChange: (playerId: string, score: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onViewScorecard?: () => void;
}

export function ModernScorecard({ 
  players, 
  currentHole, 
  holeInfo,
  onScoreChange,
  onNavigate,
  canGoNext,
  canGoPrev,
  onViewScorecard
}: ModernScorecardProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return 'text-yellow-400'; // Eagle or better
    if (diff === -1) return 'text-green-400'; // Birdie
    if (diff === 0) return 'text-blue-400'; // Par
    if (diff === 1) return 'text-orange-400'; // Bogey
    return 'text-red-400'; // Double bogey or worse
  };

  const getScoreBadge = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return '🦅';
    if (diff === -1) return '🐦';
    if (diff === 0) return '—';
    if (diff === 1) return '+1';
    return `+${diff}`;
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header with hole info */}
      <div className="bg-dark-surface px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('prev')}
              disabled={!canGoPrev}
              className="p-2 text-white hover:bg-dark-accent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">Hoyo {currentHole}</h1>
              <p className="text-sm text-secondary">Par {holeInfo.par}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {onViewScorecard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewScorecard}
                className="p-2 text-white hover:bg-dark-accent"
                title="Ver Tarjeta de Golf"
              >
                <CreditCard className="h-5 w-5" />
              </Button>
            )}
            <div className="bg-golf-blue rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{holeInfo.par}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="p-4 space-y-3">
        {players.map((player) => {
          const currentScore = player.scores.find(s => s.holeNumber === currentHole);
          const isSelected = selectedPlayer === player.id;
          
          return (
            <Card 
              key={player.id} 
              className={`bg-dark-card border-gray-700 transition-all ${
                isSelected ? 'ring-2 ring-golf-blue' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-golf-blue rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {currentScore && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-dark-surface rounded-full flex items-center justify-center border-2 border-gray-600">
                          <span className="text-xs font-bold text-white">
                            {getScoreBadge(currentScore.grossScore, holeInfo.par)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-secondary">
                        <span>H{player.handicap}</span>
                        <span>•</span>
                        <span className={currentScore ? getScoreColor(currentScore.grossScore, holeInfo.par) : 'text-gray-400'}>
                          {currentScore ? `${currentScore.grossScore}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPlayer(isSelected ? null : player.id)}
                    className="bg-dark-accent border-gray-600 text-golf-blue hover:bg-golf-blue hover:text-white"
                  >
                    {currentScore ? 'Editar' : 'Añadir'}
                  </Button>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-secondary mb-3">Puntuación para el hoyo {currentHole}</p>
                    <div className="grid grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <Button
                          key={score}
                          onClick={() => {
                            onScoreChange(player.id, score);
                            setSelectedPlayer(null);
                          }}
                          className={`aspect-square text-sm font-semibold ${
                            currentScore?.grossScore === score
                              ? 'bg-golf-blue text-white'
                              : 'bg-dark-accent text-white hover:bg-golf-blue hover:text-white'
                          }`}
                        >
                          {score === 10 ? '10+' : score}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Player Tee Information */}
      <div className="mx-4 mb-4">
        <Card className="bg-dark-card border-gray-700">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white flex items-center mb-3">
              <Target className="h-4 w-4 text-golf-blue mr-2" />
              Información por Jugador
            </h3>
            
            <div className="space-y-3">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-dark-surface rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-golf-green rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white font-medium">{player.name}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      player.selectedTee.color === 'negras' ? 'bg-black border border-gray-400' :
                      player.selectedTee.color === 'azules' ? 'bg-blue-500' :
                      player.selectedTee.color === 'blancas' ? 'bg-white border border-gray-400' :
                      player.selectedTee.color === 'blancas_f' ? 'bg-white border-2 border-pink-400' :
                      player.selectedTee.color === 'doradas' ? 'bg-yellow-400' :
                      player.selectedTee.color === 'plateadas' ? 'bg-gray-400' :
                      'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-white">{holeInfo.distances[player.selectedTee.color]}m</p>
                    <p className="text-secondary">HCP {holeInfo.strokeIndex[player.selectedTee.color]}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-6 left-4 right-4">
        <div className="flex space-x-3">
          <Button
            onClick={() => onNavigate('prev')}
            disabled={!canGoPrev}
            variant="outline"
            className="flex-1 bg-dark-surface border-gray-600 text-white py-3 hover:bg-dark-accent disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            onClick={() => onNavigate('next')}
            disabled={!canGoNext}
            className="flex-1 bg-golf-blue text-white py-3 hover:bg-golf-blue-dark"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}