interface TownEvent {
  // Name to help distinguish between events. // TODO: Do I need the name?
  name: string;
  weight: number;
  // Optional predicate to disable event based on state of game.
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

class TownState {
  flag1: boolean;
  flag2: boolean;
  flags: Array<boolean>;
  number1: number;
  number2: number;
  numbers: Array<number>;
  string1: string;
  string2: string;
  strings: Array<string>;

  constructor() {
    this.flag1 = false;
    this.flag2 = false;
    this.flags = [];
    this.number1 = 0;
    this.number2 = 0;
    this.numbers = [];
    this.string1 = '';
    this.string2 = '';
    this.strings = [];
  }
}

class Town {
  name: string;
  townsfolk: number;
  need: number;
  needMax: number;
  needRatio: number;
  boss: number;
  bossReward: number;
  foodStock: number;
  foodSupport: number;
  foodCostBuy: number;
  foodCostSell: number;
  waterStock: number;
  waterSupport: number;
  waterCostBuy: number;
  waterCostSell: number;

  inventoryWeapon: Inventory;
  inventoryWeaponBuy: Inventory;
  inventoryWeaponSell: Inventory;
  inventoryArmor: Inventory;
  inventoryArmorBuy: Inventory;
  inventoryArmorSell: Inventory;

  state: TownState;
  events: Array<TownEvent>;

  constructor() {
    this.name = 'Town';
    this.townsfolk = 0;
    this.need = 0;
    this.needMax = 0;
    this.needRatio = 0;
    this.boss = 0;
    this.bossReward = 0;
    this.foodStock = 0;
    this.foodSupport = 0;
    this.foodCostBuy = 0;
    this.foodCostSell = 0;
    this.waterStock = 0;
    this.waterSupport = 0;
    this.waterCostBuy = 0;
    this.waterCostSell = 0;

    this.inventoryWeapon = new Inventory();
    this.inventoryWeaponBuy = new Inventory();
    this.inventoryWeaponSell = new Inventory();
    this.inventoryArmor = new Inventory();
    this.inventoryArmorBuy = new Inventory();
    this.inventoryArmorSell = new Inventory();

    this.state = new TownState();
    this.events = [];
  }
}
