package player;

import game.Cell;
import game.MapGrid;

public class Player {

    private int maxStr, maxFood, maxWater;
    private int str, food, water, gold;
    private int row, col;

    private GameLogger logger;  // logger support

    private Vision vision;
    private Brain brain;

    // Initialize player with max stats and given vision/brain.
    public Player(int maxStr, int maxFood, int maxWater, Vision v, Brain b) {

        this.maxStr = this.str = maxStr;
        this.maxFood = this.food = maxFood;
        this.maxWater = this.water = maxWater;
        this.gold = 0;

        this.vision = v;
        this.brain = b;

        log("Player created. STR=" + str + ", FOOD=" + food +
                ", WATER=" + water + ", GOLD=" + gold);
    }

    // Position
    public void setPosition(int r, int c) {
        row = r;
        col = c;
        log("Player initial position set to (" + r + ", " + c + ")");
    }

    public int getRow() { return row; }
    public int getCol() { return col; }

    // FIXED — east edge check (must be >= width - 1)
    public boolean hasReachedEast(int width) {
        return col >= width - 1;
    }

    public boolean isAlive() {
        return str > 0 && food > 0 && water > 0;
    }

    // Executes 1 turn: the Brain chooses a move, then items are collected.
    public void takeTurn(MapGrid map) {

        log("---- NEW TURN ----");
        log("Current stats: STR=" + str + ", FOOD=" + food +
                ", WATER=" + water + ", GOLD=" + gold);
        log("Current position: (" + row + ", " + col + ")");

        // Let the brain choose what to do
        brain.makeMove(this, map);

        // Collect items AFTER moving
        Cell cell = map.getCell(row, col);
        vision.collectItems(this, cell);

        // Check death
        if (!isAlive()) {
            log("Player has died. STR=" + str + ", FOOD=" + food + ", WATER=" + water);
        }

        // Check east edge
        if (hasReachedEast(map.getWidth())) {
            log("Player successfully reached the east side!");
        }
    }

    // Moves the player and applies terrain costs.
    public void moveTo(int r, int c, Cell cell) {

        int oldR = row;
        int oldC = col;

        row = r;
        col = c;

        str -= cell.getTerrain().movementCost();
        food -= cell.getTerrain().foodCost();
        water -= cell.getTerrain().waterCost();

        log("Moved from (" + oldR + ", " + oldC + ") to (" + r + ", " + c + ")");
        log("Terrain: " + cell.getTerrain().name() +
                " | Costs: STR -" + cell.getTerrain().movementCost() +
                ", FOOD -" + cell.getTerrain().foodCost() +
                ", WATER -" + cell.getTerrain().waterCost());
        log("New stats: STR=" + str + ", FOOD=" + food + ", WATER=" + water);
    }

    // Logger hookup
    public void setLogger(GameLogger logger) {
        this.logger = logger;
    }

    private void log(String msg) {
        if (logger != null)
            logger.log(msg);
    }

    // Bonus functions
    public void addFood(int x) {
        int before = food;
        food = Math.min(maxFood, food + x);
        log("Picked up FOOD (+" + x + "). " + before + " -> " + food);
    }

    public void addWater(int x) {
        int before = water;
        water = Math.min(maxWater, water + x);
        log("Picked up WATER (+" + x + "). " + before + " -> " + water);
    }

    public void addGold(int x) {
        gold += x;
        log("Picked up GOLD (+" + x + "). Total gold: " + gold);
    }

    // Stat getters
    public int getStr() { return str; }
    public int getMaxStr() { return maxStr; }
    public int getFood() { return food; }
    public int getMaxFood() { return maxFood; }
    public int getWater() { return water; }
    public int getMaxWater() { return maxWater; }
    public int getGold() { return gold; }

}
