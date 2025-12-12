# Game Project - OOP Design Report

## Project Summary

### What is Finished
- **Complete game functionality**: The game is fully playable with all core features implemented and tested
- **Terrain system**: 6 different terrain types (Grass, Desert, Forest, Mountain, Swamp, Wall) with varying movement costs that affect gameplay strategy
- **Trader system**: 3 distinct trader types (Regular, Impatient, Generous) with unique trading behaviors, counter-offer logic, and patience thresholds
- **Vision system**: 4 different vision types (Focused: 3 tiles, Cautious: 4 tiles, Keen-Eyed: 5 tiles, Far-Sight: 8 tiles) affecting visibility range and strategic planning
- **AI Brain system**: 3 different brain personalities (Greedy, Explorer, Aggressive) with unique decision-making algorithms implemented using the Strategy design pattern
- **Resource management**: Complete food, water, gold, and lives system with proper encapsulation and state management
- **Level progression**: Multi-level gameplay with resource carryover between levels, increasing difficulty, and level tracking
- **Autoplay feature**: AI-controlled gameplay with configurable personalities, adjustable speed, and move reasoning display
- **Object-Oriented Design**: Full implementation of OOP principles including:
  - **Inheritance hierarchies**: Terrain and Resource class hierarchies with 6 and 5 subclasses respectively
  - **Polymorphism**: Through interfaces (`IBrainStrategy`, `IVision`, `IGameState`) and abstract base classes (`Terrain`, `Resource`, `GameObject`)
  - **Encapsulation**: Private fields with controlled access through public methods in all classes (Player, GameMap, Brain, etc.)
  - **Abstraction**: Multiple interfaces (`IGameState`, `IVision`, `ITile`, `ITerrain`, `IResource`, `IPlayer`) and abstract base classes
  - **Strategy pattern**: Brain personalities implemented as interchangeable strategy objects
  - **Single Responsibility Principle**: Separate services (`TraderService`) and focused classes
  - **Open/Closed Principle**: Brain system open for extension (new strategies) but closed for modification
  - **Dependency Inversion**: High-level modules depend on abstractions (interfaces) rather than concrete implementations
- **Type safety**: Full TypeScript implementation with enums, interfaces, and strict typing throughout
- **Code organization**: Well-structured codebase with separate files for types, interfaces, strategies, and services

### What is Not Yet Finished
- No major functionality is missing. The project is complete and ready for demonstration. All core features are implemented, tested, and working correctly.

---

## Application of Object-Oriented Design

This project extensively applies Object-Oriented Design principles learned in class, following best practices from Lectures 2, 16, 24, and 26:

### 1. **Class Hierarchy and Inheritance**
The project uses inheritance to model "is-a" relationships between game entities, following the classification and hierarchy concepts from Lecture 2:

- **Terrain Hierarchy**: `Terrain` base class with 6 subclasses (Grass, Desert, Forest, Mountain, Swamp, Wall)
  - All terrains share common behavior (color, name, walkability) but have different movement costs
  - Demonstrates template method pattern with abstract `getCost()` method
  
- **Resource Hierarchy**: `Resource` base class with 5 subclasses (Spring, Animal, Gold, Trophy, Trader)
  - All resources share common interface (`getIcon()`, `getType()`, `getMessage()`) but have different effects
  - Abstract `applyEffect()` method ensures all resources can be processed polymorphically
  
- **GameObject Hierarchy**: Abstract `GameObject` base class for `Player`
  - Prevents direct instantiation (throws error if attempted)
  - Provides common position management functionality
  
- **Strategy Pattern Hierarchy**: `IBrainStrategy` interface with 3 concrete implementations (GreedyStrategy, ExplorerStrategy, AggressiveStrategy)
  - All strategies implement the same interface, making them interchangeable
  - Demonstrates interface-based inheritance

**Code Evidence:**
- `src/App.tsx` lines 8-28: `GameObject` abstract base class with constructor check
- `src/App.tsx` lines 30-54: `Terrain` base class with abstract `getCost()` method
- `src/App.tsx` lines 120-144: `Resource` base class with abstract `applyEffect()` and `getMessage()` methods
- `src/brain-strategies.ts` lines 8-19: `IBrainStrategy` interface definition

### 2. **Encapsulation (Information Hiding)**
All classes properly encapsulate their data, hiding implementation details and exposing only what's necessary (Lecture 2 & 26):

- **Private Fields**: Internal state is hidden from external access
  - `Player` class: `private food`, `private water`, `private gold`, `private lives`, `private readonly visionRadius`
  - `GameMap` class: `private readonly size`, `private readonly difficulty`, `private readonly tiles`
  - `Brain` class: `private readonly personality`, `private readonly visitedTiles`, `private readonly recentPositions`
  - `TraderResource` class: `private readonly traderType`, `private state`, `private counterOfferCount`

- **Public Methods**: Controlled access through well-defined interfaces
  - `Player`: `getFood()`, `addFood()`, `subtractGold()`, etc. instead of direct field access
  - `GameMap`: `getSize()`, `getTiles()`, `getDifficulty()` instead of direct field access
  - Methods validate inputs and maintain object invariants

- **Protected Fields**: Allow inheritance while maintaining encapsulation
  - `Terrain.name` and `Terrain.color` are `protected readonly` - accessible to subclasses but not external code
  - `Resource.type` and `Resource.icon` are `protected readonly` - same principle

**Code Evidence:**
- `src/App.tsx` lines 311-327: `Player` class with private fields
- `src/App.tsx` lines 379-414: `Player` public accessor methods
- `src/App.tsx` lines 418-423: `GameMap` private readonly fields
- `src/App.tsx` lines 503-505: `GameMap` public accessor methods
- `src/App.tsx` lines 30-32: `Terrain` protected fields

### 3. **Polymorphism**
Polymorphism is used throughout, allowing objects of different types to be treated uniformly (Lecture 2):

- **Terrain Polymorphism**: All terrain subclasses can be used wherever `Terrain` is expected
  - Map generation creates different terrain types but stores them as `Terrain` type
  - `Tile` class works with any `Terrain` without knowing the specific type
  - Method calls like `terrain.getCost()` work on any terrain subtype
  
- **Resource Polymorphism**: All resources implement the same interface
  - `Player.collectResource(resource: Resource)` works with any resource type
  - `resource.applyEffect()` is called polymorphically - each resource type has different behavior
  - Vision system finds resources without knowing their specific type
  
- **Strategy Polymorphism**: Brain strategies are interchangeable
  - `Brain` class uses `IBrainStrategy` interface - doesn't know which specific strategy
  - `this.strategy.calculateMove()` works with any strategy implementation
  - Strategies can be swapped at runtime without changing `Brain` class code
  
- **Interface Polymorphism**: Vision system uses interface abstraction
  - Code depends on `IVision` interface, not concrete `Vision` class
  - Allows for different vision implementations in the future

**Code Evidence:**
- `src/App.tsx` lines 439-443: Terrain creation - different types stored as `Terrain`
- `src/App.tsx` lines 274-304: `Tile` class uses `Terrain` type, not specific subtypes
- `src/App.tsx` lines 351-355: `collectResource()` uses `Resource` type polymorphically
- `src/brain.ts` lines 130-140: Strategy polymorphism - `this.strategy.calculateMove()`
- `src/vision.ts` line 21: `Vision implements IVision` - interface-based polymorphism

