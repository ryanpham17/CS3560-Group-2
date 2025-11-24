package game;

// Costs associated with movement across terrain.
// Needs bonuses of resting in terrain.
public class Forest extends Terrain
{
    public int movementCost() { return 1; }
    public int foodCost()     { return 2; }
    public int waterCost()    { return 3; }
    public String name()      { return "Forest"; }
}
