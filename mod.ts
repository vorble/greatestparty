// For a given value, find the modifier from the table provided. The modifier
// table is an array of [threshold, modifier] pairs sorted such that the
// thresholds increase with position in the table.
type ModTableEntry = [number, number];
type ModTable = Array<ModTableEntry>;
function mod(value: number, table: ModTable): number {
  if (table.length == 0) {
    throw new Error('Invalid mod table.');
  }
  let result = table[0][1];
  for (let i = 1; i < table.length; ++i) {
    const [threshold, modifier] = table[i];
    if (value < threshold) {
      break;
    }
    result = modifier;
  }
  return result;
}

// Calculate a linear modifier. Modifier is calculated to be 0 when value
// is equal to that provided for zero. Every two points of value gives one
// point of modifier.
function modLinear(value: number, zero: number) {
  return Math.floor((value - zero) / 2);
}

// Linear modifier for stat ranges 0 to 20 with modifier 0 at stat value 10.
const MOD_LINEAR_10: ModTable = [
  [0, -5], [2, -4], [4, -3], [6, -2], [8, -1], [10, 0],
  [12, 1], [14, 2], [16, 3], [18, 4], [20, 5]
];
