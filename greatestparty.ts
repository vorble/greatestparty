class Party {
  size: number;
  gold: number;

  constructor() {
    this.size = 0;
    this.gold = 0;
  }

  newGame() {
    this.size = 4;
    this.gold = 10;
  }
}
