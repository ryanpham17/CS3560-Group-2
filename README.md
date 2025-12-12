# Game Project - OOP Design Report

## Project Summary

### What is Finished
- **Complete game functionality**: The game is fully playable with all core features implemented
- **Terrain system**: 6 different terrain types with varying movement costs
- **Trader system**: 3 distinct trader types with unique trading behaviors
- **Vision system**: 4 different vision types affecting visibility range
- **AI Brain system**: 3 different brain personalities with unique decision-making algorithms
- **Resource management**: Food, water, gold, and lives system
- **Level progression**: Multi-level gameplay with resource carryover
- **Autoplay feature**: AI-controlled gameplay with configurable personalities
- **Object-Oriented Design**: Full implementation of OOP principles including:
  - Inheritance hierarchies
  - Polymorphism through interfaces and abstract classes
  - Encapsulation with private fields and public interfaces
  - Abstraction through interfaces and base classes
  - Strategy pattern for brain personalities
  - Single Responsibility Principle with separated services

### What is Not Yet Finished
- No major functionality is missing. The project is complete and ready for demonstration.

---

## Application of Object-Oriented Design

This project extensively applies Object-Oriented Design principles learned in class:

### 1. **Class Hierarchy and Inheritance**
The project uses inheritance to model relationships between game entities:
- `Terrain` base class with 6 subclasses (Grass, Desert, Forest, Mountain, Swamp, Wall)
- `Resource` base class with 5 subclasses (Spring, Animal, Gold, Trophy, Trader)
- `GameObject` abstract base class for `Player`
- Strategy pattern with `IBrainStrategy` interface and 3 concrete implementations

### 2. **Encapsulation**
All classes properly encapsulate their data:
- Private fields for internal state (e.g., `Player` has private `food`, `water`, `gold`)
- Public methods for controlled access (getters/setters)
- Protected fields for inheritance (e.g., `Terrain.name`, `Resource.type`)

### 3. **Polymorphism**
Polymorphism is used throughout:
- All terrain types can be used interchangeably through the `Terrain` base class
- All resources implement the same `Resource` interface
- Brain strategies are interchangeable through the `IBrainStrategy` interface
- Vision system uses `IVision` interface for abstraction

### 4. **Abstraction**
Abstraction is achieved through:
- Interfaces (`IGameState`, `IVision`, `IBrainStrategy`, `ITile`, `ITerrain`, `IResource`)
- Abstract base classes (`GameObject`, `Terrain`, `Resource`)
- Separation of concerns (e.g., `TraderService` handles only trader logic)

### 5. **SOLID Principles**
- **Single Responsibility**: Each class has one clear purpose (e.g., `TraderService` only handles trader operations)
- **Open/Closed**: Brain system is open for extension (new strategies) but closed for modification
- **Liskov Substitution**: All subclasses can be used wherever their base class is expected
- **Interface Segregation**: Small, focused interfaces rather than large "god" interfaces
- **Dependency Inversion**: High-level modules depend on abstractions (interfaces), not concrete classes

### How This Helped the Design
- **Maintainability**: Clear separation of concerns makes code easier to understand and modify
- **Extensibility**: New terrain types, resources, or brain personalities can be added without modifying existing code
- **Type Safety**: Strong typing prevents errors and makes the code self-documenting
- **Testability**: Interfaces and encapsulation make unit testing straightforward
- **Code Reuse**: Inheritance and polymorphism eliminate code duplication

---

## Grading Information

### 1. Terrain Types (15 points)

**Number of terrain types: 6**

The project implements 6 different terrain types:
1. **Grass** - Low cost (1 food, 1 water)
2. **Desert** - Moderate cost (1 food, 3 water)
3. **Forest** - Moderate cost (2 food, 1 water)
4. **Mountain** - High cost (3 food, 2 water)
5. **Swamp** - Moderate cost (2 food, 2 water)
6. **Wall** - Impassable (0 cost, not walkable)

