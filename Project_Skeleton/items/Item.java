package items;

import player.Player;

public abstract class Item 
{
    public abstract void apply(Player p);
    public boolean repeatable() { return false; }
}
