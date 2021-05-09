interface Item {
  name: string;
  quantity: number;

  use: (game: Game) => void;
}

class ItemInventory {
  potionStrUp1: Item;

  constructor() {
    const defaults = { quantity: 0 };
    this.potionStrUp1 = {
      ...defaults,
      name: 'Potion of STR',
      use: (game: Game) => {
        game.party.status.addStatus(game, {
          name: 'Potion of STR',
          tock: 1,
          strmod: 1,
        });
      },
    };
  }
}
