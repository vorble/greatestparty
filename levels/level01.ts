game.registerLevel({
  level: 1,
  newTown: (game: Game) => {
    const town = new Town();
    const boss = new Boss();

    town.name = 'Palm Town';
    town.townsfolk = 100;
    town.foodStock = 100;
    town.foodSupport = 3;
    town.foodCostBuy = 10;
    town.foodCostSell = 7;
    town.waterStock = 100;
    town.waterSupport = 3;
    town.waterCostBuy = 12;
    town.waterCostSell = 9;
    for (const cat of EQ_FINE_CATEGORIES) {
      town.inventoryWeapon[cat] = 100;
      town.inventoryWeaponBuy[cat] = 5;
      town.inventoryWeaponSell[cat] = 3;
      town.inventoryArmor[cat] = 100;
      town.inventoryArmorBuy[cat] = 5;
      town.inventoryArmorSell[cat] = 3;
    }
    town.need = 5;
    town.boss = 500;
    town.events = [
      {
        name: 'Deep in Depression',
        weight: 1,
        action: (game: Game) => {
          const conRoll = rollDie(20);
          const chaRoll = rollDie(20);
          if (conRoll < 5 && chaRoll < 17) {
            game.log('A party member was suffering from a deep depression and has committed suicide.');
            game.killPartyMembers(1);
          } else {
            game.log('A party member is suffering from a deep depression.');
          }
        },
      },
    ];

    boss.name = 'Octopod';
    boss.str = 12;
    boss.dex = 10;
    boss.con = 9;
    boss.int = 7;
    boss.wis = 8;
    boss.cha = 5;
    boss.weapon.physical = -1; // 1 blunt damage
    boss.weapon.elemental = 1; // 1 ice damage
    boss.armor.physical = -1; // 1 blunt armor
    boss.armor.elemental = 1; // 1 ice armor

    boss.events = [
      {
        name: 'Staring Contest',
        weight: 1,
        predicate: (game: Game) => {
          return !game.boss.state.flag1 && !game.boss.state.flag2;
        },
        action: (game: Game) => {
          game.boss.state.flag1 = true;
          game.log('Octopod becomes still as it gazes over the party...');
        },
      },
      {
        name: 'Lose Staring Contest',
        weight: 1,
        predicate: (game: Game) => {
          return game.boss.state.flag1;
        },
        action: (game: Game) => {
          game.boss.state.flag1 = false;
          game.log('Octopod blinks!');
        },
      },
      {
        name: 'Win Staring Contest',
        weight: 1,
        predicate: (game: Game) => {
          return game.boss.state.flag1;
        },
        action: (game: Game) => {
          game.boss.state.flag1 = false;
          game.boss.state.flag2 = true;
          game.log('Octopod squirms with delight!');
        },
      },
      {
        name: 'Tentacle Swipe',
        weight: 1,
        predicate: (game: Game) => {
          return game.boss.state.flag2;
        },
        action: (game: Game) => {
          game.boss.state.flag2 = false;
          game.log('A member of your party disappears under Octopod\'s tentacle.');
          game.killPartyMember(1);
        },
      },
    ];

    return { town, boss };
  },
});
