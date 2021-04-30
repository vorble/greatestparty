type PartyStatusType = 'berzerk' | 'islandCurse';
const STATUSES: Array<PartyStatusType> = ['berzerk', 'islandCurse'];

interface PartyStatusItem extends ClockActions {
  active: boolean;
  year: number; // Expiry time.
  season: number;
  term: number;
  tock: number;
  tick: number;

  name: string;
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

function setStatusExpiry(game: Game, status: PartyStatusItem, length: {
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
  }
}
