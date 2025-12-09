package util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// Represents a short sequence of moves together with the total
// movement/food/water cost of following that path.
public class Path {

    // Net row/column displacement from start to end of this path.
    // (Kept for backwards compatibility with the original skeleton.)
    public int dr, dc;

    // Individual moves making up the path.
    public enum Move {
        MoveNorth(-1, 0),
        MoveSouth(1, 0),
        MoveEast(0, 1),
        MoveWest(0, -1),
        MoveNorthEast(-1, 1),
        MoveNorthWest(-1, -1),
        MoveSouthEast(1, 1),
        MoveSouthWest(1, -1);

        public final int dr;
        public final int dc;

        Move(int dr, int dc) {
            this.dr = dr;
            this.dc = dc;
        }

        // Helper: find the move that matches the given delta.
        public static Move fromDelta(int dr, int dc) {
            for (Move m : values()) {
                if (m.dr == dr && m.dc == dc) {
                    return m;
                }
            }
            return null;
        }
    }

    private final List<Move> moves = new ArrayList<>();
    private int movementCost;
    private int foodCost;
    private int waterCost;

    public Path() {
        this.dr = 0;
        this.dc = 0;
    }

    // Backwards‑compatible constructor: creates a path that only stores
    // the net displacement.  (No moves or costs are recorded.)
    public Path(int dr, int dc) {
        this.dr = dr;
        this.dc = dc;
    }

    /** Adds a move to the path and accumulates its costs. */
    public void addMove(Move move,
                        int movementCost,
                        int foodCost,
                        int waterCost) {
        if (move == null) return;
        moves.add(move);
        dr += move.dr;
        dc += move.dc;
        this.movementCost += movementCost;
        this.foodCost += foodCost;
        this.waterCost += waterCost;
    }

    /** Immutable view of the moves in this path. */
    public List<Move> getMoves() {
        return Collections.unmodifiableList(moves);
    }

    /** Number of moves in the path. */
    public int length() {
        return moves.size();
    }

    public int getMovementCost() {
        return movementCost;
    }

    public int getFoodCost() {
        return foodCost;
    }

    public int getWaterCost() {
        return waterCost;
    }

    public boolean isEmpty() {
        return moves.isEmpty();
    }

    @Override
    public String toString() {
        return "Path{" +
                "moves=" + moves +
                ", movementCost=" + movementCost +
                ", foodCost=" + foodCost +
                ", waterCost=" + waterCost +
                '}';
    }
}
