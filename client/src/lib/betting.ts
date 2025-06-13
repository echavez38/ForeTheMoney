import { HoleInfo, RoundPlayer, BettingOptions, BettingResult } from './types';

export class BettingCalculator {
  static calculateNetScore(
    grossScore: number,
    playerHandicap: number,
    holeStrokeIndex: number
  ): number {
    const strokesReceived = this.getStrokesReceived(playerHandicap, holeStrokeIndex);
    return grossScore - strokesReceived;
  }

  static calculateHoleBetting(
    players: RoundPlayer[],
    holeInfo: HoleInfo,
    bettingOptions: BettingOptions
  ): BettingResult[] {
    const results: BettingResult[] = [];

    if (bettingOptions.skins) {
      // Get net scores for all players on this hole
      const holeScores = players.map(player => {
        const score = player.scores.find(s => s.holeNumber === holeInfo.number);
        return {
          player,
          netScore: score ? score.netScore : 999
        };
      }).sort((a, b) => a.netScore - b.netScore);

      // Find winners (lowest net score)
      const winningScore = holeScores[0].netScore;
      const winners = holeScores.filter(h => h.netScore === winningScore);
      
      results.push({
        type: 'skins',
        winner: winners.length === 1 ? winners[0].player.name : null,
        amount: winners.length === 1 ? bettingOptions.unitPerHole * players.length : 0,
        tied: winners.length > 1,
      });
    }

    // Oyeses (Closest to Pin) for Par 3s only
    if (bettingOptions.oyeses && holeInfo.par === 3) {
      const oyesesWinner = players.find(player => {
        const score = player.scores.find(s => s.holeNumber === holeInfo.number);
        return score?.oyesesWinner === player.id;
      });

      results.push({
        type: 'oyeses',
        winner: oyesesWinner ? oyesesWinner.name : null,
        amount: oyesesWinner ? bettingOptions.unitPerHole * players.length : 0,
        tied: false,
      });
    }

    return results;
  }

  static calculateSideBets(
    players: RoundPlayer[],
    holeInfo: HoleInfo,
    bettingOptions: BettingOptions
  ): BettingResult[] {
    const results: BettingResult[] = [];

    // Longest Drive (solo en par 4 y par 5)
    if (bettingOptions.sideBets.longestDrive && holeInfo.par >= 4) {
      const longestDriveWinner = players.find(player => {
        const score = player.scores.find(s => s.holeNumber === holeInfo.number);
        return score?.longestDrive === player.id;
      });

      if (longestDriveWinner) {
        results.push({
          type: 'skins', // Usamos 'skins' como tipo genérico para side bets
          winner: longestDriveWinner.name,
          amount: bettingOptions.unitPerHole * players.length,
          tied: false,
        });
      }
    }

    // Birdie Pool
    if (bettingOptions.sideBets.birdiePool) {
      players.forEach(player => {
        const score = player.scores.find(s => s.holeNumber === holeInfo.number);
        if (score?.birdieAchieved && score.grossScore < holeInfo.par) {
          results.push({
            type: 'skins',
            winner: player.name,
            amount: bettingOptions.unitPerHole * 2, // Bonificación especial por birdie
            tied: false,
          });
        }
      });
    }

    // Sand Saves
    if (bettingOptions.sideBets.sandSaves) {
      players.forEach(player => {
        const score = player.scores.find(s => s.holeNumber === holeInfo.number);
        if (score?.sandSave && score.grossScore <= holeInfo.par) {
          results.push({
            type: 'skins',
            winner: player.name,
            amount: bettingOptions.unitPerHole,
            tied: false,
          });
        }
      });
    }

    return results;
  }

  static calculateCarryovers(
    players: RoundPlayer[],
    holeInfo: HoleInfo,
    bettingOptions: BettingOptions,
    carryoverAmount: number = 0
  ): { winner: string | null; amount: number; newCarryover: number } {
    if (!bettingOptions.carryovers) {
      return { winner: null, amount: 0, newCarryover: 0 };
    }

    // Obtener ganador del hoyo actual
    const holeScores = players.map(player => {
      const score = player.scores.find(s => s.holeNumber === holeInfo.number);
      return {
        player,
        netScore: score ? score.netScore : 999
      };
    }).sort((a, b) => a.netScore - b.netScore);

    const winningScore = holeScores[0].netScore;
    const winners = holeScores.filter(h => h.netScore === winningScore);
    
    const potAmount = bettingOptions.unitPerHole * players.length + carryoverAmount;

    if (winners.length === 1) {
      // Hay ganador único, se lleva todo el pozo acumulado
      return {
        winner: winners[0].player.name,
        amount: potAmount,
        newCarryover: 0
      };
    } else {
      // Empate, se acumula para el siguiente hoyo
      return {
        winner: null,
        amount: 0,
        newCarryover: potAmount
      };
    }
  }

