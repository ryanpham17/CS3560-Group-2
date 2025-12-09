package player;

// Far‑Sight vision: the largest vision.  It is four rows tall and up to
// two squares deep to the east, matching the Far‑Sight diagram.
public class FarSightVision extends Vision {

    // Relative to player at (0,0), which is the second row of the left
    // column in the picture:
    // Row -1: (-1,0), (-1,1)
    // Row  0: (0,0), (0,1), (0,2)
    // Row +1: (1,0), (1,1), (1,2)
    // Row +2: (2,0), (2,1)
    private static final int[][] OFFSETS = {
            {-1, 0}, {-1, 1},
            {0, 0}, {0, 1}, {0, 2},
            {1, 0}, {1, 1}, {1, 2},
            {2, 0}, {2, 1}
    };

    @Override
    protected int[][] visibleOffsets() {
        return OFFSETS;
    }
}
