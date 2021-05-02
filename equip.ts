type EqFineCategory = 'blunt' | 'slice' | 'dark' | 'light' | 'fire' | 'ice';
const EQ_FINE_CATEGORIES: Array<EqFineCategory> = ['blunt', 'slice', 'dark', 'light', 'fire', 'ice'];
type EqBroadCategory = 'physical' | 'magical' | 'elemental';
const EQ_BROAD_CATEGORIES: Array<EqBroadCategory> = ['physical', 'magical', 'elemental'];

class Inventory {
  blunt: number;
  slice: number;
  dark: number;
  light: number;
  fire: number;
  ice: number;

  constructor() {
    this.blunt = 0;
    this.slice = 0;
    this.dark = 0;
    this.light = 0;
    this.fire = 0;
    this.ice = 0;
  }
}

class Equipment {
  physical: number; // < 0 for blunt, > 0 for slice
  magical: number; // < 0 for dark, > 0 for light
  elemental: number; // < 0 for fire, > 0 for ice

  constructor() {
    this.physical = 0;
    this.magical = 0;
    this.elemental = 0;
  }
}
