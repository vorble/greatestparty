interface BossEvent {
  name: string;
  weight: number;
  // Optional predicate to disable event based on state of game.
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

class BossState {
  flags: Array<boolean>;
  numbers: Array<number>;
  strings: Array<string>;

  constructor() {
    this.flags = [];
    this.numbers = [];
    this.strings = [];
  }
}

class Boss implements Fighter {
  size: number;
  name: string;
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
    this.name = '';
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
