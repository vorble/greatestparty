interface BossEvent {
  name: string;
  weight: number;
  // Optional predicate to disable event based on state of game.
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

class BossState {
  flag1: boolean;
  flag2: boolean;
  flags: Array<boolean>;
  number1: number;
  number2: number;
  numbers: Array<number>;
  string1: string;
  string2: string;
  strings: Array<string>;

  constructor() {
    this.flag1 = false;
    this.flag2 = false;
    this.flags = [];
    this.number1 = 0;
    this.number2 = 0;
    this.numbers = [];
    this.string1 = '';
    this.string2 = '';
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
