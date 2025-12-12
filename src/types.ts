// Type-safe constants to avoid magic strings
export const BrainPersonality = {
  GREEDY: 'greedy',
  EXPLORER: 'explorer',
  AGGRESSIVE: 'aggressive'
} as const;

export type BrainPersonality = typeof BrainPersonality[keyof typeof BrainPersonality];

export const ResourceType = {
  SPRING: 'spring',
  ANIMAL: 'animal',
  GOLD: 'gold',
  TROPHY: 'trophy',
  TRADER: 'trader'
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export const TerrainType = {
  GRASS: 'grass',
  DESERT: 'desert',
  FOREST: 'forest',
  MOUNTAIN: 'mountain',
  SWAMP: 'swamp',
  WALL: 'wall'
} as const;

export type TerrainType = typeof TerrainType[keyof typeof TerrainType];

export const Difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export const VisionType = {
  FOCUSED: 'focused',
  CAUTIOUS: 'cautious',
  KEEN_EYED: 'keen-eyed',
  FAR_SIGHT: 'far-sight'
} as const;

export type VisionType = typeof VisionType[keyof typeof VisionType];

export const TraderType = {
  REGULAR: 'regular',
  IMPATIENT: 'impatient',
  GENEROUS: 'generous'
} as const;

export type TraderType = typeof TraderType[keyof typeof TraderType];

export const TradeItem = {
  FOOD: 'food',
  WATER: 'water',
  LIFE: 'life'
} as const;

export type TradeItem = typeof TradeItem[keyof typeof TradeItem];

// Constants to avoid magic numbers
export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { size: 12, food: 100, water: 100 },
  [Difficulty.MEDIUM]: { size: 16, food: 75, water: 75 },
  [Difficulty.HARD]: { size: 20, food: 50, water: 50 }
} as const;

export const VISION_RADIUS_CONFIG = {
  [VisionType.FOCUSED]: 3,
  [VisionType.CAUTIOUS]: 4,
  [VisionType.KEEN_EYED]: 5,
  [VisionType.FAR_SIGHT]: 8
} as const;

export const TERRAIN_COSTS = {
  [TerrainType.GRASS]: { food: 1, water: 1 },
  [TerrainType.DESERT]: { food: 1, water: 3 },
  [TerrainType.FOREST]: { food: 2, water: 1 },
  [TerrainType.MOUNTAIN]: { food: 3, water: 2 },
  [TerrainType.SWAMP]: { food: 2, water: 2 },
  [TerrainType.WALL]: { food: 0, water: 0 } // Impassable
} as const;

export const TERRAIN_COLORS = {
  [TerrainType.GRASS]: '#7cb342',
  [TerrainType.DESERT]: '#fdd835',
  [TerrainType.FOREST]: '#2e7d32',
  [TerrainType.MOUNTAIN]: '#616161',
  [TerrainType.SWAMP]: '#558b2f',
  [TerrainType.WALL]: '#5d4037'
} as const;

export const RESOURCE_ICONS = {
  [ResourceType.SPRING]: '💧',
  [ResourceType.ANIMAL]: '🍖',
  [ResourceType.GOLD]: '💰',
  [ResourceType.TROPHY]: '🏆',
  [ResourceType.TRADER]: '🧙'
} as const;

export const DEFAULT_PLAYER_LIVES = 3;
export const DEFAULT_VISION_RADIUS = 5;
export const MAX_RECENT_POSITIONS = 4;
export const BRAIN_THRESHOLD_MULTIPLIERS = {
  EXPLORER_SAFE: 0.5,
  EXPLORER_CRITICAL: 0.25,
  AGGRESSIVE_CRITICAL: 0.15,
  AGGRESSIVE_MINIMUM: 0.1
} as const;

// Type definitions
export interface PlayerResources {
  food: number;
  water: number;
  gold: number;
  lives: number;
  level?: number;
}

export interface MoveCost {
  food: number;
  water: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface TraderOffer {
  item: TradeItem;
  amount: number;
  baseCost: number;
}

export interface StartingResources {
  food: number;
  water: number;
}

export interface DifficultyConfig {
  size: number;
  food: number;
  water: number;
}

