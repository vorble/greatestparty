game.registerLevel({
  level: 2,
  newTown: (game: Game) => {
    const town = new Town();

    town.name = 'Spindling Plains';
    town.townsfolk = 450;
    town.hireCost = 100;
    town.conscriptRatio = 0.5;
    town.conscriptViolenceRatio = 0.4;
    town.foodStock = 200;
    town.foodSupport = [25, 30, 40, 15];
    town.foodCostBuy = [4, 4, 2, 5];
    town.foodCostSell = [2, 2, 1, 4];
    town.waterStock = 75;
    town.waterSupport = [30, 15, 20, 20];
    town.waterCostBuy = [4, 5, 4, 4];
    town.waterCostSell = [2, 2, 2, 2];
    for (const cat of EQ_FINE_CATEGORIES) {
      town.inventoryWeapon[cat] = 100;
      town.inventoryWeaponBuy[cat] = 8;
      town.inventoryWeaponSell[cat] = 6;
      town.inventoryArmor[cat] = 100;
      town.inventoryArmorBuy[cat] = 8;
      town.inventoryArmorSell[cat] = 6;
    }
    town.need = 20;
    town.needMax = 20;
    town.needRatio = 0.008;
    town.enemyRatio = 0.06;

    const townState = {
      partyInDesert: false,
      partyDesertKnowledge: 0,
    };
    town.state = townState;

    function loot(game: Game) {
      const r = rollRatio();
      if (r < 0.01) {
        const name = rollChoice(ITEM_NAMES_BOOST);
        game.party.items[name].quantity += 1;
        game.log('Your party receives 1 ' + game.party.items[name].name + '.');
      } else if (r < 0.16) {
        const name = rollChoice(ITEM_NAMES_POTION);
        game.party.items[name].quantity += 1;
        game.log('Your party receives 1 ' + game.party.items[name].name + '.');
      } else if (r < 0.50) {
        const typ = rollChoice(['weapon', 'armor']);
        const fine = rollChoice(EQ_FINE_CATEGORIES);
        const inv = typ == 'weapon' ? game.party.inventoryWeapon : game.party.inventoryArmor;
        inv[fine] += 1;
        game.log('Your party receives 1 ' + fine + ' ' + typ + '.');
      }
    }

    town.hooks = {
      onTownArrive: (game: Game) => {
      },
      onTownDepart: (game: Game) => {
      },
      doTickActions: (game: Game) => {
        if (townState.partyInDesert) {
          if (townState.partyDesertKnowledge < 10000) {
            ++townState.partyDesertKnowledge;
          }
        }
      },
    };

    town.events = [
      {
        name: '', // TODO
        weight: 1,
        predicate: (game: Game) => true,
        action: (game: Game) => {
        },
      },
    ];

    town.quests = [
      {
        name: '', // TODO
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert,
        action: (game: Game) => {
        },
      },
    ];

    town.enemies = [
      // Prarie Hound will start above ground, but can go below to increase
      // defense. This will also reduce its attack.
      // TODO: Maybe it's more exciting to start burrowed and them pop up.
      {
        weight: 1,
        roll: (game: Game) => {
          const WEAPON_ABOVE = {
            physical: 30,
            magical: 0,
            elemental: 0,
          };
          const ARMOR_ABOVE = {
            physical: -8,
            magical: 0,
            elemental: 0,
          };
          const WEAPON_BELOW = {
            physical: -10,
            magical: 0,
            elemental: 0,
          };
          const ARMOR_BELOW = {
            physical: 16,
            magical: 0,
            elemental: 0,
          };

          const state = {
            burrow: false,
          };

          const self: Enemy = {
            name: 'Prarie Hound',
            health: 50,
            str: 12, int: 8,
            dex: 6,  wis: 10,
            con: 11, cha: 12,
            weapon: WEAPON_ABOVE,
            armor: ARMOR_ABOVE,
            state,
            events: [
              {
                name: 'Burrow',
                weight: 1,
                predicate: (game: Game) => {
                  return !state.burrow;
                },
                action: (game: Game) => {
                  if (rollRatio() < 0.25) {
                    game.log('Prarie Hound burrows beneath the ground.');
                    state.burrow = true;
                    self.weapon = WEAPON_BELOW;
                    self.armor = ARMOR_BELOW;
                  }
                },
              },
              {
                name: 'Emerge',
                weight: 1,
                predicate: (game: Game) => {
                  return state.burrow;
                },
                action: (game: Game) => {
                  if (rollRatio() < 0.25) {
                    game.log('Prarie Hound emerges from beneath the ground!');
                    state.burrow = false;
                    self.weapon = WEAPON_ABOVE;
                    self.armor = ARMOR_ABOVE;
                  }
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(20, 30));
              loot(game);
            },
          };

          return self;
        },
      },
      {
        weight: 1,
        roll: (game: Game) => {
          const state = {
          };

          const self: Enemy = {
            name: 'Caravan Scorpion',
            health: 50,
            str: 5,  int: 8,
            dex: 6,  wis: 5,
            con: 14, cha: 4,
            weapon: {
              physical: 30,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: -8,
              magical: 0,
              elemental: 0,
            },
            state,
            events: [
              {
                name: 'Posture',
                weight: 3,
                action: (game: Game) => {
                  game.log(rollChoice([
                    'Caravan Scorpion postures for battle.',
                    'Caravan Scorpion flexes its pincers.',
                    'Caravan Scorpion undulates its metasoma.',
                  ]));
                },
              },
              {
                name: 'Sting',
                weight: 1,
                action: (game: Game) => {
                  const r = (rollDie(20)
                    + modLinear(game.party.dex, 11)
                    + modLinear(game.party.con, 14)
                  );
                  if (r <= 0) {
                    game.log('Caravan Scorpion thrusts its stinger at a member of your party and punctures their throat, killing them.');
                    game.killPartyMembers(1);
                  } else if (r <= 10) {
                    game.log('Caravan Scorpion thrusts its stinger at a member of your party and injects them with a burning venom.');
                    game.party.status.poison.active = true;
                    setStatusExpiry(game, game.party.status.poison, { term: 1 });
                  } else {
                    game.log('Caravan Scorpion thrusts its stinger at your party, but misses.');
                  }
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(15, 20));
              loot(game);
            },
          };

          return self;
        },
      },
    ];

    town.bosses = [
      {
        weight: 1,
        roll: (game: Game) => {
          const state = {
          };

          return {
            // Xo - Guardian of Destruction
            name: 'Xo',
            health: 5000,
            str: 25, int: 12,
            dex:  5, wis: 10,
            con: 20, cha:  5,
            weapon: {
              physical: -60,
              magical: 30,
              elemental: 0,
            },
            armor: {
              physical: 40,
              magical: 0,
              elemental: -25,
            },
            state,
            events: [
              {
                name: '', // TODO
                weight: 1,
                predicate: (game: Game) => true,
                action: (game: Game) => {
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(800);
            },
          };
        },
      },
    ];

    return town;
  },
});
