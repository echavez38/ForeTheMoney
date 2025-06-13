import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Round, DEFAULT_HOLES, GOLF_COURSES } from '@/lib/types';

interface GolfScorecardProps {
  round: Round;
}

export function GolfScorecard({ round }: GolfScorecardProps) {
  // Find the correct course data based on the round's course name
  const course = GOLF_COURSES.find(c => c.name === round.course) || GOLF_COURSES[0];
  const frontNine = course.holes.slice(0, 9);
  const backNine = course.holes.slice(9, 18);

  const getTeeColor = (color: string) => {
    switch (color) {
      case 'negras': return 'bg-black border border-gray-400';
      case 'azules': return 'bg-blue-500';
      case 'blancas': return 'bg-white border border-gray-400';
      case 'blancas_f': return 'bg-white border-2 border-pink-400';
      case 'doradas': return 'bg-yellow-400';
      case 'plateadas': return 'bg-gray-400';
      case 'rojas': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlayerScore = (playerId: string, holeNumber: number) => {
    const player = round.players.find(p => p.id === playerId);
    return player?.scores.find(s => s.holeNumber === holeNumber)?.grossScore || '';
  };

  const getPlayerOut = (playerId: string) => {
    const player = round.players.find(p => p.id === playerId);
    if (!player) return 0;
    return player.scores
      .filter(s => s.holeNumber >= 1 && s.holeNumber <= 9)
      .reduce((sum, s) => sum + s.grossScore, 0);
  };

  const getPlayerIn = (playerId: string) => {
    const player = round.players.find(p => p.id === playerId);
    if (!player) return 0;
    return player.scores
      .filter(s => s.holeNumber >= 10 && s.holeNumber <= 18)
      .reduce((sum, s) => sum + s.grossScore, 0);
  };

  const getPlayerTotal = (playerId: string) => {
    const player = round.players.find(p => p.id === playerId);
    return player?.grossTotal || 0;
  };

  const getPlayerHandicap = (playerId: string) => {
    const player = round.players.find(p => p.id === playerId);
    return player?.handicap || 0;
  };

  const getPlayerNet = (playerId: string) => {
    const player = round.players.find(p => p.id === playerId);
    return player?.netTotal || 0;
  };

  const getYardageForPlayer = (playerId: string, hole: any) => {
    const player = round.players.find(p => p.id === playerId);
    if (!player) return hole.distances.blancas;
    return hole.distances[player.selectedTee.color as keyof typeof hole.distances] || hole.distances.blancas;
  };

  const getHandicapForPlayer = (playerId: string, hole: any) => {
    const player = round.players.find(p => p.id === playerId);
    if (!player) return hole.strokeIndex.blancas;
    return hole.strokeIndex[player.selectedTee.color as keyof typeof hole.strokeIndex] || hole.strokeIndex.blancas;
  };

  // Calculate Stroke Play status for a player at a specific hole
  const getStrokePlayStatusAtHole = (playerId: string, holeNumber: number) => {
    const player = round.players.find(p => p.id === playerId);
    if (!player) return '';
    
    const holesPlayed = player.scores.filter(s => s.holeNumber <= holeNumber);
    if (holesPlayed.length === 0) return '';
    
    const totalNet = holesPlayed.reduce((sum, score) => sum + score.netScore, 0);
    const totalPar = holesPlayed.reduce((sum, score) => sum + score.par, 0);
    const toPar = totalNet - totalPar;
    
    if (toPar === 0) return 'E';
    if (toPar > 0) return `+${toPar}`;
    return `${toPar}`;
  };

  // Calculate Match Play status for a player at a specific hole
  const getMatchPlayStatusAtHole = (playerId: string, holeNumber: number) => {
    const player = round.players.find(p => p.id === playerId);
    if (!player || round.players.length < 2) return '';
    
    let holesWon = 0;
    let holesLost = 0;
    
    // Calculate match play results hole by hole against all other players
    for (let hole = 1; hole <= holeNumber; hole++) {
      const playerScore = player.scores.find(s => s.holeNumber === hole);
      
      if (playerScore) {
        const otherScores = round.players
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
    
    if (matchPoints === 0) return 'AS'; // All Square
    
    if (matchPoints > 0) {
      return `${matchPoints} UP`;
    } else {
      return `${Math.abs(matchPoints)} DN`;
    }
  };

  const frontNinePar = frontNine.reduce((sum, hole) => sum + hole.par, 0);
  const backNinePar = backNine.reduce((sum, hole) => sum + hole.par, 0);
  const totalPar = frontNinePar + backNinePar;

  return (
    <div className="min-h-screen bg-dark-bg p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Tarjeta de Puntuación</h1>
        <p className="text-golf-green font-semibold">{round.course}</p>
        <p className="text-gray-400 text-sm">
          {new Date(round.createdAt).toLocaleDateString('es-ES')} • {round.holes} Hoyos
        </p>
        <div className="flex justify-center gap-2 mt-2">
          {round.gameFormats.strokePlay && (
            <span className="px-3 py-1 bg-blue-600 rounded-full text-xs text-white">Stroke Play</span>
          )}
          {round.gameFormats.matchPlay && (
            <span className="px-3 py-1 bg-green-600 rounded-full text-xs text-white">Match Play</span>
          )}
        </div>
      </div>

      {/* Front Nine Scorecard */}
      <Card className="bg-dark-surface border-gray-700">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">OUT (Hoyos 1-9)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {/* Header Row */}
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-white font-semibold p-2 text-left">HOLE</th>
                  {frontNine.map(hole => (
                    <th key={hole.number} className="text-white font-semibold p-1 text-center min-w-[32px]">
                      {hole.number}
                    </th>
                  ))}
                  <th className="text-white font-semibold p-2 text-center">OUT</th>
                </tr>
              </thead>
              
              <tbody>
                {/* Par Row */}
                <tr className="border-b border-gray-600 bg-dark-card">
                  <td className="text-white font-semibold p-2">PAR</td>
                  {frontNine.map(hole => (
                    <td key={`par-${hole.number}`} className="text-white font-semibold p-1 text-center">
                      {hole.par}
                    </td>
                  ))}
                  <td className="text-white font-semibold p-2 text-center">{frontNinePar}</td>
                </tr>

                {/* Player Rows */}
                {round.players.map((player, index) => (
                  <React.Fragment key={player.id}>
                    {/* Yardage Row for each player */}
                    <tr className="border-b border-gray-600">
                      <td className="text-gray-400 p-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getTeeColor(player.selectedTee.color)}`} />
                          <span>YDS</span>
                        </div>
                      </td>
                      {frontNine.map(hole => (
                        <td key={`yds-${player.id}-${hole.number}`} className="text-gray-400 p-1 text-center text-xs">
                          {getYardageForPlayer(player.id, hole)}
                        </td>
                      ))}
                      <td className="text-gray-400 p-2 text-center text-xs">
                        {frontNine.reduce((sum, hole) => sum + getYardageForPlayer(player.id, hole), 0)}
                      </td>
                    </tr>

                    {/* Handicap Row */}
                    <tr className="border-b border-gray-600">
                      <td className="text-gray-400 p-2 text-xs">HCP</td>
                      {frontNine.map(hole => (
                        <td key={`hcp-${player.id}-${hole.number}`} className="text-gray-400 p-1 text-center text-xs">
                          {getHandicapForPlayer(player.id, hole)}
                        </td>
                      ))}
                      <td className="text-gray-400 p-2 text-center text-xs">HCP {player.handicap}</td>
                    </tr>

                    {/* Player Score Row */}
                    <tr className="border-b-2 border-gray-600">
                      <td className="text-white font-semibold p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-golf-green rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{player.name}</span>
                        </div>
                      </td>
                      {frontNine.map(hole => (
                        <td key={`score-${player.id}-${hole.number}`} className="p-1 text-center">
                          <div className="w-8 h-8 flex items-center justify-center border border-gray-500 rounded bg-dark-bg">
                            <span className="text-white font-semibold">
                              {getPlayerScore(player.id, hole.number)}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="text-white font-semibold p-2 text-center bg-dark-card">
                        {getPlayerOut(player.id) || ''}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Back Nine Scorecard */}
      <Card className="bg-dark-surface border-gray-700">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">IN (Hoyos 10-18)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {/* Header Row */}
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-white font-semibold p-2 text-left">HOLE</th>
                  {backNine.map(hole => (
                    <th key={hole.number} className="text-white font-semibold p-1 text-center min-w-[32px]">
                      {hole.number}
                    </th>
                  ))}
                  <th className="text-white font-semibold p-2 text-center">IN</th>
                  <th className="text-white font-semibold p-2 text-center">TOT</th>
                  <th className="text-white font-semibold p-2 text-center">NET</th>
                </tr>
              </thead>
              
              <tbody>
                {/* Par Row */}
                <tr className="border-b border-gray-600 bg-dark-card">
                  <td className="text-white font-semibold p-2">PAR</td>
                  {backNine.map(hole => (
                    <td key={`par-${hole.number}`} className="text-white font-semibold p-1 text-center">
                      {hole.par}
                    </td>
                  ))}
                  <td className="text-white font-semibold p-2 text-center">{backNinePar}</td>
                  <td className="text-white font-semibold p-2 text-center">{totalPar}</td>
                  <td className="text-white font-semibold p-2 text-center">PAR</td>
                </tr>

                {/* Player Rows */}
                {round.players.map((player, index) => (
                  <React.Fragment key={player.id}>
                    {/* Yardage Row for each player */}
                    <tr className="border-b border-gray-600">
                      <td className="text-gray-400 p-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getTeeColor(player.selectedTee.color)}`} />
                          <span>YDS</span>
                        </div>
                      </td>
                      {backNine.map(hole => (
                        <td key={`yds-${player.id}-${hole.number}`} className="text-gray-400 p-1 text-center text-xs">
                          {getYardageForPlayer(player.id, hole)}
                        </td>
                      ))}
                      <td className="text-gray-400 p-2 text-center text-xs">
                        {backNine.reduce((sum, hole) => sum + getYardageForPlayer(player.id, hole), 0)}
                      </td>
                      <td className="text-gray-400 p-2 text-center text-xs">
                        {DEFAULT_HOLES.reduce((sum, hole) => sum + getYardageForPlayer(player.id, hole), 0)}
                      </td>
                      <td className="text-gray-400 p-2 text-center text-xs">
                        {player.selectedTee.name}
                      </td>
                    </tr>

                    {/* Handicap Row */}
                    <tr className="border-b border-gray-600">
                      <td className="text-gray-400 p-2 text-xs">HCP</td>
                      {backNine.map(hole => (
                        <td key={`hcp-${player.id}-${hole.number}`} className="text-gray-400 p-1 text-center text-xs">
                          {getHandicapForPlayer(player.id, hole)}
                        </td>
                      ))}
                      <td className="text-gray-400 p-2 text-center text-xs"></td>
                      <td className="text-gray-400 p-2 text-center text-xs">HCP {player.handicap}</td>
                      <td className="text-gray-400 p-2 text-center text-xs"></td>
                    </tr>

                    {/* Player Score Row */}
                    <tr className="border-b-2 border-gray-600">
                      <td className="text-white font-semibold p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-golf-green rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{player.name}</span>
                        </div>
                      </td>
                      {backNine.map(hole => (
                        <td key={`score-${player.id}-${hole.number}`} className="p-1 text-center">
                          <div className="w-8 h-8 flex items-center justify-center border border-gray-500 rounded bg-dark-bg">
                            <span className="text-white font-semibold">
                              {getPlayerScore(player.id, hole.number)}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="text-white font-semibold p-2 text-center bg-dark-card">
                        {getPlayerIn(player.id) || ''}
                      </td>
                      <td className="text-white font-semibold p-2 text-center bg-golf-green text-dark-bg">
                        {getPlayerTotal(player.id) || ''}
                      </td>
                      <td className="text-golf-green font-semibold p-2 text-center bg-dark-card">
                        {getPlayerNet(player.id) || ''}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-dark-surface border-gray-700">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Resumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {round.players.map(player => {
              const totalToPar = getPlayerTotal(player.id) - totalPar;
              const netToPar = getPlayerNet(player.id) - totalPar;
              return (
                <div key={player.id} className="p-4 bg-dark-card rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-golf-green rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{player.name}</p>
                      <p className="text-gray-400 text-sm">HCP {player.handicap} • {player.selectedTee.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{getPlayerTotal(player.id)}</p>
                      <p className="text-sm text-gray-400">Total</p>
                      <p className="text-xs text-gray-500">
                        {totalToPar > 0 ? '+' : ''}{totalToPar} al par
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-golf-green">{getPlayerNet(player.id)}</p>
                      <p className="text-sm text-gray-400">Neto</p>
                      <p className="text-xs text-gray-500">
                        {netToPar > 0 ? '+' : ''}{netToPar} al par
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">${player.moneyBalance.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">Apuestas</p>
                      <p className="text-xs text-gray-500">Balance</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stroke Play Section */}
      {round.gameFormats.strokePlay && (
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 text-center">Stroke Play - Estado por Hoyo</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-white font-semibold p-2 text-left">JUGADOR</th>
                    {DEFAULT_HOLES.map(hole => (
                      <th key={hole.number} className="text-white font-semibold p-1 text-center min-w-[40px]">
                        {hole.number}
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {round.players.map(player => (
                    <tr key={player.id} className="border-b border-gray-600">
                      <td className="text-white font-semibold p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-golf-green rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{player.name}</span>
                        </div>
                      </td>
                      {DEFAULT_HOLES.map(hole => {
                        const status = getStrokePlayStatusAtHole(player.id, hole.number);
                        const hasScore = player.scores.find(s => s.holeNumber === hole.number);
                        return (
                          <td key={`sp-${player.id}-${hole.number}`} className="p-1 text-center">
                            <div className={`w-8 h-6 flex items-center justify-center rounded text-xs font-semibold ${
                              !hasScore ? 'text-gray-500' :
                              status === 'E' ? 'bg-blue-600 text-white' :
                              status.startsWith('+') ? 'bg-red-600 text-white' :
                              'bg-green-600 text-white'
                            }`}>
                              {hasScore ? status || 'E' : '—'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Play Section */}
      {round.gameFormats.matchPlay && (
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-green-400 mb-4 text-center">Match Play - Estado por Hoyo</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-white font-semibold p-2 text-left">JUGADOR</th>
                    {DEFAULT_HOLES.map(hole => (
                      <th key={hole.number} className="text-white font-semibold p-1 text-center min-w-[40px]">
                        {hole.number}
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {round.players.map(player => (
                    <tr key={player.id} className="border-b border-gray-600">
                      <td className="text-white font-semibold p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-golf-green rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{player.name}</span>
                        </div>
                      </td>
                      {DEFAULT_HOLES.map(hole => {
                        const status = getMatchPlayStatusAtHole(player.id, hole.number);
                        const hasScore = player.scores.find(s => s.holeNumber === hole.number);
                        return (
                          <td key={`mp-${player.id}-${hole.number}`} className="p-1 text-center">
                            <div className={`w-8 h-6 flex items-center justify-center rounded text-xs font-semibold ${
                              !hasScore ? 'text-gray-500' :
                              status === 'AS' ? 'bg-blue-600 text-white' :
                              status.includes('UP') ? 'bg-green-600 text-white' :
                              status.includes('DN') ? 'bg-red-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {hasScore ? status || 'AS' : '—'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}