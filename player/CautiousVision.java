package player;

// Cautious vision: can see the square above, below, and to the east
// of the player (plus the player's own square), matching the diagram.
public class CautiousVision extends Vision {

    // (-1,0) north, (0,0) current, (1,0) south, (0,1) east
    private static final int[][] OFFSETS = {
            {-1, 0},
            {0, 0},
            {1, 0},
            {0, 1}
    };

    @Override
    protected int[][] visibleOffsets() {
        return OFFSETS;
    }
}
