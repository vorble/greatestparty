function cheatItems() {
  for (const name of ITEM_NAMES) {
    game.party.items[name].quantity += 10;
  }
}

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

  game.party.items.boostWeapon.quantity = Math.max(game.party.items.boostWeapon.quantity, 6);
  game.party.items.boostArmor.quantity = Math.max(game.party.items.boostArmor.quantity, 6);
}

function cheatGold() {
  game.receiveGold(100000);
}

function cheatSupplies() {
  game.party.food += 1000;
  game.party.water += 1000;
}

function cheatStuff() {
  cheatItems();
  cheatArms();
  cheatGold();
  cheatSupplies();
}

function cheatParty() {
  game.party.size += 10;
}

function cheatSTR(value?: number) { game.party.strbase = value == null ? 18 : value; }
function cheatDEX(value?: number) { game.party.dexbase = value == null ? 18 : value; }
function cheatCON(value?: number) { game.party.conbase = value == null ? 18 : value; }
function cheatINT(value?: number) { game.party.intbase = value == null ? 18 : value; }
function cheatWIS(value?: number) { game.party.wisbase = value == null ? 18 : value; }
function cheatCHA(value?: number) { game.party.chabase = value == null ? 18 : value; }
function cheatStats(value?: number) {
  cheatSTR(value);
  cheatDEX(value);
  cheatCON(value);
  cheatINT(value);
  cheatWIS(value);
  cheatCHA(value);
}

function cheatNextLevel() {
  game.nextLevel();
  ui.show();
}

function cheatLevel2() {
  game.party.gold = 1500;
  game.party.size = 15;
  game.party.questsCompleted = 100;

  game.party.inventoryWeapon.blunt = 10;
  game.party.inventoryWeapon.slice = 10;
  game.party.inventoryWeapon.dark = 10;
  game.party.inventoryWeapon.light = 10;
  game.party.inventoryWeapon.fire = 10;
  game.party.inventoryWeapon.ice = 10;

  game.party.inventoryArmor.blunt = 10;
  game.party.inventoryArmor.slice = 10;
  game.party.inventoryArmor.dark = 10;
  game.party.inventoryArmor.light = 10;
  game.party.inventoryArmor.fire = 10;
  game.party.inventoryArmor.ice = 10;

  game.level = 1;
  game.nextLevel();
}
