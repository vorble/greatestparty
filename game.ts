interface Level {
  level: number;
  newTown: (game: Game) => { town: Town, boss: Boss };
}

class Game {
  party: Party;
  town: Town;
  boss: Boss;
  year: number;
  season: number; // 0 spring, 1 summer, 2 fall, 3 winter
  term: number;
  tock: number;
  tick: number;
  fightingBoss: boolean;
  running: boolean;
  textLog: Array<string>;
  levels: Array<Level>;
  level: number;

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
    this.levels = [];
    this.level = 0;
  }

  registerLevel(level: Level) {
    this.levels.push(level);
  }

  newGame() {
    this.year = 311; // TODO: Randomize year and season.
    this.season = 0; // TODO: Randomize year and season.
    this.term = 0;
    this.tock = 0;
    this.tick = 0;
    this.fightingBoss = false;
    this.running = true;
    this.textLog = [];
    this.level = 1;

    this.party = new Party();
    this.party.size = 4;
    this.party.gold = 100;
    this.party.quests = 0;
    this.party.food = 15;
    this.party.water = 20;
    // TODO: Roll for stats.
    const mods = [0, 0, 0, 0, 0, 0];
    function topThreeOfFourD6() {
      let a = rollDie(6);
      let b = rollDie(6);
      let c = rollDie(6);
      let d = rollDie(6);
      if (d > a) a = d;
      else if (d > b) b = d;
      else if (d > c) c = d;
      return a + b + c;
    }
    this.party.str = topThreeOfFourD6();
    this.party.dex = topThreeOfFourD6();
    this.party.con = topThreeOfFourD6();
    this.party.int = topThreeOfFourD6();
    this.party.wis = topThreeOfFourD6();
    this.party.cha = topThreeOfFourD6();

    this.startLevel();
  }

  startLevel() {
    const levels = this.levels.filter(x => x.level == this.level);
    if (levels.length == 0) {
      throw new Error('Couldn\'t find level ' + this.level + '.');
    }
    const which = rollDie(levels.length) - 1;
    const level = levels[which];
    const { boss, town } = level.newTown(this);
    this.town = town;
    this.boss = boss;

    this.log('Welcome to ' + this.town.name + '!');
  }

  winLevel() {
    this.log('You have helped ' + this.town.name + ' overcome ' + this.boss.name + ' and receive ' + this.town.bossReward + ' gold.');
    this.party.gold += this.town.bossReward;
    this.log(this.town.name + ' wishes you the best on your adventures!');
  }

  nextLevel() {
    this.level += 1;
    if (this.level <= this.levels.reduce((result, l) => Math.max(result, l.level), 0)) {
      this.startLevel();
    } else {
      // You win the game.
      this.log('Congratulations, you have beaten the final level!');
      this.log('Thanks for playing!');
      this.running = false;
    }
  }

  killPartyMembers(count: number) {
    if (this.party.size >= count) {
      this.party.size -= count;
    } else {
      this.party.size = 0;
    }
    this.capEquipment();
  }

  joinPartyFromTown(count: number) {
    if (this.town.townsfolk >= count) {
      this.party.size += count;
      this.town.townsfolk -= count;
    } else {
      this.party.size += this.town.townsfolk;
      this.town.townsfolk = 0;
    }
  }

  takeQuest() {
    if (this.town.need > 0 && this.party.quests < game.party.size) {
      this.town.need -= 1;
      this.party.quests += 1;
    }
  }

  fightBoss() {
    if (!this.fightingBoss) {
      this.boss.size = this.town.boss;
      this.fightingBoss = true;
      this.log('You pick a fight with ' + this.boss.name + '.');
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
    this.capEquipment();
  }

  capEquipment() {
    if (this.party.weapon.physical > 0) {
      this.party.weapon.physical = Math.min(this.party.size, this.party.weapon.physical, this.party.inventoryWeapon.slice);
    } else if (this.party.weapon.physical < 0) {
      this.party.weapon.physical = -Math.min(this.party.size, -this.party.weapon.physical, this.party.inventoryWeapon.blunt);
    }
    if (this.party.weapon.magical > 0) {
      this.party.weapon.magical = Math.min(this.party.size, this.party.weapon.magical, this.party.inventoryWeapon.slice);
    } else if (this.party.weapon.magical < 0) {
      this.party.weapon.magical = -Math.min(this.party.size, -this.party.weapon.magical, this.party.inventoryWeapon.blunt);
    }
    if (this.party.weapon.elemental > 0) {
      this.party.weapon.elemental = Math.min(this.party.size, this.party.weapon.elemental, this.party.inventoryWeapon.slice);
    } else if (this.party.weapon.elemental < 0) {
      this.party.weapon.elemental = -Math.min(this.party.size, -this.party.weapon.elemental, this.party.inventoryWeapon.blunt);
    }
    if (this.party.armor.physical > 0) {
      this.party.armor.physical = Math.min(this.party.size, this.party.armor.physical, this.party.inventoryArmor.slice);
    } else if (this.party.armor.physical < 0) {
      this.party.armor.physical = -Math.min(this.party.size, -this.party.armor.physical, this.party.inventoryArmor.blunt);
    }
    if (this.party.armor.magical > 0) {
      this.party.armor.magical = Math.min(this.party.size, this.party.armor.magical, this.party.inventoryArmor.slice);
    } else if (this.party.armor.magical < 0) {
      this.party.armor.magical = -Math.min(this.party.size, -this.party.armor.magical, this.party.inventoryArmor.blunt);
    }
    if (this.party.armor.elemental > 0) {
      this.party.armor.elemental = Math.min(this.party.size, this.party.armor.elemental, this.party.inventoryArmor.slice);
    } else if (this.party.armor.elemental < 0) {
      this.party.armor.elemental = -Math.min(this.party.size, -this.party.armor.elemental, this.party.inventoryArmor.blunt);
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
    unwrapClock(this);

    // ----------------------------------------------------
    // ROUND ACTIONS
    // ----------------------------------------------------
    const doActions = (s: ClockActions) => {
      if (s.doTickActions) {
        s.doTickActions(this);
      }
      if (this.tick == 0) {
        if (s.doTockActions) {
          s.doTockActions(this);
        }
        if (this.tock == 0) {
          if (s.doTermActions) {
            s.doTermActions(this);
          }
          if (this.term == 0) {
            if (s.doSeasonActions) {
              s.doSeasonActions(this);
            }
            if (this.season == 0) {
              if (s.doYearActions) {
                s.doYearActions(this);
              }
            }
          }
        }
      }
    };

    for (const status of STATUSES) {
      const s = game.party.status[status];
      if (s.active) {
        if (isStatusExpired(game, s)) {
          s.active = false;
        } else {
          doActions(s);
        }
      }
    }

    for (const skill of SKILLS) {
      const s = game.party.skills[skill];
      if (s.level > 0) {
        doActions(s);
      }
    }

    // ----------------------------------------------------
    // EATING AND DRINKING
    // ----------------------------------------------------
    const HUNGER_PER_FOOD = TICKS_PER_TOCK * TOCKS_PER_TERM;
    const HUNGER_PER_PERSON = TICKS_PER_TOCK * TOCKS_PER_TERM; // Hunger for 1 member death
    const THIRST_PER_WATER = Math.floor(HUNGER_PER_FOOD * 0.75);
    const THIRST_PER_PERSON = Math.floor(HUNGER_PER_PERSON * 0.75); // Thirst for 1 member death
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
      const PARTY_MEMBER_HP = 100;
      const damageToBoss = fightCalculateAttack(this.party, this.boss);
      const damageToParty = fightCalculateAttack(this.boss, this.party);
      this.party.damage += damageToParty;
      this.boss.size = Math.max(0, this.boss.size - damageToBoss);
      if (this.boss.size <= 0) {
        this.fightingBoss = false;
        this.log('Your party is victorious!');
        this.winLevel();
        this.nextLevel();
      } else {
        const willDie = Math.floor(this.party.damage / PARTY_MEMBER_HP);
        if (willDie > 0) {
          this.party.size = Math.max(0, this.party.size - willDie);
          this.party.damage -= willDie * PARTY_MEMBER_HP;
        }
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
    if (this.town.needRatio > 0 && this.town.need < this.town.needMax) {
      if (rollRatio() < this.town.needRatio) {
        if (FLAGS.LOG_NEW_NEED) {
          this.log('The town\'s need grows.');
        }
        this.town.need += 1;
      }
    }

    if (this.party.quests > 0) {
      const POINTS_PER_QUEST = 100;
      const GOLD_PER_QUEST = 10;
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
    if (this.tick == 0 && this.tock % 5 == 0) { // TODO: tock % 5, what if tock max isn't multiple of 5?
      const event = this.pickTownEvent();
      if (event != null) {
        event.action(this);
      }
    }

    // TODO: Temporary implementation, stop the game when the party is dead.
    if (this.party.size == 0) {
      this.running = false;
      this.log('Your party has been vanquished.');
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

  pickBossEvent(): null | BossEvent {
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

  adjustPartyEquipmentRelative(weapon: Equipment, armor: Equipment) {
    // Value on equipment is from -100 to 100 and values are scaled into
    // actually equippable amounts.
    let weaponTotal = Math.abs(weapon.physical) + Math.abs(weapon.magical) + Math.abs(weapon.elemental);
    let weaponMax = this.party.size;
    let armorTotal = Math.abs(armor.physical) + Math.abs(armor.magical) + Math.abs(armor.elemental);
    let armorMax = this.party.size;
    if (weaponTotal == 0) {
      this.party.weapon.physical = 0;
      this.party.weapon.magical = 0;
      this.party.weapon.elemental = 0;
    } else {
      const physicalUse = Math.floor((Math.abs(weapon.physical) / weaponTotal) * weaponMax);
      // TODO: Flip condition so they're in the usual order.
      if (weapon.physical > 0) {
        this.party.weapon.physical = Math.min(this.party.inventoryWeapon.slice, physicalUse);
      } else {
        this.party.weapon.physical = -Math.min(this.party.inventoryWeapon.blunt, physicalUse);
      }
      const magicalUse = Math.floor((Math.abs(weapon.magical) / weaponTotal) * weaponMax);
      if (weapon.magical > 0) {
        this.party.weapon.magical = Math.min(this.party.inventoryWeapon.light, magicalUse);
      } else {
        this.party.weapon.magical = -Math.min(this.party.inventoryWeapon.dark, magicalUse);
      }
      const elementalUse = Math.floor((Math.abs(weapon.elemental) / weaponTotal) * weaponMax);
      if (weapon.elemental > 0) {
        this.party.weapon.elemental = Math.min(this.party.inventoryWeapon.ice, elementalUse);
      } else {
        this.party.weapon.elemental = -Math.min(this.party.inventoryWeapon.fire, elementalUse);
      }
    }
    if (armorTotal == 0) {
      this.party.armor.physical = 0;
      this.party.armor.magical = 0;
      this.party.armor.elemental = 0;
    } else {
      const physicalUse = Math.floor((Math.abs(armor.physical) / armorTotal) * armorMax);
      // TODO: Flip condition so they're in the usual order.
      if (armor.physical > 0) {
        this.party.armor.physical = Math.min(this.party.inventoryArmor.slice, physicalUse);
      } else {
        this.party.armor.physical = -Math.min(this.party.inventoryArmor.blunt, physicalUse);
      }
      const magicalUse = Math.floor((Math.abs(armor.magical) / armorTotal) * armorMax);
      if (armor.magical > 0) {
        this.party.armor.magical = Math.min(this.party.inventoryArmor.light, magicalUse);
      } else {
        this.party.armor.magical = -Math.min(this.party.inventoryArmor.dark, magicalUse);
      }
      const elementalUse = Math.floor((Math.abs(armor.elemental) / armorTotal) * armorMax);
      if (armor.elemental > 0) {
        this.party.armor.elemental = Math.min(this.party.inventoryArmor.ice, elementalUse);
      } else {
        this.party.armor.elemental = -Math.min(this.party.inventoryArmor.fire, elementalUse);
      }
    }
  }

  getSkillCost(skill: SkillIdentifier): number {
    return 50 * (this.party.skills[skill].level + 1) * this.party.skills[skill].costTier;
  }

  canBuySkill(skill: SkillIdentifier): boolean {
    const s = this.party.skills[skill];
    return this.party.gold >= this.getSkillCost(skill)
      && s.level < s.levelMax;
  }

  buySkill(skill: SkillIdentifier) {
    const s = this.party.skills[skill];
    if (this.canBuySkill(skill)) {
      this.party.gold -= this.getSkillCost(skill);
      s.level += 1;
      if (s.doBuyActions) {
        s.doBuyActions(this);
      }
    }
  }
}

let game = new Game();

function gameStart() {
  game.newGame();

  initUI(game);
  ui.show();

  setInterval(() => {
    if (game.running) {
      game.round();
      ui.show();
    }
  }, 250);
}

window.onload = gameStart;
