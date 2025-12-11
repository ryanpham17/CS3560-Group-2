import { Vision } from './vision';

export type BrainPersonality = 'greedy' | 'explorer' | 'aggressive';

export interface MoveScore {
  dx: number;
  dy: number;
  x: number;
  y: number;
  score: number;
  reason: string;
}

export class Brain {
  personality: BrainPersonality;
  visitedTiles: Set<string>;
  recentPositions: string[]; // Track last few positions to prevent loops
  
  constructor(personality: BrainPersonality = 'greedy') {
    this.personality = personality;
    this.visitedTiles = new Set();
    this.recentPositions = [];
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

  private findTrophyInVision(vision: Vision): {x: number, y: number} | null {
    const visibleTiles = vision.getVisibleTiles();
    for (const {x, y, tile} of visibleTiles) {
      const resource = tile.getResource();
      if (resource && resource.type === 'trophy') {
        return {x, y};
      }
    }
    return null;
  }

  private getMoveToTarget(_gameState: any, vision: Vision, targetX: number, targetY: number): {dx: number, dy: number, reason: string} | null {
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
    if (mapSize === 12) return { food: 100, water: 100 }; // easy
    if (mapSize === 16) return { food: 75, water: 75 };  // medium
    if (mapSize === 20) return { food: 50, water: 50 };  // hard
    // Default to easy if unknown
    return { food: 100, water: 100 };
  }

  public calculateBestMove(gameState: any): {dx: number, dy: number, reason: string} | null {
    const possibleMoves = this.getPossibleMoves(gameState);
    if (possibleMoves.length === 0) return null;

    const vision = new Vision(gameState);
    const { food, water } = gameState.resources;
    const startingResources = this.getStartingResources(gameState.mapSize);
    
    // Track current position to prevent loops
    const currentPos = `${gameState.player.x},${gameState.player.y}`;
    this.recentPositions.push(currentPos);
    // Keep only last 4 positions
    if (this.recentPositions.length > 4) {
      this.recentPositions.shift();
    }
    
    const trophyPos = this.findTrophyInVision(vision);
    
    let result: {dx: number, dy: number, reason: string} | null = null;
    switch (this.personality) {
      case 'greedy':
        result = this.greedyMove(gameState, vision, trophyPos, food, water, startingResources);
        break;
      case 'explorer':
        result = this.explorerMove(gameState, vision, trophyPos, food, water, startingResources);
        break;
      case 'aggressive':
        result = this.aggressiveMove(gameState, vision, trophyPos, food, water, startingResources);
        break;
    }
    
    if (result) {
      // Track the destination to prevent immediate return
      const nextPos = `${gameState.player.x + result.dx},${gameState.player.y + result.dy}`;
      this.visitedTiles.add(nextPos);
    }
    
    return result || this.basicMove(gameState, possibleMoves);
  }

  private greedyMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, _food: number, _water: number, _startingResources: { food: number; water: number }): {dx: number, dy: number, reason: string} | null {
    // Greedy: Collect EVERY resource in sight, then go for trophy
    // No thresholds, no percentages - just collect all visible resources first
    
    // Get all visible tiles and find all resources (food, water, gold)
    const visibleTiles = vision.getVisibleTiles();
    const availableResources: Array<{x: number, y: number, type: string, distance: number}> = [];
    
    for (const {x, y, tile} of visibleTiles) {
      const resource = tile.getResource();
      // Collect all resources except trophy and trader
      if (resource && resource.type !== 'trophy' && resource.type !== 'trader') {
        const distance = Math.abs(x - gameState.player.x) + Math.abs(y - gameState.player.y);
        availableResources.push({ x, y, type: resource.type, distance });
      }
    }
    
    // If ANY resources are visible, collect the closest one first
    if (availableResources.length > 0) {
      // Sort by distance and go to closest resource
      availableResources.sort((a, b) => a.distance - b.distance);
      const closestResource = availableResources[0];
      const move = this.getMoveToTarget(gameState, vision, closestResource.x, closestResource.y);
      if (move) {
        return { ...move, reason: `GREEDY: Collecting ${closestResource.type} resource` };
      }
    }
    
    // Only go for trophy if NO resources are visible
    if (trophyPos && availableResources.length === 0) {
      const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
      if (move) {
        return { ...move, reason: 'GREEDY: No resources visible, pursuing trophy' };
      }
    }
    
    // Fallback: explore to find resources
    return this.greedyFallback(gameState, vision);
  }

