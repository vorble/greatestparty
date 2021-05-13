enum Season {
  Spring = 'spring',
  Summer = 'summer',
  Fall = 'fall',
  Winter = 'winter',
}

type SignName = 'Err' | 'Goh' | 'Yurn' | 'Joyn' | 'Ryna' | 'Sil';
const SIGNS: Array<SignName> = ['Err', 'Goh', 'Yurn', 'Joyn', 'Ryna', 'Sil'];

const TICKS_PER_TOCK = 20;
const TOCKS_PER_TERM = 20;
const TERMS_PER_SEASON = 25;
const SEASONS_PER_YEAR = Object.keys(Season).length;

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
  return unwrapClock({
    year: clock.year == null ? 0 : clock.year,
    season: clock.season == null ? 0 : clock.season,
    term: clock.term == null ? 0 : clock.term,
    tock: clock.tock == null ? 0 : clock.tock,
    tick: clock.tick == null ? 0 : clock.tick,
  });
}

function clockAdd(a: Clock, b: Clock) {
  return unwrapClock({
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

function clockIsSpring(clock: Clock): boolean { return clock.season == 0; }
function clockIsSummer(clock: Clock): boolean { return clock.season == 1; }
function clockIsFall(clock: Clock): boolean { return clock.season == 2; }
function clockIsWinter(clock: Clock): boolean { return clock.season == 3; }
function clockToSign(clock: Clock) {
  return clock.year % SIGNS.length;
}
function clockIsSign(clock: Clock, sign: SignName) {
  return sign == SIGNS[clockToSign(clock)];
}

interface ClockActions {
  doTickActions?: (game: Game) => void;
  doTockActions?: (game: Game) => void;
  doTermActions?: (game: Game) => void;
  doSeasonActions?: (game: Game) => void;
  doYearActions?: (game: Game) => void;
}

function unwrapClock(clock: Clock): Clock {
  while (clock.tick >= TICKS_PER_TOCK) {
    clock.tick -= TICKS_PER_TOCK;
    clock.tock += 1;
    while (clock.tock >= TOCKS_PER_TERM) {
      clock.tock -= TOCKS_PER_TERM;
      clock.term += 1;
      while (clock.term >= TERMS_PER_SEASON) {
        clock.term -= TERMS_PER_SEASON;
        clock.season += 1;
        while (clock.season >= SEASONS_PER_YEAR) {
          clock.season -= SEASONS_PER_YEAR;
          clock.year += 1
        }
      }
    }
  }
  return clock;
}
