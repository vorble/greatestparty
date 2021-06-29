const PARTY_MEMBER_HP = 100;

interface Level {
  level: number;
  newTown: (game: Game) => Town;
}

interface GameEvent {
  name: string;
  weight: number;
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

interface GameHooks extends ClockActions {
}

class Game {
  party: Party;
  town: Town;
  year: number;
  season: number;
  term: number;
  tock: number;
  tick: number;
  playtime: Clock;
  fightingBoss: boolean;
  running: boolean;
  paused: boolean;
  textLog: Array<string>;
  levels: Array<Level>;
  level: number;
  timeouts: Array<{ callback: () => void, clock: Clock }>;
  boss: null | Enemy;
  enemy: null | Enemy;
  events: Array<GameEvent>;
  hooks: GameHooks;

  constructor() {
    this.party = new Party();
    this.town = new Town();
    this.year = 0;
    this.season = 0;
    this.term = 0;
    this.tock = 0;
    this.tick = 0;
    this.playtime = { year: 0, season: 0, term: 0, tock: 0, tick: 0 };
    this.fightingBoss = false;
    this.running = false;
    this.paused = false;
    this.textLog = [];
    this.levels = [];
    this.level = 0;
    this.timeouts = [];
    this.boss = null;
    this.enemy = null;
    this.events = [];
    this.hooks = {};
  }

  registerLevel(level: Level) {
    this.levels.push(level);
  }

