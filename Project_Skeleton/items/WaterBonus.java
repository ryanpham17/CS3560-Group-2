package items;

import player.Player;

public class WaterBonus extends Item
{
    private boolean repeating;

    public WaterBonus(boolean repeating) {
        this.repeating = repeating;
    }

    @Override
    public boolean repeatable() 
    {
        return repeating;
    }

    // Water bonus currently set here, but maybe should be moevd to terrain instead.
    @Override
    public void apply(Player p) 
    {
        p.addWater(5);
        System.out.println("Collected water bonus.");
    }	
}
