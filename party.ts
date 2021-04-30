class Party implements Fighter {
  size: number;
  gold: number;
  food: number;
  hunger: number;
  water: number;
  thirst: number;
  quests: number;
  questsCompleted: number;
  questPoints: number;
  damage: number;

  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  inventoryWeapon: Inventory;
  inventoryArmor: Inventory;
  weapon: Equipment;
  armor: Equipment;

  status: Status;
  skills: Skills;

  constructor() {
    this.size = 0;
    this.gold = 0;
    this.food = 0;
    this.hunger = 0;
    this.water = 0;
    this.thirst = 0;
    this.quests = 0;
    this.questsCompleted = 0;
    this.questPoints = 0;
    this.damage = 0;

    this.str = 0;
    this.dex = 0;
    this.con = 0;
    this.int = 0;
    this.wis = 0;
    this.cha = 0;

    this.inventoryWeapon = new Inventory();
    this.inventoryArmor = new Inventory();
    this.weapon = new Equipment();
    this.armor = new Equipment();

    this.status = new Status();
    this.skills = new Skills();
  }
}