  newGame() {
    this.year = 307 + rollDie(Object.keys(Sign).length * 3);
    this.season = rollDie(4) - 1;
    this.term = rollDie(TERMS_PER_SEASON) - 1;
    this.tock = 0;
    this.tick = 0;
    this.fightingBoss = false;
    // TODO: running and paused could be combined into a 3-state indicator: playing, paused, finished
    this.running = true;
    this.paused = false;
    this.textLog = [];
    this.level = 1;
    this.timeouts = [];
    this.enemy = null;
    this.events = [
      {
        name: 'Err\'s Whisper',
        weight: 1,
        predicate: (game: Game) => clockIsSign(game, Sign.Err),
        action: (game: Game) => {
          const TERMS = 5;
          const positive = rollBoolean();
          const sign = positive ? '+' : '-';
          const amount = positive ? 1 : -1;
          const action = rollChoice([
            () => game.party.status.addStatus(game, { name: 'STR' + sign, strmod: amount, term: TERMS }),
            () => game.party.status.addStatus(game, { name: 'DEX' + sign, dexmod: amount, term: TERMS }),
            () => game.party.status.addStatus(game, { name: 'CON' + sign, conmod: amount, term: TERMS }),
            () => game.party.status.addStatus(game, { name: 'INT' + sign, intmod: amount, term: TERMS }),
            () => game.party.status.addStatus(game, { name: 'WIS' + sign, wismod: amount, term: TERMS }),
            () => game.party.status.addStatus(game, { name: 'CHA' + sign, chamod: amount, term: TERMS }),
          ]);
          action();
          game.log('Your party feels differently abled.');
        },
      },
      {
        name: 'Goh\'s Whisper',
        weight: 1,
        predicate: (game: Game) => clockIsSign(game, Sign.Goh),
        action: (game: Game) => {
          if (!game.party.status.outOfTown.active) {
            const r = rollDie(20);
            if (r <= 10) {
              if (game.town.townsfolk > 0) {
                game.log('A spirited town\'s person joins your party.');
                game.joinPartyFromTown(1);
              }
            } else {
              if (game.party.size > 0) {
                game.log('A spirited member of your party joins the town.');
                game.joinTownFromParty(1);
              }
            }
          }
        },
      },
      {
        name: 'Yurn\'s Whisper',
        weight: 1,
        predicate: (game: Game) => clockIsSign(game, Sign.Yurn),
        action: (game: Game) => {
          const positive = rollBoolean();
          const amount = (positive ? 1 : -1) * rollRange(1, Math.max(1, Math.ceil(game.party.gold / 2)));
          if (positive) {
            game.log('Blessings are upon your party.');
          } else {
            game.log('Misfortunes are upon your party.');
          }
          game.receiveGold(amount);
        },
      },
      {
        name: 'Joyn\'s Whisper',
        weight: 1,
        predicate: (game: Game) => clockIsSign(game, Sign.Joyn),
        action: (game: Game) => {
          const swing = rollRange(0, game.party.food + game.party.water);
          if (swing == 0) {
            // Nothing.
          } else if (swing <= game.party.food) {
            game.log('Your party\'s stores rearrange themselves.');
            game.party.food -= swing;
            game.party.water += swing;
          } else {
            game.log('Your party\'s stores rearrange themselves.');
            const amount = swing - game.party.food;
            game.party.food += amount;
            game.party.water -= amount;
          }
        },
      },
      {
        name: 'Ryna\'s Whisper',
        weight: 1,
        predicate: (game: Game) => clockIsSign(game, Sign.Ryna),
        action: (game: Game) => {
          const which = rollBoolean();
          const size = which ? game.party.weaponPoints : game.party.armorPoints;
          const config = which ? game.party.weaponConfig : game.party.armorConfig;
          const stuff = which ? 'weapons' : 'armor';
          while (true) {
            let total = 0;
            let physical = rollRange(-3, 3);
            total += Math.abs(physical);
            if (total > size) continue;
            let magical = rollRange(-3, 3);
            total += Math.abs(magical);
            if (total > size) continue;
            let elemental = rollRange(-3, 3);
            total += Math.abs(elemental);
            if (total > size) continue;
            config.physical = physical;
            config.magical = magical;
            config.elemental = elemental;
            game.calculateEquipment();
            game.log('Your party scrambles to pick up their ' + stuff + '.');
            break;
          }
        },
      },
      {
        name: 'Sil\'s Whisper',
        weight: 1,
        predicate: (game: Game) => clockIsSign(game, Sign.Sil),
        action: (game: Game) => {
          const count = Math.min(game.town.townsfolk, Math.max(5, Math.ceil(game.town.townsfolk / 20)));
          if (count > 0) {
            const message = 'Sil reaps ' + count + ' soul' + (count == 1 ? '' : 's') + ' from among the townsfolk.';
            game.killTownsfolkWithMessage(count, message);
          }
        },
      },
    ];
    this.hooks = {
    };

    this.party = new Party();
    this.party.size = 4;
    this.party.gold = 300;
    this.party.quests = 0;
    this.party.food = 30;
    this.party.water = 30;
    this.party.weaponPoints = 3;
    this.party.armorPoints = 3;
    const stats = this.rollPartyStats();
    this.party.strbase = stats.str;
    this.party.dexbase = stats.dex;
    this.party.conbase = stats.con;
    this.party.intbase = stats.int;
    this.party.wisbase = stats.wis;
    this.party.chabase = stats.cha;
    this.party.inventoryWeapon.blunt = 3;
    this.party.inventoryWeapon.slice = 3;
    this.party.inventoryWeapon.dark = 3;
    this.party.inventoryWeapon.light = 3;
    this.party.inventoryWeapon.fire = 3;
    this.party.inventoryWeapon.ice = 3;
    this.party.inventoryArmor.blunt = 3;
    this.party.inventoryArmor.slice = 3;
    this.party.inventoryArmor.dark = 3;
    this.party.inventoryArmor.light = 3;
    this.party.inventoryArmor.fire = 3;
    this.party.inventoryArmor.ice = 3;

    this.startLevel();
  }

  rollPartyStats(): { str: number, dex: number, con: number, int: number, wis: number, cha: number } {
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
    function bottomThreeOfFourD6() {
      let a = rollDie(6);
      let b = rollDie(6);
      let c = rollDie(6);
      let d = rollDie(6);
      if (d < a) a = d;
      else if (d < b) b = d;
      else if (d < c) c = d;
      return a + b + c;
    }
    function threeD6No5() {
      function roll() {
        let c = rollDie(6);
        while (5 == c) {
          c = rollDie(6);
        }
        return c;
      }
      return roll() + roll() + roll();
    }
    function twoD8() {
      return rollDie(8) + rollDie(8);
    }
    //const roller = topThreeOfFourD6;
    //const roller = bottomThreeOfFourD6;
    const roller = threeD6No5;
    //const roller = twoD8;
    return {
      str: roller(), int: roller(),
      dex: roller(), wis: roller(),
      con: roller(), cha: roller(),
    };
  }

