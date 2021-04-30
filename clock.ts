const TICKS_PER_TOCK = 20;
const TOCKS_PER_TERM = 20;
const TERMS_PER_SEASON = 25;
const SEASONS_PER_YEAR = 4;

interface Clock {
  year: number;
  season: number;
  term: number;
  tock: number;
  tick: number;
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