**Code Location:**
- **File**: `src/App.tsx`
- **Lines 30-118**: Terrain base class and all 6 terrain subclasses
- **Screenshot locations**:
  - Line 30: `export class Terrain` - Base class definition
  - Lines 56-64: `GrassTerrain extends Terrain` - Example inheritance
  - Lines 66-74: `DesertTerrain extends Terrain`
  - Lines 76-84: `ForestTerrain extends Terrain`
  - Lines 86-94: `MountainTerrain extends Terrain`
  - Lines 96-104: `SwampTerrain extends Terrain`
  - Lines 106-118: `WallTerrain extends Terrain` (overrides `isWalkable()`)

---

### 2. Trader Types (20 points)

**Number of trader types: 3**

The project implements 3 distinct trader types with unique behaviors:

1. **Regular Trader** (`TraderType.REGULAR`)
   - Accepts counter offers within 10% of base cost
   - Leaves after 3 failed counter offers
   - Standard pricing

2. **Impatient Trader** (`TraderType.IMPATIENT`)
   - Accepts counter offers within 15% of base cost (more flexible)
   - Leaves after only 2 failed counter offers (less patient)
   - Becomes unavailable for 5 turns after leaving
   - Standard pricing

3. **Generous Trader** (`TraderType.GENEROUS`)
   - Offers 15% discount on all trades
   - Accepts counter offers at 75% of base cost (very generous)
   - Leaves after 4 failed counter offers (most patient)
   - Prevents players from overpaying (stops offers above base cost)

**How They Decide to Accept/Counteroffer:**
- All traders accept if the counter offer matches or exceeds their minimum threshold
- Regular: Accepts if counter offer ≥ 90% of base cost
- Impatient: Accepts if counter offer ≥ 85% of base cost (more lenient)
- Generous: Accepts if counter offer ≥ 75% of base cost (very lenient)
- If offer is too low, they reject and increment a counter
- After too many rejections, they leave (different thresholds per type)

**Code Location:**
- **File**: `src/App.tsx`
- **Lines 211-273**: `TraderResource` class with trader type logic
- **Lines 696-900**: `submitCounterOffer()` method showing trader decision logic
- **File**: `src/trader-service.ts`
- **Lines 12-28**: `generateOffer()` method showing how generous traders get discounts
- **Screenshot locations**:
  - Line 217: `constructor(traderType: TraderType = TraderType.REGULAR)` - Trader type initialization
  - Lines 743-800: Trader decision logic in `submitCounterOffer()` method
  - Line 24: `if (traderType === TraderType.GENEROUS)` - Generous trader discount logic

---

### 3. Vision Types (10 points)

**Number of vision types: 4**

The project implements 4 different vision types:
1. **Focused** - 3 tile radius (limited visibility)
2. **Cautious** - 4 tile radius (moderate visibility)
3. **Keen-Eyed** - 5 tile radius (standard visibility)
4. **Far-Sight** - 8 tile radius (maximum visibility)

**Code Location:**
- **File**: `src/types.ts`
- **Lines 39-46**: VisionType enum definition
- **Lines 71-76**: VISION_RADIUS_CONFIG mapping vision types to radii
- **File**: `src/App.tsx`
- **Lines 591-593**: `getVisionRadius()` method using the config
- **Screenshot locations**:
  - Lines 39-46 in `src/types.ts`: VisionType enum
  - Lines 71-76 in `src/types.ts`: VISION_RADIUS_CONFIG
  - Lines 591-593 in `src/App.tsx`: `getVisionRadius()` method

---

### 4. Brain Types (15 points)

**Number of brain types: 3**

The project implements 3 distinct AI brain personalities:

1. **Greedy Brain** (`BrainPersonality.GREEDY`)
   - Collects EVERY resource in sight (food, water, gold) before pursuing trophy
   - No resource thresholds - simply gathers all visible resources first
   - Only goes for trophy when NO resources are visible
   - Prioritizes unvisited tiles to find new resources

