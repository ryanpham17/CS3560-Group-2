package game;

import items.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Cell 
{
    // Cell made up of terrain and list of potential items
    private Terrain terrain;
    private List<Item> items = new ArrayList<>();

    public Cell(Terrain t) 
    {
        this.terrain = t;
    }

    public Terrain getTerrain() 
    {
        return terrain;
    }

    public List<Item> getItems() 
    {
        return items;
    }

    public void maybeAddItems() 
    {
        Random r = new Random();
        int roll = r.nextInt(20);

        switch (roll) {
            case 0 -> items.add(new FoodBonus(false));
            //case 1 -> items.add(new WaterBonus(true));
            //case 2 -> items.add(new GoldBonus());
            case 3 -> items.add(new Trader());
        }
    }
}
