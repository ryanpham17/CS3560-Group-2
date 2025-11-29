package game;

public class Swamp extends Terrain
{
	public int movementCost() { return 3; }
	public int foodCost()     { return 2; }
	public int waterCost()    { return 1; }
	public String name()      { return "Swamp"; }
}
