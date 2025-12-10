import React, { useState, useEffect } from 'react';
import { AutoPlayControls } from '/home/kai/CS3560-Group-2/src/autoplay.tsx';

// ============================================
// ABSTRACTION: Base GameObject class
// Abstract base class that all game entities inherit from
// ============================================
class GameObject {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    if (this.constructor === GameObject) {
      throw new Error("GameObject is abstract and cannot be instantiated");
    }
    this.x = x;
    this.y = y;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// ============================================
// INHERITANCE & POLYMORPHISM: Terrain hierarchy
// Different terrain types inherit from Terrain base class
// ============================================
class Terrain {
  name: string;
  color: string;

  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }

  // POLYMORPHISM: Each terrain overrides this method
  getCost(): { food: number; water: number } {
    throw new Error("getCost() must be implemented by subclass");
  }

  getColor() {
    return this.color;
  }

  isWalkable() {
    return true;
  }
}

// INHERITANCE: Specific terrain types inherit from Terrain
class GrassTerrain extends Terrain {
  constructor() {
    super('grass', '#7cb342');
  }

  getCost() {
    return { food: 1, water: 1 };
  }
}

class DesertTerrain extends Terrain {
  constructor() {
    super('desert', '#fdd835');
  }

  getCost() {
    return { food: 1, water: 3 }; // POLYMORPHISM: Different implementation
  }
}

class ForestTerrain extends Terrain {
  constructor() {
    super('forest', '#2e7d32');
  }

  getCost() {
    return { food: 2, water: 1 }; // POLYMORPHISM: Different implementation
  }
}

class MountainTerrain extends Terrain {
  constructor() {
    super('mountain', '#616161');
  }

  getCost() {
    return { food: 3, water: 2 }; // POLYMORPHISM: Different implementation
  }
}

class SwampTerrain extends Terrain {
  constructor() {
    super('swamp', '#558b2f');
  }

  getCost() {
    return { food: 2, water: 2 }; // POLYMORPHISM: Different implementation
  }
}

class WallTerrain extends Terrain {
  constructor() {
    super('wall', '#5d4037');
  }

  getCost() {
    return { food: 0, water: 0 };
  }

  isWalkable() {
    return false; // POLYMORPHISM: Walls override walkability
  }
}

// ============================================
// INHERITANCE & POLYMORPHISM: Resource hierarchy
// Different resources inherit from Resource base class
// ============================================
class Resource {
  type: string;
  icon: string;

  constructor(type: string, icon: string) {
    this.type = type;
    this.icon = icon;
  }

  getIcon() {
    return this.icon;
  }

  // POLYMORPHISM: Each resource type provides different bonuses
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyEffect(_playerResources: PlayerResources): PlayerResources {
    throw new Error("applyEffect() must be implemented by subclass");
  }

  getMessage(): string {
    throw new Error("getMessage() must be implemented by subclass");
  }
}

type PlayerResources = {
  food: number;
  water: number;
  gold: number;
  lives: number;
  level?: number;
};

type TraderOffer = {
  item: 'food' | 'water' | 'life';
  amount: number;
  baseCost: number;
};

// INHERITANCE: Specific resource types
class SpringResource extends Resource {
  constructor() {
    super('spring', '💧');
  }

  applyEffect(playerResources: PlayerResources): PlayerResources {
    return {
      ...playerResources,
      water: playerResources.water + 30,
    };
  }

  getMessage() {
    return '+30 Water from spring!';
  }
}

class AnimalResource extends Resource {
  constructor() {
    super('animal', '🦌');
  }

  applyEffect(playerResources: PlayerResources): PlayerResources {
    return {
      ...playerResources,
      food: playerResources.food + 30,
    };
  }

  getMessage() {
    return '+30 Food from hunting!';
  }
}

class GoldResource extends Resource {
  constructor() {
    super('gold', '💰');
  }

  applyEffect(playerResources: PlayerResources): PlayerResources {
    return {
      ...playerResources,
      gold: playerResources.gold + 10,
    };
  }

  getMessage() {
    return '+10 Gold collected!';
  }
}

class TrophyResource extends Resource {
  constructor() {
    super('trophy', '🏆');
  }

  applyEffect(playerResources: PlayerResources): PlayerResources {
    return playerResources; // Trophy doesn't change resources
  }

  getMessage() {
    return 'Victory! You collected the trophy!';
  }
}

class TraderResource extends Resource {
  traderType: 'regular' | 'impatient' | 'generous';
  state: 'idle' | 'awaitOffer' | 'unavailable';
  counterOfferCount: number; // counts failed counter-offer attempts
  unavailableUntilTurn: number;

  constructor(traderType: 'regular' | 'impatient' | 'generous' = 'regular') {
    super('trader', '🧙');
    this.traderType = traderType;
    this.state = 'idle';
    this.counterOfferCount = 0;
    this.unavailableUntilTurn = 0;
  }

  applyEffect(playerResources: PlayerResources): PlayerResources {
    return playerResources; // Trader interaction handled separately
  }

  getMessage() {
    const typeNames = {
      regular: 'Regular Trader',
      impatient: 'Impatient Trader',
      generous: 'Generous Trader',
    } as const;
    return `Found a ${typeNames[this.traderType]}!`;
  }

  isAvailable(currentTurn: number) {
    if (this.traderType === 'impatient' && currentTurn < this.unavailableUntilTurn) {
      return false;
    }
    return this.state !== 'unavailable';
  }

  setState(state: 'idle' | 'awaitOffer' | 'unavailable') {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  incrementCounter() {
    this.counterOfferCount++;
  }

  resetCounter() {
    this.counterOfferCount = 0;
  }

  getCounterOfferCount() {
    return this.counterOfferCount;
  }

  setUnavailable(currentTurn: number) {
    this.state = 'unavailable';
    this.unavailableUntilTurn = currentTurn + 5;
  }

  getTraderType() {
    return this.traderType;
  }
}

// ============================================
// HIERARCHY: Tile contains Terrain and Resource
// Composition pattern - Tile "has-a" Terrain and "has-a" Resource
// ============================================
class Tile {
  terrain: Terrain;
  resource: Resource | null;