  startLevel() {
    const levels = this.levels.filter(x => x.level == this.level);
    if (levels.length == 0) {
      throw new Error('Couldn\'t find level ' + this.level + '.');
    }
    const level = rollChoice(levels);
    const town = level.newTown(this);
    const template = rollChoiceWeighted(town.bosses);
    const boss = template.roll(this);

    this.town = town;
    this.boss = boss;

    this.log('Welcome to ' + this.town.name + '!');
    if (this.town.hooks.onTownArrive) {
      this.town.hooks.onTownArrive(this);
    }
  }

  winLevel() {
    this.log(this.town.name + ' wishes you the best on your adventures!');
    const payout = this.town.goldPerQuest * this.party.quests;
    if (payout > 0) {
      this.log('You receive ' + payout + ' gold for your party\'s ' + this.party.quests + ' remaining quest' + (this.party.quests == 1 ? '' : 's') + '.');
      this.party.gold += payout;
    }
    this.party.quests = 0;
    this.nextLevel();
  }

  nextLevel() {
    this.level += 1;
    if (this.level <= this.levels.reduce((result, l) => Math.max(result, l.level), 0)) {
      if (this.town.hooks.onTownDepart) {
        this.town.hooks.onTownDepart(this);
      }
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
    this.calculateEquipment();
  }

  killTownsfolk(count: number) {
    if (count > 0) {
      if (this.town.townsfolk >= count) {
        this.town.townsfolk -= count;
      } else {
        count = this.town.townsfolk;
        this.town.townsfolk = 0;
      }
      this.log(count + ' townsfolk ' + (count == 1 ? 'is dead' : 'are dead') + '.');
    }
  }

  killTownsfolkWithMessage(count: number, message: string) {
    if (count > 0) {
      if (this.town.townsfolk >= count) {
        this.town.townsfolk -= count;
      } else {
        count = this.town.townsfolk;
        this.town.townsfolk = 0;
      }
      this.log(message);
    }
  }

  addPartyMembers(count: number) {
    this.party.size += count;
    this.calculateEquipment();
  }

  receiveGold(amount: number) {
    let action = amount < 0 ? 'loses' : 'receives';
    let showAmount = amount < 0 ? -amount : amount;
    this.log('Your party ' + action + ' ' + showAmount + ' gold.');
    this.party.gold += amount;
  }

  joinPartyFromTown(count: number) {
    if (this.town.townsfolk >= count) {
      this.party.size += count;
      this.town.townsfolk -= count;
    } else {
      this.party.size += this.town.townsfolk;
      this.town.townsfolk = 0;
    }
    this.calculateEquipment();
  }

  joinTownFromParty(count: number) {
    if (this.party.size >= count) {
      this.party.size -= count;
      this.town.townsfolk += count;
    } else {
      this.town.townsfolk += this.party.size;
      this.party.size = 0;
    }
    this.calculateEquipment();
  }

  canHire(): boolean {
    return this.party.gold >= this.town.hireCost && this.town.townsfolk > 0 && !this.party.status.outOfTown.active;
  }

  hire() {
    if (this.canHire()) {
      this.party.gold -= this.town.hireCost;
      this.joinPartyFromTown(1);
    }
  }

  canConscript() {
    return this.town.townsfolk > 0 && this.party.skills.conscript.level > 0 && !this.party.status.outOfTown.active;
  }

  conscript() {
    if (this.canConscript()) {
      if (rollRatio() < this.town.conscriptRatio + 0.01 * this.party.skills.conscript.level) {
        game.log('Your party conscripts someone from town forcefully.');
        this.joinPartyFromTown(1);
        this.adjustAlignment(-5);
      } else {
        game.log('Your party tries to forcefully conscript someone from town, but fail.');
        this.adjustAlignment(-4);
      }
      if (this.town.townsfolk > 0 && rollRatio() < this.town.conscriptViolenceRatio - 0.02 * this.party.skills.conscript.level) {
        if (rollDie(2) == 1) {
          game.log('A townsperson dies in the violence.');
          this.town.townsfolk -= 1;
          this.adjustAlignment(-2);
        } else {
          game.log('A member of your party dies in the violence.');
          this.killPartyMembers(1);
        }
      }
    }
  }

  canSacrifice() {
    return this.party.skills.sacrifice.level > 0 && this.party.size > 0;
  }

  sacrifice() {
    if (this.canSacrifice()) {
      this.killPartyMembers(1);
      const r = rollRatio();
      if (r < 0.01 * this.party.skills.sacrifice.level) {
        game.log('You efficiently collect the blood from the sacrifice of one party member.');
        this.party.blood += 2;
      } else if (r < 0.70 + 0.05 * this.party.skills.sacrifice.level) {
        game.log('You collect the blood from the sacrifice of one party member.');
        this.party.blood += 1;
      } else {
        game.log('The blood from the sacrifice of one party member is spilled upon the ground.');
      }
    }
  }

  canAnimate() {
    return this.party.skills.animate.level > 0 && this.party.blood > 0;
  }

  animate() {
    if (this.canAnimate()) {
      this.party.blood -= 1;
      const r = rollRatio();
      if (r < 0.01 * this.party.skills.animate.level) {
        this.addPartyMembers(1);
        game.log('Two party member emerge from the pool of blood.');
      } else if (r < 0.65 + 0.7 * this.party.skills.animate.level) {
        this.addPartyMembers(1);
        game.log('A party member emerges from the pool of blood.');
      } else {
        game.log('A disfigured horror emerges from the pool of blood, but it dies soon after.');
      }
    }
  }

  useItem(name: ItemNameType) {
    if (this.party.items[name].quantity > 0) {
      this.party.items[name].quantity -= 1;
      this.party.items[name].use(this);
    }
  }

  adjustAlignment(amount: number) {
    if (amount < 0 && this.party.dealignmentProtection > 0) {
      if (-amount <= this.party.dealignmentProtection) {
        this.party.dealignmentProtection += amount;
        amount = 0;
      } else {
        amount -= this.party.dealignmentProtection;
        this.party.dealignmentProtection = 0;
      }
    }
    this.town.alignment = Math.max(-100, Math.min(100, this.town.alignment + amount));
  }

  adjustTownNeed(amount: number) {
    this.town.need = Math.max(0, Math.min(this.town.needMax, this.town.need + amount));
  }

  takeQuest() {
    if (this.town.need > 0 && this.party.quests < game.party.size) {
      this.town.need -= 1;
      this.party.quests += 1;
    }
  }

  fightBoss() {
    if (this.enemy == null && this.boss != null) {
      this.fightingBoss = true;
      this.enemy = this.boss;
      this.log('You pick a fight with ' + this.boss.name + '.');
    }
  }

  togglePause() {
    if (this.running || this.paused) {
      this.running = this.paused;
      this.paused = !this.paused;
    }
  }

  buyFood() {
    if (this.party.gold >= this.town.foodCostBuy[this.season] && this.town.foodStock > 0) {
      this.party.gold -= this.town.foodCostBuy[this.season];
      this.party.food += 1;
      this.town.foodStock -= 1;
    }
  }

  sellFood() {
    if (this.party.food > 0) {
      this.party.gold += this.town.foodCostSell[this.season];
      this.party.food -= 1;
      this.town.foodStock += 1;
    }
  }

  buyWater() {
    if (this.party.gold >= this.town.waterCostBuy[this.season] && this.town.waterStock > 0) {
      this.party.gold -= this.town.waterCostBuy[this.season];
      this.party.water += 1;
      this.town.waterStock -= 1;
    }
  }

  sellWater() {
    if (this.party.water > 0) {
      this.party.gold += this.town.waterCostSell[this.season];
      this.party.water -= 1;
      this.town.waterStock += 1;
    }
  }

  buyEquipment(equipmentType: 'weapon' | 'armor', name: EqFineCategory) {
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
    this.calculateEquipment();
  }

  sellEquipment(equipmentType: 'weapon' | 'armor', name: EqFineCategory) {
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
    this.calculateEquipment();
  }

  calculateEquipment() {
    const weaponSize = Math.ceil(this.party.size / 3);
    if (this.party.weaponConfig.physical < 0) {
      this.party.weapon.physical = -Math.min(this.party.inventoryWeapon.blunt, -this.party.weaponConfig.physical * weaponSize);
    } else {
      this.party.weapon.physical = Math.min(this.party.inventoryWeapon.slice, this.party.weaponConfig.physical * weaponSize);
    }
    if (this.party.weaponConfig.magical < 0) {
      this.party.weapon.magical = -Math.min(this.party.inventoryWeapon.dark, -this.party.weaponConfig.magical * weaponSize);
    } else {
      this.party.weapon.magical = Math.min(this.party.inventoryWeapon.light, this.party.weaponConfig.magical * weaponSize);
    }
    if (this.party.weaponConfig.elemental < 0) {
      this.party.weapon.elemental = -Math.min(this.party.inventoryWeapon.fire, -this.party.weaponConfig.elemental * weaponSize);
    } else {
      this.party.weapon.elemental = Math.min(this.party.inventoryWeapon.ice, this.party.weaponConfig.elemental * weaponSize);
    }
    const armorSize = Math.ceil(this.party.size / 3);
    if (this.party.armorConfig.physical < 0) {
      this.party.armor.physical = -Math.min(this.party.inventoryArmor.blunt, -this.party.armorConfig.physical * armorSize);
    } else {
      this.party.armor.physical = Math.min(this.party.inventoryArmor.slice, this.party.armorConfig.physical * armorSize);
    }
    if (this.party.armorConfig.magical < 0) {
      this.party.armor.magical = -Math.min(this.party.inventoryArmor.dark, -this.party.armorConfig.magical * armorSize);
    } else {
      this.party.armor.magical = Math.min(this.party.inventoryArmor.light, this.party.armorConfig.magical * armorSize);
    }
    if (this.party.armorConfig.elemental < 0) {
      this.party.armor.elemental = -Math.min(this.party.inventoryArmor.fire, -this.party.armorConfig.elemental * armorSize);
    } else {
      this.party.armor.elemental = Math.min(this.party.inventoryArmor.ice, this.party.armorConfig.elemental * armorSize);
    }
  }

  log(text: string) {
    this.textLog.push(text);
  }

  fight() {
    if (this.enemy != null && this.tick == 0) {
      if (this.tock % 5 == 0) {
        const event = this.pickEnemyEvent(this.enemy);
        if (event != null) {
          event.action(this);
        }
      }

      const damageToEnemy = game.party.status.hasPreventAttack() ? 0 : fightCalculateAttack(this.party, this.enemy);
      const damageToParty = fightCalculateAttack(this.enemy, this.party);
      this.log('Your party trades blows with ' + this.enemy.name + '. Your party takes ' + damageToParty + ' damage and ' + this.enemy.name + ' takes ' + damageToEnemy + ' damage.');
      this.party.damage += damageToParty;
      this.enemy.health = Math.max(0, this.enemy.health - damageToEnemy);
      if (this.enemy.health <= 0) {
        this.log('Your party kills ' + this.enemy.name + '!');
        this.enemy.win(this);
        this.enemy = null;
      } else {
        const willDie = Math.floor(this.party.damage / PARTY_MEMBER_HP);
        if (willDie > 0) {
          this.log(this.enemy.name + ' kills ' + willDie + ' party member' + (willDie == 1 ? '' : 's') + '.');
          this.party.size = Math.max(0, this.party.size - willDie);
          this.party.damage -= willDie * PARTY_MEMBER_HP;
        }
      }

      if (this.boss != null && this.boss.health == 0 && this.fightingBoss) {
        this.fightingBoss = false;
        this.winLevel();
      }
    }
  }

  round() {
    // TODO: It is possible that the party can die between the various types of events. There should
    // be more checks for a dead party during a game round.

    // ----------------------------------------------------
    // TIME KEEPING
    // ----------------------------------------------------
    this.tick += 1;
    clockUnwrap(this);
    this.playtime.tick += 1;
    clockUnwrap(this.playtime);

    this.calculateEquipment();

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

    // TODO: Gross, filter with side effects.
    this.timeouts = this.timeouts.filter((timeout) => {
      if (clockCompare(this, timeout.clock) >= 0) {
        timeout.callback();
        return false;
      }
      return true;
    });

    for (const status of STATUSES) {
      const s = this.party.status[status];
      if (s.active) {
        if (statusIsExpired(game, s)) {
          s.active = false;
        } else {
          doActions(s);
        }
      }
    }
    this.party.status.doTickActions(this);

    for (const skill of SKILLS) {
      const s = game.party.skills[skill];
      if (s.level > 0) {
        doActions(s);
      }
    }

    doActions(this.town.hooks);
    doActions(this.hooks);

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
    this.party.hunger -= this.town.foodSupport[this.season];
    if (this.party.hunger < 0) {
      this.party.hunger = 0;
    }
    this.party.thirst -= this.town.waterSupport[this.season];
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
      const phrase = '' + countDead + (countDead == 1 ? ' party member has' : ' party members have');
      game.log(phrase + ' died from lack of basic provisions.');
    }

    // ----------------------------------------------------
    // FIGHTING
    // ----------------------------------------------------
    let inBattle = false;

    if (this.enemy != null) {
      inBattle = true;
      this.fight();
    }

    if (this.party.status.bleeding.active) {
      this.party.damage += 1;
      const willDie = Math.floor(this.party.damage / PARTY_MEMBER_HP);
      if (willDie > 0) {
        this.log(willDie + ' party member' + (willDie == 1 ? '' : 's') + ' die' + (willDie == 1 ? 's' : '') + ' from Bleeding.');
        this.party.size = Math.max(0, this.party.size - willDie);
        this.party.damage -= willDie * PARTY_MEMBER_HP;
      }
    }

    let preventHeal = false;
    for (const status of this.party.status.other) {
      if (status.preventHeal) {
        preventHeal = true;
      }
      if (status.damagePerTick > 0 || status.damagePerTock > 0) {
        this.party.damage += status.damagePerTick;
        if (this.tick == 0) {
          this.party.damage += status.damagePerTock;
        }
        const willDie = Math.floor(this.party.damage / PARTY_MEMBER_HP);
        if (willDie > 0) {
          this.log(willDie + ' party member' + (willDie == 1 ? '' : 's') + ' die' + (willDie == 1 ? 's' : '') + ' from ' + status.name + '.');
          this.party.size = Math.max(0, this.party.size - willDie);
          this.party.damage -= willDie * PARTY_MEMBER_HP;
        }
      }
    }

    if (!inBattle) {
      if (this.tick == 0 && !this.fightingBoss && rollRatio() < this.town.enemyRatio) {
        const template = this.pickEnemy();
        if (template != null) {
          inBattle = true;
          this.enemy = template.roll(this);
          this.log('Your party encounters ' + this.enemy.name + ', ready to fight!');
        }
      }

      // Slowly heal party damage when out of battle.
      if (this.party.damage > 0) {
        // Prevent healing when poison is active.
        if (!this.party.status.poison.active && !this.party.status.bleeding.active && !preventHeal) {
          this.party.damage -= 1;
        }
      }
    }

    // ----------------------------------------------------
    // QUESTING
    // ----------------------------------------------------
    if (this.town.townsfolk > 0 && this.town.needRatio > 0 && this.town.need < this.town.needMax) {
      if (rollRatio() < this.town.needRatio) {
        this.town.need += 1;
      }
    }

    // Can't quest while fighting an enemy
    if (this.enemy == null && this.party.quests > 0) {
      const POINTS_PER_QUEST = 100;
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
        for (let i = 0; i < questsCompleted; ++i) {
          const quest = this.pickTownQuest();
          if (quest != null) {
            quest.action(this);
          }
        }
        this.party.quests -= questsCompleted;
        this.party.questsCompleted += questsCompleted;
        this.party.gold += questsCompleted * this.town.goldPerQuest;
        this.party.questPoints -= POINTS_PER_QUEST * questsCompleted;
        this.adjustAlignment(questsCompleted);
      }
    }

