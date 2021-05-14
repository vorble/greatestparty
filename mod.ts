// For a given value, find the modifier from the table provided. The modifier
// table is an array of [threshold, modifier] pairs sorted such that the
// thresholds increase with position in the table. Example:
//   mod( 0, [[0, 0], [1, 2], [2, -3]]) == 0
//   mod( 1, [[0, 0], [1, 2], [2, -3]]) == 2
//   mod( 2, [[0, 0], [1, 2], [2, -3]]) == -3
//   mod( 3, [[0, 0], [1, 2], [2, -3]]) == -3
type ModTableEntry = [number, number];
type ModTable = Array<ModTableEntry>;
function mod(value: number, table: ModTable): number {
  if (table.length == 0) {
    throw new Error('Invalid mod table.');
  }
  let mod = table[0][1];
  for (let i = 1; i < table.length; ++i) {
    const [threshold, modifier] = table[i];
    if (value >= threshold) {
      mod = modifier;
    } else {
      break;
    }
  }
  return mod;
}
