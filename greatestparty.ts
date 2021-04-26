type EqFineCategory = 'blunt' | 'slice' | 'dark' | 'light' | 'fire' | 'ice';
const EQ_FINE_CATEGORIES: Array<EqFineCategory> = ['blunt', 'slice', 'dark', 'light', 'fire', 'ice'];

class Inventory {
  blunt: number;
  slice: number;
  dark: number;
  light: number;
  fire: number;
  ice: number;

  constructor() {
    this.blunt = 0;
    this.slice = 0;
    this.dark = 0;
    this.light = 0;
    this.fire = 0;
    this.ice = 0;
  }
}

class Equipment {
  physical: number; // < 0 for blunt, > 0 for slice
  magical: number; // < 0 for dark, > 0 for light
  elemental: number; // < 0 for fire, > 0 for ice

  constructor() {
    this.physical = 0;
    this.magical = 0;
    this.elemental = 0;
  }
}

class PartyMember {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  weapon: Equipment;
  armor: Equipment;

  constructor() {
    this.str = 0;
    this.dex = 0;
    this.con = 0;
    this.int = 0;
    this.wis = 0;
    this.cha = 0;

    this.weapon = new Equipment();
    this.armor = new Equipment();
  }
}

class Party {
  size: number;
  gold: number;
  food: number;
  hunger: number;
  water: number;
  thirst: number;
  quests: number;
  questPoints: number;
  damage: number;
  partyMembers: Array<PartyMember>;

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

  constructor() {
    this.size = 0;
    this.gold = 0;
    this.food = 0;
    this.hunger = 0;
    this.water = 0;
    this.thirst = 0;
    this.quests = 0;
    this.questPoints = 0;
    this.damage = 0;
    this.partyMembers = [];

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
  }
}

interface EventBase {
  weight: number;
  // Optional predicate to disable event based on state of game.
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

interface TownEvent extends EventBase {
  // Name to help distinguish between events. // TODO: Do I need the name?
  name: string;
}

interface BossEvent extends EventBase {
  name: string;
}

class BossState {
  flag1: boolean;
  flag2: boolean;
  flags: Array<boolean>;
  number1: number;
  number2: number;
  numbers: Array<number>;
  state1: string;
  state2: string;
  states: Array<string>;

  constructor() {
    this.flag1 = false;
    this.flag2 = false;
    this.flags = [];
    this.number1 = 0;
    this.number2 = 0;
    this.numbers = [];
    this.state1 = '';
    this.state2 = '';
    this.states = [];
  }
}

class Boss {
  size: number;
  state: BossState;
  events: Array<BossEvent>;

  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  weapon: Equipment;
  armor: Equipment;

  constructor() {
    this.size = 0;
    this.events = [];
    this.state = new BossState();

    this.str = 0;
    this.dex = 0;
    this.con = 0;
    this.int = 0;
    this.wis = 0;
    this.cha = 0;

    this.weapon = new Equipment();
    this.armor = new Equipment();
  }
}

class Town {
  townsfolk: number;
  need: number;
  boss: number;
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

  events: Array<TownEvent>;

  constructor() {
    this.townsfolk = 0;
    this.need = 0;
    this.boss = 0;
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

    this.events = [];
  }
}

class Game {
  party: Party;
  town: Town;
  boss: Boss;
  year: number;
  season: number; // 0 spring, 1 summer, 2 fall, 3 winter
  term: number; // 25 terms per season
  tock: number; // 20 tock per term
  tick: number; // 20 ticks per tock
  fightingBoss: boolean;
  running: boolean;
  textLog: Array<string>;

  constructor() {
    this.party = new Party();
    this.town = new Town();
    this.boss = new Boss();
    this.year = 0;
    this.season = 0;
    this.term = 0;
    this.tock = 0;
    this.tick = 0;
    this.fightingBoss = false;
    this.running = false;
    this.textLog = [];
  }

  takeQuest() {
    if (this.town.need > 0) {
      this.town.need -= 1;
      this.party.quests += 1;
    }
  }

  fightBoss() {
    if (!this.fightingBoss) {
      this.boss.size = this.town.boss;
      this.fightingBoss = true;
    }
  }

  buyFood() {
    if (this.party.gold >= this.town.foodCostBuy && this.town.foodStock > 0) {
      this.party.gold -= this.town.foodCostBuy;
      this.party.food += 1;
      this.town.foodStock -= 1;
    }
  }

