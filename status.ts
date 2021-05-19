type PartyStatusType = 'berzerk' | 'islandCurse' | 'angeredGods' | 'poison' | 'bleeding' | 'outOfTown';
const STATUSES: Array<PartyStatusType> = ['berzerk', 'islandCurse', 'angeredGods', 'poison', 'bleeding', 'outOfTown'];

interface PartyStatusItem extends ClockActions {
  active: boolean;
  year: number; // Expiry time.
  season: number;
  term: number;
  tock: number;
  tick: number;

  name: string;
}

interface PartyStatusItem2 extends Clock {
  name: string;

  strmod: number;
  dexmod: number;
  conmod: number;
  intmod: number;
  wismod: number;
  chamod: number;
}

interface PartyStatusItem2Template extends ClockInput {
  name: string;

  strmod?: number;
  dexmod?: number;
  conmod?: number;
  intmod?: number;
  wismod?: number;
  chamod?: number;
}

function partyStatusItem2TemplateExpand(status: PartyStatusItem2Template) {
  return {
    name: status.name,
    ...clockInput(status),
    strmod: status.strmod || 0,
    dexmod: status.dexmod || 0,
    conmod: status.conmod || 0,
    intmod: status.intmod || 0,
    wismod: status.wismod || 0,
    chamod: status.chamod || 0,
  };
}

function isStatusExpired(game: Game, status: PartyStatusItem) {
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

function setStatusExpiry(game: Game, status: Clock, length: {
    tick?: number, tock?: number, term?: number, season?: number, year?: number }) {
  status.year = game.year;
  status.season = game.season;
  status.term = game.term;
  status.tock = game.tock;
  status.tick = game.tick;
  if (length.year != null) {
    status.year += length.year;
  }
  if (length.season != null) {
    status.season += length.season;
  }
  if (length.term != null) {
    status.term += length.term;
  }
  if (length.tock != null) {
    status.tock += length.tock;
  }
  if (length.tick != null) {
    status.tick += length.tick;
  }
  unwrapClock(status);
}

class Status {
  berzerk: PartyStatusItem;
  islandCurse: PartyStatusItem;
  angeredGods: PartyStatusItem;
  poison: PartyStatusItem;
  bleeding: PartyStatusItem;
  outOfTown: PartyStatusItem;

  other: Array<PartyStatusItem2>;

  constructor() {
    const defaults = { active: false, year: 0, season: 0, term: 0, tock: 0, tick: 0 };
    this.berzerk = {
      ...defaults,
      name: 'Berzerk',
      doTickActions: (game: Game) => {
        if (!game.fightingBoss) {
          if (FLAGS.DEBUG.STATUS.BERZERK) {
            game.log('Berzerk: I didn\'t hear a bell! You fight the boss.');
          }
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
    // TODO: Should out of town prevent all buy/sell activity instead of just hire?
    this.outOfTown = {
      ...defaults,
      name: 'Out of Town',
    };
    this.other = [];
  }

  doTickActions(game: Game) {
    // TODO: Gross, filter with side effects!
    this.other = this.other.filter((status: PartyStatusItem2) => {
      if (clockCompare(status, game) < 0) {
        this._unapplyStatus(game, status);
        return false;
      }
      return true;
    });
  }

  // TODO: Kindof ugly to have the Game object come in this way since statuses were previously game-agnostic. Will have to see how it does in practice.
  addStatus(game: Game, status: PartyStatusItem2Template) {
    const s = partyStatusItem2TemplateExpand(status);
    setStatusExpiry(game, s, status);
    this.other.push(s);
    this._applyStatus(game, s);
  }

  // TODO: Maybe this belongs as a top level function to be nearer to the PartyStatusItem2 definition?
  _applyStatus(game: Game, status: PartyStatusItem2) {
    game.party.strmod += status.strmod;
    game.party.dexmod += status.dexmod;
    game.party.conmod += status.conmod;
    game.party.intmod += status.intmod;
    game.party.wismod += status.wismod;
    game.party.chamod += status.chamod;
  }

  // TODO: Maybe this belongs as a top level function to be nearer to the PartyStatusItem2 definition?
  _unapplyStatus(game: Game, status: PartyStatusItem2) {
    game.party.strmod -= status.strmod;
    game.party.dexmod -= status.dexmod;
    game.party.conmod -= status.conmod;
    game.party.intmod -= status.intmod;
    game.party.wismod -= status.wismod;
    game.party.chamod -= status.chamod;
  }
}