2. **Explorer Brain** (`BrainPersonality.EXPLORER`)
   - Maintains resources at 50% of starting levels
   - Proactively restocks when below 50% threshold
   - Prioritizes trophy when visible (unless critically low at 25%)
   - Strongly avoids expensive terrain to conserve resources
   - Balances resource management with trophy pursuit

3. **Aggressive Brain** (`BrainPersonality.AGGRESSIVE`)
   - Prioritizes trophy hunting above all else
   - Only seeks resources when critically low (below 15% of starting)
   - Takes risks and ignores terrain costs when resources are adequate
   - Searches aggressively, preferring unvisited tiles and map center
   - Only avoids expensive terrain when resources are very low (< 30)

**How They Work:**
Each brain uses the Strategy pattern with a dedicated strategy class that implements `IBrainStrategy`. The `Brain` class delegates move calculation to the appropriate strategy based on personality. Strategies analyze the game state, visible resources, trophy position, and current resources to make decisions.

**Code Location:**
- **File**: `src/brain-strategies.ts`
- **Lines 32-127**: `GreedyStrategy` class
- **Lines 128-264**: `ExplorerStrategy` class
- **Lines 265-361**: `AggressiveStrategy` class
- **File**: `src/brain.ts`
- **Lines 20-42**: `Brain` class using Strategy pattern
- **Lines 112-140**: `calculateBestMove()` delegating to strategies
- **Screenshot locations**:
  - Lines 32-44 in `src/brain-strategies.ts`: `GreedyStrategy` class definition
  - Lines 128-144 in `src/brain-strategies.ts`: `ExplorerStrategy` class definition
  - Lines 265-281 in `src/brain-strategies.ts`: `AggressiveStrategy` class definition
  - Lines 20-42 in `src/brain.ts`: Brain class with Strategy pattern setup
  - Lines 130-140 in `src/brain.ts`: Strategy delegation in `calculateBestMove()`

---

### 5. Video/Text Output (12 points)

The program provides comprehensive text output:
- **Move log**: Shows each move with before/after resource states
- **Resource messages**: Displays messages when collecting resources (e.g., "+30 Water from spring!")
- **Trade feedback**: Shows trade acceptance/rejection messages
- **Game state messages**: Displays game over, level complete, and life loss messages
- **Brain move reasons**: Shows why the AI made each move (e.g., "GREEDY: Collecting gold resource")
- **Trader interactions**: Displays trader type and trade offers

**Code Location:**
- **File**: `src/App.tsx`
- **Lines 1008-1034**: `handleMove()` function that logs moves and displays messages
- **Lines 1030-1033**: Move log entry creation
- **Screenshot locations**:
  - Lines 1008-1034 in `src/App.tsx`: Move handling and logging
  - Lines 1030-1033: Move log entry format

---

### 6. Hierarchy Examples (8 points)

**Example 1: Terrain Hierarchy**
- **File**: `src/App.tsx`
- **Lines 30-118**: Complete terrain class hierarchy
- **Description**: `Terrain` is the base class with 6 subclasses (GrassTerrain, DesertTerrain, ForestTerrain, MountainTerrain, SwampTerrain, WallTerrain). This demonstrates a clear "is-a" relationship hierarchy.
- **Screenshot**: Lines 30-54 (base class) and lines 56-118 (all subclasses)

**Example 2: Resource Hierarchy**
- **File**: `src/App.tsx`
- **Lines 120-273**: Complete resource class hierarchy
- **Description**: `Resource` is the base class with 5 subclasses (SpringResource, AnimalResource, GoldResource, TrophyResource, TraderResource). This shows another clear inheritance hierarchy.
- **Screenshot**: Lines 120-144 (base class) and lines 146-273 (all subclasses)

---

### 7. Inheritance Examples (8 points)

