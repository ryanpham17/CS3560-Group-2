type Tile = any;

export interface PathStep {
  x: number;
  y: number;
  dx: number;
  dy: number;
  cost: { food: number; water: number };
  totalCost: number;
}

export interface VisionResult {
  target: { x: number; y: number };
  path: PathStep[];
  totalCost: number;
  distance: number;
}

export class Vision {
  private gameState: any;
  private playerX: number;
  private playerY: number;
  private visionRadius: number;
  private map: Tile[][];
  private mapSize: number;

  constructor(gameState: any) {
    this.gameState = gameState;
    this.playerX = gameState.player.x;
    this.playerY = gameState.player.y;
    this.visionRadius = gameState.visionRadius;
    this.map = gameState.map;
    this.mapSize = gameState.mapSize;
  }

  getVisibleTiles(): Array<{x: number, y: number, tile: Tile}> {
    const visible: Array<{x: number, y: number, tile: Tile}> = [];
    
    for (let dy = -this.visionRadius; dy <= this.visionRadius; dy++) {
      for (let dx = -this.visionRadius; dx <= this.visionRadius; dx++) {
        const checkX = this.playerX + dx;
        const checkY = this.playerY + dy;
        
        if (checkX < 0 || checkY < 0 || checkX >= this.mapSize || checkY >= this.mapSize) continue;
        
        const distanceSquared = dx*dx + dy*dy;
        if (distanceSquared > this.visionRadius * this.visionRadius) continue;
        
        const tile = this.map[checkY][checkX];
        if (tile && tile.isWalkable()) {
          visible.push({ x: checkX, y: checkY, tile });
        }
      }
    }
    
    return visible;
  }

  findPathToTile(targetX: number, targetY: number): PathStep[] | null {
    const queue: Array<[number, number, PathStep[], number]> = [
      [this.playerX, this.playerY, [], 0]
    ];
    
    const visited = new Set<string>();
    visited.add(`${this.playerX},${this.playerY}`);
    
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];
    
    while (queue.length > 0) {
      const [x, y, path, totalCost] = queue.shift()!;
      
      if (x === targetX && y === targetY) return path;
      
      for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;
        
        if (newX < 0 || newY < 0 || newX >= this.mapSize || newY >= this.mapSize) continue;
        
        const key = `${newX},${newY}`;
        if (visited.has(key)) continue;
        
        const tile = this.map[newY]?.[newX];
        if (!tile || !tile.isWalkable()) continue;
        
        const moveCost = tile.getMoveCost();
        const newTotalCost = totalCost + (moveCost.food + moveCost.water);
        visited.add(key);
        
        const newStep: PathStep = {
          x: newX,
          y: newY,
          dx: dir.dx,
          dy: dir.dy,
          cost: moveCost,
          totalCost: newTotalCost
        };
        
        queue.push([newX, newY, [...path, newStep], newTotalCost]);
      }
    }
    
    return null;
  }

  private findNthClosestResource(resourceType: string, nthClosest: number = 1): VisionResult | null {
    const visibleTiles = this.getVisibleTiles();
    const resources: Array<{
      x: number, y: number, distance: number, tile: Tile, moveCost: number
    }> = [];
    
    for (const {x, y, tile} of visibleTiles) {
      const resource = tile.getResource();
      if (resource && resource.type === resourceType) {
        const distance = Math.abs(x - this.playerX) + Math.abs(y - this.playerY);
        const moveCost = tile.getMoveCost();
        const totalMoveCost = moveCost.food + moveCost.water;
        
        resources.push({ x, y, distance, tile, moveCost: totalMoveCost });
      }
    }
    
    if (resources.length === 0) return null;
    
    resources.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.moveCost !== b.moveCost) return a.moveCost - b.moveCost;
      return b.x - a.x;
    });
    
    const targetIndex = Math.min(nthClosest - 1, resources.length - 1);
    const target = resources[targetIndex];
    
    const path = this.findPathToTile(target.x, target.y);
    if (!path) return null;
    
    const totalCost = path.reduce((sum, step) => sum + (step.cost.food + step.cost.water), 0);
    
    return {
      target: { x: target.x, y: target.y },
      path,
      totalCost,
      distance: target.distance
    };
  }

  closestFood(): VisionResult | null {
    return this.findNthClosestResource('animal', 1);
  }

  closestWater(): VisionResult | null {
    return this.findNthClosestResource('spring', 1);
  }

  closestGold(): VisionResult | null {
    return this.findNthClosestResource('gold', 1);
  }

  closestTrader(): VisionResult | null {
    return this.findNthClosestResource('trader', 1);
  }

  easiestPath(): VisionResult | null {
    const visibleTiles = this.getVisibleTiles();
    let easiestTile = null;
    let minCost = Infinity;
    let minDistance = Infinity;
    
    for (const {x, y, tile} of visibleTiles) {
      if (x === this.playerX && y === this.playerY) continue;
      
      const path = this.findPathToTile(x, y);
      if (!path) continue;
      
      const totalCost = path.reduce((sum, step) => sum + (step.cost.food + step.cost.water), 0);
      const distance = Math.abs(x - this.playerX) + Math.abs(y - this.playerY);
      
      if (totalCost < minCost || (totalCost === minCost && distance < minDistance)) {
        minCost = totalCost;
        minDistance = distance;
        easiestTile = { x, y, tile, path };
      }
    }
    
    if (!easiestTile) return null;
    
    return {
      target: { x: easiestTile.x, y: easiestTile.y },
      path: easiestTile.path,
      totalCost: minCost,
      distance: minDistance
    };
  }

  secondClosestFood(): VisionResult | null {
    return this.findNthClosestResource('animal', 2);
  }

  secondClosestWater(): VisionResult | null {
    return this.findNthClosestResource('spring', 2);
  }

  secondClosestGold(): VisionResult | null {
    return this.findNthClosestResource('gold', 2);
  }

  secondClosestTrader(): VisionResult | null {
    return this.findNthClosestResource('trader', 2);
  }

  scanArea() {
    const visibleTiles = this.getVisibleTiles();
    
    const foodTiles: Array<{x: number, y: number, distance: number}> = [];
    const waterTiles: Array<{x: number, y: number, distance: number}> = [];
    const goldTiles: Array<{x: number, y: number, distance: number}> = [];
    const traderTiles: Array<{x: number, y: number, distance: number}> = [];
    
    for (const {x, y, tile} of visibleTiles) {
      const resource = tile.getResource();
      if (!resource) continue;
      
      const distance = Math.abs(x - this.playerX) + Math.abs(y - this.playerY);
      
      switch (resource.type) {
        case 'animal': foodTiles.push({x, y, distance}); break;
        case 'spring': waterTiles.push({x, y, distance}); break;
        case 'gold': goldTiles.push({x, y, distance}); break;
        case 'trader': traderTiles.push({x, y, distance}); break;
      }
    }
    
    foodTiles.sort((a, b) => a.distance - b.distance);
    waterTiles.sort((a, b) => a.distance - b.distance);
    goldTiles.sort((a, b) => a.distance - b.distance);
    traderTiles.sort((a, b) => a.distance - b.distance);
    
    return { foodTiles, waterTiles, goldTiles, traderTiles };
  }
}