  constructor(terrain: Terrain, resource: Resource | null = null) {
    this.terrain = terrain;
    this.resource = resource;
  }

  getTerrain() {
    return this.terrain;
  }

  getResource() {
    return this.resource;
  }

  removeResource() {
    this.resource = null;
  }

  isWalkable() {
    return this.terrain.isWalkable();
  }

  getMoveCost() {
    return this.terrain.getCost();
  }
}

// ============================================
// INHERITANCE: Player inherits from GameObject
// ============================================
class Player extends GameObject {
  food: number;
  water: number;
  gold: number;
  visionRadius: number;
  lives: number;

  constructor(
    x: number,
    y: number,
    food: number,
    water: number,
    gold: number,
    visionRadius = 5,
    lives = 3,
  ) {
    super(x, y);
    this.food = food;
    this.water = water;
    this.gold = gold;
    this.visionRadius = visionRadius;
    this.lives = lives;
  }

  move(newX: number, newY: number) {
    this.setPosition(newX, newY);
  }

  getResources(): PlayerResources {
    return {
      food: this.food,
      water: this.water,
      gold: this.gold,
      lives: this.lives,
    };
  }

  spendResources(food: number, water: number) {
    this.food -= food;
    this.water -= water;
  }

  hasEnoughResources(food: number, water: number) {
    return this.food >= food && this.water >= water;
  }

  collectResource(resource: Resource) {
    const newResources = resource.applyEffect(this.getResources());
    this.food = newResources.food;
    this.water = newResources.water;
    this.gold = newResources.gold;
  }

  getVisionRadius() {
    return this.visionRadius;
  }

  // Check if a tile is within player's vision (circular radius)
  canSeeTile(tileX: number, tileY: number) {
    const dx = tileX - this.x;
    const dy = tileY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.visionRadius;
  }

  addLife() {
    this.lives++;
  }

  loseLife() {
    this.lives--;
  }

  getLives() {
    return this.lives;
  }
}

// ============================================
// ABSTRACTION & HIERARCHY: GameMap manages Tiles
// Encapsulates map generation and tile management
// ============================================
class GameMap {
  size: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tiles: Tile[][];
  trophyX: number;
  trophyY: number;

  constructor(size: number, difficulty: 'easy' | 'medium' | 'hard') {
    this.size = size;
    this.difficulty = difficulty;
    // Place the trophy on a random walkable tile inside the map borders
    this.trophyX = 1 + Math.floor(Math.random() * (this.size - 2 - 1 + 1));
    this.trophyY = 1 + Math.floor(Math.random() * (this.size - 2 - 1 + 1));
    this.tiles = this.generateMap();
  }

  generateMap() {
    const tiles: Tile[][] = [];
    for (let y = 0; y < this.size; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.size; x++) {
        if (this.isBorder(x, y)) {
          row.push(new Tile(new WallTerrain()));
        } else {
          const terrain = this.createRandomTerrain();
          const resource = this.createResourceForTile(x, y, this.difficulty);
          row.push(new Tile(terrain, resource));
        }
      }
      tiles.push(row);
    }
    return tiles;
  }

  isBorder(x: number, y: number) {
    return x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1;
  }

  // Factory method pattern - creates terrain instances
  createRandomTerrain() {
    const rand = Math.random();
    if (rand < 0.4) return new GrassTerrain();
    if (rand < 0.6) return new DesertTerrain();
    if (rand < 0.75) return new ForestTerrain();
    if (rand < 0.85) return new MountainTerrain();
    return new SwampTerrain();
  }

  // Factory method pattern - creates resource instances
  createResourceForTile(
    x: number,
    y: number,
    difficulty: 'easy' | 'medium' | 'hard',
  ): Resource | null {
    // Single trophy placed at a random interior tile chosen when the map is created
    if (x === this.trophyX && y === this.trophyY) {
      return new TrophyResource();
    }

    // Difficulty affects spawn rates (further reduced to keep the world sparse)
    const rates: Record<
      'easy' | 'medium' | 'hard',
      { trader: number; spring: number; animal: number; gold: number }
    > = {
      // Easy: still relatively generous, but with noticeably fewer resources
      easy: { trader: 0.02, spring: 0.05, animal: 0.06, gold: 0.06 },
      // Medium: leaner map, players must plan routes
      medium: { trader: 0.015, spring: 0.035, animal: 0.045, gold: 0.045 },
      // Hard: very sparse resources, focused on survival
      hard: { trader: 0.01, spring: 0.025, animal: 0.035, gold: 0.035 },
    };

    const rate = rates[difficulty] || rates.easy;
    const rand = Math.random();

    if (rand < rate.trader) {
      // Random trader type
      const traderRand = Math.random();
      if (traderRand < 0.33) return new TraderResource('regular');
      if (traderRand < 0.66) return new TraderResource('impatient');
      return new TraderResource('generous');
    }
    if (rand < rate.trader + rate.spring) return new SpringResource();
    if (rand < rate.trader + rate.spring + rate.animal) return new AnimalResource();
    if (rand < rate.trader + rate.spring + rate.animal + rate.gold) return new GoldResource();
    return null;
  }

  getTileAt(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return null;
    return this.tiles[y][x];
  }

