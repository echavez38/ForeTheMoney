import { BettingCalculator } from '../lib/betting';
import { RoundPlayer, HoleInfo, BettingOptions } from '../lib/types';

describe('BettingCalculator', () => {
  const testHole: HoleInfo = {
    number: 1,
    par: 4,
    strokeIndex: 7,
    distance: 385,
  };

  const testPlayers: RoundPlayer[] = [
    {
      id: '1',
      name: 'Player 1',
      handicap: 12,
      scores: [{ holeNumber: 1, grossScore: 5, netScore: 4, par: 4, strokeIndex: 7 }],
      grossTotal: 5,
      netTotal: 4,
      moneyBalance: 0,
    },
    {
      id: '2',
      name: 'Player 2',
      handicap: 8,
      scores: [{ holeNumber: 1, grossScore: 4, netScore: 4, par: 4, strokeIndex: 7 }],
      grossTotal: 4,
      netTotal: 4,
      moneyBalance: 0,
    },
    {
      id: '3',
      name: 'Player 3',
      handicap: 18,
      scores: [{ holeNumber: 1, grossScore: 6, netScore: 5, par: 4, strokeIndex: 7 }],
      grossTotal: 6,
      netTotal: 5,
      moneyBalance: 0,
    },
  ];

  describe('calculateNetScore', () => {
    it('should calculate net score correctly for handicap 12 on stroke index 7', () => {
      const netScore = BettingCalculator.calculateNetScore(5, 12, 7);
      expect(netScore).toBe(4); // 5 gross - 1 stroke = 4 net
    });

    it('should calculate net score correctly for handicap 8 on stroke index 7', () => {
      const netScore = BettingCalculator.calculateNetScore(4, 8, 7);
      expect(netScore).toBe(4); // 4 gross - 0 strokes = 4 net
    });

    it('should calculate net score correctly for handicap 18 on stroke index 7', () => {
      const netScore = BettingCalculator.calculateNetScore(6, 18, 7);
      expect(netScore).toBe(5); // 6 gross - 1 stroke = 5 net
    });

    it('should handle high handicap correctly', () => {
      const netScore = BettingCalculator.calculateNetScore(7, 36, 1);
      expect(netScore).toBe(5); // 7 gross - 2 strokes = 5 net
    });
  });

  describe('calculateHoleBetting', () => {
    const bettingOptions: BettingOptions = {
      skins: true,
      oyeses: true,
      foursomes: false,
      unitPerHole: 1.0,
    };

    it('should calculate oyeses correctly with tied best net score', () => {
      const results = BettingCalculator.calculateHoleBetting(
        testPlayers,
        1,
        testHole,
        bettingOptions
      );

      const oyesesResult = results.find(r => r.type === 'oyeses');
      expect(oyesesResult).toBeDefined();
      expect(oyesesResult?.tied).toBe(true);
      expect(oyesesResult?.winner).toBe(null);
      expect(oyesesResult?.amount).toBe(0);
    });

    it('should calculate skins correctly with tied best net score', () => {
      const results = BettingCalculator.calculateHoleBetting(
        testPlayers,
        1,
        testHole,
        bettingOptions
      );

      const skinsResult = results.find(r => r.type === 'skins');
      expect(skinsResult).toBeDefined();
      expect(skinsResult?.tied).toBe(true);
      expect(skinsResult?.winner).toBe(null);
      expect(skinsResult?.amount).toBe(0);
    });

    it('should award oyeses to single best net score', () => {
      const playersWithWinner = [...testPlayers];
      playersWithWinner[0].scores[0].netScore = 3; // Player 1 gets best net score

      const results = BettingCalculator.calculateHoleBetting(
        playersWithWinner,
        1,
        testHole,
        bettingOptions
      );

      const oyesesResult = results.find(r => r.type === 'oyeses');
      expect(oyesesResult?.winner).toBe('Player 1');
      expect(oyesesResult?.amount).toBe(1.0);
      expect(oyesesResult?.tied).toBe(false);
    });
  });

  describe('getStrokesReceived', () => {
    it('should calculate strokes received correctly for handicap 12', () => {
      expect(BettingCalculator.getStrokesReceived(12, 1)).toBe(1); // 0 + 1 = 1
      expect(BettingCalculator.getStrokesReceived(12, 7)).toBe(1); // 0 + 1 = 1
      expect(BettingCalculator.getStrokesReceived(12, 13)).toBe(0); // 0 + 0 = 0
    });

    it('should calculate strokes received correctly for handicap 18', () => {
      expect(BettingCalculator.getStrokesReceived(18, 1)).toBe(1); // 1 + 0 = 1
      expect(BettingCalculator.getStrokesReceived(18, 18)).toBe(1); // 1 + 0 = 1
    });

    it('should calculate strokes received correctly for handicap 36', () => {
      expect(BettingCalculator.getStrokesReceived(36, 1)).toBe(2); // 2 + 0 = 2
      expect(BettingCalculator.getStrokesReceived(36, 18)).toBe(2); // 2 + 0 = 2
    });
  });

  describe('calculateTotalBetting', () => {
    it('should calculate total betting balances correctly', () => {
      const round = {
        players: testPlayers,
        bettingOptions: {
          skins: false,
          oyeses: true,
          foursomes: false,
          unitPerHole: 1.0,
        },
      };

      const holes = [testHole];
      const balances = BettingCalculator.calculateTotalBetting(round, holes);

      expect(balances.size).toBe(3);
      expect(balances.get('Player 1')).toBeDefined();
      expect(balances.get('Player 2')).toBeDefined();
      expect(balances.get('Player 3')).toBeDefined();
    });
  });
});
