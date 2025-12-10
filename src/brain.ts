export type BrainPersonality = 'survivalist' | 'explorer';

interface MoveScore {
  dx: number;
  dy: number;
  x: number;
  y: number;
  score: number;
  reason: string;
}

export class Brain {
  private personality: BrainPersonality;
  private visitedTiles: Set<string>;
  private consecutiveSameDirection: number;
  private lastDirection: {dx: number, dy: number} | null;
  private lastTargetDirection: {dx: number, dy: number} | null;
  private moveHistory: Array<{x: number, y: number}>;

  constructor(personality: BrainPersonality = 'survivalist') {
    this.personality = personality;
    this.visitedTiles = new Set();
    this.consecutiveSameDirection = 0;
    this.lastDirection = null;
    this.lastTargetDirection = null;
    this.moveHistory = [];
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

  private scanVisibleArea(gameState: any): {
    trophyTarget: {x: number, y: number} | null;
    waterTarget: {x: number, y: number} | null;
    foodTarget: {x: number, y: number} | null;
  } {
    const { x: playerX, y: playerY } = gameState.player;
    const visionRadius = gameState.playerInstance.getVisionRadius();
    const mapSize = gameState.mapSize;
    
    let trophyTarget = null;
    let waterTarget = null;
    let foodTarget = null;
    
    for (let dy = -visionRadius; dy <= visionRadius; dy++) {
      for (let dx = -visionRadius; dx <= visionRadius; dx++) {
        const checkX = playerX + dx;
        const checkY = playerY + dy;
        
        if (checkX < 0 || checkY < 0 || checkX >= mapSize || checkY >= mapSize) continue;
        
        const distanceSquared = dx*dx + dy*dy;
        if (distanceSquared > visionRadius * visionRadius) continue;
        
        const tile = gameState.map[checkY][checkX];
        if (!tile) continue;
        
        const resource = tile.getResource();
        if (!resource) continue;
        
        if (resource.type === 'trophy') {
          trophyTarget = {x: checkX, y: checkY};
          return { trophyTarget, waterTarget: null, foodTarget: null };
        }
        
        if (resource.type === 'spring') {
          waterTarget = {x: checkX, y: checkY};
        }
        
        if (resource.type === 'animal') {
          foodTarget = {x: checkX, y: checkY};
        }
      }
    }
    
    return { trophyTarget, waterTarget, foodTarget };
  }

  private getDirectionTowardTarget(playerX: number, playerY: number, targetX: number, targetY: number): {dx: number, dy: number} {
    const dx = targetX - playerX;
    const dy = targetY - playerY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return { dx: dx > 0 ? 1 : -1, dy: 0 };
    } else {
      return { dx: 0, dy: dy > 0 ? 1 : -1 };
    }
  }

  private tryGoToTarget(target: {x: number, y: number} | null, possibleMoves: MoveScore[], playerX: number, playerY: number, reason: string): {dx: number, dy: number, reason: string} | null {
    if (!target) return null;
    
    const direction = this.getDirectionTowardTarget(playerX, playerY, target.x, target.y);
    this.lastTargetDirection = direction;
    
    const targetMoves = possibleMoves.filter(move => 
      move.dx === direction.dx && move.dy === direction.dy
    );
    
    if (targetMoves.length > 0) {
      this.updateDirectionTracking(targetMoves[0].dx, targetMoves[0].dy);
      this.visitedTiles.add(`${targetMoves[0].x},${targetMoves[0].y}`);
      this.moveHistory.push({x: targetMoves[0].x, y: targetMoves[0].y});
      if (this.moveHistory.length > 50) this.moveHistory.shift();
      return {
        dx: targetMoves[0].dx,
        dy: targetMoves[0].dy,
        reason: reason
      };
    }
    
    return null;
  }

