import type { MoveCost, PlayerResources } from './types';

export interface Position {
  x: number;
  y: number;
}

// Interface for game state to enable dependency inversion
export interface IGameState {
  player: IPlayer;
  map: ITile[][];
  mapSize: number;
  resources: PlayerResources;
  gameOver: boolean;
  gameWon: boolean;
  currentLevel: number;
  playerInstance: IPlayer;
}

// Interface for player to enable abstraction
export interface IPlayer {
  x: number;
  y: number;
  food: number;
  water: number;
  gold: number;
  lives: number;
  visionRadius: number;
  getPosition(): Position;
  setPosition(x: number, y: number): void;
  getResources(): PlayerResources;
  spendResources(food: number, water: number): void;
  hasEnoughResources(food: number, water: number): boolean;
  collectResource(resource: IResource): void;
  getVisionRadius(): number;
  canSeeTile(tileX: number, tileY: number): boolean;
  addLife(): void;
  loseLife(): void;
  getLives(): number;
}

// Interface for tiles
export interface ITile {
  getTerrain(): ITerrain;
  getResource(): IResource | null;
  removeResource(): void;
  isWalkable(): boolean;
  getMoveCost(): MoveCost;
}

// Interface for terrain
export interface ITerrain {
  getName(): string;
  getColor(): string;
  getCost(): MoveCost;
  isWalkable(): boolean;
}

// Interface for resources
export interface IResource {
  getType(): string;
  getIcon(): string;
  applyEffect(playerResources: PlayerResources): PlayerResources;
  getMessage(): string;
}

// Interface for vision system
export interface IVision {
  getVisibleTiles(): Array<{x: number, y: number, tile: ITile}>;
  findPathToTile(targetX: number, targetY: number): PathStep[] | null;
  closestFood(): VisionResult | null;
  closestWater(): VisionResult | null;
  closestGold(): VisionResult | null;
  closestTrader(): VisionResult | null;
}

// Interface for brain strategy (Strategy pattern)
export interface IBrainStrategy {
  calculateMove(
    gameState: IGameState,
    vision: IVision,
    trophyPos: Position | null,
    food: number,
    water: number,
    startingResources: { food: number; water: number }
  ): {dx: number, dy: number, reason: string} | null;
}

// Path finding types
export interface PathStep {
  x: number;
  y: number;
  dx: number;
  dy: number;
  cost: MoveCost;
  totalCost: number;
}

export interface VisionResult {
  target: Position;
  path: PathStep[];
  totalCost: number;
  distance: number;
}

