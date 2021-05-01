type Season = 'spring' | 'summer' | 'fall' | 'winter';
const SEASONS: Array<Season> = ['spring', 'summer', 'fall', 'winter'];
type SignName = 'Err' | 'Goh' | 'Yurn' | 'Joyn' | 'Ryna' | 'Sil';
const SIGNS: Array<SignName> = ['Err', 'Goh', 'Yurn', 'Joyn', 'Ryna', 'Sil'];

const TICKS_PER_TOCK = 20;
const TOCKS_PER_TERM = 20;
const TERMS_PER_SEASON = 25;
const SEASONS_PER_YEAR = SEASONS.length;

interface Clock {
  year: number;
  season: number;
  term: number;
  tock: number;
  tick: number;
}

function clockIsSpring(clock: Clock): boolean { return clock.season == 0; }
function clockIsSummer(clock: Clock): boolean { return clock.season == 1; }
function clockIsFall(clock: Clock): boolean { return clock.season == 2; }
function clockIsWinter(clock: Clock): boolean { return clock.season == 3; }
function clockIsSeason(clock: Clock, season: Season): boolean {
  return season == SEASONS[clock.season % SEASONS.length];
}
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

function unwrapClock(clock: Clock) {
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
}
