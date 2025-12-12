import type { IGameState, IVision, Position } from './interfaces';
import { BRAIN_THRESHOLD_MULTIPLIERS, ResourceType } from './types';

/**
 * Strategy interface for brain personalities (Strategy Pattern)
 * Each personality implements its own decision-making algorithm
 */
export interface IBrainStrategy {
  calculateMove(
    gameState: IGameState,
    vision: IVision,
    trophyPos: Position | null,
    food: number,
    water: number,
    startingResources: { food: number; water: number },
    visitedTiles: Set<string>,
    recentPositions: string[]
  ): {dx: number, dy: number, reason: string} | null;
}

/**
 * Helper interface for shared brain functionality
 */
interface BrainHelper {
  getMoveToTarget(gameState: IGameState, vision: IVision, targetX: number, targetY: number): {dx: number, dy: number, reason: string} | null;
  getPossibleMoves(gameState: IGameState): Array<{dx: number, dy: number, x: number, y: number}>;
}

/**
 * Greedy Strategy: Collects EVERY resource in sight before going for trophy
 */
export class GreedyStrategy implements IBrainStrategy {
  constructor(private helper: BrainHelper) {}

  calculateMove(
    gameState: IGameState,
    vision: IVision,
    trophyPos: Position | null,
    _food: number,
    _water: number,
    _startingResources: { food: number; water: number },
    visitedTiles: Set<string>,
    recentPositions: string[]
  ): {dx: number, dy: number, reason: string} | null {
    // Get all visible tiles and find all resources (food, water, gold)
    const visibleTiles = vision.getVisibleTiles();
    const availableResources: Array<{x: number, y: number, type: string, distance: number}> = [];
    
    for (const {x, y, tile} of visibleTiles) {
      const resource = tile.getResource();
      // Collect all resources except trophy and trader
      if (resource) {
        const resourceType = resource.getType();
        if (resourceType !== ResourceType.TROPHY && resourceType !== ResourceType.TRADER) {
          const distance = Math.abs(x - gameState.player.x) + Math.abs(y - gameState.player.y);
          availableResources.push({ x, y, type: resourceType, distance });
        }
      }
    }
    
    // If ANY resources are visible, collect the closest one first
    if (availableResources.length > 0) {
      availableResources.sort((a, b) => a.distance - b.distance);
      const closestResource = availableResources[0];
      const move = this.helper.getMoveToTarget(gameState, vision, closestResource.x, closestResource.y);
      if (move) {
        return { ...move, reason: `GREEDY: Collecting ${closestResource.type} resource` };
      }
    }
    
    // Only go for trophy if NO resources are visible
    if (trophyPos && availableResources.length === 0) {
      const move = this.helper.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'GREEDY: No resources visible, pursuing trophy' };
      }
    }
    
    // Fallback: explore to find resources
    return this.greedyFallback(gameState, vision, visitedTiles, recentPositions);
  }

  private greedyFallback(
    gameState: IGameState,
    _vision: IVision,
    visitedTiles: Set<string>,
    recentPositions: string[]
  ): {dx: number, dy: number, reason: string} | null {
    const possibleMoves = this.helper.getPossibleMoves(gameState);
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      const tile = gameState.map[move.y][move.x];
      const cost = tile.getMoveCost();
      const key = `${move.x},${move.y}`;
      
      // Prefer low-cost terrain
      score -= (cost.food + cost.water) * 10;
      
      // STRONGLY prefer unvisited tiles
      if (!visitedTiles.has(key)) {
        score += 150;
      } else {
        score -= 50;
        const recentIndex = recentPositions.indexOf(key);
        if (recentIndex >= 0) {
          score -= 200 - (recentIndex * 50);
        }
      }
      
      score += Math.random() * 5;
      return { ...move, score };
    });
    
    scoredMoves.sort((a, b) => b.score - a.score);
    const bestMove = scoredMoves[0];
    
    return {
      dx: bestMove.dx,
      dy: bestMove.dy,
      reason: 'GREEDY: Exploring to find resources'
    };
  }
}

/**
 * Explorer Strategy: Maintains 50% of starting resources, prioritizes trophy when visible
 */