  static calculateSegmentBetting(
    round: { players: RoundPlayer[]; bettingOptions: BettingOptions; gameFormats: { strokePlay: boolean; matchPlay: boolean } },
    segment: 'frontNine' | 'backNine' | 'total'
  ): { 
    playerBalances: Record<string, number>; 
    totalPot: number;
    strokePlayResults?: { playerBalances: Record<string, number>; totalPot: number };
    matchPlayResults?: { playerBalances: Record<string, number>; totalPot: number };
  } {
    const combinedBalances: Record<string, number> = {};
    let totalPot = 0;

    // Initialize player balances
    round.players.forEach(player => {
      combinedBalances[player.id] = 0;
    });

    // Define holes for this segment
    const segmentHoles = segment === 'frontNine' ? [1,2,3,4,5,6,7,8,9] :
                        segment === 'backNine' ? [10,11,12,13,14,15,16,17,18] :
                        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];

    // Add Oyeses earnings to player balances first
    if (round.bettingOptions.oyeses) {
      const par3Holes = segment === 'frontNine' ? [1,2,3,4,5,6,7,8,9].filter(h => {
        const holeInfo = round.players[0]?.scores.find(s => s.holeNumber === h);
        return holeInfo?.par === 3;
      }) : segment === 'backNine' ? [10,11,12,13,14,15,16,17,18].filter(h => {
        const holeInfo = round.players[0]?.scores.find(s => s.holeNumber === h);
        return holeInfo?.par === 3;
      }) : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].filter(h => {
        const holeInfo = round.players[0]?.scores.find(s => s.holeNumber === h);
        return holeInfo?.par === 3;
      });

