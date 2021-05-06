interface TownHooks extends ClockActions {
  onTownArrive?: (game: Game) => void;
  onTownDepart?: (game: Game) => void;
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

interface TownWeather {
  name: string;
  weight: number;
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

class TownState {
  flags: Array<boolean>;
  numbers: Array<number>;
  strings: Array<string>;

  constructor() {
    this.flags = [];
    this.numbers = [];
    this.strings = [];
  }
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
  boss: number;
  bossReward: number;
  foodStock: number;
  foodSupport: TownSeasonVector;
  foodCostBuy: TownSeasonVector;
  foodCostSell: TownSeasonVector;
  waterStock: number;
  waterSupport: TownSeasonVector;
  waterCostBuy: TownSeasonVector;
  waterCostSell: TownSeasonVector;

  inventoryWeapon: Inventory;
  inventoryWeaponBuy: Inventory;
  inventoryWeaponSell: Inventory;
  inventoryArmor: Inventory;
  inventoryArmorBuy: Inventory;
  inventoryArmorSell: Inventory;

  state: TownState;
  hooks: TownHooks;
  events: Array<TownEvent>;
  quests: Array<TownQuest>;

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
    this.boss = 0;
    this.bossReward = 0;
    this.foodStock = 0;
    this.foodSupport = [0, 0, 0, 0];
    this.foodCostBuy = [0, 0, 0, 0];
    this.foodCostSell = [0, 0, 0, 0];
    this.waterStock = 0;
    this.waterSupport = [0, 0, 0, 0];
    this.waterCostBuy = [0, 0, 0, 0];
    this.waterCostSell = [0, 0, 0, 0];

    this.inventoryWeapon = new Inventory();
    this.inventoryWeaponBuy = new Inventory();
    this.inventoryWeaponSell = new Inventory();
    this.inventoryArmor = new Inventory();
    this.inventoryArmorBuy = new Inventory();
    this.inventoryArmorSell = new Inventory();

    this.state = new TownState();
    this.hooks = {};
    this.events = [];
    this.quests = [];
  }
}