export class ExplorerStrategy implements IBrainStrategy {
  constructor(private helper: BrainHelper) {}

  calculateMove(
    gameState: IGameState,
    vision: IVision,
    trophyPos: Position | null,
    food: number,
    water: number,
    startingResources: { food: number; water: number },
    visitedTiles: Set<string>,
    recentPositions: string[]
  ): {dx: number, dy: number, reason: string} | null {
    const SAFE_THRESHOLD = Math.round(startingResources.food * BRAIN_THRESHOLD_MULTIPLIERS.EXPLORER_SAFE);
    const CRITICAL_THRESHOLD = Math.round(startingResources.food * BRAIN_THRESHOLD_MULTIPLIERS.EXPLORER_CRITICAL);
    
    // Critical: Must get resources immediately
    if (food < CRITICAL_THRESHOLD || water < CRITICAL_THRESHOLD) {
      const foodPath = vision.closestFood();
      const waterPath = vision.closestWater();
      
      if (food < water && foodPath) {
        return {
          dx: foodPath.path[0].dx,
          dy: foodPath.path[0].dy,
          reason: 'EXPLORER: Critical food need - emergency'
        };
      } else if (waterPath) {
        return {
          dx: waterPath.path[0].dx,
          dy: waterPath.path[0].dy,
          reason: 'EXPLORER: Critical water need - emergency'
        };
      }
    }
    
    // If trophy is visible, go for it (unless critically low)
    if (trophyPos) {
      const move = this.helper.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'EXPLORER: Trophy visible, pursuing it' };
      }
    }
    
    // Below safe threshold: Restock to maintain 50%
    if (food < SAFE_THRESHOLD) {
      const foodPath = vision.closestFood();
      if (foodPath) {
        return {
          dx: foodPath.path[0].dx,
          dy: foodPath.path[0].dy,
          reason: 'EXPLORER: Maintaining food at 50% threshold'
        };
      }
    }
    
    if (water < SAFE_THRESHOLD) {
      const waterPath = vision.closestWater();
      if (waterPath) {
        return {
          dx: waterPath.path[0].dx,
          dy: waterPath.path[0].dy,
          reason: 'EXPLORER: Maintaining water at 50% threshold'
        };
      }
    }
    
    return this.explorerFallback(gameState, vision, food, water, startingResources, visitedTiles, recentPositions);
  }

  private explorerFallback(
    gameState: IGameState,
    vision: IVision,
    food: number,
    water: number,
    startingResources: { food: number; water: number },
    visitedTiles: Set<string>,
    recentPositions: string[]
  ): {dx: number, dy: number, reason: string} | null {
    const SAFE_THRESHOLD = Math.round(startingResources.food * BRAIN_THRESHOLD_MULTIPLIERS.EXPLORER_SAFE);
    const foodPath = vision.closestFood();
    const waterPath = vision.closestWater();
    
    if (food < SAFE_THRESHOLD && foodPath) {
      return {
        dx: foodPath.path[0].dx,
        dy: foodPath.path[0].dy,
        reason: 'EXPLORER: Found food, maintaining 50% threshold'
      };
    }
    
    if (water < SAFE_THRESHOLD && waterPath) {
      return {
        dx: waterPath.path[0].dx,
        dy: waterPath.path[0].dy,
        reason: 'EXPLORER: Found water, maintaining 50% threshold'
      };
    }
    
    const possibleMoves = this.helper.getPossibleMoves(gameState);
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      const tile = gameState.map[move.y][move.x];
      const cost = tile.getMoveCost();
      const key = `${move.x},${move.y}`;
      
      // VERY strongly avoid expensive terrain
      score -= (cost.food + cost.water) * 40;
      
      if (!visitedTiles.has(key)) {
        score += 20;
      } else {
        score -= 30;
        const recentIndex = recentPositions.indexOf(key);
        if (recentIndex >= 0) {
          score -= 150 - (recentIndex * 30);
        }
      }
      
      score += Math.random() * 3;
      return { ...move, score };
    });
    
    scoredMoves.sort((a, b) => b.score - a.score);
    const bestMove = scoredMoves[0];
    
    return {
      dx: bestMove.dx,
      dy: bestMove.dy,
      reason: 'EXPLORER: Moving conservatively, avoiding expensive terrain'
    };
  }
}

