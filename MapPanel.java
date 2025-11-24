import game.Cell;
import game.MapGrid;
import game.Terrain;
import player.Player;

import javax.swing.*;
import java.awt.*;

public class MapPanel extends JPanel {

    private final MapGrid map;
    private final Player player;

    public MapPanel(MapGrid map, Player player) {
        this.map = map;
        this.player = player;

        // Preferred size
        int w = map.getWidth();
        int h = map.getHeight();
        int cellSize = 30; // pixels per cell
        setPreferredSize(new Dimension(w * cellSize, h * cellSize));
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        int rows = map.getHeight();
        int cols = map.getWidth();

        int cellWidth = getWidth() / cols;
        int cellHeight = getHeight() / rows;

        // Draw terrain
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                Cell cell = map.getCell(r, c);
                Terrain t = cell.getTerrain();
                g.setColor(colorForTerrain(t));
                int x = c * cellWidth;
                int y = r * cellHeight;
                g.fillRect(x, y, cellWidth, cellHeight);
                g.setColor(Color.DARK_GRAY);
                g.drawRect(x, y, cellWidth, cellHeight);
            }
        }

        // Draw player
        int pr = player.getRow();
        int pc = player.getCol();
        int px = pc * cellWidth;
        int py = pr * cellHeight;

        g.setColor(Color.RED);
        int margin = Math.min(cellWidth, cellHeight) / 6;
        g.fillOval(px + margin, py + margin,
                cellWidth - 2 * margin, cellHeight - 2 * margin);
    }

    private Color colorForTerrain(Terrain t) {
        if (t == null) return Color.LIGHT_GRAY;
        String name = t.name().toLowerCase();

        if (name.contains("plain"))   return new Color(114, 114, 38);
        if (name.contains("forest"))  return new Color(34, 139, 34);
        if (name.contains("mountain"))return new Color(120, 120, 120);
        if (name.contains("desert"))  return new Color(237, 201, 175);
        if (name.contains("swamp"))   return new Color(46, 139, 87);

        return Color.LIGHT_GRAY;
    }

}
