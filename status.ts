type StatusType = 'berzerk' | 'islandCurse' | 'angeredGods' | 'poison' | 'bleeding' | 'outOfTown';
const STATUSES: Array<StatusType> = ['berzerk', 'islandCurse', 'angeredGods', 'poison', 'bleeding', 'outOfTown'];

interface StatusItemCore extends ClockActions {
  active: boolean;
  year: number; // Expiry time.
  season: number;
  term: number;
  tock: number;
  tick: number;

  name: string;
}

interface StatusItem extends Clock {
  name: string;

  strmod: number;
  dexmod: number;
  conmod: number;
  intmod: number;
  wismod: number;
  chamod: number;

  preventAttack: boolean;
  preventHeal: boolean;
  damagePerTick: number;
  damagePerTock: number;
}

interface StatusItemInput extends ClockInput {
  name: string;

  strmod?: number;
  dexmod?: number;
  conmod?: number;
  intmod?: number;
  wismod?: number;
  chamod?: number;

  preventAttack?: boolean;
  preventHeal?: boolean;
  damagePerTick?: number;
  damagePerTock?: number;
}

function statusItemInput(status: StatusItemInput) {
  return {
    name: status.name,
    ...clockInput(status),
    strmod: status.strmod || 0,
    dexmod: status.dexmod || 0,
    conmod: status.conmod || 0,
    intmod: status.intmod || 0,
    wismod: status.wismod || 0,
    chamod: status.chamod || 0,
    preventAttack: status.preventAttack || false,
    preventHeal: status.preventHeal || false,
    damagePerTick: status.damagePerTick || 0,
    damagePerTock: status.damagePerTock || 0,
  };
}

function statusIsExpired(game: Game, status: StatusItemCore) {
  if (status.year == 0 && status.term == 0 && status.tock == 0 && status.tick == 0)
    return false;
  else if (game.year < status.year) return false;
  else if (game.year > status.year) return true;
  else if (game.season < status.season) return false;
  else if (game.season > status.season) return true;
  else if (game.term < status.term) return false;
  else if (game.term > status.term) return true;
  else if (game.tock < status.tock) return false;
  else if (game.tock > status.tock) return true;
  return game.tick >= status.tick;
}

function statusSetExpiry(game: Game, status: Clock, length: ClockInput) {
  const clock = clockAdd(game, clockInput(length))
  status.year = clock.year;
  status.season = clock.season;
  status.term = clock.term;
  status.tock = clock.tock;
  status.tick = clock.tick;
  clockUnwrap(status);
}

class Status {
  berzerk: StatusItemCore;
  islandCurse: StatusItemCore;
  angeredGods: StatusItemCore;
  poison: StatusItemCore;
  bleeding: StatusItemCore;
  outOfTown: StatusItemCore;

  other: Array<StatusItem>;

  constructor() {
    const defaults = { active: false, year: 0, season: 0, term: 0, tock: 0, tick: 0 };
    this.berzerk = {
      ...defaults,
      name: 'Berzerk',
      doTickActions: (game: Game) => {
        if (!game.fightingBoss) {
          game.log('Your party is berzerk and fights the boss, "I didn\'t hear a bell!"');
          game.fightBoss();
        }
      },
    };
    this.islandCurse = {
      ...defaults,
      name: 'Island Curse',
    };
    this.angeredGods = {
      ...defaults,
      name: 'Angered Gods',
    };
    this.poison = {
      ...defaults,
      name: 'Poison',
    };
    this.bleeding = {
      ...defaults,
      name: 'Bleeding',
    };
    this.outOfTown = {
      ...defaults,
      name: 'Out of Town',
    };
    this.other = [];
  }

  doTickActions(game: Game) {
    const nextOther = [];
    for (const status of this.other) {
      if (clockCompare(game, status) >= 0) {
        this._unapplyStatus(game, status);
      } else {
        nextOther.push(status);
      }
    }
    this.other = nextOther;
  }

  hasPreventAttack() {
    for (const status of this.other) {
      if (status.preventAttack) {
        return true;
      }
    }
    return false;
  }

  addStatus(game: Game, status: StatusItemInput) {
    const s = statusItemInput(status);
    statusSetExpiry(game, s, status);
    this.other.push(s);
    this._applyStatus(game, s);
  }

  _applyStatus(game: Game, status: StatusItem) {
    game.party.strmod += status.strmod;
    game.party.dexmod += status.dexmod;
    game.party.conmod += status.conmod;
    game.party.intmod += status.intmod;
    game.party.wismod += status.wismod;
    game.party.chamod += status.chamod;
  }

  _unapplyStatus(game: Game, status: StatusItem) {
    game.party.strmod -= status.strmod;
    game.party.dexmod -= status.dexmod;
    game.party.conmod -= status.conmod;
    game.party.intmod -= status.intmod;
    game.party.wismod -= status.wismod;
    game.party.chamod -= status.chamod;
  }
}