  private tryContinueLastDirection(possibleMoves: MoveScore[]): {dx: number, dy: number, reason: string} | null {
    if (!this.lastTargetDirection) return null;
    
    const memoryMoves = possibleMoves.filter(move => 
      move.dx === this.lastTargetDirection!.dx && 
      move.dy === this.lastTargetDirection!.dy
    );
    
    if (memoryMoves.length > 0) {
      this.updateDirectionTracking(memoryMoves[0].dx, memoryMoves[0].dy);
      this.visitedTiles.add(`${memoryMoves[0].x},${memoryMoves[0].y}`);
      this.moveHistory.push({x: memoryMoves[0].x, y: memoryMoves[0].y});
      if (this.moveHistory.length > 50) this.moveHistory.shift();
      return {
        dx: memoryMoves[0].dx,
        dy: memoryMoves[0].dy,
        reason: 'Continuing last direction'
      };
    }
    
    return null;
  }

  public calculateBestMove(gameState: any): {dx: number, dy: number, reason: string} | null {
    const possibleMoves = this.getPossibleMoves(gameState);
    if (possibleMoves.length === 0) return null;

    if (this.personality === 'survivalist') {
      return this.calculateSurvivalistMove(gameState, possibleMoves);
    }

    if (this.personality === 'explorer') {
      return this.calculateExplorerMove(gameState, possibleMoves);
    }

    return this.calculateSurvivalistMove(gameState, possibleMoves);
  }

