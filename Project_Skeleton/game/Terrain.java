package game;

import java.util.Random;

public abstract class Terrain 
{

    public abstract int movementCost();
    public abstract int foodCost();
    public abstract int waterCost();
    public abstract String name();

    // Generation of random terrain. Takes difficulty to determine generation.
    public static Terrain randomTerrain(int difficulty) 
    {
        Random r = new Random();
        int x = r.nextInt(10);

        // More plains and forests on easy.
        if(difficulty == 1)
        {
            return switch (x) 
            {
                case 0,1,2 -> new Plains();
                case 4,5 -> new Forest();
                case 6,7 -> new Desert();
                case 8 -> new Mountain();
                case 9 -> new Swamp();
                default -> new Plains();
            };
        }

        // More Deserts and Mountanis and medium.
        else if (difficulty == 2)
        {
            return switch (x) 
            {
                case 0,1 -> new Plains();
                case 2,3 -> new Forest();
                case 4,5,6 -> new Desert();
                case 7,8 -> new Mountain();
                case 9 -> new Swamp();
                default -> new Plains();
            };
        }

        // Even more deserts, mountains, and swamps on hard.
        return switch (x) 
            {
                case 0,1 -> new Plains();
                case 2 -> new Forest();
                case 3,4,5 -> new Desert();
                case 6,7,8-> new Mountain();
                case 9 -> new Swamp();
                default -> new Plains();
            };

    }
}