  private greedyFallback(gameState: any, _vision: Vision): {dx: number, dy: number, reason: string} | null {
    // Explore to find resources - prefer unvisited areas
    const possibleMoves = this.getPossibleMoves(gameState);
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      const tile = gameState.map[move.y][move.x];
      const cost = tile.getMoveCost();
      const key = `${move.x},${move.y}`;
      
      // Prefer low-cost terrain
      score -= (cost.food + cost.water) * 10;
      
      // STRONGLY prefer unvisited tiles (might have uncollected resources)
      if (!this.visitedTiles.has(key)) {
        score += 150;
      } else {
        // Penalize visited tiles, especially recently visited ones
        score -= 50;
        const recentIndex = this.recentPositions.indexOf(key);
        if (recentIndex >= 0) {
          score -= 200 - (recentIndex * 50);
        }
      }
      
      // Add small random factor to break ties and prevent loops
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

  private explorerMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, food: number, water: number, startingResources: { food: number; water: number }): {dx: number, dy: number, reason: string} | null {
    // Explorer: Maintains 50% of starting resources, but prioritizes trophy when visible
    const SAFE_THRESHOLD = Math.round(startingResources.food * 0.5);
    const CRITICAL_THRESHOLD = Math.round(startingResources.food * 0.25);
    
    // Critical: Must get resources immediately - emergency situation
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
      const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
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
    
    // Explorer fallback: move conservatively, strongly avoiding expensive terrain
    return this.explorerFallback(gameState, vision, food, water, startingResources);
  }

  private explorerFallback(gameState: any, vision: Vision, food: number, water: number, startingResources: { food: number; water: number }): {dx: number, dy: number, reason: string} | null {
    // Keep checking for resources - explorer always wants to maintain 50% threshold
    const SAFE_THRESHOLD = Math.round(startingResources.food * 0.5);
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
    
    const possibleMoves = this.getPossibleMoves(gameState);
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      const tile = gameState.map[move.y][move.x];
      const cost = tile.getMoveCost();
      const key = `${move.x},${move.y}`;
      
      // VERY strongly avoid expensive terrain (explorer avoids risks)
      score -= (cost.food + cost.water) * 40;
      
      // Prefer unvisited tiles but not as strongly (exploration is secondary)
      if (!this.visitedTiles.has(key)) {
        score += 20;
      } else {
        // Penalize visited tiles, especially recently visited
        score -= 30;
        const recentIndex = this.recentPositions.indexOf(key);
        if (recentIndex >= 0) {
          score -= 150 - (recentIndex * 30);
        }
      }
      
      // Add small random factor to break ties
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


  private aggressiveMove(gameState: any, vision: Vision, trophyPos: {x: number, y: number} | null, food: number, water: number, startingResources: { food: number; water: number }): {dx: number, dy: number, reason: string} | null {
    // Aggressive: Prioritizes trophy hunting above all, takes risks, only seeks resources when critically low (15% of starting)
    const CRITICAL_THRESHOLD = Math.round(startingResources.food * 0.15);
    const MINIMUM_THRESHOLD = Math.round(startingResources.food * 0.1); // Absolute minimum before death
    
    // Trophy is visible: Go for it immediately unless literally about to die
    if (trophyPos) {
      if (food >= MINIMUM_THRESHOLD && water >= MINIMUM_THRESHOLD) {
        const move = this.getMoveToTarget(gameState, vision, trophyPos.x, trophyPos.y);
        if (move) {
          return { ...move, reason: 'AGGRESSIVE: Trophy in sight - going for it!' };
        }
      }
    }
    
    // Only get resources if absolutely critical (below 15% or about to die)
    if (food < CRITICAL_THRESHOLD || water < CRITICAL_THRESHOLD) {
      const foodPath = vision.closestFood();
      const waterPath = vision.closestWater();
      
      // If both are critical, get the one that's lower
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
    
    // Search for trophy aggressively - explore areas likely to have trophy
    return this.aggressiveFallback(gameState, vision, food, water);
  }

  private aggressiveFallback(gameState: any, _vision: Vision, food: number, water: number): {dx: number, dy: number, reason: string} | null {
    const possibleMoves = this.getPossibleMoves(gameState);
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      const key = `${move.x},${move.y}`;
      
      // Prefer unvisited tiles (might find trophy)
      if (!this.visitedTiles.has(key)) {
        score += 100;
      } else {
        // Penalize visited tiles
        score -= 30;
        const recentIndex = this.recentPositions.indexOf(key);
        if (recentIndex >= 0) {
          score -= 100 - (recentIndex * 25);
        }
      }
      
      // Prefer moving toward map center (trophy often in center area)
      const mapCenter = gameState.mapSize / 2;
      const distToCenter = Math.abs(move.x - mapCenter) + Math.abs(move.y - mapCenter);
      score += (gameState.mapSize - distToCenter) * 2;
      
      // Only avoid expensive terrain when resources are very low
      const tile = gameState.map[move.y][move.x];
      const cost = tile.getMoveCost();
      if (food < 30 || water < 30) {
        score -= (cost.food + cost.water) * 10;
      }
      
      // Add small random factor to break ties
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

  private basicMove(_gameState: any, possibleMoves: MoveScore[]): {dx: number, dy: number, reason: string} {
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    return {
      dx: randomMove.dx,
      dy: randomMove.dy,
      reason: `${this.personality.toUpperCase()}: Random move`
    };
  }

}
