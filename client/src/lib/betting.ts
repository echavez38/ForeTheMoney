import { RoundPlayer, HoleInfo, BettingResult, BettingOptions, TeeSelection } from './types';

export class BettingCalculator {
  static calculateNetScore(
    grossScore: number,
    playerHandicap: number,
    holeStrokeIndex: number
  ): number {
    const strokesReceived = Math.floor(playerHandicap / 18) + 
      (holeStrokeIndex <= (playerHandicap % 18) ? 1 : 0);
    return grossScore - strokesReceived;
  }

  static calculateHoleBetting(
    players: RoundPlayer[],
    holeInfo: HoleInfo,
    bettingOptions: BettingOptions
  ): BettingResult[] {
    const results: BettingResult[] = [];

    // Get scores for this hole
    const holeScores = players.map(player => {
      const score = player.scores.find(s => s.holeNumber === holeInfo.number);
      return {
        player,
        grossScore: score?.grossScore || 0,
        netScore: score?.netScore || 0,
      };
    }).filter(s => s.grossScore > 0);

    if (holeScores.length === 0) return results;

    // Calculate Oyeses (best net score)
    if (bettingOptions.oyeses) {
      const bestNet = Math.min(...holeScores.map(s => s.netScore));
      const winners = holeScores.filter(s => s.netScore === bestNet);
      
      results.push({
        type: 'oyeses',
        winner: winners.length === 1 ? winners[0].player.name : null,
        amount: winners.length === 1 ? bettingOptions.unitPerHole : 0,
        tied: winners.length > 1,
      });
    }

    // Calculate Skins (unique best net score)
    if (bettingOptions.skins) {
      const bestNet = Math.min(...holeScores.map(s => s.netScore));
      const winners = holeScores.filter(s => s.netScore === bestNet);
      
      results.push({
        type: 'skins',
        winner: winners.length === 1 ? winners[0].player.name : null,
        amount: winners.length === 1 ? bettingOptions.unitPerHole * 2 : 0,
        tied: winners.length > 1,
      });
    }

    return results;
  }