  isValidPosition(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  getTiles() {
    return this.tiles;
  }
}

type VisionType = 'focused' | 'cautious' | 'keen-eyed' | 'far-sight';
type Difficulty = 'easy' | 'medium' | 'hard';


type GameStateSnapshot = {
  map: Tile[][];
  player: { x: number; y: number };
  resources: PlayerResources;
  gameOver: boolean;
  gameWon: boolean;
  mapSize: number;
  visionRadius: number;
  playerInstance: Player;
  currentLevel: number;
};

// ============================================
// ABSTRACTION: Game class - Main controller
// Encapsulates all game logic and coordinates between objects
// ============================================
class Game {
  difficulty: Difficulty;
  visionType: VisionType;
  currentLevel: number;
  currentTurn: number;
  map!: GameMap;
  player!: Player;
  gameOver: boolean;
  gameWon: boolean;
  traderTile: Tile | null;
  activeTrader: TraderResource | null;
  activeOffer: TraderOffer | null;

  constructor(
    difficulty: Difficulty,
    visionType: VisionType,
    startingResources: (PlayerResources & { level: number }) | null = null,
  ) {
    this.difficulty = difficulty;
    this.visionType = visionType;
    this.currentLevel = startingResources ? startingResources.level : 1;
    this.currentTurn = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.traderTile = null;
    this.activeTrader = null;
    this.activeOffer = null;
    this.setupGame(startingResources);
  }

  setupGame(startingResources: (PlayerResources & { level: number }) | null = null) {
    const config = this.getDifficultyConfig();
    const visionRadius = this.getVisionRadius();
    this.map = new GameMap(config.size, this.difficulty);

    if (startingResources) {
      // Continue with saved resources
      this.player = new Player(
        1,
        1,
        startingResources.food,
        startingResources.water,
        startingResources.gold,
        visionRadius,
        startingResources.lives,
      );
    } else {
      // Start fresh
      this.player = new Player(1, 1, config.food, config.water, 0, visionRadius, 3);
    }

    this.gameOver = false;
    this.gameWon = false;
    this.traderTile = null;
    this.activeTrader = null;
    this.activeOffer = null;
  }

  generateTraderOffer(traderType: TraderResource['traderType']): TraderOffer {
    const basePool: TraderOffer[] = [
      { item: 'food', amount: 25, baseCost: 6 },
      { item: 'food', amount: 35, baseCost: 8 },
      { item: 'water', amount: 25, baseCost: 6 },
      { item: 'water', amount: 35, baseCost: 8 },
      { item: 'life', amount: 1, baseCost: 14 },
    ];
    const offer = { ...basePool[Math.floor(Math.random() * basePool.length)] };
    if (traderType === 'generous') {
      offer.baseCost = Math.max(3, Math.round(offer.baseCost * 0.85));
    }
    // Impatient traders now use the same baseCost; their behavior is handled
    // purely by acceptance probability in the trading logic.
    return offer;
  }

  getVisionRadius() {
    const visionConfig: Record<VisionType, number> = {
      'focused': 3,   // small, tight view
      'cautious': 4,  // a bit wider
      'keen-eyed': 5, // balanced
      'far-sight': 8, // biggest range
    };
    return visionConfig[this.visionType] ?? 5;
  }


  getDifficultyConfig() {
    const configs: Record<Difficulty, { size: number; food: number; water: number }> =
      {
        easy: { size: 12, food: 100, water: 100 },
        medium: { size: 16, food: 75, water: 75 },
        hard: { size: 20, food: 50, water: 50 },
      };
    return configs[this.difficulty] || configs.easy;
  }

  attemptMove(dx: number, dy: number) {
    if (this.gameOver || this.gameWon) return null;
    this.currentTurn++;
    const pos = this.player.getPosition();
    const newX = pos.x + dx;
    const newY = pos.y + dy;
    if (!this.map.isValidPosition(newX, newY)) return null;
    const tile = this.map.getTileAt(newX, newY);
    if (!tile || !tile.isWalkable()) return null;
    const cost = tile.getMoveCost();

    if (!this.player.hasEnoughResources(cost.food, cost.water)) {
      // If you don't have enough resources to move, you always lose a life
      // and gain +5 food / +5 water. The game only ends when you are at 0 lives
      // AND cannot pay the movement cost.
      if (this.player.getLives() > 0) {
        this.player.loseLife();
        this.player.food += 5;
        this.player.water += 5;

        return {
          lostLife: true,
          message: `Not enough resources! Lost a life. Respawned with +5 food and +5 water. ${this.player.getLives()} lives remaining.`,
        };
      }

      // Reaching this branch means you already have 0 lives and still can't move.
      this.gameOver = true;
      return { gameOver: true, message: 'Game Over! No lives or resources remaining!' };
    }

    this.player.spendResources(cost.food, cost.water);
    this.player.move(newX, newY);
    const resource = tile.getResource();
    if (resource) {
      if (resource.type === 'trophy') {
        this.gameWon = true;
        this.player.food += 10;
        this.player.water += 10;
        this.player.gold += 5;

        return {
          gameWon: true,
          message: `Level ${this.currentLevel} Complete! +10 Food, +10 Water, +5 Gold!`,
          resourceCollected: resource.type,
          nextLevel: true,
        };
      }

      if (resource.type === 'trader') {
        const trader = resource as TraderResource;
        if (!trader.isAvailable(this.currentTurn)) {
          return {
            message: 'This trader is currently unavailable (will return in a few turns).',
            traderUnavailable: true,
          };
        }

        this.traderTile = tile;
        this.activeTrader = trader;
        this.activeOffer = this.generateTraderOffer(trader.getTraderType());
        return {
          message: trader.getMessage(),
          trader: true,
          traderType: trader.getTraderType(),
          offer: this.activeOffer,
        };
      }

      // Difficulty-scaled resource collection for food and water
      if (resource.type === 'spring') {
        const waterByDifficulty: Record<Difficulty, number> = {
          easy: 20,
          medium: 15,
          hard: 10,
        };
        const gain = waterByDifficulty[this.difficulty] ?? 15;
        this.player.water += gain;
        tile.removeResource();
        return {
          message: `+${gain} Water from spring!`,
          resourceCollected: resource.type,
        };
      }

      if (resource.type === 'animal') {
        const foodByDifficulty: Record<Difficulty, number> = {
          easy: 20,
          medium: 15,
          hard: 10,
        };
        const gain = foodByDifficulty[this.difficulty] ?? 15;
        this.player.food += gain;
        tile.removeResource();
        return {
          message: `+${gain} Food from hunting!`,
          resourceCollected: resource.type,
        };
      }

      // Other resources (gold, traders, etc.) use their own logic
      this.player.collectResource(resource);
      tile.removeResource();

      return {
        message: resource.getMessage(),
        resourceCollected: resource.type,
      };
    }
    return { success: true };
  }