### 4. **Abstraction**
Abstraction is achieved through interfaces and abstract classes, focusing on "what" rather than "how" (Lecture 2):

- **Interface-Based Abstraction**: Multiple interfaces define contracts without implementation
  - `IGameState`: Abstracts game state structure - code depends on interface, not concrete game object
  - `IVision`: Abstracts vision functionality - allows different vision implementations
  - `IBrainStrategy`: Abstracts brain decision-making - enables Strategy pattern
  - `ITile`, `ITerrain`, `IResource`: Domain model abstractions
  - `IPlayer`: Player abstraction for dependency inversion

- **Abstract Base Classes**: Provide common structure while requiring subclass implementation
  - `Terrain`: Defines common terrain behavior, requires subclasses to implement `getCost()`
  - `Resource`: Defines common resource interface, requires subclasses to implement `applyEffect()` and `getMessage()`
  - `GameObject`: Abstract class that cannot be instantiated directly

- **Separation of Concerns**: Abstraction through service classes
  - `TraderService`: Abstracts trader business logic from game logic
  - Brain strategies: Abstract decision-making algorithms from brain coordination

**Code Evidence:**
- `src/interfaces.ts` lines 8-18: `IGameState` interface - game state abstraction
- `src/interfaces.ts` lines 68-75: `IVision` interface - vision system abstraction
- `src/interfaces.ts` lines 78-87: `IBrainStrategy` interface - strategy abstraction
- `src/App.tsx` lines 30-54: `Terrain` abstract base class
- `src/App.tsx` lines 120-144: `Resource` abstract base class
- `src/trader-service.ts` lines 4-40: `TraderService` - abstraction of trader logic

### 5. **SOLID Principles (Lecture 16)**
The project follows all five SOLID principles:

- **Single Responsibility Principle (SRP)**: Each class has one, and only one, reason to change
  - `TraderService`: Only responsible for trader offer generation and trade logic
  - `GreedyStrategy`, `ExplorerStrategy`, `AggressiveStrategy`: Each only responsible for one brain personality's logic
  - `GameMap`: Only responsible for map generation and tile management
  - `Player`: Only responsible for player state and resource management
  - `Vision`: Only responsible for visibility calculations and pathfinding

- **Open/Closed Principle (OCP)**: Open for extension, closed for modification
  - Brain system: New personalities can be added by creating new strategy classes without modifying `Brain` class
  - Terrain system: New terrain types can be added by extending `Terrain` without modifying existing code
  - Resource system: New resources can be added by extending `Resource` without changing collection logic

- **Liskov Substitution Principle (LSP)**: Subclasses must be usable anywhere their superclass is expected
  - All `Terrain` subclasses can be used wherever `Terrain` is expected
  - All `Resource` subclasses can be used wherever `Resource` is expected
  - All strategy implementations can be used wherever `IBrainStrategy` is expected
  - No subclass violates the expectations of its base class

- **Interface Segregation Principle (ISP)**: Many small, focused interfaces are better than one large interface
  - `IGameState`, `IVision`, `IBrainStrategy`, `ITile`, `ITerrain`, `IResource` are separate, focused interfaces
  - Classes only implement interfaces they actually need
  - No "god interfaces" that force classes to implement unused methods

- **Dependency Inversion Principle (DIP)**: High-level modules depend on abstractions, not concrete classes
  - `Brain` depends on `IBrainStrategy` interface, not concrete strategy classes
  - Brain strategies depend on `IGameState` and `IVision` interfaces, not concrete implementations
  - `TraderService` uses `TraderType` enum (abstraction) rather than concrete trader classes

**Code Evidence:**
- `src/trader-service.ts`: Single Responsibility - only trader logic
- `src/brain-strategies.ts` lines 32-127: `GreedyStrategy` - single responsibility
- `src/brain.ts` lines 41-42: Open/Closed - strategy created via factory, can add new strategies
- `src/brain-strategies.ts` lines 8-19: Interface Segregation - focused `IBrainStrategy` interface
- `src/brain.ts` lines 3-4: Dependency Inversion - imports interfaces, not concrete classes

### 6. **Object Identity and Classification (Lecture 2)**
- Every game object has its own identity (Player, Tile, Resource instances are distinct)
- Objects are classified into types (Terrain types, Resource types, Brain personalities)
- Classification enables polymorphism and code reuse

### 7. **Combining Data and Behavior (Lecture 2)**
- Objects own both their data and methods that operate on that data
- `Player` class contains food/water/gold data AND methods to manipulate them
- `Terrain` class contains name/color data AND methods to query them
- Unlike procedural code, data and behavior are encapsulated together

### How This Helped the Design
- **Maintainability**: Clear separation of concerns makes code easier to understand and modify. Each class has a single, well-defined purpose.
- **Extensibility**: New terrain types, resources, or brain personalities can be added without modifying existing code (Open/Closed Principle). For example, adding a new brain personality requires only creating a new strategy class.
- **Type Safety**: Strong TypeScript typing prevents errors and makes the code self-documenting. Enums prevent magic strings, interfaces ensure contracts are met.
- **Testability**: Interfaces and encapsulation make unit testing straightforward. Each class can be tested in isolation with mock dependencies.
- **Code Reuse**: Inheritance and polymorphism eliminate code duplication. Common terrain/resource behavior is defined once in base classes.
- **Flexibility**: Polymorphism allows runtime behavior changes (e.g., switching brain strategies) without code changes.
- **Robustness**: Encapsulation prevents invalid state changes. Private fields can only be modified through controlled public methods.

---

## Grading Information

### 1. Terrain Types (15 points)

**Number of terrain types: 6**

The project implements 6 different terrain types, each with unique movement costs that affect gameplay strategy:

