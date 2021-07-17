type ItemNameType_StatBuff = 'potionStrUp1' | 'potionDexUp1' | 'potionConUp1' | 'potionIntUp1' | 'potionWisUp1' | 'potionChaUp1';
const ITEM_NAMES_STAT_BUFF: Array<ItemNameType_StatBuff> = ['potionStrUp1', 'potionDexUp1', 'potionConUp1', 'potionIntUp1', 'potionWisUp1', 'potionChaUp1'];

type ItemNameType_StatBoost = 'tomeStrUp' | 'tomeDexUp' | 'tomeConUp' | 'tomeIntUp' | 'tomeWisUp' | 'tomeChaUp';
const ITEM_NAMES_STAT_BOOST: Array<ItemNameType_StatBoost> = ['tomeStrUp', 'tomeDexUp', 'tomeConUp', 'tomeIntUp', 'tomeWisUp', 'tomeChaUp'];

type ItemNameType_Consumable = 'potionAntidote' | 'potionHealth' | 'clericRobes' | 'potionEnrage' | 'gobletBlood' | 'pocketAutomaton' | 'basicProvisions';
const ITEM_NAMES_CONSUMABLE: Array<ItemNameType_Consumable> = ['potionAntidote', 'potionHealth', 'clericRobes', 'potionEnrage', 'gobletBlood', 'pocketAutomaton', 'basicProvisions'];

type ItemNameType_EquipmentBoost = 'boostWeapon' | 'boostArmor';
const ITEM_NAMES_EQUIPMENT_BOOST: Array<ItemNameType_EquipmentBoost> = ['boostWeapon', 'boostArmor'];

type ItemNameType = ItemNameType_StatBuff | ItemNameType_StatBoost | ItemNameType_Consumable | ItemNameType_EquipmentBoost;
const ITEM_NAMES: Array<ItemNameType> = [...ITEM_NAMES_STAT_BUFF, ...ITEM_NAMES_STAT_BOOST, ...ITEM_NAMES_CONSUMABLE, ...ITEM_NAMES_EQUIPMENT_BOOST];

interface Item {
  name: string;
  quantity: number;

  use: (game: Game) => void;
}

class ItemInventory {
  potionStrUp1: Item;
  potionDexUp1: Item;
  potionConUp1: Item;
  potionIntUp1: Item;
  potionWisUp1: Item;
  potionChaUp1: Item;

  tomeStrUp: Item;
  tomeDexUp: Item;
  tomeConUp: Item;
  tomeIntUp: Item;
  tomeWisUp: Item;
  tomeChaUp: Item;

  potionAntidote: Item;
  potionHealth: Item;
  clericRobes: Item;
  potionEnrage: Item;
  gobletBlood: Item;
  pocketAutomaton: Item;
  basicProvisions: Item;

  boostWeapon: Item;
  boostArmor: Item;

  constructor() {
    const defaults = { quantity: 0 };
    this.potionStrUp1 = {
      ...defaults,
      name: 'Potion of STR',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'STR+',
          tock: 100,
          strmod: 1,
        });
      },
    };
    this.potionDexUp1 = {
      ...defaults,
      name: 'Potion of DEX',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'DEX+',
          tock: 100,
          dexmod: 1,
        });
      },
    };
    this.potionConUp1 = {
      ...defaults,
      name: 'Potion of CON',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'CON+',
          tock: 100,
          conmod: 1,
        });
      },
    };
    this.potionIntUp1 = {
      ...defaults,
      name: 'Potion of INT',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'INT+',
          tock: 100,
          intmod: 1,
        });
      },
    };
    this.potionWisUp1 = {
      ...defaults,
      name: 'Potion of WIS',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'WIS+',
          tock: 100,
          wismod: 1,
        });
      },
    };
    this.potionChaUp1 = {
      ...defaults,
      name: 'Potion of CHA',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'CHA+',
          tock: 100,
          chamod: 1,
        });
      },
    };
    this.tomeStrUp = {
      ...defaults,
      name: 'Tome of STR',
      use: (game: Game) => {
        game.party.strbase += 1;
        game.log('Your party\'s STR has increased!');
      },
    };
    this.tomeDexUp = {
      ...defaults,
      name: 'Tome of DEX',
      use: (game: Game) => {
        game.party.dexbase += 1;
        game.log('Your party\'s DEX has increased!');
      },
    };
    this.tomeConUp = {
      ...defaults,
      name: 'Tome of CON',
      use: (game: Game) => {
        game.party.conbase += 1;
        game.log('Your party\'s CON has increased!');
      },
    };
    this.tomeIntUp = {
      ...defaults,
      name: 'Tome of INT',
      use: (game: Game) => {
        game.party.intbase += 1;
        game.log('Your party\'s INT has increased!');
      },
    };
    this.tomeWisUp = {
      ...defaults,
      name: 'Tome of WIS',
      use: (game: Game) => {
        game.party.wisbase += 1;
        game.log('Your party\'s WIS has increased!');
      },
    };
    this.tomeChaUp = {
      ...defaults,
      name: 'Tome of CHA',
      use: (game: Game) => {
        game.party.chabase += 1;
        game.log('Your party\'s CHA has increased!');
      },
    };
    this.potionAntidote = {
      ...defaults,
      name: 'Antidote',
      use: (game: Game) => {
        game.party.status.poison.active = false;
      },
    };
    this.potionHealth = {
      ...defaults,
      name: 'Health Potion',
      use: (game: Game) => {
        game.party.damage -= 100;
      },
    };
    this.clericRobes = {
      ...defaults,
      name: 'Cleric Robes',
      use: (game: Game) => {
        game.party.dealignmentProtection += 50;
        game.log('Your party is temporarily protected from dealignment.');
      },
    };
    this.potionEnrage = {
      ...defaults,
      name: 'Enrage Potion',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'Enrage',
          enrage: true,
          tock: 2,
        });
      },
    };
    this.gobletBlood = {
      ...defaults,
      name: 'Goblet of Blood',
      use: (game: Game) => {
        const amount = rollRange(1, 3);
        game.party.blood += amount;
        game.log('Your party receives ' + amount + ' unit' + (amount == 1 ? '' : 's') + ' of blood.');
      },
    };
    this.pocketAutomaton = {
      ...defaults,
      name: 'Pocket Automaton',
      use: (game: Game) => {
        game.party.size += 1;
        game.log('The automaton springs to life. Your party grows.');
      },
    };
    this.basicProvisions = {
      ...defaults,
      name: 'Basic Provisions',
      use: (game: Game) => {
        const foodAmount = rollRange(3, 10);
        const waterAmount = rollRange(3, 10);
        game.party.food += foodAmount;
        game.party.water += waterAmount;
        game.log('Your party opens the provisions and receives ' + foodAmount + ' food and ' + waterAmount + ' water.');
      },
    };
    this.boostWeapon = {
      ...defaults,
      name: 'Boost Weapon',
      use: (game: Game) => {
        game.party.weaponPoints += 1;
        game.log('Your party may now allocate ' + game.party.weaponPoints + ' weapon points.');
      },
    };
    this.boostArmor = {
      ...defaults,
      name: 'Boost Armor',
      use: (game: Game) => {
        game.party.armorPoints += 1;
        game.log('Your party may now allocate ' + game.party.armorPoints + ' armor points.');
      },
    };
  }
}
