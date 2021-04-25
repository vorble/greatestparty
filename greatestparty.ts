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
  partyMembers: Array<PartyMember>;

  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  inventory: Inventory;
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
    this.partyMembers = [];

    this.str = 0;
    this.dex = 0;
    this.con = 0;
    this.int = 0;
    this.wis = 0;
    this.cha = 0;

    this.inventory = new Inventory();
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
  waterStock: number;
  waterSupport: number;

  inventory: Inventory;

  constructor() {
    this.townsfolk = 0;
    this.need = 0;
    this.boss = 0;
    this.foodStock = 0;
    this.foodSupport = 0;
    this.waterStock = 0;
    this.waterSupport = 0;

    this.inventory = new Inventory();
  }
}

class Game {
  party: Party;
  town: Town;
  year: number;
  season: number; // 0 spring, 1 summer, 2 fall, 3, winter
  tick: number; // 3000 ticks per season
  running: boolean;

  constructor() {
    this.party = new Party();
    this.town = new Town();
    this.year = 0;
    this.season = 0;
    this.tick = 0;
    this.running = false;
  }

  takeQuest() {
    if (this.town.need > 0) {
      this.town.need -= 1;
      this.party.quests += 1;
    }
  }

  fightBoss() {
    // TODO - Initiate the fight
  }

  round() {
    // ----------------------------------------------------
    // TIME KEEPING
    // ----------------------------------------------------
    this.tick += 1;
    if (this.tick >= 3000) {
      this.tick = 0;
      this.season += 1;
      if (this.season >= 4) {
        this.season = 0;
        this.year += 1
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
      this.party.thirst -= useWater * HUNGER_PER_FOOD;
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

    // ----------------------------------------------------
    // BOSS EVENTS
    // ----------------------------------------------------

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
  }
}

let game = new Game();

// XXX: Testing values
game.party.size = 4;
game.party.quests =1;
game.running = true;
game.town.foodSupport = 1;
game.town.waterSupport = 1;
game.town.townsfolk = 100;
game.town.need = 5;
game.town.boss = 50;

function gameStart() {
  initUI(game);

  setInterval(() => {
    if (game.running) {
      game.round();
      ui.show();
    }
  }, 250);
}

// TODO: Do some research: the DOM should be fully laid out
// before this callback is called, right?
window.onload = gameStart;
