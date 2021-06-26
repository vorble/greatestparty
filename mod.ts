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

// Calculate a linear modifier. Modifier is calculated to be 0 when value
// is equal to that provided for zero. Every "step" points of value gives one
// point of modifier.
function modLinearStep(value: number, zero: number, step: number) {
  return Math.floor((value - zero) / step);
}
