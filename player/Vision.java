package player;

import game.Cell;
import game.MapGrid;
import items.*;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;
import util.Path;

// Super class for all visions.  A Vision knows which neighbouring squares
// it can examine (given by visibleOffsets) and contains helper methods
// for finding interesting targets in those squares.
public abstract class Vision {

    /**
     * Offsets that this vision can inspect, relative to the player's
     * current position.  Each element is {deltaRow, deltaCol}.
     *
     * Example: new int[][] { {0, 0}, {-1, 0}, {1, 0}, {0, 1} }
     * would mean: the player's own square, one to the north,
     * one to the south and one to the east.
     */
    protected abstract int[][] visibleOffsets();

    // Public search API
    /** Closest square (within this vision) that contains a FoodBonus. */
    public Path closestFood(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, FoodBonus.class), 1);
    }

    /** Second‑closest square with a FoodBonus. */
    public Path secondClosestFood(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, FoodBonus.class), 2);
    }

    public Path closestWater(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, WaterBonus.class), 1);
    }

    public Path secondClosestWater(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, WaterBonus.class), 2);
    }

    public Path closestGold(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, GoldBonus.class), 1);
    }

    public Path secondClosestGold(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, GoldBonus.class), 2);
    }

    public Path closestTrader(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, Trader.class), 1);
    }

    public Path secondClosestTrader(Player p, MapGrid map) {
        return findKthClosest(p, map, cell -> hasItem(cell, Trader.class), 2);
    }

    /**
     * Path to the square (within this vision) that is easiest to move to,
     * i.e. with the smallest movement cost.  Ties are broken by
     *  (1) fewer steps, then
     *  (2) furthest to the east (largest column).
     */
    public Path easiestPath(Player p, MapGrid map) {
        List<Candidate> candidates = collectCandidates(p, map, cell -> true);
        if (candidates.isEmpty()) return null;

        candidates.sort((a, b) -> {
            // 1) least movement cost
            int cmp = Integer.compare(a.path.getMovementCost(), b.path.getMovementCost());
            if (cmp != 0) return cmp;

            // 2) fewest steps
            cmp = Integer.compare(a.path.length(), b.path.length());
            if (cmp != 0) return cmp;

            // 3) furthest east
            return Integer.compare(b.col, a.col);
        });

        return candidates.get(0).path;
    }

    // Core search helpers
    protected static class Candidate {
        final int row, col;
        final Path path;

        Candidate(int row, int col, Path path) {
            this.row = row;
            this.col = col;
            this.path = path;
        }
    }

    /** Returns the k‑th best path to a cell that matches the predicate. */
    private Path findKthClosest(Player p, MapGrid map,
                                Predicate<Cell> match,
                                int k) {

        List<Candidate> candidates = collectCandidates(p, map, match);
        if (candidates.size() < k) {
            // Not enough options: no first/second‑closest, etc.
            return null;
        }

        candidates.sort((a, b) -> {
            // 1) fewest steps
            int cmp = Integer.compare(a.path.length(), b.path.length());
            if (cmp != 0) return cmp;

            // 2) least movement cost
            cmp = Integer.compare(a.path.getMovementCost(), b.path.getMovementCost());
            if (cmp != 0) return cmp;

            // 3) furthest east (largest column)
            return Integer.compare(b.col, a.col);
        });

        return candidates.get(k - 1).path;
    }

    /**
     * Collects all visible cells that satisfy {@code match} and builds a
     * path to each of them.
     */
    private List<Candidate> collectCandidates(Player p, MapGrid map,
                                              Predicate<Cell> match) {
        List<Candidate> result = new ArrayList<>();

        int baseR = p.getRow();
        int baseC = p.getCol();

        for (int[] offset : visibleOffsets()) {
            int r = baseR + offset[0];
            int c = baseC + offset[1];

            Cell cell = map.getCell(r, c);
            if (cell == null) continue;      // off the map
            if (!match.test(cell)) continue; // not interesting

            Path path = buildPath(baseR, baseC, r, c, map);
            if (path != null) {
                result.add(new Candidate(r, c, path));
            }
        }

        return result;
    }

    /**
     * Builds a Path from (startR,startC) to (targetR,targetC), using diagonal
     * moves when both the row and column need to change.
     */
    protected Path buildPath(int startR, int startC,
                             int targetR, int targetC,
                             MapGrid map) {
        if (startR == targetR && startC == targetC) {
            // Already on that square – empty path.
            return new Path();
        }

        Path path = new Path();
        int r = startR;
        int c = startC;

        while (r != targetR || c != targetC) {
            int dr = Integer.compare(targetR, r); // -1, 0, or +1
            int dc = Integer.compare(targetC, c);

            Path.Move move = Path.Move.fromDelta(dr, dc);
            if (move == null) {
                // Should never happen for neighbouring squares, but be safe.
                return null;
            }

            r += dr;
            c += dc;

            Cell stepCell = map.getCell(r, c);
            if (stepCell == null) {
                // Walked off the map; abort this candidate.
                return null;
            }

            int moveCost  = stepCell.getTerrain().movementCost();
            int foodCost  = stepCell.getTerrain().foodCost();
            int waterCost = stepCell.getTerrain().waterCost();

            path.addMove(move, moveCost, foodCost, waterCost);
        }

        return path;
    }

    /** Checks whether a cell contains at least one item of the given type. */
    private boolean hasItem(Cell cell, Class<?> wantedType) {
        for (Item item : cell.getItems()) {
            if (wantedType.isInstance(item)) {
                return true;
            }
        }
        return false;
    }

    // Collect items and bonuses of tile when applicable.
    public void collectItems(Player p, Cell cell) {
        cell.getItems().removeIf(item -> {
            item.apply(p);
            return !item.repeatable();
        });
    }
}
