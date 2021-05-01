game.registerLevel({
  level: 1,
  newTown: (game: Game) => {
    const town = new Town();
    const boss = new Boss();

    town.name = 'Palm Town';
    town.townsfolk = 100;
    town.hireCost = 200;
    town.conscriptRatio = 0.4;
    town.conscriptViolenceRatio = 0.5;
    town.foodStock = 100;
    town.foodSupport = [3, 4, 3, 1];
    town.foodCostBuy = [2, 2, 3, 6];
    town.foodCostSell = [1, 1, 1, 4];
    town.waterStock = 100;
    town.waterSupport = [4, 5, 5, 4];
    town.waterCostBuy = [3, 3, 3, 3];
    town.waterCostSell = [2, 2, 2, 2];
    for (const cat of EQ_FINE_CATEGORIES) {
      town.inventoryWeapon[cat] = 100;
      town.inventoryWeaponBuy[cat] = 5;
      town.inventoryWeaponSell[cat] = 3;
      town.inventoryArmor[cat] = 100;
      town.inventoryArmorBuy[cat] = 5;
      town.inventoryArmorSell[cat] = 3;
    }
    town.need = 10;
    town.needMax = 10;
    town.needRatio = 0.010;
    town.boss = 2000;
    town.bossReward = 200;

    class TownStateWrapper {
      get bodiesOutToSea(): number { return game.town.state.number1; }
      set bodiesOutToSea(value: number) { game.town.state.number1 = value; }
    }
    const townState = new TownStateWrapper();

    function maybeInflictIslandCurse(game: Game) {
      if (!game.party.status.islandCurse.active) {
        // Being wise lets you avoid picking up the cursed item, avoiding the curse.
        const r = rollDie(20) + calcmod(game.party.wis, [[0, -1], [5, 0], [14, 1]]);
        if (r <= 2) {
          game.party.status.islandCurse.active = true;
          setStatusExpiry(game, game.party.status.islandCurse, { year: 1 });
          game.log('A party member grabs something interesting from the ground.');
        } else if (r <= 4) {
          if (game.party.wis >= 16) {
            game.log('A party member notices something interesting on the ground, but its ominous glow gives them pause.');
          } else {
            game.log('A party member overlooks something interesting on the ground.');
          }
        }
      }
    }

    function returnFromTheSea(game: Game) {
      if (townState.bodiesOutToSea > 0) {
        if (rollDie(8) == 1) {
          --townState.bodiesOutToSea;
          game.log('A body washes ashore.');
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
        name: 'Call of the Sea',
        weight: 10,
        predicate: (game: Game) => {
          return game.party.status.islandCurse.active;
        },
        action: (game: Game) => {
          const r = (rollDie(20)
            + calcmod(game.party.con, [[0, 0], [12, 1]])
            + calcmod(game.party.cha, [[0, 0], [16, 1]])
          );
          if (r <= 5) {
            game.log('A member of your party is drawn toward the sea, swims toward the horizon, and dies.');
            game.killPartyMembers(1);
            ++townState.bodiesOutToSea;
          } else {
            game.log('A member of your party is drawn toward the sea.');
          }
          loot(game);
          returnFromTheSea(game); // Do this in every event.
        },
      },
      {
        name: 'Searching for Shells',
        weight: 1,
        action: (game: Game) => {
          const r = rollDie(20) + calcmod(game.party.wis, [[0, -1], [6, 0]]); // Being unwise could lead you into the crab nest.
          if (r <= 2) {
            game.log('Some members of your party comb the shore for sea shells and disturbs a giant crab nest, leading to one death.');
            game.killPartyMembers(1);
          } else if (r <= 10) {
            game.log('Some members of your party comb the shore for sea shells, but don\'t find anything special.');
          } else if (r <= 18) {
            game.log('Some members of your party comb the shore for sea shells and find a really nice one that someone from town buys for 1 gold.');
            game.party.gold += 1;
          } else {
            game.log('Some members of your party comb the shore for sea shells and find a rare shell that someone from town buys for 10 gold.');
            game.party.gold += 10;
          }
          loot(game);
          returnFromTheSea(game); // Do this in every event.
          maybeInflictIslandCurse(game);
        },
      },
      {
        name: 'Moving Rocks',
        weight: 1,
        action: (game: Game) => {
          const roll = (rollDie(20)
            + calcmod(game.party.cha, [[0, 1], [8, 0]]) // Hermit likes you more if you have social problems.
            + calcmod(game.party.wis, [[0, 0], [12, 1]]) // Common sense leads to a better design.
            + (game.party.str < 11 ? ( // Being weak makes this task quite difficult...
                game.party.int < 12 ? -2 : 0 // Unless you are smart enough.
              ) : 0)
          );
          if (roll <= 2) {
            game.log('The party moves rocks for the town hermit, but one of your party members is crushed to death.');
            game.killPartyMembers(1);
          } else if (roll <= 18) {
            game.log('The party moves rocks for the town hermit.');
          } else {
            game.log('The party moves rocks for the town hermit who is so moved by the design that they gifts you 10 gold.');
            game.party.gold += 10;
          }
          loot(game);
          returnFromTheSea(game); // Do this in every event.
          maybeInflictIslandCurse(game);
        },
      },
      {
        name: 'Cliff Ruins',
        weight: 1,
        action: (game: Game) => {
          const roll = (rollDie(20)
            + calcmod(game.party.str, [[0, -2], [5, 0]]) // Might be too weak to climb well
            + calcmod(game.party.dex, [[0, -2], [5, -1], [9, 0]]) // Nagivaging the cliffs is dangerous without dex.
            + calcmod(game.party.int, [[0, 0], [10, 1], [14, 2]]) // Being smart might help finding something useful.
            + (game.party.cha >= 13 && game.party.wis <= 7 ? -2 : 0) // On a dare, one might do something stupid.
          );
          if (roll <= 3) {
            game.log('The party scales the cliffs to explore some ruins, but one member falls to their death.');
            game.killPartyMembers(1);
          } else if (roll <= 10) {
            game.log('The party scales the cliffs to explore some ruins.');
          } else if (roll <= 22) {
            game.log('The party scales the cliffs to explore some ruins and find 10 gold.');
            game.party.gold += 10;
          } else {
            game.log('The party scales the cliffs to explore some ruins and discover ancient runes that when spoken summons a light drawing one member into the sky.');
            game.killPartyMembers(1);
            loot(game);
            loot(game);
            loot(game);
          }
          loot(game);
          returnFromTheSea(game); // Do this in every event.
          maybeInflictIslandCurse(game);
        },
      },
      {
        name: 'Goh\'s Whisper',
        weight: 1,
        predicate: (game: Game) => clockIsSign(game, 'Goh'),
        action: (game: Game) => {
          const r = rollDie(20);
          if (r <= 10) {
            if (game.town.townsfolk > 0) {
              game.log('A spirited town\'s person joins your party.');
              game.joinPartyFromTown(1);
            }
          } else {
            if (game.party.size > 0) {
              game.log('A spirited member of the party joins the town.');
              game.joinTownFromParty(1);
            }
          }
        },
      },
      {
        name: 'Fall Squall',
        weight: 1,
        predicate: (game: Game) => clockIsFall(game),
        action: (game: Game) => {
          const r = rollDie(20);
          if (r <= 10) {
            game.log('Dark clouds roll in from the sea whipping up raging winds tha carry one party member into the sky.');
            game.killPartyMembers(1);
          } else {
            game.log('Dark clouds roll in from the sea whipping up raging winds nearly carrying someone away.');
          }
        },
      },
    ];

    boss.name = 'Octopod';
    boss.str = 17;
    boss.dex = 13;
    boss.con = 9;
    boss.int = 7;
    boss.wis = 8;
    boss.cha = 6;
    boss.weapon.physical = -1; // 1 blunt damage
    boss.weapon.elemental = 1; // 1 ice damage
    boss.armor.physical = -1; // 1 blunt armor
    boss.armor.elemental = 1; // 1 ice armor

    class BossStateWrapper {
      get inStaringContest(): boolean { return game.boss.state.flag1; }
      set inStaringContest(value: boolean) { game.boss.state.flag1 = value; }
      get wonStaringContest(): boolean { return game.boss.state.flag2; }
      set wonStaringContest(value: boolean) { game.boss.state.flag2 = value; }
    }
    const bossState = new BossStateWrapper();

    boss.events = [
      {
        name: 'Staring Contest',
        weight: 1,
        predicate: (game: Game) => {
          return !bossState.inStaringContest && !bossState.wonStaringContest;
        },
        action: (game: Game) => {
          bossState.inStaringContest = true;
          game.log('Octopod becomes still as it gazes over the party...');
        },
      },
      {
        name: 'Lose Staring Contest',
        weight: 1,
        predicate: (game: Game) => {
          return bossState.inStaringContest;
        },
        action: (game: Game) => {
          bossState.inStaringContest = false;
          game.log('Octopod blinks!');
        },
      },
      {
        name: 'Win Staring Contest',
        weight: 1,
        predicate: (game: Game) => {
          return bossState.inStaringContest;
        },
        action: (game: Game) => {
          bossState.inStaringContest = false;
          bossState.wonStaringContest = true;
          game.log('Octopod squirms with delight!');
        },
      },
      {
        name: 'Tentacle Swipe',
        weight: 1,
        predicate: (game: Game) => {
          return bossState.wonStaringContest;
        },
        action: (game: Game) => {
          bossState.wonStaringContest = false;
          game.log('A member of your party disappears under Octopod\'s tentacle.');
          game.killPartyMembers(1);
        },
      },
    ];

    return { town, boss };
  },
});
