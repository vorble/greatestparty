interface TownHooks extends ClockActions {
  onTownArrive?: (game: Game) => void;
  onTownDepart?: (game: Game) => void;
  onSacrifice?: (game: Game) => void;
  onAnimate?: (game: Game) => void;
}

interface TownEvent {
  name: string;
  weight: number;
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

interface TownQuest {
  name: string;
  weight: number;
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

interface TownEnvironment {
  name: string;
  weight: number;
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

// Quantities for spring, summer, fall, and then winter.
type TownSeasonVector = [number, number, number, number];

class Town {
  name: string;
  townsfolk: number;
  hireCost: number;
  conscriptRatio: number;
  conscriptViolenceRatio: number;
  alignment: number;
  need: number;
  needMax: number;
  needRatio: number;
  enemyRatio: number;
  goldPerQuest: number;
  foodStock: number;
  foodSupport: TownSeasonVector;
  foodCostBuy: TownSeasonVector;
  foodCostSell: TownSeasonVector;
  waterStock: number;
  waterSupport: TownSeasonVector;
  waterCostBuy: TownSeasonVector;
  waterCostSell: TownSeasonVector;

  inventoryWeapon: EquipmentInventory;
  inventoryWeaponBuy: EquipmentInventory;
  inventoryWeaponSell: EquipmentInventory;
  inventoryArmor: EquipmentInventory;
  inventoryArmorBuy: EquipmentInventory;
  inventoryArmorSell: EquipmentInventory;

  state: unknown;
  hooks: TownHooks;
  events: Array<TownEvent>;
  quests: Array<TownQuest>;
  enemies: Array<EnemyTemplate>;
  bosses: Array<EnemyTemplate>;

  constructor() {
    this.name = 'Town';
    this.townsfolk = 0;
    this.hireCost = 0;
    this.conscriptRatio = 0;
    this.conscriptViolenceRatio = 0;
    this.alignment = 0;
    this.need = 0;
    this.needMax = 0;
    this.needRatio = 0;
    this.enemyRatio = 0;
    this.goldPerQuest = 0;
    this.foodStock = 0;
    this.foodSupport = [0, 0, 0, 0];
    this.foodCostBuy = [0, 0, 0, 0];
    this.foodCostSell = [0, 0, 0, 0];
    this.waterStock = 0;
    this.waterSupport = [0, 0, 0, 0];
    this.waterCostBuy = [0, 0, 0, 0];
    this.waterCostSell = [0, 0, 0, 0];

    this.inventoryWeapon = new EquipmentInventory();
    this.inventoryWeaponBuy = new EquipmentInventory();
    this.inventoryWeaponSell = new EquipmentInventory();
    this.inventoryArmor = new EquipmentInventory();
    this.inventoryArmorBuy = new EquipmentInventory();
    this.inventoryArmorSell = new EquipmentInventory();

    this.state = {};
    this.hooks = {};
    this.events = [];
    this.quests = [];
    this.enemies = [];
    this.bosses = [];
  }
}