  submitCounterOffer(counterGold: number) {
    if (!this.traderTile || !this.activeTrader || !this.activeOffer) {
      return { error: 'No trader nearby!' };
    }
    if (counterGold <= 0) {
      return { error: 'Counter offer must be greater than 0 gold.' };
    }
    if (this.player.gold < counterGold) {
      return { error: `You only have ${this.player.gold} gold.` };
    }

    const trader = this.activeTrader;
    const traderType = trader.getTraderType();
    const { item, amount, baseCost } = this.activeOffer;

    const priceDiff = baseCost - counterGold; // positive if player offers less

    // Helper to complete a successful trade
    const completeTrade = (goldToPay: number) => {
      this.player.gold -= goldToPay;
      if (item === 'food') this.player.food += amount;
      if (item === 'water') this.player.water += amount;
      if (item === 'life') this.player.addLife();

      trader.setState('idle');
      trader.resetCounter();

      const rewardLabel =
        item === 'life'
          ? 'gained +1 Life'
          : `gained +${amount} ${item === 'food' ? 'Food' : 'Water'}`;

      const message = `Trade accepted! You ${rewardLabel} for ${goldToPay} gold.`;

      // After a successful trade, generate a fresh offer
      this.activeOffer = this.generateTraderOffer(traderType);

      return {
        success: true as const,
        message,
        nextOffer: this.activeOffer,
      };
    };

    // Generous traders
    if (traderType === 'generous') {
      if (counterGold > baseCost) {
        // They refuse to overcharge you
        return {
          error: `The generous trader stops you. They don't want to scam you and only want ${baseCost} gold.`,
        };
      }

      if (counterGold === baseCost) {
        return completeTrade(counterGold);
      }

      // Offer less than asking price → success rate reduced by 15% per gold below asking.
      // Example: asking 10, offer 8 → 2 gold below → 70% success chance.
      const generousPriceDiff = Math.max(0, baseCost - counterGold);
      const successRate = Math.max(0, 1 - 0.15 * generousPriceDiff);
      const accepted = Math.random() < successRate;
      if (!accepted) {
        trader.incrementCounter();
        if (trader.getCounterOfferCount() >= 7) {
          trader.setState('unavailable');
          if (this.traderTile) {
            this.traderTile.removeResource();
          }
          this.leaveTrader();
          return {
            error:
              'After many failed offers, even the generous trader decides to move on.',
            traderGone: true,
          };
        }

        return {
          error: 'The generous trader declines this offer. Try offering a bit more gold.',
        };
      }

      return completeTrade(counterGold);
    }

    // Impatient traders
    if (traderType === 'impatient') {
      if (counterGold > baseCost) {
        // Instantly accept any offer above their asking price
        return completeTrade(counterGold);
      }

      if (priceDiff >= 4) {
        // Offer 4 or more gold below their price → instant leave
        trader.setState('unavailable');
        if (this.traderTile) {
          this.traderTile.removeResource();
        }
        this.leaveTrader();
        return {
          error:
            'Your offer is far below their asking price. The impatient trader is offended and leaves immediately.',
          traderGone: true,
        };
      }

      // 0–3 gold below asking price → success rate decreases by 25% per gold
      const successRate = Math.max(0, 1 - 0.25 * Math.max(0, priceDiff));
      const accepted = Math.random() < successRate;

      if (!accepted) {
        trader.incrementCounter();
        if (trader.getCounterOfferCount() >= 3) {
          trader.setState('unavailable');
          if (this.traderTile) {
            this.traderTile.removeResource();
          }
          this.leaveTrader();
          return {
            error:
              'After several failed offers, the impatient trader loses patience and leaves.',
            traderGone: true,
          };
        }

        return {
          error:
            'The impatient trader rejects your offer. Try something closer to their asking price.',
        };
      }

      return completeTrade(counterGold);
    }

    // Regular traders
    if (counterGold >= baseCost) {
      // Always accept offers that meet or exceed asking price
      return completeTrade(counterGold);
    }

    // Lower than asking price → success chance reduced by 20% per gold below asking
    // Example: asking 10, offer 6 → 4 gold below → 20% success chance
    const regularPriceDiff = Math.max(0, baseCost - counterGold);
    const successRate = Math.max(0, 1 - 0.2 * regularPriceDiff);
    const accepted = Math.random() < successRate;

    if (!accepted) {
      trader.incrementCounter();
      if (trader.getCounterOfferCount() >= 5) {
        trader.setState('unavailable');
        if (this.traderTile) {
          this.traderTile.removeResource();
        }
        this.leaveTrader();
        return {
          error:
            'After too many failed offers, the regular trader decides to leave.',
          traderGone: true,
        };
      }

      return {
        error:
          'The trader rejects your offer. You must create a new offer to continue trading.',
      };
    }

    return completeTrade(counterGold);
  }

  getGameState(): GameStateSnapshot {
    return {
      map: this.map.getTiles(),
      player: this.player.getPosition(),
      resources: this.player.getResources(),
      gameOver: this.gameOver,
      gameWon: this.gameWon,
      mapSize: this.map.size,
      visionRadius: this.player.getVisionRadius(),
      playerInstance: this.player,
      currentLevel: this.currentLevel,
    };
  }

