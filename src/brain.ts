export type BrainPersonality = 'survivalist' | 'cautious' | 'balanced' | 'aggressive' | 'explorer';

export interface MoveScore {
  dx: number;
  dy: number;
  x: number;
  y: number;
  score: number;
  reason: string;
}

import { Vision } from '/home/kai/CS3560-Group-2/src/vision.ts';

export class Brain {
  personality: BrainPersonality;
  visitedTiles: Set<string>;
  
  constructor(personality: BrainPersonality = 'survivalist') {
    this.personality = personality;
    this.visitedTiles = new Set();
  }

  private getPossibleMoves(gameState: any): MoveScore[] {
    const moves: MoveScore[] = [];
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
            y: newY,
            score: 0,
            reason: ''
          });
        }
      }
    }

    return moves;
  }

  private findTrophyInVision(vision: any): {x: number, y: number} | null {
    try {
      const visibleTiles = vision.getVisibleTiles ? vision.getVisibleTiles() : [];
      for (const {x, y, tile} of visibleTiles) {
        const resource = tile.getResource();
        if (resource && resource.type === 'trophy') {
          return {x, y};
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  private getMoveToTarget(gameState: any, vision: any, targetX: number, targetY: number): {dx: number, dy: number, reason: string} | null {
    const path = vision['findPathToTile'](targetX, targetY);
    if (path && path.length > 0) {
      return {
        dx: path[0].dx,
        dy: path[0].dy,
        reason: 'Moving toward target'
      };
    }
    return null;
  }

  public calculateBestMove(gameState: any): {dx: number, dy: number, reason: string} | null {
    const possibleMoves = this.getPossibleMoves(gameState);
    if (possibleMoves.length === 0) return null;

    const vision = new Vision(gameState);
    const { food, water } = gameState.resources;
    
    const trophyPos = this.findTrophyInVision(vision);
    
    switch (this.personality) {
      case 'survivalist':
        return this.survivalistMove(gameState, vision, trophyPos, food, water);
      case 'cautious':
        return this.cautiousMove(gameState, vision, trophyPos, food, water);
      case 'balanced':
        return this.balancedMove(gameState, vision, trophyPos, food, water);
      case 'aggressive':
        return this.aggressiveMove(gameState, vision, trophyPos, food, water);
      case 'explorer':
        return this.explorerMove(gameState, vision, trophyPos, food, water);
    }
    
    return this.basicMove(gameState, possibleMoves);
  }

  private survivalistMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, food: number, water: number): {dx: number, dy: number, reason: string} | null {
    const foodPath = vision.closestFood();
    const waterPath = vision.closestWater();
    
    if (foodPath && waterPath) {
      if (foodPath.distance < waterPath.distance) {
        return {
          dx: foodPath.path[0].dx,
          dy: foodPath.path[0].dy,
          reason: 'SURVIVALIST: Closest food'
        };
      } else {
        return {
          dx: waterPath.path[0].dx,
          dy: waterPath.path[0].dy,
          reason: 'SURVIVALIST: Closest water'
        };
      }
    } else if (foodPath) {
      return {
        dx: foodPath.path[0].dx,
        dy: foodPath.path[0].dy,
        reason: 'SURVIVALIST: Only food found'
      };
    } else if (waterPath) {
      return {
        dx: waterPath.path[0].dx,
        dy: waterPath.path[0].dy,
        reason: 'SURVIVALIST: Only water found'
      };
    }
    
    if (trophyPos) {
      const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'SURVIVALIST: No resources, going to trophy' };
      }
    }
    
    return this.explorerMove(gameState, vision, trophyPos, food, water);
  }

  private cautiousMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, food: number, water: number): {dx: number, dy: number, reason: string} | null {
    if (food < 70) {
      const foodPath = vision.closestFood();
      if (foodPath) {
        return {
          dx: foodPath.path[0].dx,
          dy: foodPath.path[0].dy,
          reason: 'CAUTIOUS: Food below 70'
        };
      }
    }
    
    if (water < 70) {
      const waterPath = vision.closestWater();
      if (waterPath) {
        return {
          dx: waterPath.path[0].dx,
          dy: waterPath.path[0].dy,
          reason: 'CAUTIOUS: Water below 70'
        };
      }
    }
    
    if (trophyPos) {
      const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'CAUTIOUS: Going for trophy' };
      }
    }
    
    return this.explorerMove(gameState, vision, trophyPos, food, water);
  }

  private balancedMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, food: number, water: number): {dx: number, dy: number, reason: string} | null {
    if (food < 50) {
      const foodPath = vision.closestFood();
      if (foodPath) {
        return {
          dx: foodPath.path[0].dx,
          dy: foodPath.path[0].dy,
          reason: 'BALANCED: Food below 50'
        };
      }
    }
    
    if (water < 30) {
      const waterPath = vision.closestWater();
      if (waterPath) {
        return {
          dx: waterPath.path[0].dx,
          dy: waterPath.path[0].dy,
          reason: 'BALANCED: Water below 30'
        };
      }
    }
    
    if (trophyPos) {
      const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'BALANCED: Going for trophy' };
      }
    }
    
    return this.explorerMove(gameState, vision, trophyPos, food, water);
  }

  private aggressiveMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, food: number, water: number): {dx: number, dy: number, reason: string} | null {
    if (trophyPos) {
      const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'AGGRESSIVE: Trophy in sight!' };
      }
    }
    
    if (food < 20) {
      const foodPath = vision.closestFood();
      if (foodPath) {
        return {
          dx: foodPath.path[0].dx,
          dy: foodPath.path[0].dy,
          reason: 'AGGRESSIVE: Critical food need'
        };
      }
    }
    
    if (water < 20) {
      const waterPath = vision.closestWater();
      if (waterPath) {
        return {
          dx: waterPath.path[0].dx,
          dy: waterPath.path[0].dy,
          reason: 'AGGRESSIVE: Critical water need'
        };
      }
    }
    
    const trophyPath = this.findTrophyPath(vision);
    if (trophyPath) {
      return {
        dx: trophyPath.path[0].dx,
        dy: trophyPath.path[0].dy,
        reason: 'AGGRESSIVE: Searching for trophy'
      };
    }
    
    return this.explorerMove(gameState, vision, trophyPos, food, water);
  }

  private findTrophyPath(vision: Vision): any {
    const trophyPos = this.findTrophyInVision(vision);
    if (!trophyPos) return null;
    
    try {
      const path = vision['findPathToTile'](trophyPos.x, trophyPos.y);
      if (path && path.length > 0) {
        return {
          target: { x: trophyPos.x, y: trophyPos.y },
          path: path,
          distance: Math.abs(trophyPos.x) + Math.abs(trophyPos.y)
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  private explorerMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, food: number, water: number): {dx: number, dy: number, reason: string} | null {
    if (food < 30 || water < 30) {
      if (food < water) {
        const foodPath = vision.closestFood();
        if (foodPath) {
          return {
            dx: foodPath.path[0].dx,
            dy: foodPath.path[0].dy,
            reason: 'EXPLORER: Low on food'
          };
        }
      } else {
        const waterPath = vision.closestWater();
        if (waterPath) {
          return {
            dx: waterPath.path[0].dx,
            dy: waterPath.path[0].dy,
            reason: 'EXPLORER: Low on water'
          };
        }
      }
    }
    
    if (trophyPos) {
      const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'EXPLORER: Trophy found!' };
      }
    }
    
    const possibleMoves = this.getPossibleMoves(gameState);
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      const key = `${move.x},${move.y}`;
      
      if (!this.visitedTiles.has(key)) {
        score += 150;
      }
      
      const tile = gameState.map[move.y][move.x];
      const cost = tile.getMoveCost();
      score -= (cost.food + cost.water) * 5;
      
      score += Math.random() * 10;
      
      return { ...move, score };
    });
    
    scoredMoves.sort((a, b) => b.score - a.score);
    const bestMove = scoredMoves[0];
    
    this.visitedTiles.add(`${bestMove.x},${bestMove.y}`);
    
    return {
      dx: bestMove.dx,
      dy: bestMove.dy,
      reason: 'EXPLORER: Exploring'
    };
  }

  private basicMove(gameState: any, possibleMoves: MoveScore[]): {dx: number, dy: number, reason: string} {
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    return {
      dx: randomMove.dx,
      dy: randomMove.dy,
      reason: `${this.personality.toUpperCase()}: Random move`
    };
  }

  public resetMemory() {
    this.visitedTiles.clear();
  }

  public getPersonality(): BrainPersonality {
    return this.personality;
  }
}