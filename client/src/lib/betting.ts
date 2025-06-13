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
    holeNumber: number,
    holeInfo: HoleInfo,
    bettingOptions: BettingOptions
  ): BettingResult[] {
    const results: BettingResult[] = [];

    // Get scores for this hole
    const holeScores = players.map(player => {
      const score = player.scores.find(s => s.holeNumber === holeNumber);
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

  static calculateTotalBetting(
    round: { players: RoundPlayer[]; bettingOptions: BettingOptions },
    holes: HoleInfo[]
  ): Map<string, number> {
    const balances = new Map<string, number>();
    
    // Initialize balances
    round.players.forEach(player => {
      balances.set(player.name, 0);
    });

    // Calculate for each hole
    for (let holeNumber = 1; holeNumber <= holes.length; holeNumber++) {
      const holeInfo = holes[holeNumber - 1];
      const bettingResults = this.calculateHoleBetting(
        round.players,
        holeNumber,
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
    }

    return balances;
  }

  static getStrokesReceived(playerHandicap: number, holeStrokeIndex: number): number {
    return Math.floor(playerHandicap / 18) + 
      (holeStrokeIndex <= (playerHandicap % 18) ? 1 : 0);
  }
}