    // If you run out of quests, then any progress toward
    // quests is abandoned since there is nothing left
    // for the party to do.
    if (this.party.quests <= 0) {
      this.party.questPoints = 0;
    }

    // ----------------------------------------------------
    // GAME EVENTS
    // ----------------------------------------------------
    if (this.tick == 0 && this.tock == 0) {
      const event = this.pickGameEvent();
      if (event != null) {
        event.action(this);
      }
    }

    // ----------------------------------------------------
    // TOWN EVENTS
    // ----------------------------------------------------
    if (this.tick == 0 && this.tock % TOCKS_PER_SEMITERM == 0) {
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
    const events = this.town.events.filter((event) => {
      return event.predicate == null || event.predicate(this);
    });
    if (events.length == 0) {
      return null;
    }
    return rollChoiceWeighted(events);
  }

  pickGameEvent(): null | GameEvent {
    const events = this.events.filter((event) => {
      return event.predicate == null || event.predicate(this);
    });
    if (events.length == 0) {
      return null;
    }
    return rollChoiceWeighted(events);
  }

  pickTownQuest(): null | TownQuest {
    const quests = this.town.quests.filter((quest) => {
      return quest.predicate == null || quest.predicate(this);
    });
    if (quests.length == 0) {
      return null;
    }
    return rollChoiceWeighted(quests);
  }