1. **Grass** (`GrassTerrain`) - Low cost (1 food, 1 water)
   - Most efficient terrain for movement
   - Green color (#7cb342)
   - Always walkable

2. **Desert** (`DesertTerrain`) - Moderate cost (1 food, 3 water)
   - High water consumption makes it risky
   - Yellow color (#fdd835)
   - Always walkable

3. **Forest** (`ForestTerrain`) - Moderate cost (2 food, 1 water)
   - Moderate food cost, low water cost
   - Dark green color (#2e7d32)
   - Always walkable

4. **Mountain** (`MountainTerrain`) - High cost (3 food, 2 water)
   - Most expensive walkable terrain
   - Gray color (#616161)
   - Always walkable

5. **Swamp** (`SwampTerrain`) - Moderate cost (2 food, 2 water)
   - Balanced but moderate cost
   - Olive green color (#558b2f)
   - Always walkable

6. **Wall** (`WallTerrain`) - Impassable (0 cost, not walkable)
   - Cannot be traversed (overrides `isWalkable()` to return false)
   - Brown color (#5d4037)
   - Used for map borders

**Design Pattern**: All terrain types inherit from the abstract `Terrain` base class, which defines the common interface (`getColor()`, `getName()`, `isWalkable()`) and requires subclasses to implement `getCost()`. This follows the Template Method pattern.

**Code Location:**
- **File**: `src/App.tsx`
- **Lines 30-54**: `Terrain` base class definition
  - Line 30: `export class Terrain` - Base class declaration
  - Lines 31-32: Protected fields (`name`, `color`) for inheritance
  - Line 39: Abstract `getCost()` method that subclasses must implement
  - Lines 43-48: Common methods inherited by all terrains
  - Line 51: Default `isWalkable()` returns true (overridden by WallTerrain)
  
- **Lines 56-64**: `GrassTerrain extends Terrain`
  - Line 56: Class declaration showing inheritance
  - Line 58: Constructor calls `super()` with terrain type and color from constants
  - Lines 61-63: Implements `getCost()` returning grass-specific costs
  
- **Lines 66-74**: `DesertTerrain extends Terrain`
  - Line 66: Class declaration
  - Lines 71-73: Returns desert-specific costs (1 food, 3 water)
  
- **Lines 76-84**: `ForestTerrain extends Terrain`
  - Lines 81-83: Returns forest-specific costs (2 food, 1 water)
  
- **Lines 86-94**: `MountainTerrain extends Terrain`
  - Lines 91-93: Returns mountain-specific costs (3 food, 2 water)
  
- **Lines 96-104**: `SwampTerrain extends Terrain`
  - Lines 101-103: Returns swamp-specific costs (2 food, 2 water)
  
- **Lines 106-118**: `WallTerrain extends Terrain`
  - Line 106: Class declaration
  - Lines 111-113: Returns wall costs (0, 0)
  - **Lines 115-117**: **Important**: Overrides `isWalkable()` to return `false` - this is the only terrain that is not walkable

**Additional Code Evidence:**
- **Lines 439-443**: Terrain creation in map generation - shows polymorphism
- **Lines 457-461**: Random terrain generation logic
- **File**: `src/types.ts`
  - **Lines 20-29**: `TerrainType` enum definition
  - **Lines 78-86**: `TERRAIN_COSTS` constant mapping terrain types to costs
  - **Lines 87-95**: `TERRAIN_COLORS` constant mapping terrain types to colors

**Screenshot locations for complete terrain system:**
1. **Base class**: `src/App.tsx` lines 30-54
2. **All subclasses**: `src/App.tsx` lines 56-118
3. **Type definitions**: `src/types.ts` lines 20-29, 78-95
4. **Usage example**: `src/App.tsx` lines 439-443 (map generation)

---

### 2. Trader Types (20 points)

**Number of trader types: 3**

The project implements 3 distinct trader types with unique behaviors, decision-making logic, and patience thresholds:

1. **Regular Trader** (`TraderType.REGULAR`)
   - **Acceptance threshold**: Accepts counter offers if they are ≥ 90% of base cost
   - **Patience**: Leaves after 3 failed counter offers
   - **Pricing**: Standard pricing (no discounts)
   - **Behavior**: Moderate flexibility, standard business practices
   - **Decision logic**: If `counterGold >= baseCost * 0.9`, accepts. Otherwise rejects and increments counter.

2. **Impatient Trader** (`TraderType.IMPATIENT`)
   - **Acceptance threshold**: Accepts counter offers if they are ≥ 85% of base cost (more flexible than regular)
   - **Patience**: Leaves after only 2 failed counter offers (least patient)
   - **Pricing**: Standard pricing (no discounts)
   - **Behavior**: More lenient on price but less patient with negotiations
   - **Special feature**: Becomes unavailable for 5 turns after leaving (can't be found immediately)
   - **Decision logic**: If `counterGold >= baseCost * 0.85`, accepts. If offer is far below (≥4 gold difference), leaves immediately offended. Otherwise rejects and increments counter.

3. **Generous Trader** (`TraderType.GENEROUS`)
   - **Acceptance threshold**: Accepts counter offers if they are ≥ 75% of base cost (very generous)
   - **Patience**: Leaves after 4 failed counter offers (most patient)
   - **Pricing**: Offers 15% discount on all trades (baseCost * 0.85)
   - **Behavior**: Very generous with pricing and patience, but prevents overpayment
   - **Special feature**: Stops players from offering MORE than base cost (doesn't want to scam players)
   - **Decision logic**: If `counterGold > baseCost`, rejects with message about not wanting to scam. If `counterGold === baseCost`, accepts immediately. If `counterGold >= baseCost * 0.75`, uses probability-based acceptance. Otherwise rejects and increments counter.

**Detailed Decision-Making Algorithm:**

All traders follow this general flow in `submitCounterOffer()`:
1. **Validation**: Check if trader exists and offer is valid
2. **Type-specific logic**: Each trader type has different acceptance thresholds
3. **Counter tracking**: Each rejection increments a counter
4. **Patience check**: After threshold rejections, trader leaves
5. **Trade completion**: If accepted, resources are exchanged and new offer generated

**Regular Trader Logic** (Lines 800-838):
- Calculates `priceDiff = baseCost - counterGold`
- If `counterGold >= baseCost`, accepts immediately
- If `priceDiff <= baseCost * 0.1` (within 10%), accepts
- Otherwise rejects and increments counter
- After 3 rejections, leaves

**Impatient Trader Logic** (Lines 780-799):
- If `counterGold > baseCost`, accepts immediately
- If `priceDiff >= 4` (very low offer), leaves immediately offended
- If `priceDiff <= baseCost * 0.15` (within 15%), accepts
- Otherwise rejects and increments counter
- After 2 rejections, leaves
- Sets unavailable for 5 turns when leaving

**Generous Trader Logic** (Lines 743-778):
- If `counterGold > baseCost`, rejects (doesn't want to scam)
- If `counterGold === baseCost`, accepts immediately
- If `counterGold >= baseCost * 0.75`, uses probability: `successRate = 1 - 0.15 * priceDiff`
- Otherwise rejects and increments counter
- After 4 rejections, leaves

**Code Location:**
- **File**: `src/App.tsx`
- **Lines 211-273**: `TraderResource` class definition
  - **Line 212**: `private readonly traderType: TraderType` - Trader type stored as enum
  - **Line 217**: Constructor with `TraderType` parameter and default value
  - **Lines 238-242**: `isAvailable()` method - checks if trader is available (impatient traders can be unavailable)
  - **Lines 253-255**: `incrementCounter()` - tracks failed offers
  - **Lines 257-259**: `resetCounter()` - resets after successful trade
  - **Lines 261-263**: `getCounterOfferCount()` - returns current rejection count
  - **Lines 265-268**: `setUnavailable()` - makes trader unavailable (impatient trader feature)
  - **Line 270**: `getTraderType()` - returns trader type
  
- **Lines 701-900**: `submitCounterOffer()` method - complete trader decision logic
  - **Lines 712-714**: Gets trader and offer details
  - **Lines 718-741**: `completeTrade()` helper function - executes trade when accepted
  - **Lines 743-778**: **Generous trader logic** - most complex, includes probability
  - **Lines 780-799**: **Impatient trader logic** - includes immediate leave on low offers
  - **Lines 800-838**: **Regular trader logic** - standard 10% threshold
  - **Lines 840-900**: Trader leaving logic and state management

- **File**: `src/trader-service.ts`
- **Lines 12-28**: `generateOffer()` method
  - **Lines 13-19**: Base offer pool (same for all traders)
  - **Lines 23-25**: **Generous trader discount**: `offer.baseCost = Math.max(3, Math.round(offer.baseCost * 0.85))`
  - This is where generous traders get their 15% discount

- **File**: `src/types.ts`
- **Lines 48-54**: `TraderType` enum definition
  - `REGULAR: 'regular'`
  - `IMPATIENT: 'impatient'`
  - `GENEROUS: 'generous'`

- **File**: `src/App.tsx`
- **Lines 484-486**: Trader creation in map generation
  - Randomly creates one of three trader types with equal probability

**Screenshot locations for complete trader system:**
1. **Trader class**: `src/App.tsx` lines 211-273
2. **Trader type enum**: `src/types.ts` lines 48-54
3. **Generous trader discount**: `src/trader-service.ts` lines 23-25
4. **Regular trader logic**: `src/App.tsx` lines 800-838
5. **Impatient trader logic**: `src/App.tsx` lines 780-799
6. **Generous trader logic**: `src/App.tsx` lines 743-778
7. **Trade completion**: `src/App.tsx` lines 718-741

---

### 3. Vision Types (10 points)

**Number of vision types: 4**

The project implements 4 different vision types, each affecting the player's visibility radius and strategic planning ability:

1. **Focused** (`VisionType.FOCUSED`) - 3 tile radius
   - **Description**: Limited visibility - tight, tactical view
   - **Gameplay impact**: Player can only see immediate surroundings, requires careful exploration
   - **Use case**: More challenging gameplay, forces conservative movement

2. **Cautious** (`VisionType.CAUTIOUS`) - 4 tile radius
   - **Description**: Moderate visibility - watch your surroundings
   - **Gameplay impact**: Better than focused but still limited, allows moderate planning
   - **Use case**: Balanced difficulty, moderate strategic planning

3. **Keen-Eyed** (`VisionType.KEEN_EYED`) - 5 tile radius
   - **Description**: Standard visibility - balanced view
   - **Gameplay impact**: Default vision, allows good strategic planning
   - **Use case**: Standard gameplay experience, good balance

4. **Far-Sight** (`VisionType.FAR_SIGHT`) - 8 tile radius
   - **Description**: Maximum visibility - see danger and opportunities early
   - **Gameplay impact**: Can see far ahead, allows long-term planning
   - **Use case**: Easier gameplay, maximum strategic advantage

**Implementation Details:**
- Vision radius is stored in `VISION_RADIUS_CONFIG` constant object
- Vision type is set when starting a game and cannot be changed during gameplay
- Vision affects what tiles the player can see, which resources are visible, and pathfinding calculations
- The `Vision` class uses the radius to calculate visible tiles in a circular area around the player

**Code Location:**
- **File**: `src/types.ts`
- **Lines 39-46**: `VisionType` enum definition
  ```typescript
  export const VisionType = {
    FOCUSED: 'focused',
    CAUTIOUS: 'cautious',
    KEEN_EYED: 'keen-eyed',
    FAR_SIGHT: 'far-sight'
  } as const;
  ```
  
- **Lines 71-76**: `VISION_RADIUS_CONFIG` constant mapping
  ```typescript
  export const VISION_RADIUS_CONFIG = {
    [VisionType.FOCUSED]: 3,
    [VisionType.CAUTIOUS]: 4,
    [VisionType.KEEN_EYED]: 5,
    [VisionType.FAR_SIGHT]: 8
  } as const;
  ```
  This maps each vision type to its radius value using computed property names.

- **File**: `src/App.tsx`
- **Lines 539-553**: `Game` constructor accepts `visionType: VisionType` parameter
- **Lines 591-593**: `getVisionRadius()` method
  ```typescript
  getVisionRadius(): number {
    return VISION_RADIUS_CONFIG[this.visionType] ?? DEFAULT_VISION_RADIUS;
  }
  ```
  This method looks up the vision radius from the config, with a fallback to default (5).

- **Lines 552-564**: Vision radius used in player creation
  - Line 562: `visionRadius` is passed to `Player` constructor
  - This sets the player's vision radius for the entire game

- **File**: `src/vision.ts`
- **Lines 27-34**: `Vision` constructor uses vision radius from game state
- **Lines 36-57**: `getVisibleTiles()` method calculates visible tiles based on radius
  - Uses distance calculation: `distanceSquared = dx*dx + dy*dy`
  - Checks if `distanceSquared <= visionRadius * visionRadius` (circular vision)

- **File**: `src/App.tsx`
- **Lines 1178-1205**: Vision type selection UI
  - Four buttons for selecting vision type before starting game
  - Each button calls `startGame(difficulty, VisionType.XXX)`

**Screenshot locations for complete vision system:**
1. **Vision type enum**: `src/types.ts` lines 39-46
2. **Vision radius config**: `src/types.ts` lines 71-76
3. **getVisionRadius method**: `src/App.tsx` lines 591-593
4. **Vision usage in player creation**: `src/App.tsx` lines 552-564
5. **Vision class implementation**: `src/vision.ts` lines 27-57
6. **Vision selection UI**: `src/App.tsx` lines 1178-1205

---

### 4. Brain Types (15 points)

**Number of brain types: 3**

The project implements 3 distinct AI brain personalities, each with unique decision-making algorithms implemented using the Strategy design pattern:

1. **Greedy Brain** (`BrainPersonality.GREEDY`)
   - **Primary goal**: Collect EVERY resource in sight (food, water, gold) before pursuing trophy
   - **Resource thresholds**: NONE - ignores resource levels completely
   - **Decision logic**:
     1. Scans all visible tiles for resources (excluding trophy and trader)
     2. If ANY resources found, collects the closest one first
     3. Only pursues trophy when NO resources are visible
     4. Fallback: Explores unvisited tiles to find new resources
   - **Terrain preference**: Prefers low-cost terrain (score -= cost * 10)
   - **Exploration**: Strongly prefers unvisited tiles (+150 score) to find uncollected resources
   - **Loop prevention**: Penalizes recently visited tiles (-200 to -50 score based on recency)
   - **Use case**: Maximizes resource collection, good for building up resources before trophy hunt

2. **Explorer Brain** (`BrainPersonality.EXPLORER`)
   - **Primary goal**: Maintain resources at 50% of starting levels while pursuing trophy
   - **Resource thresholds**: 
     - Safe threshold: 50% of starting resources
     - Critical threshold: 25% of starting resources
   - **Decision logic**:
     1. If critically low (< 25%), emergency resource gathering
     2. If trophy visible AND not critically low, pursues trophy
     3. If below safe threshold (< 50%), proactively restocks
     4. Fallback: Moves conservatively, strongly avoiding expensive terrain
   - **Terrain preference**: VERY strongly avoids expensive terrain (score -= cost * 40)
   - **Exploration**: Moderate preference for unvisited tiles (+20 score)
   - **Risk aversion**: Strongly penalizes expensive terrain to conserve resources
   - **Use case**: Balanced approach, maintains resources while progressing toward trophy

3. **Aggressive Brain** (`BrainPersonality.AGGRESSIVE`)
   - **Primary goal**: Trophy hunting above all else
   - **Resource thresholds**:
     - Critical threshold: 15% of starting resources (only gets resources when absolutely necessary)
     - Minimum threshold: 10% of starting resources (death prevention)
   - **Decision logic**:
     1. If trophy visible AND above minimum threshold, goes for trophy immediately
     2. If critically low (< 15%), gets resources to survive
     3. Otherwise: Aggressively searches for trophy
   - **Terrain preference**: Ignores terrain costs unless resources very low (< 30)
   - **Exploration**: Strongly prefers unvisited tiles (+100 score) and map center
   - **Risk tolerance**: Takes risks, only avoids expensive terrain when resources < 30
   - **Use case**: Fast trophy hunting, takes calculated risks

**How They Work - Strategy Pattern Implementation:**

The brain system uses the Strategy design pattern (from Lecture 16 - Open/Closed Principle):

1. **Interface Definition**: `IBrainStrategy` interface defines the contract
   - Single method: `calculateMove()` that returns a move decision
   - All strategies must implement this interface

2. **Strategy Classes**: Each personality has its own strategy class
   - `GreedyStrategy` implements `IBrainStrategy`
   - `ExplorerStrategy` implements `IBrainStrategy`
   - `AggressiveStrategy` implements `IBrainStrategy`

3. **Brain Class**: `Brain` class uses composition, not inheritance
   - Contains a `strategy: IBrainStrategy` field
   - Delegates move calculation to the strategy: `this.strategy.calculateMove()`
   - Doesn't know which specific strategy is being used (polymorphism)

4. **Factory Pattern**: `BrainStrategyFactory` creates the appropriate strategy
   - Takes personality type and returns corresponding strategy instance
   - Allows easy addition of new personalities without modifying `Brain` class

5. **Move Calculation Process**:
   - `Brain.calculateBestMove()` is called with game state
   - Creates `Vision` instance to see visible tiles
   - Finds trophy position if visible
   - Delegates to strategy's `calculateMove()` method
   - Strategy analyzes state and returns move decision with reason
   - Brain tracks visited tiles and recent positions to prevent loops

**Detailed Algorithm Examples:**

**Greedy Strategy** (Lines 35-127 in `brain-strategies.ts`):
```typescript
// Step 1: Find all visible resources (excluding trophy/trader)
for (const {x, y, tile} of visibleTiles) {
  const resource = tile.getResource();
  if (resource && resource.getType() !== ResourceType.TROPHY && resource.getType() !== ResourceType.TRADER) {
    availableResources.push({ x, y, type: resource.getType(), distance });
  }
}

// Step 2: If resources found, collect closest
if (availableResources.length > 0) {
  availableResources.sort((a, b) => a.distance - b.distance);
  return move to closest resource;
}

// Step 3: Only go for trophy if no resources visible
if (trophyPos && availableResources.length === 0) {
  return move to trophy;
}

// Step 4: Fallback - explore to find resources
return greedyFallback();
```

**Explorer Strategy** (Lines 128-264 in `brain-strategies.ts`):
```typescript
const SAFE_THRESHOLD = startingResources.food * 0.5;  // 50%
const CRITICAL_THRESHOLD = startingResources.food * 0.25;  // 25%

// Step 1: Critical emergency
if (food < CRITICAL_THRESHOLD || water < CRITICAL_THRESHOLD) {
  return move to closest food/water;
}

// Step 2: Trophy visible - go for it
if (trophyPos) {
  return move to trophy;
}

// Step 3: Below safe threshold - restock
if (food < SAFE_THRESHOLD) {
  return move to closest food;
}
if (water < SAFE_THRESHOLD) {
  return move to closest water;
}

// Step 4: Fallback - conservative movement
return explorerFallback();
```

**Aggressive Strategy** (Lines 265-361 in `brain-strategies.ts`):
```typescript
const CRITICAL_THRESHOLD = startingResources.food * 0.15;  // 15%
const MINIMUM_THRESHOLD = startingResources.food * 0.1;  // 10%

// Step 1: Trophy visible - go for it (unless about to die)
if (trophyPos && food >= MINIMUM_THRESHOLD && water >= MINIMUM_THRESHOLD) {
  return move to trophy;
}

// Step 2: Only get resources if critical
if (food < CRITICAL_THRESHOLD || water < CRITICAL_THRESHOLD) {
  return move to closest food/water;
}

// Step 3: Aggressively search for trophy
return aggressiveFallback();
```

**Code Location:**
- **File**: `src/brain-strategies.ts`
- **Lines 8-19**: `IBrainStrategy` interface definition
  - Defines the contract all strategies must follow
  - Method signature: `calculateMove(gameState, vision, trophyPos, food, water, startingResources, visitedTiles, recentPositions)`
  
- **Lines 32-127**: `GreedyStrategy` class
  - **Lines 35-44**: `calculateMove()` method signature
  - **Lines 45-67**: Resource collection logic
  - **Lines 69-76**: Trophy pursuit (only if no resources)
  - **Lines 82-127**: `greedyFallback()` - exploration logic with scoring
  
- **Lines 128-264**: `ExplorerStrategy` class
  - **Lines 141-142**: Threshold calculations (50% and 25%)
  - **Lines 144-160**: Critical emergency handling
  - **Lines 162-168**: Trophy pursuit
  - **Lines 170-191**: Safe threshold maintenance
  - **Lines 193-264**: `explorerFallback()` - conservative movement
  
- **Lines 265-361**: `AggressiveStrategy` class
  - **Lines 278-279**: Threshold calculations (15% and 10%)
  - **Lines 281-291**: Trophy pursuit (highest priority)
  - **Lines 293-312**: Critical resource gathering
  - **Lines 314-361**: `aggressiveFallback()` - aggressive exploration

- **Lines 368-378**: `BrainStrategyFactory` class
  - **Lines 370-377**: `create()` method - factory method that creates appropriate strategy
  - Uses switch statement to map personality to strategy class

- **File**: `src/brain.ts`
- **Lines 20-42**: `Brain` class definition
  - **Line 24**: `private readonly strategy: IBrainStrategy` - strategy field
  - **Lines 35-39**: Helper object creation for shared functionality
  - **Line 42**: Strategy creation via factory: `BrainStrategyFactory.create(personality, this.helper)`
  
- **Lines 112-149**: `calculateBestMove()` method
  - **Lines 116-118**: Creates Vision and gets resources
  - **Lines 120-126**: Tracks current position to prevent loops
  - **Line 128**: Finds trophy position
  - **Lines 130-140**: **Strategy delegation** - `this.strategy.calculateMove(...)`
  - **Lines 142-146**: Tracks visited tiles
  - **Line 148**: Fallback to basic move if strategy returns null

- **File**: `src/types.ts`
- **Lines 2-7**: `BrainPersonality` enum
  - `GREEDY: 'greedy'`
  - `EXPLORER: 'explorer'`
  - `AGGRESSIVE: 'aggressive'`
  
- **Lines 107-112**: `BRAIN_THRESHOLD_MULTIPLIERS` constants
  - `EXPLORER_SAFE: 0.5` (50%)
  - `EXPLORER_CRITICAL: 0.25` (25%)
  - `AGGRESSIVE_CRITICAL: 0.15` (15%)
  - `AGGRESSIVE_MINIMUM: 0.1` (10%)

- **File**: `src/autoplay.tsx`
- **Lines 107-125**: Brain personality selection UI
- **Lines 38-39**: Threshold calculations for display

**Screenshot locations for complete brain system:**
1. **Strategy interface**: `src/brain-strategies.ts` lines 8-19
2. **Greedy strategy**: `src/brain-strategies.ts` lines 32-127
3. **Explorer strategy**: `src/brain-strategies.ts` lines 128-264
4. **Aggressive strategy**: `src/brain-strategies.ts` lines 265-361
5. **Brain class**: `src/brain.ts` lines 20-42
6. **Strategy delegation**: `src/brain.ts` lines 130-140
7. **Factory pattern**: `src/brain-strategies.ts` lines 368-378
8. **Personality enum**: `src/types.ts` lines 2-7

---

### 5. Video/Text Output (12 points)

The program provides comprehensive text output throughout gameplay, giving players clear feedback on all actions and game state changes:

**Output Types:**

1. **Move Log** (Detailed move history)
   - Shows each move with coordinates: "Move (dx, dy) from (x1, y1) to (x2, y2)"
   - Displays resource changes: "Food 50→45, Water 30→27, Gold 10→10"
   - Includes move messages when applicable
   - Maintains last 20 moves in scrollable log
   - Format: `Move (${dx}, ${dy}) from (${before.x},${before.y}) to (${after.x},${after.y}) | Food ${before.food}→${after.food}, Water ${before.water}→${after.water}, Gold ${before.gold}→${after.gold}${msg ? ' | ' + msg : ''}`

2. **Resource Collection Messages**
   - Spring: "+30 Water from spring!" or difficulty-based amounts
   - Animal: "+30 Food from hunting!" or difficulty-based amounts
   - Gold: "+10 Gold collected!"
   - Trophy: "Level X Complete! +10 Food, +10 Water, +5 Gold!"
   - Custom messages from each resource type's `getMessage()` method

3. **Trade Feedback Messages**
   - Trade acceptance: "Trade accepted! You gained +25 Food for 6 gold."
   - Trade rejection: "The regular trader declines this offer. Try offering a bit more gold."
   - Trader leaving: "After too many failed offers, the regular trader decides to leave."
   - Counter offer feedback displayed in trade menu

4. **Game State Messages**
   - Game Over: "Game Over! No lives or resources remaining!"
   - Level Complete: "Level 1 Complete! +10 Food, +10 Water, +5 Gold!"
   - Life Lost: "Not enough resources! Lost a life. Respawned with +5 food and +5 water. 2 lives remaining."
   - Trader unavailable: "This trader is currently unavailable (will return in a few turns)."

5. **Brain Move Reasons** (Autoplay feature)
   - Shows why AI made each move: "GREEDY: Collecting gold resource"
   - Examples:
     - "GREEDY: No resources visible, pursuing trophy"
     - "EXPLORER: Maintaining food at 50% threshold"
     - "AGGRESSIVE: Trophy in sight - going for it!"
   - Displayed in "Last move reason" box in brain control panel

6. **Trader Interaction Messages**
   - Trader discovery: "Found a Regular Trader!" / "Found a Generous Trader!" / "Found an Impatient Trader!"
   - Trade offers displayed with item, amount, and cost
   - Trader type shown in trade menu

7. **UI Status Display**
   - Current resources (Food, Water, Gold, Lives) always visible
   - Current level displayed
   - Difficulty and vision type shown
   - Game over/win screens with messages

**Code Location:**
- **File**: `src/App.tsx`
- **Lines 1008-1034**: `handleMove()` function - main move handling and logging
  - **Lines 1011-1016**: Gets game state before and after move
  - **Lines 1018-1022**: Handles trader discovery and trade menu display
  - **Lines 1023-1029**: Displays move result messages
  - **Lines 1030-1033**: **Move log entry creation** - detailed format:
    ```typescript
    const msg = 'message' in result ? result.message : '';
    const entry = `Move (${dx}, ${dy}) from (${before.player.x},${before.player.y}) to (${after.player.x},${after.player.y}) | Food ${before.resources.food}→${after.resources.food}, Water ${before.resources.water}→${after.resources.water}, Gold ${before.resources.gold}→${after.resources.gold}${msg ? ' | ' + msg : ''}`;
    setMoveLog(prev => [entry, ...prev].slice(0, 20));
    ```
  - **Line 1034**: Maintains last 20 moves (`.slice(0, 20)`)

- **Lines 599-694**: `attemptMove()` method - returns messages for different outcomes
  - **Lines 608-610**: Life loss message with lives remaining
  - **Lines 614**: Game over message
  - **Lines 629**: Level complete message with rewards
  - **Lines 648-652**: Trader discovery message
  - **Lines 665**: Spring collection message (difficulty-based)
  - **Lines 680**: Animal collection message (difficulty-based)
  - **Lines 688-691**: Generic resource collection message

- **Lines 701-900**: `submitCounterOffer()` - trade feedback messages
  - **Lines 732**: Trade acceptance message
  - **Lines 746-747**: Generous trader rejection message
  - **Lines 773**: Generous trader decline message
  - **Lines 792-794**: Impatient trader leaving message
  - **Lines 838**: Regular trader leaving message

- **Lines 920-950**: `acceptCurrentOffer()` - trade acceptance messages
  - **Lines 945**: Trade completion message with reward label

- **File**: `src/App.tsx`
- **Lines 146-159**: `SpringResource.getMessage()` - "+30 Water from spring!"
- **Lines 173-176**: `AnimalResource.getMessage()` - "+30 Food from hunting!"
- **Lines 190-193**: `GoldResource.getMessage()` - "+10 Gold collected!"
- **Lines 204-207**: `TrophyResource.getMessage()` - "Victory! You collected the trophy!"
- **Lines 229-235**: `TraderResource.getMessage()` - "Found a [Type] Trader!"

- **File**: `src/autoplay.tsx`
- **Lines 21**: `lastMoveReason` state for displaying brain move reasons
- **Lines 54-57**: Sets move reason when brain makes move
- **Lines 95-101**: Displays "Last move reason" in UI
  ```typescript
  {lastMoveReason && (
    <div className="mb-2 p-2 bg-gray-800 rounded text-xs">
      <div className="text-gray-300 mb-1">Last move reason:</div>
      <div className="text-cyan-300">{lastMoveReason}</div>
    </div>
  )}
  ```

- **File**: `src/App.tsx`
- **Lines 1230-1300**: Move log display in UI
  - Scrollable container showing last 20 moves
  - Each entry shows full move details

**Screenshot locations for text output:**
1. **Move log creation**: `src/App.tsx` lines 1030-1033
2. **Move handling**: `src/App.tsx` lines 1008-1034
3. **Resource messages**: `src/App.tsx` lines 146-235 (all resource getMessage() methods)
4. **Trade messages**: `src/App.tsx` lines 732, 773, 838, 945
5. **Game state messages**: `src/App.tsx` lines 608-614, 629
6. **Brain move reasons**: `src/autoplay.tsx` lines 95-101
7. **Move log UI**: `src/App.tsx` lines 1230-1300 (in React component)

---

### 6. Hierarchy Examples (8 points)

**Example 1: Terrain Class Hierarchy**
- **File**: `src/App.tsx`
- **Lines 30-118**: Complete terrain class hierarchy
- **Description**: 
  - `Terrain` is the abstract base class that defines the common interface for all terrain types
  - 6 concrete subclasses extend `Terrain`: `GrassTerrain`, `DesertTerrain`, `ForestTerrain`, `MountainTerrain`, `SwampTerrain`, `WallTerrain`
  - This demonstrates a clear "is-a" relationship hierarchy: "GrassTerrain IS-A Terrain", "DesertTerrain IS-A Terrain", etc.
  - The hierarchy allows all terrain types to be treated uniformly through the base class interface
  - Base class provides common functionality (`getColor()`, `getName()`, default `isWalkable()`)
  - Subclasses implement terrain-specific behavior (`getCost()` method with different values)
  - `WallTerrain` demonstrates method overriding by overriding `isWalkable()` to return `false`
  
- **Hierarchy Structure**:
  ```
  Terrain (abstract base class)
  ├── GrassTerrain
  ├── DesertTerrain
  ├── ForestTerrain
  ├── MountainTerrain
  ├── SwampTerrain
  └── WallTerrain (overrides isWalkable())
  ```

- **Code Evidence**:
  - **Line 30**: `export class Terrain` - Base class declaration
  - **Line 39**: `getCost(): MoveCost { throw new Error(...) }` - Abstract method (must be implemented by subclasses)
  - **Line 51**: `isWalkable(): boolean { return true; }` - Default implementation
  - **Line 56**: `class GrassTerrain extends Terrain` - Inheritance relationship
  - **Line 58**: `super(TerrainType.GRASS, TERRAIN_COLORS[TerrainType.GRASS])` - Calls parent constructor
  - **Lines 61-63**: Implements abstract `getCost()` method
  - **Line 115**: `isWalkable(): boolean { return false; }` - Method override in WallTerrain

- **Screenshot locations**:
  - **Base class definition**: Lines 30-54
  - **All subclasses**: Lines 56-118
  - **Inheritance keyword**: Line 56 (`extends Terrain`)
  - **Method override**: Lines 115-117 (`WallTerrain.isWalkable()`)

**Example 2: Resource Class Hierarchy**
- **File**: `src/App.tsx`
- **Lines 120-273**: Complete resource class hierarchy
- **Description**:
  - `Resource` is the abstract base class that defines the common interface for all resource types
  - 5 concrete subclasses extend `Resource`: `SpringResource`, `AnimalResource`, `GoldResource`, `TrophyResource`, `TraderResource`
  - This shows another clear inheritance hierarchy: "SpringResource IS-A Resource", "AnimalResource IS-A Resource", etc.
  - All resources share common properties (type, icon) and methods (`getIcon()`, `getType()`, `getMessage()`)
  - Each resource implements abstract methods (`applyEffect()`, `getMessage()`) with resource-specific behavior
  - The hierarchy enables polymorphic resource handling - code can work with `Resource` type without knowing specific subtype
  - `TraderResource` is the most complex, adding trader-specific state and behavior while still being a Resource
  
- **Hierarchy Structure**:
  ```
  Resource (abstract base class)
  ├── SpringResource (adds water)
  ├── AnimalResource (adds food)
  ├── GoldResource (adds gold)
  ├── TrophyResource (win condition)
  └── TraderResource (trading functionality)
  ```

- **Code Evidence**:
  - **Line 120**: `export class Resource` - Base class declaration
  - **Line 137**: `applyEffect(_playerResources: PlayerResources): PlayerResources { throw new Error(...) }` - Abstract method
  - **Line 141**: `getMessage(): string { throw new Error(...) }` - Abstract method
  - **Line 146**: `class SpringResource extends Resource` - Inheritance relationship
  - **Line 147**: `super(ResourceType.SPRING, RESOURCE_ICONS[ResourceType.SPRING])` - Calls parent constructor
  - **Lines 150-154**: Implements `applyEffect()` - adds 30 water
  - **Lines 156-159**: Implements `getMessage()` - returns collection message
  - **Line 211**: `class TraderResource extends Resource` - Most complex subclass
  - **Lines 212-215**: Additional private fields for trader state
  - **Lines 225-227**: Overrides `applyEffect()` (doesn't modify resources directly)

- **Screenshot locations**:
  - **Base class definition**: Lines 120-144
  - **Simple subclass example**: Lines 146-159 (SpringResource)
  - **Complex subclass example**: Lines 211-273 (TraderResource)
  - **Inheritance keyword**: Line 146 (`extends Resource`)
  - **Abstract methods**: Lines 137, 141
  - **Method implementations**: Lines 150-154, 156-159

---

### 7. Inheritance Examples (8 points)

**Example 1: Terrain Inheritance - GrassTerrain**
- **File**: `src/App.tsx`
- **Lines 56-64**: `GrassTerrain extends Terrain`
- **Description**: 
  - `GrassTerrain` demonstrates inheritance by extending the `Terrain` base class
  - **Inherited members**: Inherits `getColor()`, `getName()`, and `isWalkable()` methods from `Terrain` base class
  - **Constructor**: Calls `super()` to initialize parent class with terrain type and color from constants
  - **Method override**: Implements abstract `getCost()` method with grass-specific costs (1 food, 1 water)
  - **Code reuse**: Doesn't need to reimplement `getColor()`, `getName()`, or `isWalkable()` - inherits them
  - **Polymorphism**: Can be used anywhere a `Terrain` is expected
  
- **Detailed Code Analysis**:
  ```typescript
  class GrassTerrain extends Terrain {  // Line 56: Inheritance declaration
    constructor() {  // Line 57: Constructor
      super(TerrainType.GRASS, TERRAIN_COLORS[TerrainType.GRASS]);  // Line 58: Parent constructor call
    }
  
    getCost(): MoveCost {  // Lines 61-63: Override abstract method
      return TERRAIN_COSTS[TerrainType.GRASS];  // Returns { food: 1, water: 1 }
    }
  }
  ```
  
  - **Line 56**: `extends Terrain` keyword establishes inheritance relationship
  - **Line 58**: `super()` call invokes parent class constructor, passing terrain type and color
  - **Line 61**: `getCost()` method signature matches parent's abstract method
  - **Line 62**: Returns grass-specific cost from constants (type-safe, no magic numbers)
  - **Inherited methods** (not shown but available): `getColor()`, `getName()`, `isWalkable()`

- **Screenshot locations**:
  - **Inheritance declaration**: Line 56 (`class GrassTerrain extends Terrain`)
  - **Parent constructor call**: Line 58 (`super(...)`)
  - **Method override**: Lines 61-63 (`getCost()` implementation)
  - **Base class for reference**: Lines 30-54 (shows what is being inherited)

**Example 2: Resource Inheritance - SpringResource**
- **File**: `src/App.tsx`
- **Lines 146-159**: `SpringResource extends Resource`
- **Description**:
  - `SpringResource` demonstrates inheritance by extending the `Resource` base class
  - **Inherited members**: Inherits `getIcon()` and `getType()` methods from `Resource` base class
  - **Constructor**: Calls `super()` to initialize parent class with resource type and icon
  - **Abstract method implementation**: Implements `applyEffect()` method that adds 30 water to player resources
  - **Abstract method implementation**: Implements `getMessage()` method that returns collection message
  - **Code reuse**: Doesn't need to reimplement `getIcon()` or `getType()` - inherits them
  - **Polymorphism**: Can be used anywhere a `Resource` is expected (e.g., in `Player.collectResource()`)
  
- **Detailed Code Analysis**:
  ```typescript
  class SpringResource extends Resource {  // Line 146: Inheritance declaration
    constructor() {  // Line 147: Constructor
      super(ResourceType.SPRING, RESOURCE_ICONS[ResourceType.SPRING]);  // Line 148: Parent constructor call
    }
  
    applyEffect(playerResources: PlayerResources): PlayerResources {  // Lines 150-154: Implement abstract method
      return {
        ...playerResources,
        water: playerResources.water + 30,  // Adds 30 water
      };
    }
  
    getMessage() {  // Lines 156-159: Implement abstract method
      return '+30 Water from spring!';
    }
  }
  ```
  
  - **Line 146**: `extends Resource` keyword establishes inheritance relationship
  - **Line 148**: `super()` call invokes parent class constructor, passing resource type and icon
  - **Lines 150-154**: `applyEffect()` implements abstract method from parent - creates new resource object with increased water
  - **Lines 156-159**: `getMessage()` implements abstract method from parent - returns user-friendly message
  - **Inherited methods** (not shown but available): `getIcon()`, `getType()`
  - **Polymorphic usage**: In `Player.collectResource(resource: Resource)` at line 351, any Resource subtype can be passed

- **Screenshot locations**:
  - **Inheritance declaration**: Line 146 (`class SpringResource extends Resource`)
  - **Parent constructor call**: Line 148 (`super(...)`)
  - **Abstract method implementations**: Lines 150-154 (`applyEffect()`), Lines 156-159 (`getMessage()`)
  - **Base class for reference**: Lines 120-144 (shows abstract methods being implemented)
  - **Polymorphic usage**: Line 351 (`collectResource(resource: Resource)`) - can accept any Resource subclass

---

### 8. Polymorphism Examples (8 points)

**Example 1: Terrain Polymorphism in Map Generation**
- **File**: `src/App.tsx`
- **Lines 433-461**: Terrain creation and usage in map generation
- **Description**: 
  - Different terrain subclasses (`GrassTerrain`, `DesertTerrain`, `ForestTerrain`, `MountainTerrain`, `SwampTerrain`) are created but stored and used as `Terrain` type
  - This demonstrates **subtype polymorphism** - all terrain subclasses can be used wherever `Terrain` is expected
  - The `createRandomTerrain()` method returns different terrain types, but they're all treated as `Terrain`
  - When `Tile` stores a terrain, it stores it as `Terrain` type, not knowing the specific subtype
  - Method calls like `terrain.getCost()` work on any terrain subtype through polymorphism
  - The same code works for all terrain types without needing type-specific logic
  
- **Detailed Code Analysis**:
  ```typescript
  // Line 441: createRandomTerrain() returns Terrain type (not specific subtype)
  const terrain = this.createRandomTerrain();
  
  // Lines 457-461: Different terrain types created, all returned as Terrain
  if (rand < 0.4) return new GrassTerrain();      // Returns as Terrain
  if (rand < 0.6) return new DesertTerrain();    // Returns as Terrain
  if (rand < 0.75) return new ForestTerrain();     // Returns as Terrain
  if (rand < 0.85) return new MountainTerrain();   // Returns as Terrain
  return new SwampTerrain();                      // Returns as Terrain
  
  // Line 443: Tile constructor accepts Terrain (any subtype)
  row.push(new Tile(terrain, resource));
  
  // Line 274: Tile stores terrain as Terrain type
  terrain: Terrain;
  
  // Line 302: getMoveCost() calls terrain.getCost() - polymorphic call
  getMoveCost() {
    return this.terrain.getCost();  // Works for any Terrain subtype
  }
  ```
  
  - **Polymorphic behavior**: When `terrain.getCost()` is called, the correct implementation is invoked based on the actual object type (GrassTerrain, DesertTerrain, etc.)
  - **No type checking needed**: Code doesn't need `if (terrain instanceof GrassTerrain)` - polymorphism handles it
  - **Extensibility**: New terrain types can be added without changing code that uses `Terrain` type

- **Screenshot locations**:
  - **Terrain creation**: Lines 457-461 (different types created)
  - **Return type**: Method signature showing `Terrain` return type
  - **Polymorphic storage**: Line 441 (`const terrain = this.createRandomTerrain()`)
  - **Polymorphic usage**: Line 443 (`new Tile(terrain, resource)`)
  - **Tile class**: Lines 274-304 (shows `terrain: Terrain` field and `getMoveCost()` method)
  - **Polymorphic method call**: Line 302 (`this.terrain.getCost()`)

**Example 2: Strategy Pattern Polymorphism**
- **File**: `src/brain.ts`
- **Lines 130-140**: Strategy delegation in `calculateBestMove()`
- **Description**:
  - The `Brain` class uses **interface-based polymorphism** through the `IBrainStrategy` interface
  - Different strategy implementations (`GreedyStrategy`, `ExplorerStrategy`, `AggressiveStrategy`) all implement `IBrainStrategy`
  - The `Brain` class stores a strategy as `IBrainStrategy` type, not knowing which specific implementation
  - When `this.strategy.calculateMove()` is called, the correct strategy's implementation is invoked
  - This demonstrates **runtime polymorphism** - the same method call produces different behavior based on the actual strategy object
  - Strategies can be swapped at runtime without changing `Brain` class code
  - This follows the **Strategy design pattern** and **Dependency Inversion Principle**
  
- **Detailed Code Analysis**:
  ```typescript
  // Line 24: Brain stores strategy as interface type (not concrete class)
  private readonly strategy: IBrainStrategy;
  
  // Line 42: Strategy created via factory - could be any implementation
  this.strategy = BrainStrategyFactory.create(personality, this.helper);
  
  // Lines 130-140: Polymorphic method call
  const result = this.strategy.calculateMove(  // Calls interface method
    gameState,
    vision,
    trophyPos,
    food,
    water,
    startingResources,
    this.visitedTiles,
    this.recentPositions
  );
  ```
  
  - **Line 24**: `strategy: IBrainStrategy` - stores interface type, not concrete class
  - **Line 42**: Factory creates appropriate strategy based on personality - could be any of the three
  - **Lines 130-140**: `this.strategy.calculateMove()` - polymorphic call
    - If strategy is `GreedyStrategy`, calls `GreedyStrategy.calculateMove()`
    - If strategy is `ExplorerStrategy`, calls `ExplorerStrategy.calculateMove()`
    - If strategy is `AggressiveStrategy`, calls `AggressiveStrategy.calculateMove()`
  - **No conditional logic**: Brain doesn't need `if (personality === 'greedy')` - polymorphism handles it
  - **Extensibility**: New strategies can be added by implementing `IBrainStrategy` without changing `Brain` class

- **Supporting Code**:
  - **File**: `src/brain-strategies.ts`
  - **Line 32**: `export class GreedyStrategy implements IBrainStrategy`
  - **Line 128**: `export class ExplorerStrategy implements IBrainStrategy`
  - **Line 265**: `export class AggressiveStrategy implements IBrainStrategy`
  - All three implement the same interface, making them polymorphically interchangeable

- **Screenshot locations**:
  - **Interface definition**: `src/brain-strategies.ts` lines 8-19 (`IBrainStrategy` interface)
  - **Strategy field**: `src/brain.ts` line 24 (`private readonly strategy: IBrainStrategy`)
  - **Strategy creation**: `src/brain.ts` line 42 (factory creates strategy)
  - **Polymorphic call**: `src/brain.ts` lines 130-140 (`this.strategy.calculateMove(...)`)
  - **Interface implementations**: `src/brain-strategies.ts` lines 32, 128, 265 (all implement `IBrainStrategy`)
  - **Factory pattern**: `src/brain-strategies.ts` lines 368-378 (creates appropriate strategy)

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