  sellFood() {
    if (this.party.food > 0) {
      this.party.gold += this.town.foodCostSell;
      this.party.food -= 1;
      this.town.foodStock += 1;
    }
  }

  buyWater() {
    if (this.party.gold >= this.town.waterCostBuy && this.town.waterStock > 0) {
      this.party.gold -= this.town.waterCostBuy;
      this.party.water += 1;
      this.town.waterStock -= 1;
    }
  }

  sellWater() {
    if (this.party.water > 0) {
      this.party.gold += this.town.waterCostSell;
      this.party.water -= 1;
      this.town.waterStock += 1;
    }
  }

  buyEquipment(equipmentType: 'weapon' | 'armor', name: EqFineCategory) {
    // TODO: I don't like the argument names.
    const { townInventory, townInventoryBuy, partyInventory } = (() => {
      switch (equipmentType) {
        case 'weapon': return {
          townInventory: this.town.inventoryWeapon,
          townInventoryBuy: this.town.inventoryWeaponBuy,
          partyInventory: this.party.inventoryWeapon,
        };
        case 'armor': return {
          townInventory: this.town.inventoryArmor,
          townInventoryBuy: this.town.inventoryArmorBuy,
          partyInventory: this.party.inventoryArmor,
        };
      }
    })();
    if (this.party.gold >= townInventoryBuy[name] && townInventory[name] > 0) {
      this.party.gold -= townInventoryBuy[name];
      townInventory[name] -= 1;
      partyInventory[name] += 1;
    }
  }

  sellEquipment(equipmentType: 'weapon' | 'armor', name: EqFineCategory) {
    // TODO: I don't like the argument names.
    const { townInventory, townInventorySell, partyInventory } = (() => {
      switch (equipmentType) {
        case 'weapon': return {
          townInventory: this.town.inventoryWeapon,
          townInventorySell: this.town.inventoryWeaponSell,
          partyInventory: this.party.inventoryWeapon,
        };
        case 'armor': return {
          townInventory: this.town.inventoryArmor,
          townInventorySell: this.town.inventoryArmorSell,
          partyInventory: this.party.inventoryArmor,
        };
      }
    })();
    if (partyInventory[name] > 0) {
      this.party.gold += townInventorySell[name];
      partyInventory[name] -= 1;
      townInventory[name] += 1;
    }
  }

  log(text: string) {
    this.textLog.push(text);
  }

