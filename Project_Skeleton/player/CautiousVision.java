package player;

import game.Cell;
import game.MapGrid;
import util.Path;

// Barebones skeleton that is currently not used to move as brain makes both vision and movement decision. 
public class CautiousVision extends Vision 
{

    @Override
    public Path closestFood(Player p, MapGrid map) {
        // For example, look North, South, East only.
        return new Path(0,1); // Move East as a placeholder
    }
}
