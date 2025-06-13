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

    return results;
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
    
    // Initialize combined balances
    round.players.forEach(player => {
      combinedBalances[player.id] = 0;
    });

    const result: {
      playerBalances: Record<string, number>;
      totalPot: number;
      strokePlayResults?: { playerBalances: Record<string, number>; totalPot: number };
      matchPlayResults?: { playerBalances: Record<string, number>; totalPot: number };
    } = {
      playerBalances: combinedBalances,
      totalPot: 0
    };

    // Define hole numbers for each segment
    const segmentHoles = segment === 'frontNine' ? [1,2,3,4,5,6,7,8,9] :
                        segment === 'backNine' ? [10,11,12,13,14,15,16,17,18] :
                        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];

    // Calculate Stroke Play if enabled and segment is active
    if (round.gameFormats.strokePlay && round.bettingOptions.segments[segment]) {
      const strokeBalances: Record<string, number> = {};
      round.players.forEach(player => {
        strokeBalances[player.id] = 0;
      });

      // Get bet amount for this segment
      const betAmount = segment === 'frontNine' ? round.bettingOptions.strokePlayBets.frontNine :
                       segment === 'backNine' ? round.bettingOptions.strokePlayBets.backNine :
                       round.bettingOptions.strokePlayBets.total;

      const strokePot = betAmount * round.players.length;
      totalPot += strokePot;

      // Calculate segment net scores
      const segmentScores = round.players.map(player => {
        const segmentNet = player.scores
          .filter(score => segmentHoles.includes(score.holeNumber))
          .reduce((sum, score) => sum + score.netScore, 0);

        return {
          player,
          netScore: segmentNet
        };
      });

      // Sort by net score (lowest wins)
      segmentScores.sort((a, b) => a.netScore - b.netScore);

      // Check for ties at the lowest score
      const winningScore = segmentScores[0].netScore;
      const winners = segmentScores.filter(s => s.netScore === winningScore);

      if (winners.length === 1) {
        // Clear winner - gets pot minus their contribution
        const winnerId = winners[0].player.id;
        strokeBalances[winnerId] = strokePot - betAmount;
        
        // Others lose their bet
        segmentScores.slice(1).forEach(playerScore => {
          strokeBalances[playerScore.player.id] = -betAmount;
        });
      } else {
        // Tie - winners split the non-contributing portion, others lose
        const nonContributingPot = strokePot - (betAmount * winners.length);
        const winnerShare = nonContributingPot / winners.length;
        
        winners.forEach(winner => {
          strokeBalances[winner.player.id] = winnerShare;
        });
        
        segmentScores.filter(s => s.netScore > winningScore).forEach(playerScore => {
          strokeBalances[playerScore.player.id] = -betAmount;
        });
      }

      // Add to combined balances
      Object.entries(strokeBalances).forEach(([playerId, amount]) => {
        combinedBalances[playerId] += amount;
      });

      result.strokePlayResults = { playerBalances: strokeBalances, totalPot: strokePot };
    }

    // Calculate Match Play if enabled and segment is active
    if (round.gameFormats.matchPlay && round.bettingOptions.segments[segment]) {
      const matchBalances: Record<string, number> = {};
      round.players.forEach(player => {
        matchBalances[player.id] = 0;
      });

      // Get bet amount for this segment
      const betAmount = segment === 'frontNine' ? round.bettingOptions.matchPlayBets.frontNine :
                       segment === 'backNine' ? round.bettingOptions.matchPlayBets.backNine :
                       round.bettingOptions.matchPlayBets.total;

      const matchPot = betAmount * round.players.length;
      totalPot += matchPot;

      // Calculate match play points - hole by hole competition
      const matchPoints: Record<string, number> = {};
      round.players.forEach(player => {
        matchPoints[player.id] = 0;
      });

      // Award points for each hole in the segment
      segmentHoles.forEach(holeNumber => {
        const holeScores = round.players.map(player => {
          const score = player.scores.find(s => s.holeNumber === holeNumber);
          return {
            player,
            netScore: score ? score.netScore : 999
          };
        }).sort((a, b) => a.netScore - b.netScore);

        // Award points: winner gets +1 point for the hole
        if (holeScores.length > 0) {
          const winningScore = holeScores[0].netScore;
          const holeWinners = holeScores.filter(h => h.netScore === winningScore);
          
          if (holeWinners.length === 1) {
            matchPoints[holeWinners[0].player.id] += 1;
          }
          // If tied on hole, no points awarded
        }
      });

      // Determine overall match play winner for the segment
      const sortedByPoints = Object.entries(matchPoints).sort(([,a], [,b]) => b - a);
      const maxPoints = sortedByPoints[0][1];
      const segmentWinners = sortedByPoints.filter(([, points]) => points === maxPoints);

      if (segmentWinners.length === 1) {
        // Clear match play winner
        const winnerId = segmentWinners[0][0];
        matchBalances[winnerId] = matchPot - betAmount;
        
        // Others lose their bet
        round.players.forEach(player => {
          if (player.id !== winnerId) {
            matchBalances[player.id] = -betAmount;
          }
        });
      } else {
        // Tie in match play - winners split non-contributing portion
        const nonContributingPot = matchPot - (betAmount * segmentWinners.length);
        const winnerShare = nonContributingPot / segmentWinners.length;
        
        segmentWinners.forEach(([winnerId]) => {
          matchBalances[winnerId] = winnerShare;
        });
        
        // Non-winners lose their bet
        round.players.forEach(player => {
          const isWinner = segmentWinners.some(([winnerId]) => winnerId === player.id);
          if (!isWinner) {
            matchBalances[player.id] = -betAmount;
          }
        });
      }

      // Add to combined balances
      Object.entries(matchBalances).forEach(([playerId, amount]) => {
        combinedBalances[playerId] += amount;
      });

      result.matchPlayResults = { playerBalances: matchBalances, totalPot: matchPot };
    }

    result.playerBalances = combinedBalances;
    result.totalPot = totalPot;

    return result;
  }

  static calculateTotalBetting(
    round: { players: RoundPlayer[]; bettingOptions: BettingOptions; gameFormat: 'stroke' | 'match' },
    holes: HoleInfo[]
  ): Record<string, number> {
    const playerBalances: Record<string, number> = {};
    
    round.players.forEach(player => {
      playerBalances[player.id] = 0;
    });

    // Calculate betting results for all three segments
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
    [frontNineResults, backNineResults, totalResults].forEach(segmentResult => {
      Object.entries(segmentResult.playerBalances).forEach(([playerId, amount]) => {
        playerBalances[playerId] += amount;
      });
    });

    return playerBalances;
  }

  static getStrokesReceived(playerHandicap: number, holeStrokeIndex: number): number {
    if (playerHandicap <= 0) return 0;
    
    const strokesPerHole = Math.floor(playerHandicap / 18);
    const extraStrokes = playerHandicap % 18;
    
    let strokes = strokesPerHole;
    if (holeStrokeIndex <= extraStrokes) {
      strokes += 1;
    }
    
    return strokes;
  }
}