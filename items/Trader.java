package items;

import player.Player;

import java.util.Random;

public class Trader extends Item 
{

    // Very basic trader interaction. Should probably be made as brain and trader interacting with each other instead of all
    // in one method as seen here.
    @Override
    public void apply(Player p) 
    {
        Random r = new Random();

        int giveFood  = r.nextInt(3);
        int giveWater = r.nextInt(3);
        int askGold = r.nextInt(3) + 1;

        System.out.println("Trader wants " + askGold + " gold.");
        System.out.println("He will give " + giveFood + " food and " + giveWater + " water.");

        if (p.getGold() >= askGold) {
            p.addFood(giveFood);
            p.addWater(giveWater);
            p.addGold(-askGold);
            System.out.println("Trade accepted!");
        } else {
            System.out.println("Player cannot afford trade.");
        }
    }

    @Override
    public boolean repeatable() { return true; }
}
