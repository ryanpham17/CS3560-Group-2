package game;

public class Desert extends Terrain
{
    public int movementCost() { return 2; }
    public int foodCost()     { return 2; }
    public int waterCost()    { return 5; }
    public String name()      { return "Desert"; }	
}
