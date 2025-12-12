import { Vision } from './vision';
import { BrainPersonality, MAX_RECENT_POSITIONS, DIFFICULTY_CONFIG, ResourceType, Difficulty } from './types';
import type { IGameState, IVision, Position } from './interfaces';
import type { IBrainStrategy } from './brain-strategies';
import { BrainStrategyFactory } from './brain-strategies';

export interface MoveScore {
  dx: number;
  dy: number;
  x: number;
  y: number;
  score: number;
  reason: string;
}

/**
 * Brain class using Strategy Pattern for different personalities
 * Follows Open/Closed Principle - open for extension, closed for modification
 */
export class Brain {
  private readonly personality: BrainPersonality;
  private readonly visitedTiles: Set<string>;
  private readonly recentPositions: string[];
  private readonly strategy: IBrainStrategy;
  private readonly helper: {
    getMoveToTarget: (gameState: IGameState, vision: IVision, targetX: number, targetY: number) => {dx: number, dy: number, reason: string} | null;
    getPossibleMoves: (gameState: IGameState) => Array<{dx: number, dy: number, x: number, y: number}>;
  };
  
  constructor(personality: BrainPersonality = BrainPersonality.GREEDY) {
    this.personality = personality;
    this.visitedTiles = new Set();
    this.recentPositions = [];
    
    // Create helper for shared functionality
    this.helper = {
      getMoveToTarget: this.getMoveToTarget.bind(this),
      getPossibleMoves: this.getPossibleMoves.bind(this)
    };
    
    // Create strategy based on personality (Strategy Pattern)
    this.strategy = BrainStrategyFactory.create(personality, this.helper);
  }

  private getPossibleMoves(gameState: IGameState): Array<{dx: number, dy: number, x: number, y: number}> {
    const moves: Array<{dx: number, dy: number, x: number, y: number}> = [];
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    const { x, y } = gameState.player;
    const mapSize = gameState.mapSize;

    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      
      if (newX >= 0 && newY >= 0 && newX < mapSize && newY < mapSize) {
        const tile = gameState.map[newY][newX];
        if (tile && tile.isWalkable()) {
          moves.push({
            dx: dir.dx,
            dy: dir.dy,
            x: newX,
            y: newY
          });
        }
      }
    }

    return moves;
  }

  private findTrophyInVision(vision: IVision): Position | null {
    const visibleTiles = vision.getVisibleTiles();
    for (const {x, y, tile} of visibleTiles) {
      const resource = tile.getResource();
      if (resource && resource.getType() === ResourceType.TROPHY) {
        return {x, y};
      }
    }
    return null;
  }

  private getMoveToTarget(_gameState: IGameState, vision: IVision, targetX: number, targetY: number): {dx: number, dy: number, reason: string} | null {
    const path = vision.findPathToTile(targetX, targetY);
    if (path && path.length > 0) {
      return {
        dx: path[0].dx,
        dy: path[0].dy,
        reason: 'Moving toward target'
      };
    }
    return null;
  }

  private getStartingResources(mapSize: number): { food: number; water: number } {
    // Infer difficulty from map size and return starting resources
    for (const config of Object.values(DIFFICULTY_CONFIG)) {
      if (config.size === mapSize) {
        return { food: config.food, water: config.water };
      }
    }
    // Default to easy if unknown
    return { food: DIFFICULTY_CONFIG[Difficulty.EASY].food, water: DIFFICULTY_CONFIG[Difficulty.EASY].water };
  }

  public calculateBestMove(gameState: IGameState): {dx: number, dy: number, reason: string} | null {
    const possibleMoves = this.getPossibleMoves(gameState);
    if (possibleMoves.length === 0) return null;

    const vision = new Vision(gameState);
    const { food, water } = gameState.resources;
    const startingResources = this.getStartingResources(gameState.mapSize);
    
    // Track current position to prevent loops
    const currentPos = `${gameState.player.x},${gameState.player.y}`;
    this.recentPositions.push(currentPos);
    // Keep only last MAX_RECENT_POSITIONS positions
    if (this.recentPositions.length > MAX_RECENT_POSITIONS) {
      this.recentPositions.shift();
    }
    
    const trophyPos = this.findTrophyInVision(vision);
    
    // Delegate to strategy (Strategy Pattern)
    const result = this.strategy.calculateMove(
      gameState,
      vision,
      trophyPos,
      food,
      water,
      startingResources,
      this.visitedTiles,
      this.recentPositions
    );
    
    if (result) {
      // Track the destination to prevent immediate return
      const nextPos = `${gameState.player.x + result.dx},${gameState.player.y + result.dy}`;
      this.visitedTiles.add(nextPos);
    }
    
    return result || this.basicMove(gameState, possibleMoves);
  }

  private basicMove(_gameState: IGameState, possibleMoves: Array<{dx: number, dy: number, x: number, y: number}>): {dx: number, dy: number, reason: string} {
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    return {
      dx: randomMove.dx,
      dy: randomMove.dy,
      reason: `${this.personality.toUpperCase()}: Random move`
    };
  }
}