      par3Holes.forEach(holeNumber => {
        const oyesesWinner = round.players.find(player => {
          const score = player.scores.find(s => s.holeNumber === holeNumber);
          return score?.oyesesWinner === player.id;
        });

        if (oyesesWinner) {
          const winAmount = round.bettingOptions.unitPerHole * round.players.length;
          combinedBalances[oyesesWinner.id] += winAmount;
          totalPot += winAmount;

          // Others lose their bet
          round.players.forEach(player => {
            if (player.id !== oyesesWinner.id) {
              combinedBalances[player.id] -= round.bettingOptions.unitPerHole;
            }
          });
        }
      });
    }

    // Calculate Stroke Play if enabled and segment is active
    if (round.gameFormats.strokePlay && round.bettingOptions.segments[segment]) {
      const strokeBalances: Record<string, number> = {};
      round.players.forEach(player => {
        strokeBalances[player.id] = 0;
      });

      // Calculate segment scores
      const segmentScores = round.players.map(player => {
        const relevantScores = player.scores.filter(score => 
          segmentHoles.includes(score.holeNumber)
        );
        
        const grossTotal = relevantScores.reduce((sum, score) => sum + score.grossScore, 0);
        const netTotal = relevantScores.reduce((sum, score) => sum + score.netScore, 0);
        
        return {
          player,
          grossTotal,
          netTotal,
          holesPlayed: relevantScores.length
        };
      }).sort((a, b) => a.netTotal - b.netTotal);

      // Find winner (lowest net score)
      if (segmentScores.length > 0 && segmentScores[0].holesPlayed > 0) {
        const winners = segmentScores.filter(playerScore => 
          playerScore.netTotal === segmentScores[0].netTotal
        );
        
        if (winners.length === 1) {
          const winner = winners[0];
          const betAmount = round.bettingOptions.strokePlayBets[segment];
          const totalWinnings = betAmount * (round.players.length - 1);
          
          strokeBalances[winner.player.id] += totalWinnings;
          segmentScores.forEach(playerScore => {
            if (playerScore.player.id !== winner.player.id) {
              strokeBalances[playerScore.player.id] -= betAmount;
            }
          });
          
          totalPot += totalWinnings;
        }
      }

      // Add to combined balances
      Object.keys(strokeBalances).forEach(playerId => {
        combinedBalances[playerId] += strokeBalances[playerId];
      });
    }

    // Calculate Match Play if enabled and segment is active
    if (round.gameFormats.matchPlay && round.bettingOptions.segments[segment]) {
      const matchBalances: Record<string, number> = {};
      round.players.forEach(player => {
        matchBalances[player.id] = 0;
      });

      // Calculate match play points for this segment
      const matchPoints = round.players.map(player => {
        let points = 0;
        
        segmentHoles.forEach(holeNumber => {
          const playerScore = player.scores.find(s => s.holeNumber === holeNumber);
          if (!playerScore) return;
          
          const otherScores = round.players
            .filter(p => p.id !== player.id)
            .map(p => p.scores.find(s => s.holeNumber === holeNumber))
            .filter(s => s !== undefined);
          
          if (otherScores.length === 0) return;
          
          const playerNet = playerScore.netScore;
          const bestOtherNet = Math.min(...otherScores.map(s => s!.netScore));
          
          if (playerNet < bestOtherNet) {
            points += 1; // Win the hole
          } else if (playerNet > bestOtherNet) {
            points -= 1; // Lose the hole
          }
          // Tie = 0 points
        });
        
        return {
          player,
          points
        };
      }).sort((a, b) => b.points - a.points);

      // Award match play winnings
      if (matchPoints.length > 0) {
        const winners = matchPoints.filter(mp => mp.points === matchPoints[0].points);
        
        if (winners.length === 1 && matchPoints[0].points > 0) {
          const winner = winners[0];
          const betAmount = round.bettingOptions.matchPlayBets[segment];
          const totalWinnings = betAmount * (round.players.length - 1);
          
          matchBalances[winner.player.id] += totalWinnings;
          round.players.forEach(player => {
            if (player.id !== winner.player.id) {
              matchBalances[player.id] -= betAmount;
            }
          });
          
          totalPot += totalWinnings;
        }
      }

      // Add to combined balances
      Object.keys(matchBalances).forEach(playerId => {
        combinedBalances[playerId] += matchBalances[playerId];
      });
    }

    return {
      playerBalances: combinedBalances,
      totalPot
    };
  }

  static calculateTotalBetting(
    round: { players: RoundPlayer[]; bettingOptions: BettingOptions; gameFormat: 'stroke' | 'match' },
    holes: HoleInfo[]
  ): { playerBalances: Record<string, number>; totalPot: number } {
    const playerBalances: Record<string, number> = {};
    let totalPot = 0;

    // Initialize balances
    round.players.forEach(player => {
      playerBalances[player.id] = 0;
    });

    // Sum up all segments
    const frontNineResults = this.calculateSegmentBetting(
      { ...round, gameFormats: { strokePlay: round.gameFormat === 'stroke', matchPlay: round.gameFormat === 'match' } },
      'frontNine'
    );
    const backNineResults = this.calculateSegmentBetting(
      { ...round, gameFormats: { strokePlay: round.gameFormat === 'stroke', matchPlay: round.gameFormat === 'match' } },
      'backNine'
    );
    const totalResults = this.calculateSegmentBetting(
      { ...round, gameFormats: { strokePlay: round.gameFormat === 'stroke', matchPlay: round.gameFormat === 'match' } },
      'total'
    );

    // Combine all results
    [frontNineResults, backNineResults, totalResults].forEach(result => {
      Object.keys(result.playerBalances).forEach(playerId => {
        playerBalances[playerId] += result.playerBalances[playerId];
      });
      totalPot += result.totalPot;
    });

    return { playerBalances, totalPot };
  }

  static getStrokesReceived(playerHandicap: number, holeStrokeIndex: number): number {
    if (playerHandicap <= 0) return 0;
    
    if (playerHandicap <= 18) {
      return holeStrokeIndex <= playerHandicap ? 1 : 0;
    } else {
      // For handicaps > 18, player gets 2 strokes on some holes
      const extraStrokes = playerHandicap - 18;
      return holeStrokeIndex <= extraStrokes ? 2 : 1;
    }
  }
}