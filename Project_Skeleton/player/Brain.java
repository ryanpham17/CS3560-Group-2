package player;

import game.MapGrid;

// Super class for brains.
public abstract class Brain 
{
    public abstract void makeMove(Player p, MapGrid map);
}