  pickEnemy(): null | EnemyTemplate {
    const enemies = this.town.enemies.filter((enemy) => {
      return enemy.predicate == null || enemy.predicate(this);
    });
    if (enemies.length == 0) {
      return null;
    }
    return rollChoiceWeighted(enemies);
  }

  pickEnemyEvent(enemy: Enemy): null | EnemyEvent {
    const events = enemy.events.filter((event) => {
      return event.predicate == null || event.predicate(this);
    });
    if (events.length == 0) {
      return null;
    }
    return rollChoiceWeighted(events);
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
      if (weapon.physical < 0) {
        this.party.weapon.physical = -Math.min(this.party.inventoryWeapon.blunt, physicalUse);
      } else {
        this.party.weapon.physical = Math.min(this.party.inventoryWeapon.slice, physicalUse);
      }
      const magicalUse = Math.floor((Math.abs(weapon.magical) / weaponTotal) * weaponMax);
      if (weapon.magical < 0) {
        this.party.weapon.magical = -Math.min(this.party.inventoryWeapon.dark, magicalUse);
      } else {
        this.party.weapon.magical = Math.min(this.party.inventoryWeapon.light, magicalUse);
      }
      const elementalUse = Math.floor((Math.abs(weapon.elemental) / weaponTotal) * weaponMax);
      if (weapon.elemental < 0) {
        this.party.weapon.elemental = -Math.min(this.party.inventoryWeapon.fire, elementalUse);
      } else {
        this.party.weapon.elemental = Math.min(this.party.inventoryWeapon.ice, elementalUse);
      }
    }
    if (armorTotal == 0) {
      this.party.armor.physical = 0;
      this.party.armor.magical = 0;
      this.party.armor.elemental = 0;
    } else {
      const physicalUse = Math.floor((Math.abs(armor.physical) / armorTotal) * armorMax);
      if (armor.physical < 0) {
        this.party.armor.physical = -Math.min(this.party.inventoryArmor.blunt, physicalUse);
      } else {
        this.party.armor.physical = Math.min(this.party.inventoryArmor.slice, physicalUse);
      }
      const magicalUse = Math.floor((Math.abs(armor.magical) / armorTotal) * armorMax);
      if (armor.magical < 0) {
        this.party.armor.magical = -Math.min(this.party.inventoryArmor.dark, magicalUse);
      } else {
        this.party.armor.magical = Math.min(this.party.inventoryArmor.light, magicalUse);
      }
      const elementalUse = Math.floor((Math.abs(armor.elemental) / armorTotal) * armorMax);
      if (armor.elemental < 0) {
        this.party.armor.elemental = -Math.min(this.party.inventoryArmor.fire, elementalUse);
      } else {
        this.party.armor.elemental = Math.min(this.party.inventoryArmor.ice, elementalUse);
      }
    }
  }

  getSkillCost(skill: SkillIdentifier): number {
    return 50 * (this.party.skills[skill].level + 1) * this.party.skills[skill].costTier;
  }

  canBuySkill(skill: SkillIdentifier): boolean {
    const s = this.party.skills[skill];
    return this.party.gold >= this.getSkillCost(skill)
      && s.level < s.levelMax
      && this.party.questsCompleted >= s.unlockAtCompletedQuests;
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

  setTimeout(callback: () => void, clock: ClockInput) {
    this.timeouts.push({
      callback,
      clock: clockAdd(this, clockInput(clock)),
    });
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