**Example 1: Terrain Inheritance**
- **File**: `src/App.tsx`
- **Lines 56-64**: `GrassTerrain extends Terrain`
- **Description**: `GrassTerrain` inherits from `Terrain`, inheriting `getColor()`, `getName()`, and `isWalkable()` methods, while overriding `getCost()` to return grass-specific costs.
- **Screenshot**: Lines 56-64 showing `class GrassTerrain extends Terrain` and the `getCost()` override

**Example 2: Resource Inheritance**
- **File**: `src/App.tsx`
- **Lines 146-159**: `SpringResource extends Resource`
- **Description**: `SpringResource` inherits from `Resource`, inheriting `getIcon()` and `getType()`, while implementing abstract methods `applyEffect()` and `getMessage()`.
- **Screenshot**: Lines 146-159 showing `class SpringResource extends Resource` and method implementations

---

### 8. Polymorphism Examples (8 points)

**Example 1: Terrain Polymorphism**
- **File**: `src/App.tsx`
- **Lines 439-443**: Terrain creation in map generation
- **Description**: Different terrain subclasses are created and stored as `Terrain` type, then used polymorphically through the base class interface. All terrains can be used interchangeably where a `Terrain` is expected.
- **Screenshot**: Lines 439-443 showing `new GrassTerrain()`, `new DesertTerrain()`, etc. being created and used as `Terrain` type

**Example 2: Strategy Pattern Polymorphism**
- **File**: `src/brain.ts`
- **Lines 130-140**: Strategy delegation
- **Description**: The `Brain` class uses `IBrainStrategy` interface, and different strategy implementations (GreedyStrategy, ExplorerStrategy, AggressiveStrategy) can be used interchangeably. The `calculateBestMove()` method calls `this.strategy.calculateMove()` without knowing which specific strategy is being used.
- **Screenshot**: Lines 130-140 in `src/brain.ts` showing `this.strategy.calculateMove()` polymorphic call

---

### 9. Encapsulation Examples (8 points)

**Example 1: Player Class Encapsulation**
- **File**: `src/App.tsx`
- **Lines 311-415**: `Player` class
- **Description**: The `Player` class has private fields (`food`, `water`, `gold`, `lives`, `visionRadius`) that cannot be accessed directly. Access is controlled through public methods like `getFood()`, `addFood()`, `subtractGold()`, etc. This prevents external code from directly modifying player state.
- **Screenshot**: 
  - Lines 311-327: Private field declarations
  - Lines 379-414: Public accessor methods (getters/setters)

**Example 2: GameMap Class Encapsulation**
- **File**: `src/App.tsx`
- **Lines 418-506**: `GameMap` class
- **Description**: The `GameMap` class has private readonly fields (`size`, `difficulty`, `tiles`, `trophyX`, `trophyY`) that are only accessible through public methods like `getSize()`, `getTiles()`, `getDifficulty()`. This ensures the map state cannot be accidentally modified.
- **Screenshot**:
  - Lines 419-423: Private readonly field declarations
  - Lines 503-505: Public accessor methods

---

### 10. Abstraction Examples (8 points)

**Example 1: Interface-Based Abstraction (IVision)**
- **File**: `src/interfaces.ts`
- **Lines 68-75**: `IVision` interface
- **File**: `src/vision.ts`
- **Line 21**: `export class Vision implements IVision`
- **Description**: The `IVision` interface defines the contract for vision functionality without specifying implementation. The `Vision` class implements this interface, and code using `IVision` doesn't need to know the concrete implementation details.
- **Screenshot**: 
  - Lines 68-75 in `src/interfaces.ts`: `IVision` interface definition
  - Line 21 in `src/vision.ts`: `class Vision implements IVision`

