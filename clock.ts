enum Season {
  Spring,
  Summer,
  Fall,
  Winter,
}
// Keep non-numeric keys as a lookup table of Season names.
const SEASONS: Array<string> = Object.keys(Season).filter(x => !/^\d+$/.test(x));

enum Sign {
  Err,
  Goh,
  Yurn,
  Joyn,
  Ryna,
  Sil,
}
// Keep non-numeric keys as a lookup table of Sign names.
const SIGNS: Array<string> = Object.keys(Sign).filter(x => !/^\d+$/.test(x));
const SIGNS_COUNT = SIGNS.length;

const TICKS_PER_TOCK = 20;
const TOCKS_PER_TERM = 20;
const TERMS_PER_SEASON = 25;
const SEASONS_PER_YEAR = SEASONS.length;
// The SEMITERM isn't part of the normal clock, it's a distinguishable period of
// time between a TOCK and a TERM.
const TOCKS_PER_SEMITERM = 5;
if (TOCKS_PER_TERM % TOCKS_PER_SEMITERM != 0) {
  throw new Error('TOCKS_PER_TERM must be a multiple of ' + TOCKS_PER_SEMITERM + '!');
}

interface Clock {
  year: number;
  season: number;
  term: number;
  tock: number;
  tick: number;
}

interface ClockInput {
  year?: number;
  season?: number;
  term?: number;
  tock?: number;
  tick?: number;
}

function clockInput(clock: ClockInput): Clock {
  return clockUnwrap({
    year: clock.year == null ? 0 : clock.year,
    season: clock.season == null ? 0 : clock.season,
    term: clock.term == null ? 0 : clock.term,
    tock: clock.tock == null ? 0 : clock.tock,
    tick: clock.tick == null ? 0 : clock.tick,
  });
}

function clockAdd(a: Clock, b: Clock): Clock {
  return clockUnwrap({
    year: a.year + b.year,
    season: a.season + b.season,
    term: a.term + b.term,
    tock: a.tock + b.tock,
    tick: a.tick + b.tick,
  });
}

function clockCompare(a: Clock, b: Clock): -1 | 0 | 1 {
  if (a.year < b.year) return -1;
  else if (a.year > b.year) return 1;
  else if (a.season < b.season) return -1;
  else if (a.season > b.season) return 1;
  else if (a.term < b.term) return -1;
  else if (a.term > b.term) return 1;
  else if (a.tock < b.tock) return -1;
  else if (a.tock > b.tock) return 1;
  else if (a.tick < b.tick) return -1
  else if (a.tick > b.tick) return 1;
  return 0;
}

function clockIsSeason(clock: Clock, season: Season): boolean {
  return clock.season == season;
}

function clockIsSpring(clock: Clock): boolean {
  return clock.season == Season.Spring;
}

function clockIsSummer(clock: Clock): boolean {
  return clock.season == Season.Summer;
}

function clockIsFall(clock: Clock): boolean {
  return clock.season == Season.Fall;
}

function clockIsWinter(clock: Clock): boolean {
  return clock.season == Season.Winter;
}

function clockToSign(clock: Clock): Sign {
  return clock.year % SIGNS_COUNT;
}

function clockIsSign(clock: Clock, sign: Sign): boolean {
  return sign == clockToSign(clock);
}

interface ClockActions {
  doTickActions?: (game: Game) => void;
  doTockActions?: (game: Game) => void;
  doTermActions?: (game: Game) => void;
  doSeasonActions?: (game: Game) => void;
  doYearActions?: (game: Game) => void;
}

function clockUnwrap(clock: Clock): Clock {
  while (clock.tick >= TICKS_PER_TOCK) {
    clock.tick -= TICKS_PER_TOCK;
    clock.tock += 1;
  }
  while (clock.tock >= TOCKS_PER_TERM) {
    clock.tock -= TOCKS_PER_TERM;
    clock.term += 1;
  }
  while (clock.term >= TERMS_PER_SEASON) {
    clock.term -= TERMS_PER_SEASON;
    clock.season += 1;
  }
  while (clock.season >= SEASONS_PER_YEAR) {
    clock.season -= SEASONS_PER_YEAR;
    clock.year += 1;
  }
  return clock;
}