  round() {
    // ----------------------------------------------------
    // TIME KEEPING
    // ----------------------------------------------------
    this.tick += 1;
    if (this.tick >= 20) {
      this.tick = 0;
      this.tock += 1;
      if (this.tock >= 20) {
        this.tock = 0;
        this.term += 1;
        if (this.term >= 25) {
          this.term = 0;
          this.season += 1;
          if (this.season >= 4) {
            this.season = 0;
            this.year += 1
          }
        }
      }
    }

    // ----------------------------------------------------
    // EATING AND DRINKING
    // ----------------------------------------------------
    const HUNGER_PER_FOOD = 100;
    const HUNGER_PER_PERSON = 100; // Hunger for 1 member death
    const THIRST_PER_WATER = 75;
    const THIRST_PER_PERSON = 75; // Thirst for 1 member death
    // Every member of your party needs to eat and dring,
    // contributing hunger and thirst points.
    this.party.hunger += this.party.size;
    this.party.thirst += this.party.size;
    // Hunger and thirst points are satisfied by the land
    // first, then the party's food and water stores.
    this.party.hunger -= this.town.foodSupport;
    if (this.party.hunger < 0) {
      this.party.hunger = 0;
    }
    this.party.thirst -= this.town.waterSupport;
    if (this.party.thirst < 0) {
      this.party.thirst = 0;
    }
    const neededFood = Math.floor(this.party.hunger / HUNGER_PER_FOOD);
    const neededWater = Math.floor(this.party.thirst / THIRST_PER_WATER);
    const useFood = Math.min(this.party.food, neededFood);
    const useWater = Math.min(this.party.water, neededWater);
    if (useFood > 0) {
      this.party.food -= useFood;
      this.party.hunger -= useFood * HUNGER_PER_FOOD;
    }
    if (useWater > 0) {
      this.party.water -= useWater;
      this.party.thirst -= useWater * THIRST_PER_WATER;
    }
    // Excess hunger and thirst will cause party members to die.
    const countStarved = Math.floor(this.party.hunger / HUNGER_PER_PERSON);
    const countDehydrated = Math.floor(this.party.thirst / THIRST_PER_PERSON);
    const countDead = Math.min(this.party.size, Math.max(countStarved, countDehydrated));
    if (countDead > 0) {
      this.party.size -= countDead;
      // Staisfy hunger and thirst since the members no longer
      // need the food and water.
      this.party.hunger -= countStarved * HUNGER_PER_PERSON;
      this.party.thirst -= countDehydrated * THIRST_PER_PERSON;
    }

    // ----------------------------------------------------
    // FIGHTING BOSS
    // ----------------------------------------------------
    if (this.fightingBoss) {
      const PARTY_MEMBER_HP = 20;
      const damageToBoss = fightCalculateAttack(this.party, this.boss);
      const damageToParty = fightCalculateAttack(this.boss, this.party);
      this.party.damage += damageToParty;
      this.boss.size = Math.max(0, this.boss.size - damageToBoss);
      if (this.boss.size <= 0) {
        this.fightingBoss = false;
        // TODO: Need to trigger town change somehow.
      }
      const willDie = Math.floor(this.party.damage / PARTY_MEMBER_HP);
      if (willDie > 0) {
        this.party.size = Math.max(0, this.party.size - willDie);
        this.party.damage -= willDie * PARTY_MEMBER_HP;
      }
    } else {
      // Slowly heal party damage when out of battle.
      if (this.party.damage > 0) {
        this.party.damage -= 1;
      }
    }

    // ----------------------------------------------------
    // BOSS EVENTS
    // ----------------------------------------------------
    if (this.fightingBoss && this.tick == 0) {
      const event = this.pickBossEvent();
      if (event != null) {
        event.action(this);
      }
    }

    // ----------------------------------------------------
    // QUESTING
    // ----------------------------------------------------
    if (this.party.quests > 0) {
      const POINTS_PER_QUEST = 100;
      const GOLD_PER_QUEST = 1;
      // A random percentage of your party is effective this
      // turn, gain a quest point for each effective party
      // member.
      const newQuestPoints = Math.floor(this.party.size * rollRatio()) + 1;
      this.party.questPoints += newQuestPoints;
      // Quest points count toward completing quests, but
      // the number of completed quests is limited by the
      // number of active quests.
      const questsCompleted = Math.min(this.party.quests, Math.floor(this.party.questPoints / POINTS_PER_QUEST));
      if (questsCompleted > 0) {
        this.party.quests -= questsCompleted;
        this.party.gold += questsCompleted * GOLD_PER_QUEST;
        this.party.questPoints -= POINTS_PER_QUEST * questsCompleted;
      }
      // If it was possible to complete additional quests
      // this round, the quest points are abandoned since
      // there is nothing left for the party to do.
      // TODO: Does this overlap with what's in QWERRRERE?
      if (this.party.questPoints >= POINTS_PER_QUEST) {
        this.party.questPoints = this.party.questPoints % POINTS_PER_QUEST;
      }
    }

    // If you run out of quests, then any progress toward
    // quests is abandoned since there is nothing left
    // for the party to do.
    // TODO: Does this overlap with what's in QWERRRERE?
    if (this.party.quests <= 0) {
      this.party.questPoints = 0;
    }

    // ----------------------------------------------------
    // TOWN EVENTS
    // ----------------------------------------------------
    if (this.tick == 0 && this.tock == 0) {
      const event = this.pickTownEvent();
      if (event != null) {
        event.action(this);
      }
    }

    // TODO: Temporary implementation, stop the game when the party is dead.
    if (this.party.size == 0) {
      this.running = false;
    }
  }

  pickTownEvent(): null | TownEvent {
    let totalWeight = 0;
    const events = [];
    for (const event of this.town.events) {
      if (event.predicate == null || event.predicate(this)) {
        totalWeight += event.weight;
        events.push(event);
      }
    }
    if (totalWeight == 0 || events.length == 0) {
      return null;
    }
    let choice = rollDie(totalWeight) - 1; // TODO: Should I expose the _randomInt function?
    for (const event of events) {
      if (choice < event.weight) {
        return event;
      }
      choice -= event.weight;
    }
    throw new Error('Assertion error. Could not pick town event.');
  }

