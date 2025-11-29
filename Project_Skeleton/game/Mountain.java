package game;

public class Mountain extends Terrain
{
	public int movementCost() { return 3; }
	public int foodCost()     { return 3; }
	public int waterCost()    { return 4; }
	public String name()      { return "Mountain"; }
}
