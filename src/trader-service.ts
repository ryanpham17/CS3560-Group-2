import { TraderType, TradeItem } from './types';
import type { TraderOffer } from './types';

/**
 * TraderService - Handles all trader-related business logic
 * Follows Single Responsibility Principle - only responsible for trader operations
 */
export class TraderService {
  /**
   * Generates a trader offer based on trader type
   */
  static generateOffer(traderType: TraderType): TraderOffer {
    const basePool: TraderOffer[] = [
      { item: TradeItem.FOOD, amount: 25, baseCost: 6 },
      { item: TradeItem.FOOD, amount: 35, baseCost: 8 },
      { item: TradeItem.WATER, amount: 25, baseCost: 6 },
      { item: TradeItem.WATER, amount: 35, baseCost: 8 },
      { item: TradeItem.LIFE, amount: 1, baseCost: 14 },
    ];
    const offer = { ...basePool[Math.floor(Math.random() * basePool.length)] };
    
    // Generous traders offer discounts
    if (traderType === TraderType.GENEROUS) {
      offer.baseCost = Math.max(3, Math.round(offer.baseCost * 0.85));
    }
    
    return offer;
  }


  /**
   * Gets the reward label for a trade
   */
  static getRewardLabel(item: TradeItem, amount: number): string {
    if (item === TradeItem.LIFE) {
      return 'gained +1 Life';
    }
    return `gained +${amount} ${item === TradeItem.FOOD ? 'Food' : 'Water'}`;
  }
}

