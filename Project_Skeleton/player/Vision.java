package player;

import game.Cell;
import game.MapGrid;
import util.Path;

// Super class for all visions.
public abstract class Vision 
{

    public abstract Path closestFood(Player p, MapGrid map);

    // Collect items and bonuses of tile when applicable.
    public void collectItems(Player p, Cell cell) {
        cell.getItems().removeIf(item -> {
            item.apply(p);
            return !item.repeatable();
        });
    }
}
