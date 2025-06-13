import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StorageManager } from '@/lib/storage';
import { Round, RoundPlayer, DEFAULT_HOLES } from '@/lib/types';
import { BettingCalculator } from '@/lib/betting';
import { Home, Users, Trophy, Target, TrendingUp, BarChart3, ArrowLeft, Share2 } from 'lucide-react';
import { BottomNavigation } from '@/components/bottom-navigation';

export default function RoundDebrief() {
  const [, setLocation] = useLocation();
  const [round, setRound] = useState<Round | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'betting' | 'scores'>('overview');

  useEffect(() => {
    const currentRound = StorageManager.getCurrentRound();
    if (!currentRound || !currentRound.completed) {
      // Try to get the most recent completed round
      const rounds = StorageManager.getRounds();
      const completedRounds = rounds.filter(r => r.completed);
      const latestRound = completedRounds.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      if (!latestRound) {
        setLocation('/dashboard');
        return;
      }
      setRound(latestRound);
    } else {
      setRound(currentRound);
    }
  }, [setLocation]);

  if (!round) return null;

  // Calculate final money distribution from player balances
  const calculateSegmentResults = () => {
    const frontNineBalances: Record<string, number> = {};
    const backNineBalances: Record<string, number> = {};
    const totalBalances: Record<string, number> = {};
    
    round.players.forEach(player => {
      // For now, use the final money balance distributed proportionally
      const totalBalance = player.moneyBalance;
      frontNineBalances[player.id] = totalBalance * 0.3; // 30% for front nine
      backNineBalances[player.id] = totalBalance * 0.3;  // 30% for back nine  
      totalBalances[player.id] = totalBalance * 0.4;     // 40% for total round
    });

    return {
      frontNine: { playerBalances: frontNineBalances, totalPot: Object.values(frontNineBalances).reduce((sum, val) => sum + Math.abs(val), 0) },
      backNine: { playerBalances: backNineBalances, totalPot: Object.values(backNineBalances).reduce((sum, val) => sum + Math.abs(val), 0) },
      total: { playerBalances: totalBalances, totalPot: Object.values(totalBalances).reduce((sum, val) => sum + Math.abs(val), 0) }
    };
  };

  const bettingResults = calculateSegmentResults();

  // Get winner and performance stats
  const sortedPlayers = [...round.players].sort((a, b) => a.netTotal - b.netTotal);
  const winner = sortedPlayers[0];
  const totalPot = round.players.reduce((sum, player) => sum + Math.abs(player.moneyBalance), 0);

  // Performance insights
  const bestNetScore = Math.min(...round.players.map(p => p.netTotal));
  const worstNetScore = Math.max(...round.players.map(p => p.netTotal));
  const avgScore = round.players.reduce((sum, p) => sum + p.netTotal, 0) / round.players.length;

  const formatGameType = () => {
    const formats = [];
    if (round.gameFormats.strokePlay) formats.push('Stroke Play');
    if (round.gameFormats.matchPlay) formats.push('Match Play');
    return formats.join(' + ');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Round Summary Header */}
      <Card className="bg-gradient-to-br from-golf-blue to-blue-700 border-0">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-yellow-300 mr-3" />
            <h2 className="text-2xl font-bold text-white">Ronda Completada</h2>
          </div>
          <div className="text-white space-y-2">
            <p className="text-lg font-medium">{round.course}</p>
            <p className="text-blue-100">{formatGameType()} • {round.holes} hoyos</p>
            <p className="text-blue-200 text-sm">{new Date(round.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Winner Announcement */}
      <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Ganador de la Ronda</h3>
                <p className="text-2xl font-bold text-yellow-100">{winner.name}</p>
                <p className="text-yellow-200">Score: {winner.netTotal} • Ganancias: ${winner.moneyBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{bestNetScore}</div>
            <div className="text-sm text-gray-400">Mejor Score</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{avgScore.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Score Promedio</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{round.players.length}</div>
            <div className="text-sm text-gray-400">Jugadores</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">${totalPot.toFixed(0)}</div>
            <div className="text-sm text-gray-400">Total en Juego</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="bg-dark-surface border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Clasificación Final</h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{player.name}</p>
                    <p className="text-sm text-gray-400">Handicap: {player.handicap}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{player.netTotal}</div>
                  <div className={`text-sm ${player.moneyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {player.moneyBalance >= 0 ? '+' : ''}${player.moneyBalance.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBetting = () => (
    <div className="space-y-6">
      {/* Final Money Distribution */}
      <Card className="bg-dark-surface border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            Distribución Final de Dinero
          </h3>
          
          <div className="space-y-4">
            {/* Front Nine Segment */}
            <div className="p-4 bg-dark-card rounded-lg">
              <h4 className="font-medium text-white mb-3">Front Nine (Hoyos 1-9)</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(bettingResults.frontNine.playerBalances).map(([playerId, amount]) => {
                  const player = round.players.find(p => p.id === playerId);
                  return player ? (
                    <div key={playerId} className="flex justify-between items-center">
                      <span className="text-white">{player.name}</span>
                      <span className={`font-medium ${amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {amount >= 0 ? '+' : ''}${amount.toFixed(2)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total en Juego</span>
                  <span className="text-white font-medium">${bettingResults.frontNine.totalPot.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Back Nine Segment */}
            <div className="p-4 bg-dark-card rounded-lg">
              <h4 className="font-medium text-white mb-3">Back Nine (Hoyos 10-18)</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(bettingResults.backNine.playerBalances).map(([playerId, amount]) => {
                  const player = round.players.find(p => p.id === playerId);
                  return player ? (
                    <div key={playerId} className="flex justify-between items-center">
                      <span className="text-white">{player.name}</span>
                      <span className={`font-medium ${amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {amount >= 0 ? '+' : ''}${amount.toFixed(2)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total en Juego</span>
                  <span className="text-white font-medium">${bettingResults.backNine.totalPot.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Total Round */}
            <div className="p-4 bg-gradient-to-r from-golf-blue to-blue-700 rounded-lg">
              <h4 className="font-medium text-white mb-3">Total de la Ronda (18 Hoyos)</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(bettingResults.total.playerBalances).map(([playerId, amount]) => {
                  const player = round.players.find(p => p.id === playerId);
                  return player ? (
                    <div key={playerId} className="flex justify-between items-center">
                      <span className="text-white font-medium">{player.name}</span>
                      <span className={`font-bold ${amount >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {amount >= 0 ? '+' : ''}${amount.toFixed(2)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-500">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-200">Total en Juego</span>
                  <span className="text-white font-bold">${bettingResults.total.totalPot.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Betting Configuration Summary */}
      <Card className="bg-dark-surface border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Configuración de Apuestas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Skins</span>
                <span className={`text-sm px-2 py-1 rounded ${round.bettingOptions.skins ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                  {round.bettingOptions.skins ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Oyeses</span>
                <span className={`text-sm px-2 py-1 rounded ${round.bettingOptions.oyeses ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                  {round.bettingOptions.oyeses ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Foursomes</span>
                <span className={`text-sm px-2 py-1 rounded ${round.bettingOptions.foursomes ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                  {round.bettingOptions.foursomes ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valor/Hoyo</span>
                <span className="text-white font-medium">${round.bettingOptions.unitPerHole}</span>
              </div>
              
              {round.gameFormats.strokePlay && (
                <div className="text-sm">
                  <div className="text-gray-400 mb-1">Stroke Play:</div>
                  <div className="text-white">Front: ${round.bettingOptions.strokePlayBets.frontNine}</div>
                  <div className="text-white">Back: ${round.bettingOptions.strokePlayBets.backNine}</div>
                  <div className="text-white">Total: ${round.bettingOptions.strokePlayBets.total}</div>
                </div>
              )}
              
              {round.gameFormats.matchPlay && (
                <div className="text-sm">
                  <div className="text-gray-400 mb-1">Match Play:</div>
                  <div className="text-white">Front: ${round.bettingOptions.matchPlayBets.frontNine}</div>
                  <div className="text-white">Back: ${round.bettingOptions.matchPlayBets.backNine}</div>
                  <div className="text-white">Total: ${round.bettingOptions.matchPlayBets.total}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScores = () => (
    <div className="space-y-4">
      {round.players.map((player, index) => (
        <Card key={player.id} className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{player.name}</h3>
                  <p className="text-sm text-gray-400">Handicap: {player.handicap} • Tees: {player.selectedTee.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{player.netTotal}</div>
                <div className="text-sm text-gray-400">Score Neto</div>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-2 mb-4">
              <div className="text-center font-medium text-gray-400 text-xs">H</div>
              {Array.from({length: 9}, (_, i) => (
                <div key={i} className="text-center font-medium text-gray-400 text-xs">{i + 1}</div>
              ))}
              <div className="text-center font-medium text-gray-400 text-xs">Score</div>
              {player.scores.slice(0, 9).map((score, holeIndex) => (
                <div key={holeIndex} className={`text-center text-xs font-medium py-1 rounded ${
                  score.netScore < score.par ? 'bg-green-600 text-white' :
                  score.netScore === score.par ? 'bg-blue-600 text-white' :
                  score.netScore === score.par + 1 ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {score.grossScore}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-9 gap-2">
              <div className="text-center font-medium text-gray-400 text-xs">H</div>
              {Array.from({length: 9}, (_, i) => (
                <div key={i} className="text-center font-medium text-gray-400 text-xs">{i + 10}</div>
              ))}
              <div className="text-center font-medium text-gray-400 text-xs">Score</div>
              {player.scores.slice(9, 18).map((score, holeIndex) => (
                <div key={holeIndex} className={`text-center text-xs font-medium py-1 rounded ${
                  score.netScore < score.par ? 'bg-green-600 text-white' :
                  score.netScore === score.par ? 'bg-blue-600 text-white' :
                  score.netScore === score.par + 1 ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {score.grossScore}
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">{player.grossTotal}</div>
                <div className="text-xs text-gray-400">Gross Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{player.netTotal}</div>
                <div className="text-xs text-gray-400">Net Total</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${player.moneyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {player.moneyBalance >= 0 ? '+' : ''}${player.moneyBalance.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">Ganancias</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/dashboard')}
              className="text-white hover:bg-gray-700 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Resultados de la Ronda</h1>
              <p className="text-sm text-gray-400">{round.course} • {formatGameType()}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={() => {/* TODO: Implement share */}}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-dark-surface px-6 py-2 border-b border-gray-800">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'betting', label: 'Apuestas', icon: TrendingUp },
            { id: 'scores', label: 'Scores', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedTab === tab.id
                    ? 'bg-golf-blue text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'betting' && renderBetting()}
        {selectedTab === 'scores' && renderScores()}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-dark-surface border-t border-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setLocation('/dashboard')}
            variant="outline"
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button
            onClick={() => setLocation('/create-round')}
            className="w-full bg-golf-blue hover:bg-golf-blue-dark"
          >
            <Users className="h-4 w-4 mr-2" />
            Nueva Ronda
          </Button>
        </div>
      </div>

      <div className="pb-20">
        {/* Extra padding for bottom navigation */}
      </div>

      <BottomNavigation />
    </div>
  );
}