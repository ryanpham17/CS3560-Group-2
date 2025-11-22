package player;

import game.Cell;
import game.MapGrid;

public class Player 
{

    private int maxStr, maxFood, maxWater;
    private int str, food, water, gold;
    private int row, col;

    private Vision vision;
    private Brain brain;

    // Initialize player at the max stats they start with and the given vision and brain.
    public Player(int maxStr, int maxFood, int maxWater, Vision v, Brain b) 
    {

        this.maxStr = this.str = maxStr;
        this.maxFood = this.food = maxFood;
        this.maxWater = this.water = maxWater;
        this.gold = 0;

        this.vision = v;
        this.brain = b;
    }

    public void setPosition(int r, int c) { row = r; col = c; }
    public int getRow() { return row; }
    public int getCol() { return col; }

    // Some potential error here that is preventing a win.
    public boolean hasReachedEast(int width) { return col >= width; }
    public boolean isAlive() { return str > 0 && food > 0 && water > 0; }

    // Takes in current player cell and makes move depending on it. 
    public void takeTurn(MapGrid map) 
    {
        brain.makeMove(this, map);
        Cell cell = map.getCell(row, col);
        vision.collectItems(this, cell);
    }

    // Takes in cell to move to and decrements the proper costs.
    public void moveTo(int r, int c, Cell cell) 
    {
        row = r;
        col = c;

        str -= cell.getTerrain().movementCost();
        food -= cell.getTerrain().foodCost();
        water -= cell.getTerrain().waterCost();
    }

    // Takes in resources, but does not go over maximum. 
    public void addFood(int x) { food = Math.min(maxFood, food + x); }
    public void addWater(int x) { water = Math.min(maxWater, water + x); }
    public void addGold(int x) { gold += x; }

    public int getFood() { return food; }
    public int getWater() { return water; }
    public int getGold() { return gold; }
}
