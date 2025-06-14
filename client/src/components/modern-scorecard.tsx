import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RoundPlayer, HoleInfo, TeeSelection } from '@/lib/types';
import { ChevronLeft, ChevronRight, RotateCw, Target, TrendingUp, CreditCard, X } from 'lucide-react';
import { ScoreEntryModal } from './score-entry-modal';

interface ModernScorecardProps {
  players: RoundPlayer[];
  currentHole: number;
  holeInfo: HoleInfo;
  onScoreChange: (playerId: string, score: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onViewScorecard?: () => void;
  onAbandonRound?: () => void;
  onOyesesWinnerChange?: (playerId: string) => void;
  gameFormats: {
    strokePlay: boolean;
    matchPlay: boolean;
  };
  bettingOptions: {
    oyeses: boolean;
    unitPerHole: number;
  };
}

export function ModernScorecard({ 
  players, 
  currentHole, 
  holeInfo,
  onScoreChange,
  onNavigate,
  canGoNext,
  canGoPrev,
  onViewScorecard,
  onAbandonRound,
  onOyesesWinnerChange,
  gameFormats,
  bettingOptions
}: ModernScorecardProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState<RoundPlayer | null>(null);
  
  // Get current oyeses winner for this hole
  const currentOyesesWinner = players.find(player => {
    const holeScore = player.scores.find(s => s.holeNumber === currentHole);
    return holeScore?.oyesesWinner === player.id;
  });

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

  // Calculate stroke play position relative to par
  const getStrokePlayStatus = (player: RoundPlayer) => {
    const completedHoles = player.scores.filter(s => s.holeNumber <= currentHole);
    if (completedHoles.length === 0) return null;
    
    const totalStrokes = completedHoles.reduce((sum, score) => sum + score.grossScore, 0);
    const totalPar = completedHoles.reduce((sum, score) => sum + score.par, 0);
    const diff = totalStrokes - totalPar;
    
    if (diff === 0) return 'E';
    if (diff > 0) return `+${diff}`;
    return `${diff}`;
  };

  // Calculate match play status against the field (hole-by-hole basis)
  const getMatchPlayStatus = (player: RoundPlayer) => {
    if (players.length < 2) return 'AS';
    
    let holesWon = 0;
    let holesLost = 0;
    
    // Calculate match play results hole by hole against all other players
    for (let hole = 1; hole <= currentHole; hole++) {
      const playerScore = player.scores.find(s => s.holeNumber === hole);
      
      if (playerScore) {
        const otherScores = players
          .filter(p => p.id !== player.id)
          .map(p => p.scores.find(s => s.holeNumber === hole))
          .filter(score => score !== undefined);
        
        if (otherScores.length > 0) {
          const playerNet = playerScore.netScore;
          const bestOpponentNet = Math.min(...otherScores.map(s => s!.netScore));
          
          if (playerNet < bestOpponentNet) {
            holesWon += 1; // Player wins the hole
          } else if (playerNet > bestOpponentNet) {
            holesLost += 1; // Player loses the hole
          }
          // Tie = no change to either counter
        }
      }
    }
    
    const matchPoints = holesWon - holesLost;
    const holesRemaining = 18 - currentHole;
    
    if (matchPoints === 0) return 'AS'; // All Square
    
    // Check if match is mathematically decided
    if (Math.abs(matchPoints) > holesRemaining) {
      return matchPoints > 0 ? `${matchPoints} UP` : `${Math.abs(matchPoints)} DOWN`;
    }
    
    // Match still active
    if (matchPoints > 0) {
      return `${matchPoints} UP`;
    } else {
      return `${Math.abs(matchPoints)} DN`;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'text-gray-400';
    if (status === 'E' || status === 'AS') return 'text-blue-400';
    if (status === 'UP' || status.includes('UP')) return 'text-green-400';
    if (status.includes('DN') || status.includes('DOWN')) return 'text-red-400';
    if (status.startsWith('-')) return 'text-green-400';
    if (status.startsWith('+')) return 'text-red-400';
    return 'text-gray-400';
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
              {/* Active Game Formats */}
              <div className="flex items-center space-x-2 mt-1">
                {gameFormats.strokePlay && (
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">
                    Stroke Play
                  </span>
                )}
                {gameFormats.matchPlay && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                    Match Play
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {onAbandonRound && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAbandonRound}
                className="p-2 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                title="Abandonar Ronda"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
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
                      
                      {/* Game Format Status Indicators */}
                      <div className="flex items-center space-x-3 mt-1">
                        {gameFormats.strokePlay && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-400">SP:</span>
                            <span className={`text-xs font-semibold ${getStatusColor(getStrokePlayStatus(player))}`}>
                              {getStrokePlayStatus(player) || '—'}
                            </span>
                          </div>
                        )}
                        {gameFormats.matchPlay && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-400">MP:</span>
                            <span className={`text-xs font-semibold ${getStatusColor(getMatchPlayStatus(player))}`}>
                              {getMatchPlayStatus(player) || '—'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActivePlayer(player);
                      setScoreModalOpen(true);
                    }}
                    className="bg-dark-accent border-gray-600 text-golf-blue hover:bg-golf-blue hover:text-white"
                  >
                    {currentScore ? 'Editar' : 'Añadir'}
                  </Button>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <ModernScoreInput
                      selectedScore={currentScore?.grossScore || null}
                      onScoreSelect={(score) => {
                        onScoreChange(player.id, score);
                        setSelectedPlayer(null);
                      }}
                      par={holeInfo.par}
                      playerName={player.name}
                      handicap={player.handicap}
                      strokeIndex={holeInfo.strokeIndex[player.selectedTee.color]}
                      maxScore={10}
                    />
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

      {/* Tournament Status Panel */}
      {(gameFormats.strokePlay || gameFormats.matchPlay) && (
        <div className="p-4 mb-20">
          <Card className="bg-dark-surface border-gray-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Estado del Torneo</h3>
              
              {gameFormats.strokePlay && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Stroke Play - Clasificación</h4>
                  <div className="space-y-2">
                    {players
                      .map(player => ({
                        ...player,
                        status: getStrokePlayStatus(player),
                        completedHoles: player.scores.filter(s => s.holeNumber <= currentHole).length
                      }))
                      .sort((a, b) => {
                        const aTotal = a.scores.filter(s => s.holeNumber <= currentHole)
                          .reduce((sum, score) => sum + score.grossScore, 0);
                        const bTotal = b.scores.filter(s => s.holeNumber <= currentHole)
                          .reduce((sum, score) => sum + score.grossScore, 0);
                        return aTotal - bTotal;
                      })
                      .map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-dark-card rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-bold text-sm w-6">#{index + 1}</span>
                            <div className="w-6 h-6 bg-golf-blue rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {player.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white">{player.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">{player.completedHoles}/18</span>
                            <span className={`font-semibold ${getStatusColor(player.status)}`}>
                              {player.status || '—'}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {gameFormats.matchPlay && (
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-2">Match Play - Estado (Hoyo por Hoyo)</h4>
                  <div className="space-y-2">
                    {players
                      .map(player => {
                        const status = getMatchPlayStatus(player);
                        // Extract numeric value for sorting (UP = positive, DN = negative, AS = 0)
                        let sortValue = 0;
                        if (status && status !== 'AS' && status !== '—') {
                          const match = status.match(/(\d+)\s*(UP|DN)/);
                          if (match) {
                            const value = parseInt(match[1]);
                            sortValue = match[2] === 'UP' ? value : -value;
                          }
                        }
                        return {
                          ...player,
                          status,
                          sortValue,
                          completedHoles: player.scores.filter(s => s.holeNumber <= currentHole).length
                        };
                      })
                      .sort((a, b) => b.sortValue - a.sortValue) // Sort by match play position
                      .map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-dark-card rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-bold text-sm w-6">#{index + 1}</span>
                            <div className="w-6 h-6 bg-golf-green rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {player.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white">{player.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">{player.completedHoles}/18</span>
                            <span className={`font-semibold ${getStatusColor(player.status)}`}>
                              {player.status || '—'}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Oyeses (Closest to Pin) Section - Only for Par 3s */}
      {holeInfo.par === 3 && bettingOptions.oyeses && (
        <div className="px-4 pb-4">
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-yellow-400 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-400">Oyeses - Closest to Pin</h3>
              </div>
              <p className="text-center text-gray-300 text-sm mb-4">
                Selecciona quién quedó más cerca del hoyo en este par 3
              </p>
              
              <div className="space-y-2">
                {players.map((player) => {
                  const isWinner = currentOyesesWinner?.id === player.id;
                  return (
                    <Button
                      key={player.id}
                      onClick={() => onOyesesWinnerChange?.(player.id)}
                      variant={isWinner ? "default" : "outline"}
                      className={`w-full justify-between h-12 ${
                        isWinner 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500' 
                          : 'bg-dark-surface border-gray-600 text-white hover:bg-dark-accent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isWinner ? 'bg-yellow-700' : 'bg-golf-blue'
                        }`}>
                          <span className="text-xs font-bold text-white">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      {isWinner && (
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-yellow-200" />
                          <span className="text-yellow-200 text-sm font-medium">
                            +${bettingOptions.unitPerHole * players.length}
                          </span>
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
              
              {currentOyesesWinner && (
                <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">
                      {currentOyesesWinner.name} ganó ${bettingOptions.unitPerHole * players.length}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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