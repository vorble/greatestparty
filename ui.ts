function getElementById(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error('Element ' + id + ' not found.');
  }
  return element;
}

function getElementByIdAsType<T extends HTMLElement>(id: string, clazz: { new(): T }): T {
  const element = getElementById(id);
  if (!(element instanceof clazz)) {
    throw new Error('Element ' + id + ' is not a ' + clazz.prototype.constructor.name + '.');
  }
  return element;
}

class UIParty {
  game: Game;
  date: HTMLElement;
  size: HTMLElement;
  quests: HTMLElement;
  gold: HTMLElement;
  food: HTMLElement;
  water: HTMLElement;

  constructor() {
    this.game = game;
    this.date = getElementById('panel-party-date-value');
    this.size = getElementById('panel-party-size-value');
    this.quests = getElementById('panel-party-quests-value');
    this.gold = getElementById('panel-party-gold-value');
    this.food = getElementById('panel-party-food-value');
    this.water = getElementById('panel-party-water-value');
  }

  show() {
    const game = this.game;

    {
      let text = '';
      switch (game.season) {
        case 0: text = 'Spring'; break;
        case 1: text = 'Summer'; break;
        case 2: text = 'Winter'; break;
        case 3: text = 'Fall'; break;
        default:
          throw new Error('Game season is out of bounds.');
      }
      text += ' ' + game.year;
      if (DEBUG.SHOW_TICKS) {
        text += ` (${ game.tick })`;
      }
      this.date.innerText = text;
    }

    this.size.innerText = '' + game.party.size;
    this.quests.innerText = '' + game.party.quests;
    this.gold.innerText = '' + game.party.gold;
    this.food.innerText = '' + game.party.food;
    this.water.innerText = '' + game.party.water;
    if (DEBUG.SHOW_HUNGER_THIRST) {
      this.food.innerText += ' (' + game.party.hunger + ')';
      this.water.innerText += ' (' + game.party.thirst + ')';
    }
  }
}

class UITown {
  game: Game;
  townsfolk: HTMLElement;
  need: HTMLElement;
  boss: HTMLElement;

  takeQuest: HTMLButtonElement;
  fightBoss: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;
    this.townsfolk = getElementById('panel-town-townsfolk-value');
    this.need = getElementById('panel-town-need-value');
    this.boss = getElementById('panel-town-boss-value');

    this.takeQuest = getElementByIdAsType('panel-town-take-quest-button', HTMLButtonElement);
    this.takeQuest.onclick = (e) => {
      game.takeQuest();
    };
    this.fightBoss = getElementByIdAsType('panel-town-fight-boss-button', HTMLButtonElement);
    this.fightBoss.onclick = (e) => {
      game.fightBoss();
    };
  }

  show() {
    const game = this.game;

    this.townsfolk.innerText = '' + game.town.townsfolk;
    this.need.innerText = '' + game.town.need;
    this.boss.innerText = '' + game.town.boss;

    this.takeQuest.disabled = game.town.need <= 0;
    // TODO: Block out fight button if already fighting the boss.
  }
}

class UI {
  party: UIParty;
  town: UITown;

  constructor(game: Game) {
    this.party = new UIParty();
    this.town = new UITown(game);
  }

  show() {
    this.party.show();
    this.town.show();
  }
}

let ui: UI;

function initUI(game: Game) {
  ui = new UI(game);
}
