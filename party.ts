class Party implements Fighter {
  size: number;
  gold: number;
  blood: number;
  food: number;
  hunger: number;
  water: number;
  thirst: number;
  quests: number;
  questsCompleted: number;
  questPoints: number;
  damage: number;

  strbase: number;
  dexbase: number;
  conbase: number;
  intbase: number;
  wisbase: number;
  chabase: number;

  strmod: number;
  dexmod: number;
  conmod: number;
  intmod: number;
  wismod: number;
  chamod: number;

  inventoryWeapon: Inventory;
  inventoryArmor: Inventory;
  weaponPoints: number; // How many points to distribute.
  weaponConfig: Equipment; // How player configured.
  weapon: Equipment; // Computed values.
  armorPoints: number; // How many points to distribute.
  armorConfig: Equipment; // How player configured.
  armor: Equipment; // Computed values.

  status: Status;
  skills: Skills;

  constructor() {
    this.size = 0;
    this.gold = 0;
    this.blood = 0;
    this.food = 0;
    this.hunger = 0;
    this.water = 0;
    this.thirst = 0;
    this.quests = 0;
    this.questsCompleted = 0;
    this.questPoints = 0;
    this.damage = 0;

    this.strbase = 0;
    this.dexbase = 0;
    this.conbase = 0;
    this.intbase = 0;
    this.wisbase = 0;
    this.chabase = 0;

    this.strmod = 0;
    this.dexmod = 0;
    this.conmod = 0;
    this.intmod = 0;
    this.wismod = 0;
    this.chamod = 0;

    this.inventoryWeapon = new Inventory();
    this.inventoryArmor = new Inventory();
    this.weaponPoints = 0;
    this.weaponConfig = new Equipment();
    this.weapon = new Equipment();
    this.armorPoints = 0;
    this.armorConfig = new Equipment();
    this.armor = new Equipment();

    this.status = new Status();
    this.skills = new Skills();
  }

  get str(): number {
    return Math.max(0, this.strbase + this.strmod);
  }

  get dex(): number {
    return Math.max(0, this.dexbase + this.dexmod);
  }

  get con(): number {
    return Math.max(0, this.conbase + this.conmod);
  }

  get int(): number {
    return Math.max(0, this.intbase + this.intmod);
  }

  get wis(): number {
    return Math.max(0, this.wisbase + this.wismod);
  }

  get cha(): number {
    return Math.max(0, this.chabase + this.chamod);
  }

  get health(): number {
    return Math.max(0, this.size * PARTY_MEMBER_HP - this.damage);
  }
}
