interface Fighter {
  health: number;

  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  weapon: Equipment;
  armor: Equipment;
}

function fightCalculatePhysicalDamage(attacker: Fighter, defender: Fighter): number {
  // Raw attack is determined by attacker's physical weapon level and is increased by 1% for each
  // point of str and dex.
  const atkabs = Math.round(
    Math.abs(attacker.weapon.physical) * (1.0 + (attacker.str + attacker.dex) * 0.01)
  );
  // Raw defense is determined by defender's physical armor level and is increased by 0.8% for each
  // point of str, dex, and con.
  const defabs = Math.round(
    Math.abs(defender.armor.physical) * (1.0 + (defender.str + defender.dex + defender.con) * 0.008)
  );
  // If the defender has more defense than the attacker, then damage is mitigated.
  const mitigation = defabs > atkabs ? defabs - atkabs : 0;
  // Mitigate the raw attack, but ensure it never goes below 0.
  let damage = atkabs > mitigation ? atkabs - mitigation : 0;
  // Finally, if the defender's armor is in alignment with the attacker's weapon (blunt weapon
  // vs blunt armor or slice weapon vs slice armor), then damage is reduced by 35%.
  if ((attacker.weapon.physical > 0 && defender.armor.physical > 0)
    || (attacker.weapon.physical < 0 && defender.armor.physical < 0)) {
    damage = Math.round(damage * (1.0 - 0.35));
  }
  return damage;
}

function fightCalculateMagicalDamage(attacker: Fighter, defender: Fighter): number {
  let atkabs = Math.round(
    Math.abs(attacker.weapon.magical) * (1.0 + (attacker.int + attacker.wis) * 0.01)
  );
  if ((attacker.weapon.magical > 0 && defender.armor.magical > 0)
      || (attacker.weapon.magical < 0 && defender.armor.magical < 0)) {
    atkabs = 0;
  } else if ((attacker.weapon.magical > 0 && defender.armor.magical < 0)
      || (attacker.weapon.magical < 0 && defender.armor.magical > 0)) {
    atkabs *= 2;
  }
  const defabs = Math.round(
    Math.abs(defender.armor.magical) * (1.0 + (defender.int + defender.wis + defender.con) * 0.008)
  );
  const mitigation = defabs > atkabs ? defabs - atkabs : 0;
  const damage = atkabs > mitigation ? atkabs - mitigation : 0;
  return damage;
}

function fightCalculateElementalDamage(attacker: Fighter, defender: Fighter): number {
  let atkabs = Math.round(
    Math.abs(attacker.weapon.elemental) * (1.0 + (attacker.con) * 0.02)
  );
  const defabs = Math.round(
    Math.abs(defender.armor.elemental) * (1.0 + (defender.con) * 0.02)
  );
  const mitigation = defabs > atkabs ? defabs - atkabs : 0;
  let damage = atkabs > mitigation ? atkabs - mitigation : 0;
  if ((attacker.weapon.elemental > 0 && defender.armor.elemental > 0)
      || (attacker.weapon.elemental < 0 && defender.armor.elemental < 0)) {
    damage = 0;
  } else if ((attacker.weapon.elemental > 0 && defender.armor.elemental < 0)
      || (attacker.weapon.elemental < 0 && defender.armor.elemental > 0)) {
    damage = Math.round(damage * 1.5);
  }
  return damage;
}

function fightCalculateAttack(attacker: Fighter, defender: Fighter): number {
  return fightCalculatePhysicalDamage(attacker, defender)
    + fightCalculateMagicalDamage(attacker, defender)
    + fightCalculateElementalDamage(attacker, defender);
}