  static calculateSegmentBetting(
    round: { players: RoundPlayer[]; bettingOptions: BettingOptions; gameFormats: { strokePlay: boolean; matchPlay: boolean } },
    holes: HoleInfo[],
    segment: 'frontNine' | 'backNine' | 'total'
  ): { strokePlay?: { playerBalances: Record<string, number>; totalPot: number }; matchPlay?: { playerBalances: Record<string, number>; totalPot: number } } {
    const result: { strokePlay?: { playerBalances: Record<string, number>; totalPot: number }; matchPlay?: { playerBalances: Record<string, number>; totalPot: number } } = {};

    const segmentHoles = segment === 'frontNine' ? holes.slice(0, 9) :
                        segment === 'backNine' ? holes.slice(9, 18) :
                        holes;

    // Calculate Stroke Play if enabled
    if (round.gameFormats.strokePlay) {
      const strokeBalances: Record<string, number> = {};
      let strokePot = 0;

      round.players.forEach(player => {
        strokeBalances[player.id] = 0;
      });

      const playerTotals: Record<string, { gross: number; net: number; name: string }> = {};
      
      round.players.forEach(player => {
        const segmentScores = player.scores.filter(score => 
          segmentHoles.some(hole => hole.number === score.holeNumber)
        );
        
        const grossTotal = segmentScores.reduce((sum, score) => sum + score.grossScore, 0);
        const netTotal = segmentScores.reduce((sum, score) => sum + score.netScore, 0);
        
        playerTotals[player.id] = { gross: grossTotal, net: netTotal, name: player.name };
      });

      // Find winners for gross and net
      const grossWinner = Object.entries(playerTotals).reduce((min, [id, data]) => 
        data.gross < min[1].gross ? [id, data] : min
      );
      const netWinner = Object.entries(playerTotals).reduce((min, [id, data]) => 
        data.net < min[1].net ? [id, data] : min
      );

      // Use specific stroke play bet amount for this segment
      const unitValue = segment === 'frontNine' ? round.bettingOptions.strokePlayBets.frontNine :
                       segment === 'backNine' ? round.bettingOptions.strokePlayBets.backNine :
                       round.bettingOptions.strokePlayBets.total;
      
      // Award winnings
      if (grossWinner[0] !== netWinner[0]) {
        strokeBalances[grossWinner[0]] += unitValue;
        strokeBalances[netWinner[0]] += unitValue;
        strokePot += unitValue * 2;
      } else {
        strokeBalances[grossWinner[0]] += unitValue * 2;
        strokePot += unitValue * 2;
      }

      result.strokePlay = { playerBalances: strokeBalances, totalPot: strokePot };
    }

    // Calculate Match Play if enabled
    if (round.gameFormats.matchPlay) {
      const matchBalances: Record<string, number> = {};
      let matchPot = 0;

      round.players.forEach(player => {
        matchBalances[player.id] = 0;
      });

      // Use specific match play bet amount for this segment
      const unitValue = segment === 'frontNine' ? round.bettingOptions.matchPlayBets.frontNine :
                       segment === 'backNine' ? round.bettingOptions.matchPlayBets.backNine :
                       round.bettingOptions.matchPlayBets.total;

      // Calculate hole-by-hole match play for the segment
      let holesWonByPlayer: Record<string, number> = {};
      round.players.forEach(player => {
        holesWonByPlayer[player.id] = 0;
      });

      segmentHoles.forEach(holeInfo => {
        // Find who won this hole (lowest net score)
        const holeWinners: string[] = [];
        let bestScore = Infinity;
        
        round.players.forEach(player => {
          const holeScore = player.scores.find(s => s.holeNumber === holeInfo.number);
          if (holeScore && holeScore.netScore < bestScore) {
            bestScore = holeScore.netScore;
            holeWinners.length = 0;
            holeWinners.push(player.id);
          } else if (holeScore && holeScore.netScore === bestScore) {
            holeWinners.push(player.id);
          }
        });

        // Award hole wins (only if not tied)
        if (holeWinners.length === 1) {
          holesWonByPlayer[holeWinners[0]]++;
        }
      });

      // Determine segment winner and award prize
      const maxHolesWon = Math.max(...Object.values(holesWonByPlayer));
      const segmentWinners = Object.keys(holesWonByPlayer).filter(id => holesWonByPlayer[id] === maxHolesWon);
      
      if (segmentWinners.length === 1 && maxHolesWon > 0) {
        matchBalances[segmentWinners[0]] += unitValue;
        matchPot += unitValue;
      }

      result.matchPlay = { playerBalances: matchBalances, totalPot: matchPot };
    }

    return result;
  }

  static calculateTotalBetting(
    round: { players: RoundPlayer[]; bettingOptions: BettingOptions; gameFormat: 'stroke' | 'match' },
    holes: HoleInfo[]
  ): Map<string, number> {
    const balances = new Map<string, number>();
    
    // Initialize balances
    round.players.forEach(player => {
      balances.set(player.name, 0);
    });

    // Calculate for each hole
    holes.forEach(holeInfo => {
      const bettingResults = this.calculateHoleBetting(
        round.players,
        holeInfo,
        round.bettingOptions
      );

      bettingResults.forEach(result => {
        if (result.winner && result.amount > 0) {
          const currentBalance = balances.get(result.winner) || 0;
          balances.set(result.winner, currentBalance + result.amount);
          
          // Subtract from other players
          const costPerPlayer = result.amount / (round.players.length - 1);
          round.players.forEach(player => {
            if (player.name !== result.winner) {
              const currentBalance = balances.get(player.name) || 0;
              balances.set(player.name, currentBalance - costPerPlayer);
            }
          });
        }
      });
    });

    return balances;
  }

  static getStrokesReceived(playerHandicap: number, holeStrokeIndex: number): number {
    return Math.floor(playerHandicap / 18) + 
      (holeStrokeIndex <= (playerHandicap % 18) ? 1 : 0);
  }
}
