function cheatArms() {
  game.party.inventoryWeapon.blunt += 100;
  game.party.inventoryWeapon.slice += 100;
  game.party.inventoryWeapon.dark += 100;
  game.party.inventoryWeapon.light += 100;
  game.party.inventoryWeapon.fire += 100;
  game.party.inventoryWeapon.ice += 100;

  game.party.inventoryArmor.blunt += 100;
  game.party.inventoryArmor.slice += 100;
  game.party.inventoryArmor.dark += 100;
  game.party.inventoryArmor.light += 100;
  game.party.inventoryArmor.fire += 100;
  game.party.inventoryArmor.ice += 100;

  game.party.items.boostWeapon.quantity += 6;
  game.party.items.boostArmor.quantity += 6;
}

function cheatNextLevel() {
  game.nextLevel();
}
