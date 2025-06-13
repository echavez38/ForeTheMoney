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
    round: { players: RoundPlayer[]; bettingOptions: BettingOptions; gameFormat: 'stroke' | 'match' },
    holes: HoleInfo[],
    segment: 'frontNine' | 'backNine' | 'total'
  ): { playerBalances: Record<string, number>; totalPot: number } {
    const playerBalances: Record<string, number> = {};
    let totalPot = 0;

    round.players.forEach(player => {
      playerBalances[player.id] = 0;
    });

    const segmentHoles = segment === 'frontNine' ? holes.slice(0, 9) :
                        segment === 'backNine' ? holes.slice(9, 18) :
                        holes;

    if (round.gameFormat === 'stroke') {
      // Stroke play - calculate total scores for segment
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

      const unitValue = round.bettingOptions.unitPerHole * segmentHoles.length;
      
      // Award winnings
      if (grossWinner[0] !== netWinner[0]) {
        playerBalances[grossWinner[0]] += unitValue;
        playerBalances[netWinner[0]] += unitValue;
        totalPot += unitValue * 2;
      } else {
        playerBalances[grossWinner[0]] += unitValue * 2;
        totalPot += unitValue * 2;
      }
    } else {
      // Match play - hole by hole
      segmentHoles.forEach(holeInfo => {
        const holeResults = this.calculateHoleBetting(round.players, holeInfo, round.bettingOptions);
        holeResults.forEach(result => {
          if (result.winner && !result.tied) {
            const winnerId = round.players.find(p => p.name === result.winner)?.id;
            if (winnerId) {
              playerBalances[winnerId] += result.amount;
              totalPot += result.amount;
            }
          }
        });
      });
    }

    return { playerBalances, totalPot };
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
