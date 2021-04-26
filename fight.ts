function fightCalculateAttack(attacker: PartyMember, defender: PartyMember): number {
  let damagePhysical = Math.abs(attacker.weapon.physical);
  let damageMagical = Math.abs(attacker.weapon.magical);
  let damageElemental = Math.abs(attacker.weapon.elemental);

  // When the defender's physical armor matches the type of damage from the attacker's weapon,
  // then the armor offsets the physical damage.
  if ((attacker.weapon.physical < 0) == (defender.armor.physical < 0)) {
    damagePhysical = Math.max(0, damagePhysical - Math.abs(defender.armor.physical));
  // Unmatched physical armor reduces the damage by 25%.
  } else {
    damagePhysical = Math.max(0, damagePhysical - Math.floor(Math.abs(defender.armor.physical) * 0.75));
  }

  // Magical aligment being the same between the attacker and defender produces zero damage.
  if ((attacker.weapon.magical < 0 && defender.armor.magical < 0)
      || (attacker.weapon.magical > 0 && defender.armor.magical > 0)) {
    damageMagical = 0;
  // Magical disalignment produces double damage, but the magical armor mitigates
  // one-to-one damage points.
  } else {
    damageMagical *= 2;
    damageMagical = Math.max(0, damageMagical - Math.abs(defender.armor.magical));
  }

  // Elemental alignment offsets damage at double the defender's armor.
  if ((attacker.weapon.elemental < 0) == (defender.armor.elemental < 0)) {
    damageElemental = Math.max(0, damageElemental - Math.abs(defender.armor.elemental) * 2);
  // Elemental disalignment offsets damage points one-to-one, but doubles the resulting damage.
  } else {
    damageElemental = Math.max(0, damageElemental - Math.abs(defender.armor.elemental));
    damageElemental *= 2;
  }

  return damagePhysical + damageMagical + damageElemental;
}
