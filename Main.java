import game.MapGrid;
import player.*;

import javax.swing.*;

public class Main {
    public static void main(String[] args) {

        SwingUtilities.invokeLater(() -> {
            // Ask for basic settings using dialogs
            int w = askInt("Map width:", 20);
            int h = askInt("Map height:", 10);
            int difficulty = askInt("Difficulty (1–3) Easy, Medium, Hard:", 1);

            // Create map
            MapGrid map = new MapGrid(w, h, difficulty);

            // Create a player (adjust constructor to match your actual Player)
            Vision vision = new CautiousVision();
            Brain brain = new SimpleBrain();
            Player p = new Player(100, 50, 50, vision, brain); // example stats
            // Place player on map
            map.placePlayer(p);

            // Open GUI
            new WSSFrame(map, p);
        });
    }

    private static int askInt(String message, int defaultValue) {
        while (true) {
            String input = JOptionPane.showInputDialog(null, message, defaultValue);
            if (input == null) {
                System.exit(0); // user canceled
            }
            try {
                return Integer.parseInt(input.trim());
            } catch (NumberFormatException e) {
                JOptionPane.showMessageDialog(null, "Please enter a valid integer.");
            }
        }
    }
}
