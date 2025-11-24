import javax.swing.*;
import java.awt.*;
import java.util.LinkedHashMap;
import java.util.Map;

public class LegendPanel extends JPanel {

    private final Map<String, Color> terrainColors = new LinkedHashMap<>();

    public LegendPanel() {
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setBorder(BorderFactory.createTitledBorder("Legend"));

        terrainColors.put("Plains",   new Color(114, 114, 38));
        terrainColors.put("Forest",   new Color(34, 139, 34));
        terrainColors.put("Mountain", new Color(120, 120, 120));
        terrainColors.put("Desert",   new Color(237, 201, 175));
        terrainColors.put("Swamp",    new Color(46, 139, 87));

        for (Map.Entry<String, Color> entry : terrainColors.entrySet()) {
            add(createLegendItem(entry.getKey(), entry.getValue()));
        }
    }

    private JComponent createLegendItem(String name, Color color) {
        JPanel panel = new JPanel();
        panel.setLayout(new FlowLayout(FlowLayout.LEFT));

        JPanel colorBox = new JPanel();
        colorBox.setPreferredSize(new Dimension(18, 18));
        colorBox.setBackground(color);
        colorBox.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY));

        JLabel label = new JLabel(" " + name);

        panel.add(colorBox);
        panel.add(label);

        return panel;
    }
}
