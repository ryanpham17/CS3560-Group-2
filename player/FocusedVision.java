package player;

// Focused vision: only sees the three squares directly in front of the
// player (east, north‑east, and south‑east) plus the player's own square.
public class FocusedVision extends Vision {

    // (0,0) current, (-1,1) NE, (0,1) E, (1,1) SE
    private static final int[][] OFFSETS = {
            {0, 0},
            {-1, 1},
            {0, 1},
            {1, 1}
    };

    @Override
    protected int[][] visibleOffsets() {
        return OFFSETS;
    }
}
