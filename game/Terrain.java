package game;

import java.util.Random;

public abstract class Terrain 
{

    public abstract int movementCost();
    public abstract int foodCost();
    public abstract int waterCost();
    public abstract String name();

    // Generation of random terrain. Takes difficulty, but currently does not use it for generation.
    public static Terrain randomTerrain(int difficulty) {
        Random r = new Random();
        int x = r.nextInt(5);
        return switch (x) {
            case 0 -> new Plains();
            case 1 -> new Forest();
            case 2 -> new Desert();
            case 3 -> new Mountain();
            case 4 -> new Swamp();
            default -> new Plains();
        };
    }
}
