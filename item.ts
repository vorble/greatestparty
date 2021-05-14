type ItemNameType_Potion = 'potionStrUp1' | 'potionDexUp1' | 'potionConUp1' | 'potionIntUp1' | 'potionWisUp1' | 'potionChaUp1';
const ITEM_NAMES_POTION: Array<ItemNameType_Potion> = ['potionStrUp1', 'potionDexUp1', 'potionConUp1', 'potionIntUp1', 'potionWisUp1', 'potionChaUp1'];

type ItemNameType_Consumable = 'clericRobes';
const ITEM_NAMES_CONSUMABLE: Array<ItemNameType_Consumable> = ['clericRobes'];

type ItemNameType_Boost = 'boostWeapon' | 'boostArmor' | 'tomeOfKnowledge';
const ITEM_NAMES_BOOST: Array<ItemNameType_Boost> = ['boostWeapon', 'boostArmor', 'tomeOfKnowledge'];

type ItemNameType = ItemNameType_Potion | ItemNameType_Consumable | ItemNameType_Boost;
const ITEM_NAMES: Array<ItemNameType> = [...ITEM_NAMES_POTION, ...ITEM_NAMES_CONSUMABLE, ...ITEM_NAMES_BOOST];

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
  clericRobes: Item;

  boostWeapon: Item;
  boostArmor: Item;
  tomeOfKnowledge: Item;

  constructor() {
    const defaults = { quantity: 0 };
    this.potionStrUp1 = {
      ...defaults,
      name: 'Potion of STR',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: '+STR',
          tock: 10,
          strmod: 1,
        });
      },
    };
    this.potionDexUp1 = {
      ...defaults,
      name: 'Potion of DEX',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: '+DEX',
          tock: 10,
          dexmod: 1,
        });
      },
    };
    this.potionConUp1 = {
      ...defaults,
      name: 'Potion of CON',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: '+CON',
          tock: 10,
          conmod: 1,
        });
      },
    };
    this.potionIntUp1 = {
      ...defaults,
      name: 'Potion of INT',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: '+INT',
          tock: 10,
          intmod: 1,
        });
      },
    };
    this.potionWisUp1 = {
      ...defaults,
      name: 'Potion of WIS',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: '+WIS',
          tock: 10,
          wismod: 1,
        });
      },
    };
    this.potionChaUp1 = {
      ...defaults,
      name: 'Potion of CHA',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: '+CHA',
          tock: 10,
          chamod: 1,
        });
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
    this.tomeOfKnowledge = {
      ...defaults,
      name: 'Tome of Knowledge',
      use: (game: Game) => {
        game.party.intmod += 1; // TODO: Modify the modifier or base?
        game.log('Your party\'s intelligence has increased.');
      },
    };
  }
}