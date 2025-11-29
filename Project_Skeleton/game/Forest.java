package game;

public class Forest extends Terrain
{
	public int movementCost() { return 2; }
	public int foodCost()     { return 1; }
	public int waterCost()    { return 2; }
	public String name()      { return "Forest"; }
}
