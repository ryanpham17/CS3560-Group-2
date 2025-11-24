package player;

import game.Cell;
import game.MapGrid;

public class SimpleBrain extends Brain 
{

    // Should be made by calling the vision but currently super basic and look on its own.
    @Override
    public void makeMove(Player p, MapGrid map) {
        int r = p.getRow();
        int c = p.getCol();

        Cell east = map.getCell(r, c + 1);

        // Error going on here that is making "Cannot move east anymore" infinitely displayed. Some logic error when this method is called.
        if (east != null) {
            p.moveTo(r, c + 1, east);
            System.out.println("Moved east.");
        } else {
            System.out.println("Cannot move east anymore.");
        }
    }
}
