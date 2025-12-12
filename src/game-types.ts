import type { TraderOffer, TraderType } from './types';
import type { ResourceType } from './types';

/**
 * Type definitions for game operation results
 * Follows type safety best practices
 */
export type MoveResult = 
  | { success: true }
  | { gameOver: true; message: string }
  | { gameWon: true; message: string; resourceCollected: ResourceType; nextLevel: true }
  | { lostLife: true; message: string }
  | { trader: true; message: string; traderType: TraderType; offer: TraderOffer }
  | { traderUnavailable: true; message: string }
  | { message: string; resourceCollected: ResourceType };

export type CounterOfferResult =
  | { error: string; traderGone?: boolean }
  | { success: true; message: string; nextOffer: TraderOffer };

