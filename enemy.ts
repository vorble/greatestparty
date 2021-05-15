interface EnemyEvent {
  name: string;
  weight: number;
  predicate?: (game: Game) => boolean;
  action: (game: Game) => void;
}

interface Enemy extends Fighter {
  name: string;
  state: unknown;
  events: Array<EnemyEvent>;
  win: (game: Game) => void;
}

interface EnemyTemplate {
  weight: number;
  predicate?: (game: Game) => boolean;
  roll: (game: Game) => Enemy;
}