  pickBossEvent(): null | TownEvent {
    let totalWeight = 0;
    const events = [];
    for (const event of this.boss.events) {
      if (event.predicate == null || event.predicate(this)) {
        totalWeight += event.weight;
        events.push(event);
      }
    }
    if (totalWeight == 0 || events.length == 0) {
      return null;
    }
    let choice = rollDie(totalWeight) - 1; // TODO: Should I expose the _randomInt function?
    for (const event of events) {
      if (choice < event.weight) {
        return event;
      }
      choice -= event.weight;
    }
    throw new Error('Assertion error. Could not pick boss event.');
  }
}

let game = new Game();

// XXX: Testing values
game.running = true;
game.year = 311;
game.party.size = 4;
game.party.gold = 100;
game.party.quests =1;
game.party.food = 15;
game.party.water = 20;
game.party.str = 10;
game.party.dex = 10;
game.party.con = 10;
game.party.int = 10;
game.party.wis = 10;
game.party.cha = 10;
game.party.weapon.physical = 2;
game.party.armor.physical = 1;
game.town.townsfolk = 100;
game.town.foodStock = 100;
game.town.foodSupport = 3;
game.town.foodCostBuy = 10;
game.town.foodCostSell = 7;
game.town.waterStock = 100;
game.town.waterSupport = 3;
game.town.waterCostBuy = 12;
game.town.waterCostSell = 9;
for (const cat of EQ_FINE_CATEGORIES) {
  game.town.inventoryWeapon[cat] = 100;
  game.town.inventoryWeaponBuy[cat] = 5;
  game.town.inventoryWeaponSell[cat] = 3;
  game.town.inventoryArmor[cat] = 100;
  game.town.inventoryArmorBuy[cat] = 5;
  game.town.inventoryArmorSell[cat] = 3;
}
game.town.need = 5;
game.town.boss = 50;
game.town.events = [
  {
    name: 'Deep in Depression',
    weight: 1,
    action: (game: Game) => {
      const conRoll = rollDie(20);
      const chaRoll = rollDie(20);
      if (conRoll < 5 && chaRoll < 17) {
        game.log('A party member was suffering from a deep depression and has committed suicide.');
        // TODO: Make a "killPartyMembers" method or something that does party size checks.
        game.party.size -= 1;
      } else {
        game.log('A party member is suffering from a deep depression.');
      }
    },
  },
];

game.boss.weapon.physical = -1; // 1 blunt damage
game.boss.weapon.elemental = 1; // 1 ice damage
game.boss.armor.physical = -1; // 1 blunt armor
game.boss.armor.elemental = 1; // 1 ice armor
game.boss.str = 10;
game.boss.dex = 10;
game.boss.con = 10;
game.boss.int = 10;
game.boss.wis = 10;
game.boss.cha = 10;
game.boss.events = [
  {
    name: 'Staring Contest',
    weight: 1,
    predicate: (game: Game) => {
      return !game.boss.state.flag1 && !game.boss.state.flag2;
    },
    action: (game: Game) => {
      game.boss.state.flag1 = true;
      game.log('Octopod becomes still as it gazes over the party...');
    },
  },
  {
    name: 'Lose Staring Contest',
    weight: 1,
    predicate: (game: Game) => {
      return game.boss.state.flag1;
    },
    action: (game: Game) => {
      game.boss.state.flag1 = false;
      game.log('Octopod blinks!');
    },
  },
  {
    name: 'Win Staring Contest',
    weight: 1,
    predicate: (game: Game) => {
      return game.boss.state.flag1;
    },
    action: (game: Game) => {
      game.boss.state.flag1 = false;
      game.boss.state.flag2 = true;
      game.log('Octopod squirms with delight!');
    },
  },
  {
    name: 'Tentacle Swipe',
    weight: 1,
    predicate: (game: Game) => {
      return game.boss.state.flag2;
    },
    action: (game: Game) => {
      game.boss.state.flag2 = false;
      game.log('A member of your party disappears under Octopod\'s tentacle.');
      // TODO: Make a "killPartyMembers" method or something that does party size checks.
      game.party.size -= 1;
    },
  },
];
game.log('Game initialized with test values.');

function gameStart() {
  initUI(game);
  ui.show();

  setInterval(() => {
    if (game.running) {
      game.round();
      ui.show();
    }
  }, 250);
}

// TODO: Cheat code to stay alive.
/*
setInterval(() => {
  if (game.party.size < 4) {
    game.party.size = 4;
  }
}, 1000);
*/

// TODO: Do some research: the DOM should be fully laid out
// before this callback is called, right?
window.onload = gameStart;
