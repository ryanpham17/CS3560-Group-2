import game.MapGrid;
import player.*;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner in = new Scanner(System.in);

        System.out.println("=== Wilderness Survival System ===");

        System.out.print("Map width: ");
        int w = in.nextInt();
        System.out.print("Map height: ");
        int h = in.nextInt();

        System.out.println("Select difficulty:");
        System.out.println("1. Easy");
        System.out.println("2. Normal");
        System.out.println("3. Hard");
        int difficulty = in.nextInt();

        MapGrid map = new MapGrid(w, h, difficulty);

        // Create player
        Player p = new Player(
                20, 20, 20,          // max stats
                new CautiousVision(),
                new SimpleBrain()
        );

        map.placePlayer(p);

        // Run simulation
        // Some error going in this loop, the hasReachedEast method and the SimpleBrain makeMove method that results in infinite 
        // "Can't move east" spam instead of winning
        while (!p.hasReachedEast(w) && p.isAlive()) {
            p.takeTurn(map);
        }

        if (p.hasReachedEast(w))
            System.out.println("Player successfully reached the east side!");
        else
            System.out.println("Player died before escaping.");

        System.out.println("Game Over.");
    }
}
