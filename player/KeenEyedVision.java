package player;

// Keen‑Eyed vision: medium‑sized vision, matching the Keen‑Eyed diagram.
public class KeenEyedVision extends Vision {

    // Co‑ordinates relative to player at (0,0):
    // (-1,1) and (-1,2)  -> row above, 1 and 2 steps east
    // (0,0),(0,1),(0,2)  -> player's row, from current to 2 east
    // (1,1),(1,2)        -> row below, 1 and 2 east
    private static final int[][] OFFSETS = {
            {-1, 1}, {-1, 2},
            {0, 0}, {0, 1}, {0, 2},
            {1, 1}, {1, 2}
    };

    @Override
    protected int[][] visibleOffsets() {
        return OFFSETS;
    }
}
