import game.MapGrid;
import player.GameLogger;
import player.Player;

import javax.swing.*;
import java.awt.*;

public class WSSFrame extends JFrame {

    private final MapGrid map;
    private final Player player;
    private final MapPanel mapPanel;
    private final JLabel statusLabel;
    private final JTextArea logArea;
    private GameLogger logger;

    public WSSFrame(MapGrid map, Player player) {
        this.map = map;
        this.player = player;

        setTitle("Wilderness Survival System");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        // Center: map drawing panel
        mapPanel = new MapPanel(map, player);
        add(mapPanel, BorderLayout.CENTER);

        // EAST: Legend panel
        LegendPanel legendPanel = new LegendPanel();
        add(legendPanel, BorderLayout.EAST);

        // South: status + buttons
        JPanel bottomPanel = new JPanel(new BorderLayout());

        statusLabel = new JLabel();
        updateStatusText();
        bottomPanel.add(statusLabel, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel();
        JButton stepButton = new JButton("Next Turn");
        JButton autoButton = new JButton("Auto Run");
        buttonPanel.add(stepButton);
        buttonPanel.add(autoButton);
        bottomPanel.add(buttonPanel, BorderLayout.EAST);

        add(bottomPanel, BorderLayout.SOUTH);

        // GAME LOG PANEL
        logArea = new JTextArea(10, 30);
        logArea.setEditable(false);
        logArea.setLineWrap(true);
        logArea.setWrapStyleWord(true);

        JScrollPane scrollPane = new JScrollPane(logArea);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);

        logger = message -> {
            logArea.append(message + "\n");
            logArea.setCaretPosition(logArea.getDocument().getLength());
        };

        //attach logger to the player
        player.setLogger(logger);

        JPanel eastPanel = new JPanel(new BorderLayout());
        eastPanel.add(new LegendPanel(), BorderLayout.NORTH);
        eastPanel.add(scrollPane, BorderLayout.CENTER);
        add(eastPanel, BorderLayout.EAST);


        // Button actions
        stepButton.addActionListener(e -> doOneTurn());
        autoButton.addActionListener(e -> doAutoRun());

        pack();
        setLocationRelativeTo(null);
        setVisible(true);
    }


    private void doOneTurn() {
        if (!player.isAlive() || player.hasReachedEast(map.getWidth())) {
            JOptionPane.showMessageDialog(this, "Game is already over.");
            return;
        }

        player.takeTurn(map);
        updateStatusText();
        mapPanel.repaint();

        if (!player.isAlive()) {
            JOptionPane.showMessageDialog(this, "Player died before escaping.");
        } else if (player.hasReachedEast(map.getWidth())) {
            JOptionPane.showMessageDialog(this, "Player successfully reached the east side!");
        }
    }

    private void doAutoRun() {
        while (player.isAlive() && !player.hasReachedEast(map.getWidth())) {
            player.takeTurn(map);
        }
        updateStatusText();
        mapPanel.repaint();

        if (!player.isAlive()) {
            JOptionPane.showMessageDialog(this, "Player died before escaping.");
        } else if (player.hasReachedEast(map.getWidth())) {
            JOptionPane.showMessageDialog(this, "Player successfully reached the east side!");
        }
    }

    private void updateStatusText() {
        String text = String.format(
                "Str: %d/%d   Food: %d/%d   Water: %d/%d   Gold: %d   Pos: (%d,%d)",
                player.getStr(), player.getMaxStr(),
                player.getFood(), player.getMaxFood(),
                player.getWater(), player.getMaxWater(),
                player.getGold(),
                player.getRow(), player.getCol()
        );
        statusLabel.setText(text);
    }
}
