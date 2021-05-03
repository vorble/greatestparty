game.registerLevel({
  level: 1,
  newTown: (game: Game) => {
    const town = new Town();
    const boss = new Boss();

    town.name = 'Magma Town';
    town.townsfolk = 200;
    town.foodStock = 150;
    town.foodSupport = 3;
    town.foodCostBuy = 3;
    town.foodCostSell = 2;
    town.waterStock = 150;
    town.waterSupport = 3;
    town.waterCostBuy = 3;
    town.waterCostSell = 2;
    for (const cat of EQ_FINE_CATEGORIES) {
      town.inventoryWeapon[cat] = 100;
      town.inventoryWeaponBuy[cat] = 5;
      town.inventoryWeaponSell[cat] = 3;
      town.inventoryArmor[cat] = 100;
      town.inventoryArmorBuy[cat] = 5;
      town.inventoryArmorSell[cat] = 3;
    }
    town.need = 45;
    town.needMax = 45;
    town.needRatio = 0.010;
    town.boss = 3000;
    town.bossReward = 300;

    // Town State:

    function maybeAngerGods(game: Game) {
      if (!game.party.status.angeredGods.active) {
        // Being charasmatic helps you avoid making a faux pas at a local ceremony. 
        const r = rollDie(20) + calcmod(game.party.cha, [[0, -1], [5, 0], [14, 1]]);
        if (r <= 2) {
          game.party.status.angeredGods.active = true;
          setStatusExpiry(game, game.party.status.angeredGods, { term: 75 });
          game.log('A party member commits a faux pas at a ceremony with some townsfolk.');
        } else if (r <= 4) {
          if (game.party.wis >= 14) {
            game.log('A party member is invited to a ceremony by some townsfolk, but declines.');
          } else {
            game.log('A party member goes to a ceremony with some townsfolk and has a good time.');
          }
        }
      }
    }

    function loot(game: Game) {
      if (rollRatio() <= 0.4) {
        const typ = rollChoice(['weapon', 'armor']);
        const fine = rollChoice(EQ_FINE_CATEGORIES);
        const inv = typ == 'weapon' ? game.party.inventoryWeapon : game.party.inventoryArmor;
        inv[fine] += 1;
        game.log('You loot 1 ' + fine + ' ' + typ + '.');
      }
    }

    town.events = [
      {
        name: 'Angered Gods',
        weight: 10,
        predicate: (game: Game) => {
          return game.party.status.angeredGods.active;
        },
        action: (game: Game) => {
          const r = rollDie(20);
          if (r <= 2) {
            game.log('The volcano rumbles in the distance, and spews out magma. One party member is hit by a lava bomb and dies');
            game.killPartyMembers(1);
          } else {
            game.log('The volcano rumbles in the distance.');
          }
          loot(game);
        },
      },
      {
        name: 'Digging lava irrigation',
        weight: 1,
        action: (game: Game) => {
          const wis = rollDie(20) + calcmod(game.party.wis, [[0, -1], [6, 0],[12, +1]]); // Wisdom tells you not to stand in the way of pyroclastic flow
          const dex = rollDie(20) + calcmod(game.party.dex, [[0, -1], [6, 0],[12, +1],[16, +2]]); // Dexterity helps you get out of the way when you do stand in the way of pyroclastic flow
          if ( wis <= 7) {
            if ( dex <= 12 ) {
              game.log('Some members of your party dig an irrigation ditch to divert some of the lava flow away from the town. One party member is overcome by pyroclastic flow and dies.'); 
              game.killPartyMembers(1);
            } else { 
              game.log('Some members of your party dig an irrigation ditch to divert some of the lava flow away from the town. One party member is nearly overcome by pyroclastic flow, but manages to escape with their life'); 
            }
          } else if ( wis > 7 && wis <= 18 ) {
            game.log('Some members of your party dig an irrigation ditch to divirt some of the lava flow away from the town.');
          } else {
            if ( dex <= 13 ) {
              game.log('Some members of your party dig an irrigation ditch to divirt some of the lava flow away from the town.');
            } else { 
              game.log('Some members of your party dig an irrigation ditch to divirt some of the lava flow away from the town. One party member tries to outrun the pyroclastic flow, but is overcome and dies.');
              game.killPartyMembers(1);
            }
          }    
          loot(game);
          maybeAngerGods(game);
        },
      }
    ];

    // Boss State:

    boss.name = 'Fire Elemental';
    boss.str = 14;
    boss.dex = 15;
    boss.con = 9;
    boss.int = 8;
    boss.wis = 8;
    boss.cha = 7;
    boss.weapon.physical = -1; // 1 blunt damage
    boss.weapon.elemental = -1; // 1 fire damage
    boss.armor.physical = -1; // 1 blunt armor
    boss.armor.elemental = -1; // 1 fire armor

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
          game.killPartyMembers(1);
        },
      },
    ];

    return { town, boss };
  },
});