  private calculateSurvivalistMove(gameState: any, possibleMoves: MoveScore[]): {dx: number, dy: number, reason: string} | null {
    const { x: playerX, y: playerY } = gameState.player;
    const { food, water } = gameState.resources;
    const visible = this.scanVisibleArea(gameState);
    
    const waterMove = this.tryGoToTarget(visible.waterTarget, possibleMoves, playerX, playerY, 'SURVIVALIST: Getting water');
    if (waterMove) return waterMove;
    
    const foodMove = this.tryGoToTarget(visible.foodTarget, possibleMoves, playerX, playerY, 'SURVIVALIST: Getting food');
    if (foodMove) return foodMove;
    
    const trophyMove = this.tryGoToTarget(visible.trophyTarget, possibleMoves, playerX, playerY, 'SURVIVALIST: Going for trophy');
    if (trophyMove) return trophyMove;
    
    const continueMove = this.tryContinueLastDirection(possibleMoves);
    if (continueMove) return continueMove;
    
    const scoredMoves = possibleMoves.map(move => {
      let score = 0;
      let reason = '';
      
      const tile = gameState.map[move.y][move.x];
      const moveCost = tile.getMoveCost();
      const visitedKey = `${move.x},${move.y}`;
      const isVisited = this.visitedTiles.has(visitedKey);

      const foodAfterMove = food - moveCost.food;
      const waterAfterMove = water - moveCost.water;
      
      if (foodAfterMove < 0 || waterAfterMove < 0) {
        score -= 100000;
        reason = 'SURVIVALIST: Cannot afford move';
        return { ...move, score, reason };
      }
      
      if (food < 20 || water < 20) {
        score -= 10000;
        reason = 'SURVIVALIST: CRITICAL LOW RESOURCES';
      }
      
      const costPenalty = (moveCost.food + moveCost.water) * 50;
      score -= costPenalty;
      
      if (!isVisited) {
        score += 200;
        if (!reason) reason = 'SURVIVALIST: Exploring new area';
      } else {
        score -= 100;
      }
      
      if (this.lastDirection) {
        if (move.dx === -this.lastDirection.dx && move.dy === -this.lastDirection.dy) {
          score -= 500;
          if (!reason) reason = 'SURVIVALIST: AVOIDING BACKTRACK';
        }
      }
      
      const resource = tile.getResource();
      if (resource) {
        if (resource.type === 'spring') {
          const waterNeed = Math.max(0, 100 - water) / 100;
          score += 1000 * waterNeed;
          if (!reason) reason = 'SURVIVALIST: Adjacent water!';
        } else if (resource.type === 'animal') {
          const foodNeed = Math.max(0, 100 - food) / 100;
          score += 1000 * foodNeed;
          if (!reason) reason = 'SURVIVALIST: Adjacent food!';
        } else if (resource.type === 'trophy') {
          score += 20000;
          if (!reason) reason = 'SURVIVALIST: ADJACENT TROPHY!';
        }
      }
      
      score += Math.random() * 10;
      
      return {
        dx: move.dx,
        dy: move.dy,
        x: move.x,
        y: move.y,
        score: score,
        reason: reason || 'SURVIVALIST: Exploring'
      };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    
    if (scoredMoves.length === 0) return null;
    
    const bestMove = scoredMoves[0];
    this.updateDirectionTracking(bestMove.dx, bestMove.dy);
    this.visitedTiles.add(`${bestMove.x},${bestMove.y}`);
    this.moveHistory.push({x: bestMove.x, y: bestMove.y});
    if (this.moveHistory.length > 50) this.moveHistory.shift();
    
    return {
      dx: bestMove.dx,
      dy: bestMove.dy,
      reason: bestMove.reason
    };
  }

  private calculateExplorerMove(gameState: any, possibleMoves: MoveScore[]): {dx: number, dy: number, reason: string} | null {
    const { x: playerX, y: playerY } = gameState.player;
    const visionRadius = gameState.playerInstance.getVisionRadius();
    
    const explorationMove = this.findBestUnexploredDirection(gameState, possibleMoves);
    if (explorationMove) return explorationMove;
    
    const unvisitedMoves = possibleMoves.filter(move => {
      const key = `${move.x},${move.y}`;
      return !this.visitedTiles.has(key);
    });
    
    if (unvisitedMoves.length > 0) {
      const bestUnvisited = unvisitedMoves.reduce((best, current) => {
        const currentScore = this.getExplorerMoveScore(gameState, current);
        const bestScore = this.getExplorerMoveScore(gameState, best);
        return currentScore > bestScore ? current : best;
      }, unvisitedMoves[0]);
      
      this.updateDirectionTracking(bestUnvisited.dx, bestUnvisited.dy);
      this.visitedTiles.add(`${bestUnvisited.x},${bestUnvisited.y}`);
      this.moveHistory.push({x: bestUnvisited.x, y: bestUnvisited.y});
      if (this.moveHistory.length > 50) this.moveHistory.shift();
      return {
        dx: bestUnvisited.dx,
        dy: bestUnvisited.dy,
        reason: 'EXPLORER: Moving to unvisited tile'
      };
    }
    
    const scoredMoves = possibleMoves.map(move => {
      return {
        ...move,
        score: this.getExplorerMoveScore(gameState, move),
        reason: 'EXPLORER: Choosing best visited tile'
      };
    });
    
    scoredMoves.sort((a, b) => b.score - a.score);
    
    if (scoredMoves.length === 0) return null;
    
    const bestMove = scoredMoves[0];
    
    if (this.isInLoop()) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      this.updateDirectionTracking(randomMove.dx, randomMove.dy);
      this.visitedTiles.add(`${randomMove.x},${randomMove.y}`);
      this.moveHistory.push({x: randomMove.x, y: randomMove.y});
      if (this.moveHistory.length > 50) this.moveHistory.shift();
      return {
        dx: randomMove.dx,
        dy: randomMove.dy,
        reason: 'EXPLORER: Random move to break loop'
      };
    }
    
    this.updateDirectionTracking(bestMove.dx, bestMove.dy);
    this.visitedTiles.add(`${bestMove.x},${bestMove.y}`);
    this.moveHistory.push({x: bestMove.x, y: bestMove.y});
    if (this.moveHistory.length > 50) this.moveHistory.shift();
    
    return {
      dx: bestMove.dx,
      dy: bestMove.dy,
      reason: bestMove.reason
    };
  }

  private getExplorerMoveScore(gameState: any, move: MoveScore): number {
    let score = 0;
    const visitedKey = `${move.x},${move.y}`;
    const isVisited = this.visitedTiles.has(visitedKey);
    const recentKey = `${move.x},${move.y}`;
    const isRecent = this.moveHistory.some(pos => pos.x === move.x && pos.y === move.y);
    
    if (!isVisited) {
      score += 1000;
    } else if (!isRecent) {
      score += 100;
    } else {
      score -= 500;
    }
    
    if (this.lastDirection) {
      if (move.dx === -this.lastDirection.dx && move.dy === -this.lastDirection.dy) {
        score -= 800;
      } else if (move.dx === this.lastDirection.dx && move.dy === this.lastDirection.dy) {
        if (this.consecutiveSameDirection < 2) {
          score += 50;
        } else {
          score -= 200;
        }
      }
    }
    
    const tile = gameState.map[move.y][move.x];
    const moveCost = tile.getMoveCost();
    const costPenalty = (moveCost.food + moveCost.water) * 3;
    score -= costPenalty;
    
    const resource = tile.getResource();
    if (resource && resource.type === 'trader') {
      score -= 300;
    }
    
    score += Math.random() * 30;
    
    return score;
  }

  private isInLoop(): boolean {
    if (this.moveHistory.length < 4) return false;
    
    const recent = this.moveHistory.slice(-4);
    
    const positions = new Set<string>();
    for (const pos of recent) {
      const key = `${pos.x},${pos.y}`;
      if (positions.has(key)) return true;
      positions.add(key);
    }
    
    if (recent[0].x === recent[2].x && recent[0].y === recent[2].y &&
        recent[1].x === recent[3].x && recent[1].y === recent[3].y) {
      return true;
    }
    
    return false;
  }

  private findBestUnexploredDirection(gameState: any, possibleMoves: MoveScore[]): {dx: number, dy: number, reason: string} | null {
    const { x: playerX, y: playerY } = gameState.player;
    const visionRadius = gameState.playerInstance.getVisionRadius();
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (const move of possibleMoves) {
      let newTilesVisible = 0;
      const newX = playerX + move.dx;
      const newY = playerY + move.dy;
      
      for (let dy = -visionRadius; dy <= visionRadius; dy++) {
        for (let dx = -visionRadius; dx <= visionRadius; dx++) {
          const checkX = newX + dx;
          const checkY = newY + dy;
          
          if (checkX < 0 || checkY < 0 || checkX >= gameState.mapSize || checkY >= gameState.mapSize) continue;
          
          const distanceSquared = dx*dx + dy*dy;
          if (distanceSquared > visionRadius * visionRadius) continue;
          
          const key = `${checkX},${checkY}`;
          if (!this.visitedTiles.has(key)) {
            newTilesVisible++;
          }
        }
      }
      
      const visitedKey = `${move.x},${move.y}`;
      const isVisited = this.visitedTiles.has(visitedKey);
      const moveScore = (newTilesVisible * 20) + (isVisited ? -50 : 100);
      
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    }
    
    if (bestMove && bestScore > 0) {
      this.updateDirectionTracking(bestMove.dx, bestMove.dy);
      this.visitedTiles.add(`${bestMove.x},${bestMove.y}`);
      this.moveHistory.push({x: bestMove.x, y: bestMove.y});
      if (this.moveHistory.length > 50) this.moveHistory.shift();
      return {
        dx: bestMove.dx,
        dy: bestMove.dy,
        reason: `EXPLORER: ${Math.round(bestScore/20)} new tiles visible`
      };
    }
    
    return null;
  }

  private updateDirectionTracking(dx: number, dy: number): void {
    if (this.lastDirection && dx === this.lastDirection.dx && dy === this.lastDirection.dy) {
      this.consecutiveSameDirection++;
    } else {
      this.consecutiveSameDirection = 0;
    }
    this.lastDirection = { dx, dy };
  }

  public resetMemory(): void {
    this.visitedTiles.clear();
    this.consecutiveSameDirection = 0;
    this.lastDirection = null;
    this.lastTargetDirection = null;
    this.moveHistory = [];
  }

  public getPersonality(): BrainPersonality {
    return this.personality;
  }
}