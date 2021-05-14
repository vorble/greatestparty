interface EnemyEvent {
  name: string;
  weight: number;
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

class EnemyState {
  flags: Array<boolean>;
  numbers: Array<number>;
  strings: Array<string>;

  constructor() {
    this.flags = [];
    this.numbers = [];
    this.strings = [];
  }
}

class Enemy implements Fighter {
  health: number;
  name: string;
  state: EnemyState;
  events: Array<EnemyEvent>;

  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  weapon: Equipment;
  armor: Equipment;

  constructor() {
    this.health = 0;
    this.name = '';
    this.events = [];
    this.state = new EnemyState();

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

