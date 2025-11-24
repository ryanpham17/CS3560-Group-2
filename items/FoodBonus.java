package items;

import player.Player;

public class FoodBonus extends Item 
{

    private boolean repeating;

    public FoodBonus(boolean repeating) {
        this.repeating = repeating;
    }

    @Override
    public boolean repeatable() 
    {
        return repeating;
    }

    // Food bonus currently set here, but maybe should be moevd to terrain instead.
    @Override
    public void apply(Player p) 
    {
        p.addFood(5);
        System.out.println("Collected food bonus.");
    }
}
