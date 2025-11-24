package game;

import player.Player;
import java.util.Random;

public class MapGrid {

    // Grid made of width, height, and double cell array.
    private final int width;
    private final int height;
    private final Cell[][] grid;
    private Random rand = new Random();

    // Initializes grid with proper size and calls terrain generation based on difficulty.
    public MapGrid(int width, int height, int difficulty) 
    {
        this.width = width;
        this.height = height;
        this.grid = new Cell[height][width];

        generate(difficulty);
    }

    // Generates terrain based on difficulty.
    private void generate(int difficulty) 
    {
        for (int r = 0; r < height; r++) 
        {
            for (int c = 0; c < width; c++) 
            {
                grid[r][c] = new Cell(Terrain.randomTerrain(difficulty));
                grid[r][c].maybeAddItems();
            }
        }
    }

    // Returns cell
    public Cell getCell(int row, int col) 
    {
        if (row < 0 || row >= height || col < 0 || col >= width)
            return null;
        return grid[row][col];
    }

    //Sets player at western edge in the middle of array.
    public void placePlayer(Player p) 
    {
        p.setPosition(height / 2, 0);
    }

    public int getHeight() {return height;}

    public int getWidth()
    {
        return width;
    }

}