**Example 2: Abstract Base Class (Terrain)**
- **File**: `src/App.tsx`
- **Lines 30-54**: `Terrain` abstract base class
- **Description**: The `Terrain` class provides an abstraction for all terrain types. It defines common methods (`getColor()`, `getName()`, `isWalkable()`) and declares abstract methods (`getCost()`) that subclasses must implement. Code can work with `Terrain` objects without knowing the specific terrain type.
- **Screenshot**: Lines 30-54 showing the `Terrain` class with abstract `getCost()` method

---

### 11. Good Comments Examples (8 points)

**Example 1: Strategy Pattern Documentation**
- **File**: `src/brain-strategies.ts`
- **Lines 4-7**: Interface documentation
- **Lines 29-31**: Class documentation
- **Description**: Clear, concise comments explaining the purpose of the Strategy pattern, what each strategy does, and how they differ. These comments help developers understand the design pattern being used.
- **Screenshot**: 
  - Lines 4-7: `IBrainStrategy` interface documentation
  - Lines 29-31: `GreedyStrategy` class documentation

**Example 2: Service Class Documentation**
- **File**: `src/trader-service.ts`
- **Lines 4-7**: Class-level documentation
- **Lines 10-11**: Method documentation
- **Description**: Well-documented class explaining its purpose (Single Responsibility Principle) and methods explaining what they do. These comments make the code self-documenting.
- **Screenshot**:
  - Lines 4-7: `TraderService` class documentation
  - Lines 10-11: `generateOffer()` method documentation

**Example 3: Brain Class Documentation**
- **File**: `src/brain.ts`
- **Lines 16-18**: Class documentation
- **Description**: Explains the use of Strategy pattern and Open/Closed Principle, helping developers understand the design decisions.
- **Screenshot**: Lines 16-18 in `src/brain.ts`

---

## Code File Summary

For easy reference, here are the key files and their purposes:

- **`src/App.tsx`**: Main game logic, classes (Terrain, Resource, Player, Game, GameMap), and React UI
- **`src/brain.ts`**: Brain class using Strategy pattern
- **`src/brain-strategies.ts`**: Strategy implementations for each brain personality
- **`src/types.ts`**: Enums, constants, and type definitions
- **`src/interfaces.ts`**: Interface definitions for abstraction
- **`src/trader-service.ts`**: Trader business logic (Single Responsibility Principle)
- **`src/vision.ts`**: Vision system implementation
- **`src/autoplay.tsx`**: Autoplay UI controls
- **`src/game-types.ts`**: Type definitions for game operations

---

## Screenshot Checklist

When taking screenshots for your report, make sure to capture:

1. **Terrain Types**: `src/App.tsx` lines 30-118
2. **Trader Types**: `src/App.tsx` lines 211-273 and 696-900
3. **Vision Types**: `src/types.ts` lines 39-46 and 71-76
4. **Brain Types**: `src/brain-strategies.ts` lines 32-361
5. **Hierarchy**: `src/App.tsx` lines 30-118 (Terrain) and 120-273 (Resource)
6. **Inheritance**: `src/App.tsx` lines 56-64 (GrassTerrain) and 146-159 (SpringResource)
7. **Polymorphism**: `src/App.tsx` lines 439-443 and `src/brain.ts` lines 130-140
8. **Encapsulation**: `src/App.tsx` lines 311-415 (Player) and 418-506 (GameMap)
9. **Abstraction**: `src/interfaces.ts` lines 68-75 and `src/App.tsx` lines 30-54
10. **Comments**: `src/brain-strategies.ts` lines 4-7, `src/trader-service.ts` lines 4-7, `src/brain.ts` lines 16-18

---

## Total Points Summary

- Terrain Types: **15 points** (6 types)
- Trader Types: **20 points** (3 types)
- Vision Types: **10 points** (4 types)
- Brain Types: **15 points** (3 types)
- Video/Text Output: **12 points**
- Hierarchy: **8 points**
- Inheritance: **8 points**
- Polymorphism: **8 points**
- Encapsulation: **8 points**
- Abstraction: **8 points**
- Good Comments: **8 points**

**Total: 120 points**