  getCurrentResources() {
    const resources = this.player.getResources();
    return {
      food: resources.food,
      water: resources.water,
      gold: resources.gold,
      lives: resources.lives,
      level: this.currentLevel + 1,
    };
  }

  hasTrader() {
    return this.traderTile !== null && this.activeTrader !== null;
  }

  getTraderType() {
    return this.activeTrader ? this.activeTrader.getTraderType() : null;
  }

  getActiveOffer() {
    return this.activeOffer;
  }

  leaveTrader() {
    this.traderTile = null;
    this.activeTrader = null;
    this.activeOffer = null;
  }

  // Handle when the player explicitly rejects the current trader's offer
  rejectCurrentTrade() {
    if (!this.activeTrader) {
      return;
    }

    const traderType = this.activeTrader.getTraderType();

    // Impatient traders immediately leave the map for this level if you reject their offer
    if (traderType === 'impatient') {
      this.activeTrader.setState('unavailable');
      if (this.traderTile) {
        this.traderTile.removeResource();
      }
    }

    this.leaveTrader();
  }

  // Accept the current offer at the trader's asking price (no randomness)
  acceptCurrentOffer() {
    if (!this.traderTile || !this.activeTrader || !this.activeOffer) {
      return { error: 'No trader nearby!' };
    }

    const { item, amount, baseCost } = this.activeOffer;

    if (this.player.gold < baseCost) {
      return { error: `You need ${baseCost} gold to accept this trade.` };
    }

    this.player.gold -= baseCost;
    if (item === 'food') this.player.food += amount;
    if (item === 'water') this.player.water += amount;
    if (item === 'life') this.player.addLife();

    this.activeTrader.setState('idle');
    this.activeTrader.resetCounter();

    const rewardLabel =
      item === 'life'
        ? 'gained +1 Life'
        : `gained +${amount} ${item === 'food' ? 'Food' : 'Water'}`;

    const message = `Trade accepted! You ${rewardLabel} for ${baseCost} gold.`;

    const traderType = this.activeTrader.getTraderType();
    this.activeOffer = this.generateTraderOffer(traderType);

    return {
      success: true as const,
      message,
      nextOffer: this.activeOffer,
    };
  }
}

// ============================================
// React Component (View Layer)
// ============================================
const TileGame: React.FC = () => {
  const TILE_SIZE = 32;
  
    const terrainLegend: Terrain[] = [
    new GrassTerrain(),
    new DesertTerrain(),
    new ForestTerrain(),
    new MountainTerrain(),
    new SwampTerrain(),
    new WallTerrain(), 
  ];
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [visionType, setVisionType] = useState<VisionType | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);
  const [message, setMessage] = useState('');
  const [showTradeMenu, setShowTradeMenu] = useState(false);
  const [traderType, setTraderType] =
    useState<TraderResource['traderType'] | null>(null);
  const [currentOffer, setCurrentOffer] = useState<TraderOffer | null>(null);
  const [counterGold, setCounterGold] = useState(0);
  const [tradeFeedback, setTradeFeedback] = useState('');
  const [moveLog, setMoveLog] = useState<string[]>([]);
 

  const startGame = (
    diff: Difficulty,
    vision: VisionType,
    resources: (PlayerResources & { level: number }) | null = null,
  ) => {
    const newGame = new Game(diff, vision, resources);
    setGame(newGame);
    setGameState(newGame.getGameState());
    setDifficulty(diff);
    setVisionType(vision);
    setMessage('');
    setShowTradeMenu(false);
    setTraderType(null);
    setCurrentOffer(null);
    setCounterGold(0);
    setTradeFeedback('');
	setMoveLog([]);
  };

  const nextLevel = () => {
    if (!game) return;
    const resources = game.getCurrentResources();
    startGame(difficulty ?? 'easy', visionType ?? 'keen-eyed', resources);
  };

  const handleMove = (dx: number, dy: number) => {
    if (!game) return;
	
	// snapshot BEFORE move
	const before = game.getGameState();

	const result = game.attemptMove(dx, dy);

    // snapshot AFTER move
	const after = game.getGameState();
	setGameState(after);
	
    //const result = game.attemptMove(dx, dy);
    setGameState(game.getGameState());
    if (result && 'trader' in result && result.trader) {
      setShowTradeMenu(true);
      setTraderType((result as any).traderType);
      const offer = game.getActiveOffer();
      setCurrentOffer(offer);
      setCounterGold(offer ? offer.baseCost : 0);
      setTradeFeedback('');
    } else {
      setShowTradeMenu(false);
      setTraderType(null);
      setCurrentOffer(null);
      setTradeFeedback('');
    }
    if (result && 'message' in result && result.message) {
      const r = result as any;
      setMessage(r.message);
      if (!r.gameWon && !r.gameOver && !r.lostLife) {
        setTimeout(() => setMessage(''), 3000);
      }
    }
	const msg = (result as any)?.message ?? '';
	const entry = `Move (${dx}, ${dy})  from (${before.player.x},${before.player.y}) to (${after.player.x},${after.player.y})  |  Food ${before.resources.food}→${after.resources.food}, Water ${before.resources.water}→${after.resources.water}, Gold ${before.resources.gold}→${after.resources.gold}${msg ? '  |  ' + msg : ''}`;

	setMoveLog(prev => [entry, ...prev].slice(0, 20)); // keep last 20 moves
  };

  const handleCounterOffer = () => {
    if (!game || !currentOffer) return;
    const result = game.submitCounterOffer(counterGold);
    setGameState(game.getGameState());
    if ('error' in result && result.error) {
      setTradeFeedback(result.error);
      if ((result as any).traderGone) {
        setShowTradeMenu(false);
        setTraderType(null);
        setCurrentOffer(null);
      }
    } else if ('success' in result && result.success) {
      setTradeFeedback(result.message);
      const nextOffer = (result as { nextOffer?: TraderOffer }).nextOffer || game.getActiveOffer();
      setCurrentOffer(nextOffer || null);
      setCounterGold(nextOffer ? nextOffer.baseCost : 0);
    }
  };
  const handleLeaveTrader = () => {
    if (game) {
      game.rejectCurrentTrade();
    }
    setShowTradeMenu(false);
    setTraderType(null);
    setCurrentOffer(null);
    setTradeFeedback('');
    setCounterGold(0);
  };

