type ItemNameType_Potion = 'potionStrUp1' | 'potionDexUp1' | 'potionConUp1' | 'potionIntUp1' | 'potionWisUp1' | 'potionChaUp1';
const ITEM_NAMES_POTION: Array<ItemNameType_Potion> = ['potionStrUp1', 'potionDexUp1', 'potionConUp1', 'potionIntUp1', 'potionWisUp1', 'potionChaUp1'];

type ItemNameType = ItemNameType_Potion;
const ITEM_NAMES: Array<ItemNameType> = [...ITEM_NAMES_POTION];

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
  }
}