/**
 * Aggressive Strategy: Prioritizes trophy hunting, only seeks resources when critically low
 */
export class AggressiveStrategy implements IBrainStrategy {
  constructor(private helper: BrainHelper) {}

  calculateMove(
    gameState: IGameState,
    vision: IVision,
    trophyPos: Position | null,
    food: number,
    water: number,
    startingResources: { food: number; water: number },
    visitedTiles: Set<string>,
    recentPositions: string[]
  ): {dx: number, dy: number, reason: string} | null {
    const CRITICAL_THRESHOLD = Math.round(startingResources.food * BRAIN_THRESHOLD_MULTIPLIERS.AGGRESSIVE_CRITICAL);
    const MINIMUM_THRESHOLD = Math.round(startingResources.food * BRAIN_THRESHOLD_MULTIPLIERS.AGGRESSIVE_MINIMUM);
    
    // Trophy is visible: Go for it immediately unless literally about to die
    if (trophyPos) {
      if (food >= MINIMUM_THRESHOLD && water >= MINIMUM_THRESHOLD) {
        const move = this.helper.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
        if (move) {
          return { ...move, reason: 'AGGRESSIVE: Trophy in sight - going for it!' };
        }
      }
    }
    
    // Only get resources if absolutely critical
    if (food < CRITICAL_THRESHOLD || water < CRITICAL_THRESHOLD) {
      const foodPath = vision.closestFood();
      const waterPath = vision.closestWater();
      
      if (food < water && foodPath) {
        return {
          dx: foodPath.path[0].dx,
          dy: foodPath.path[0].dy,
          reason: 'AGGRESSIVE: Critical food need - must survive'
        };
      } else if (waterPath) {
        return {
          dx: waterPath.path[0].dx,
          dy: waterPath.path[0].dy,
          reason: 'AGGRESSIVE: Critical water need - must survive'
        };
      }
    }
    
    return this.aggressiveFallback(gameState, vision, food, water, visitedTiles, recentPositions);
  }

  private aggressiveFallback(
    gameState: IGameState,
    _vision: IVision,
    food: number,
    water: number,
    visitedTiles: Set<string>,
    recentPositions: string[]
  ): {dx: number, dy: number, reason: string} | null {
    const possibleMoves = this.helper.getPossibleMoves(gameState);
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      const key = `${move.x},${move.y}`;
      
      // Prefer unvisited tiles (might find trophy)
      if (!visitedTiles.has(key)) {
        score += 100;
      } else {
        score -= 30;
        const recentIndex = recentPositions.indexOf(key);
        if (recentIndex >= 0) {
          score -= 100 - (recentIndex * 25);
        }
      }
      
      // Prefer moving toward map center
      const mapCenter = gameState.mapSize / 2;
      const distToCenter = Math.abs(move.x - mapCenter) + Math.abs(move.y - mapCenter);
      score += (gameState.mapSize - distToCenter) * 2;
      
      // Only avoid expensive terrain when resources are very low
      const tile = gameState.map[move.y][move.x];
      const cost = tile.getMoveCost();
      if (food < 30 || water < 30) {
        score -= (cost.food + cost.water) * 10;
      }
      
      score += Math.random() * 5;
      return { ...move, score };
    });
    
    scoredMoves.sort((a, b) => b.score - a.score);
    const bestMove = scoredMoves[0];
    
    return {
      dx: bestMove.dx,
      dy: bestMove.dy,
      reason: 'AGGRESSIVE: Searching for trophy'
    };
  }
}

/**
 * Factory to create strategy instances
 */
export class BrainStrategyFactory {
  static create(strategyType: string, helper: BrainHelper): IBrainStrategy {
    switch (strategyType) {
      case 'greedy':
        return new GreedyStrategy(helper);
      case 'explorer':
        return new ExplorerStrategy(helper);
      case 'aggressive':
        return new AggressiveStrategy(helper);
      default:
        return new GreedyStrategy(helper);
    }
  }
}