  useEffect(() => {
    if (difficulty && visionType && game) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (showTradeMenu) {
          switch (e.key) {
            case 'ArrowUp':
              setCounterGold((prev) => prev + 1);
              break;
            case 'ArrowDown':
              setCounterGold((prev) => Math.max(1, prev - 1));
              break;
            case 'Escape':
              handleLeaveTrader();
              break;
            case 'Enter':
              // Enter submits the current counter-offer while in trade view
              handleCounterOffer();
              break;
          }
        } else {
          e.preventDefault();
          switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
              handleMove(0, -1);
              break;
            case 'ArrowDown':
            case 's':
            case 'S':
              handleMove(0, 1);
              break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
              handleMove(-1, 0);
              break;
            case 'ArrowRight':
            case 'd':
            case 'D':
              handleMove(1, 0);
              break;
          }
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [game, difficulty, visionType, showTradeMenu]);

  if (!difficulty || !visionType || !gameState) {
    return (
      <div className="app-shell">
        <div className="game-panel hero-panel" style={{ maxWidth: 900, width: '100%' }}>
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl font-bold mb-3">Survival Adventure</h1>
            <p className="text-lg mb-1">Explore the wilderness and manage your resources.</p>
            <p className="text-sm text-gray-400">
              Collect food, water, and gold. Reach the 🏆 trophy before you run out!
            </p>
          </div>

          {!difficulty ? (
            <>
              <h2 className="text-white text-2xl mb-6 text-center">Choose Your Challenge</h2>
              <div
                className="flex gap-4 mb-6 justify-center"
                style={{ maxWidth: 720, margin: '0 auto' }}
              >
                <button
                  onClick={() => setDifficulty('easy')}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-bold transition"
                >
                  Easy
                  <div className="text-sm font-normal">12x12 Map</div>
                  <div className="text-xs">100 Food / 100 Water</div>
                  <div className="text-xs">Plenty of resources</div>
                </button>

                <button
                  onClick={() => setDifficulty('medium')}
                  className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xl font-bold transition"
                >
                  Medium
                  <div className="text-sm font-normal">16x16 Map</div>
                  <div className="text-xs">75 Food / 75 Water</div>
                  <div className="text-xs">Balanced difficulty</div>
                </button>

                <button
                  onClick={() => setDifficulty('hard')}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xl font-bold transition"
                >
                  Hard
                  <div className="text-sm font-normal">20x20 Map</div>
                  <div className="text-xs">50 Food / 50 Water</div>
                  <div className="text-xs">Scarce resources</div>
                </button>
              </div>
              {/* Tip removed for a cleaner, more game-like start screen */}
            </>
          ) : (
            <>
              <h2 className="text-white text-2xl mb-6 text-center">Choose Vision Range</h2>
              <div
                className="flex gap-4 mb-6 justify-center"
                style={{ maxWidth: 720, margin: '0 auto' }}
              >
                <button
                  onClick={() => startGame(difficulty, 'focused')}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xl font-bold transition"
                >
                  Focused Vision
                  <div className="text-sm font-normal">3 Tile Radius</div>
                  <div className="text-xs">Tight, tactical view</div>
                </button>

                <button
                  onClick={() => startGame(difficulty, 'cautious')}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xl font-bold transition"
                >
                  Cautious Vision
                  <div className="text-sm font-normal">4 Tile Radius</div>
                  <div className="text-xs">Watch your flanks</div>
                </button>

                <button
                  onClick={() => startGame(difficulty, 'keen-eyed')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-bold transition"
                >
                  Keen-Eyed Vision
                  <div className="text-sm font-normal">5 Tile Radius</div>
                  <div className="text-xs">Balanced visibility</div>
                </button>

                <button
                  onClick={() => startGame(difficulty, 'far-sight')}
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xl font-bold transition"
                >
                  Far-Sight Vision
                  <div className="text-sm font-normal">8 Tile Radius</div>
                  <div className="text-xs">See danger early</div>
                </button>
              </div>
              <div className="flex justify-center items-center mt-4 text-xs text-gray-400">
                <button
                  onClick={() => setDifficulty(null)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                >
                  ← Back to Difficulty
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Camera clamping so the map never scrolls beyond its borders.
  // If the map is smaller than the base viewport (e.g. Easy), the
  // viewport shrinks to exactly fit the map so you never see beyond walls.
  const BASE_VIEWPORT_WIDTH = 416;
  const BASE_VIEWPORT_HEIGHT = 320;
  let viewportWidth = BASE_VIEWPORT_WIDTH;
  let viewportHeight = BASE_VIEWPORT_HEIGHT;
  let worldTranslateX = 0;
  let worldTranslateY = 0;
  if (gameState) {
    const worldWidth = gameState.mapSize * TILE_SIZE;
    const worldHeight = gameState.mapSize * TILE_SIZE;

    viewportWidth = Math.min(BASE_VIEWPORT_WIDTH, worldWidth);
    viewportHeight = Math.min(BASE_VIEWPORT_HEIGHT, worldHeight);

    // If the world is bigger than the viewport on an axis, clamp movement;
    // otherwise keep it fixed (no scrolling) on that axis.
    const desiredTx = -gameState.player.x * TILE_SIZE + viewportWidth / 2;
    if (worldWidth > viewportWidth) {
      const minTx = Math.min(0, viewportWidth - worldWidth);
      const maxTx = 0;
      worldTranslateX = Math.max(minTx, Math.min(desiredTx, maxTx));
    } else {
      worldTranslateX = 0;
    }

    const desiredTy = -gameState.player.y * TILE_SIZE + viewportHeight / 2;
    if (worldHeight > viewportHeight) {
      const minTy = Math.min(0, viewportHeight - worldHeight);
      const maxTy = 0;
      worldTranslateY = Math.max(minTy, Math.min(desiredTy, maxTy));
    } else {
      worldTranslateY = 0;
    }
  }

  return (
    <div className="app-shell">
      <div className="game-panel" style={{ maxWidth: 1400, width: '100%' }}>
        <div className="mb-3 text-white text-center">
          <div className="mb-2">
            <img
              src="/wilderness-banner.png"
              alt="Wilderness Survival System"
              className="game-logo"
            />
          </div>
          <div className="text-xs text-gray-400 mb-2">
            Difficulty: <span className="text-yellow-300">{difficulty.toUpperCase()}</span>{' '}
            • Level <span className="text-cyan-400">{gameState.currentLevel}</span> • Vision:{' '}
            <span className="text-green-300">{visionType.toUpperCase()}</span>
          </div>
          <div className="flex gap-6 justify-center text-lg font-bold mb-2 hud-bar">
            <div className="flex items-center gap-2 stat-pill">
              <span className="hud-label">LIVES</span>
              <span className="hud-value text-red-400">
                ❤️ {gameState.resources.lives}
              </span>
            </div>
            <div className="flex items-center gap-2 stat-pill">
              <span className="hud-label">FOOD</span>
              <span
                className={`hud-value ${
                  gameState.resources.food < 10 ? 'text-red-400' : 'text-green-400'
                }`}
              >
                🍖 {gameState.resources.food}
              </span>
            </div>
            <div className="flex items-center gap-2 stat-pill">
              <span className="hud-label">WATER</span>
              <span
                className={`hud-value ${
                  gameState.resources.water < 10 ? 'text-red-400' : 'text-blue-400'
                }`}
              >
                💧 {gameState.resources.water}
              </span>
            </div>
            <div className="flex items-center gap-2 stat-pill">
              <span className="hud-label">GOLD</span>
              <span className="hud-value text-yellow-400">
                💰 {gameState.resources.gold}
              </span>
            </div>
          </div>
          <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {message && (
              <div className="message-banner text-sm mt-2">{message}</div>
            )}
          </div>
        </div>

      <div
        style={{
          marginTop: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'nowrap', maxWidth: '100%', overflow: 'hidden', paddingLeft: '20px', paddingRight: '20px' }}>
          {/* Left side: Trade menu */}
          <div style={{ width: 320, flexShrink: 0, minWidth: 0 }}>
            <div className="overlay-card trade-card text-center" style={{ width: '81%', minHeight: '575px' }}>
              {showTradeMenu && currentOffer ? (
                <>
                  <div className="text-2xl mb-1">
                    {traderType === 'regular' && '🧙 Regular Trader'}
                    {traderType === 'impatient' && '⚡ Impatient Trader'}
                    {traderType === 'generous' && '💝 Generous Trader'}
                  </div>
                  <div className="text-xs text-gray-400 mb-3 dialog-text">
                    {traderType === 'regular' &&
                      'A merchant with steady prices and a fair attitude. They leave after 5 bad counter-offers in a row!'}
                    {traderType === 'impatient' &&
                      'Offers are risky: too low and they will leave entirely. Rejecting their trades or making 3 bad counter-offers in a row will cause them to leave as well!'}
                    {traderType === 'generous' &&
                      'Kind-hearted, patient, and honest. They refuse to take more than they ask. However, they will leave after 7 bad counter-offers in a row!'}
                  </div>
                  <div className="offer-display mb-3">
                    <div className="offer-line">
                      They offer{' '}
                      <span className="text-yellow-300 font-bold">
                        {currentOffer.item === 'life'
                          ? '+1 Life'
                          : `+${currentOffer.amount} ${
                              currentOffer.item === 'food' ? 'Food' : 'Water'
                            }`}
                      </span>
                    </div>
                    <div className="offer-line">
                      Requested price:{' '}
                      <span className="text-cyan-400 font-bold">
                        {currentOffer.baseCost} gold
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <button
                      onClick={() => {
                        if (!game) return;
                        const result = (game as any).acceptCurrentOffer
                          ? (game as any).acceptCurrentOffer()
                          : { error: 'Accept not available.' };
                        setGameState(game.getGameState());
                        if ('error' in result && result.error) {
                          setTradeFeedback(result.error);
                        } else if ('success' in result && result.success) {
                          setTradeFeedback(result.message);
                          const nextOffer =
                            (result as { nextOffer?: TraderOffer }).nextOffer ||
                            game.getActiveOffer();
                          setCurrentOffer(nextOffer || null);
                          setCounterGold(nextOffer ? nextOffer.baseCost : 0);
                        }
                      }}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm"
                    >
                      Accept Trade
                    </button>
                    <button
                      onClick={handleLeaveTrader}
                      className="w-full px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"
                    >
                      Reject Trade
                    </button>
                  </div>

                  <div className="counter-section mb-3 text-center">
                    <div className="text-xs text-gray-300 mb-1">
                      Make Counter-Offer:
                    </div>
                    <div className="counter-controls justify-center">
                      <button
                        className="counter-btn"
                        onClick={() =>
                          setCounterGold((prev) => Math.max(1, prev - 1))
                        }
                      >
                        −
                      </button>
                      <input
                        className="counter-input"
                        type="number"
                        min={1}
                        value={counterGold}
                        onChange={(e) =>
                          setCounterGold(
                            Math.max(1, Number(e.target.value) || 1),
                          )
                        }
                      />
                      <button
                        className="counter-btn"
                        onClick={() => setCounterGold((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {tradeFeedback && (
                    <div className="trade-feedback mb-2 text-xs">{tradeFeedback}</div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={handleCounterOffer}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm"
                    >
                      Submit Counter-Offer
                    </button>
                    <button
                      onClick={() => setCounterGold(currentOffer.baseCost)}
                      className="w-full px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs"
                    >
                      Match Asking Price ({currentOffer.baseCost} gold)
                    </button>
                  </div>
                </>
              ) : (
                <div className="dialog-text text-gray-300 text-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '575px' }}>
                  <div className="text-base mb-1">No Trader Nearby</div>
                  <p className="text-xs">
                    Move around the map to find a trader. When you step on their
                    tile, their current offer will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center: Map */}
          <div style={{ width: viewportWidth, flexShrink: 0, minWidth: 0 }}>
            <div
              className="relative border-4 border-gray-600 overflow-hidden"
              style={{
                width: viewportWidth,
                height: viewportHeight,
                backgroundColor: '#0b1120',
                imageRendering: 'pixelated',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: gameState.mapSize * TILE_SIZE,
                  height: gameState.mapSize * TILE_SIZE,
                  transform: `translate(${worldTranslateX}px, ${worldTranslateY}px)`,
                  transition: 'transform 0.2s ease',
                }}
              >
                {gameState.map.map((row, y) =>
                  row.map((tile, x) => {
                    const isVisible = gameState.playerInstance.canSeeTile(x, y);
                    return (
                      <div
                        key={`${x}-${y}`}
                        style={{
                          position: 'absolute',
                          left: x * TILE_SIZE,
                          top: y * TILE_SIZE,
                          width: TILE_SIZE,
                          height: TILE_SIZE,
                          backgroundColor: isVisible
                            ? tile.getTerrain().getColor()
                            : '#1a1a1a',
                          border: '1px solid rgba(0,0,0,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          opacity: isVisible ? 1 : 0.3,
                        }}
                      >
                        {isVisible &&
                          tile.getResource() &&
                          tile.getResource()!.getIcon()}
                      </div>
                    );
                  }),
                )}

                <div
                  style={{
                    position: 'absolute',
                    left: gameState.player.x * TILE_SIZE,
                    top: gameState.player.y * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: '#dcfce7',
                    borderRadius: '4px',
                    border: '2px solid #16a34a',
                    transition: 'all 0.1s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    zIndex: 10,
                  }}
                >
                  🚶
                </div>
              </div>

              {gameState.gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
                  <div className="overlay-card text-center">
                    <div className="text-red-400 text-4xl font-bold mb-2">
                      Game Over
                    </div>
                    <div className="text-white text-lg mb-3">
                      You ran out of resources.
                    </div>
                    <div className="text-yellow-400 text-lg mb-4">
                      Gold Collected: {gameState.resources.gold}
                    </div>
                    <button
                      onClick={() => {
                        setDifficulty(null);
                        setVisionType(null);
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                    >
                      Back to Main Menu
                    </button>
                  </div>
                </div>
              )}

              {gameState.gameWon && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
                  <div className="overlay-card text-center">
                    <div className="text-green-400 text-4xl font-bold mb-2">
                      Level {gameState.currentLevel} Complete!
                    </div>
                    <div className="text-white text-lg mb-2">
                      You collected the trophy!
                    </div>
                    <div className="text-cyan-400 text-sm mb-2">
                      Bonus: +10 Food, +10 Water, +5 Gold
                    </div>
                    <div className="text-yellow-400 text-sm mb-1">
                      Gold: {gameState.resources.gold}
                    </div>
                    <div className="text-blue-400 text-sm mb-1">
                      Food: {gameState.resources.food}
                    </div>
                    <div className="text-cyan-400 text-sm mb-4">
                      Water: {gameState.resources.water}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={nextLevel}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                      >
                        Next Level →
                      </button>
                      <button
                        onClick={() => {
                          setDifficulty(null);
                          setVisionType(null);
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                      >
                        Main Menu
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Terrain legend and Move log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: 320, flexShrink: 0, minWidth: 0 }}>
            {/* Terrain legend */}
            <div
              className="overlay-card"
              style={{ padding: '0.75rem 1rem', fontSize: '9px', textAlign: 'left', width: '100%' }}
            >
              <div style={{ fontSize: '0.75rem', marginBottom: 6, fontWeight: 'bold' }}>
                Terrain Legend (cost per move)
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '4px',
                }}
              >
                {terrainLegend.map((terrain) => {
                  const cost = terrain.getCost();
                  const isWalkable = terrain.isWalkable();
                  const label =
                    terrain.name.charAt(0).toUpperCase() + terrain.name.slice(1);

                  return (
                    <div
                      key={terrain.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          backgroundColor: terrain.getColor(),
                          boxShadow: '0 0 0 2px rgba(0,0,0,0.6)',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem' }}>{label}</div>
                        <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>
                          {isWalkable
                            ? `Food ${cost.food} • Water ${cost.water}`
                            : 'Impassable'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

              
            {game && (
              <AutoPlayControls
                game={game}
                onMove={() => setGameState(game.getGameState())}
                disabled={showTradeMenu}
              />
            )}

            {/* Move log */}
            <div
              className="overlay-card"
              style={{
                fontSize: '9px',
                height: Math.max(360, viewportHeight - 240),
                overflowY: 'auto',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '0.75rem', marginBottom: 4, fontWeight: 'bold' }}>
                Move Log
              </div>
              {moveLog.length === 0 ? (
                <div className="text-gray-400" style={{ fontSize: '0.65rem' }}>
                  Your recent moves will appear here.
                </div>
              ) : (
                moveLog.map((line, idx) => (
                  <div key={idx} style={{ fontSize: '0.65rem', marginBottom: 2 }}>{line}</div>
                ))
              )}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={() => {
              setDifficulty(null);
              setVisionType(null);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          >
            Change Settings
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TileGame;