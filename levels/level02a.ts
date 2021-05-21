game.registerLevel({
  level: 2,
  newTown: (game: Game) => {
    const town = new Town();

    const DESERT_KNOWLEDGE_MASTER = TICKS_PER_TOCK * TOCKS_PER_TERM * TERMS_PER_SEASON; // 1 season.

    const FOOD_SUPPORT_NORMAL: TownSeasonVector = [25, 30, 40, 15];
    const FOOD_SUPPORT_DESERT: TownSeasonVector = [1, 0, 0, 1];

    const WATER_SUPPORT_NORMAL: TownSeasonVector = [30, 15, 20, 20];
    const WATER_SUPPORT_DESERT: TownSeasonVector = [1, 0, 0, 1];

    town.name = 'Spindling Plains';
    town.townsfolk = 450;
    town.hireCost = 100;
    town.conscriptRatio = 0.5;
    town.conscriptViolenceRatio = 0.4;
    town.foodStock = 200;
    town.foodSupport = FOOD_SUPPORT_NORMAL;
    town.foodCostBuy = [4, 4, 2, 5];
    town.foodCostSell = [2, 2, 1, 4];
    town.waterStock = 75;
    town.waterSupport = WATER_SUPPORT_NORMAL;
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

    function maybeGoToDesert(game: Game) {
      const r = (rollDie(20)
        + modLinear(game.party.int, 12) // Need to be pretty smart to know the land.
        + modLinear(game.party.wis, 10) // Need moderate wisdom to know to be crareful.
      );
      if (r <= 8) {
        goToDesert(game);
      }
    }

    function goToDesert(game: Game) {
      if (!townState.partyInDesert) {
        game.log('Your party finds itself on wind-swept red sands of the Verees Desert.');
        townState.partyInDesert = true;
        townState.backupFoodStock = town.foodStock;
        town.foodStock = 0;
        townState.backupWaterStock = town.waterStock;
        town.waterStock = 0;
        town.foodSupport = FOOD_SUPPORT_DESERT;
        town.waterSupport = WATER_SUPPORT_DESERT;
        game.party.status.outOfTown.active = true;
      }
    }

    function leaveDesert(game: Game) {
      if (townState.partyInDesert) {
        game.log('Your party makes it out of the Verees Desert.');
        townState.partyInDesert = false;
        town.foodStock = townState.backupFoodStock;
        town.waterStock = townState.backupWaterStock;
        town.foodSupport = FOOD_SUPPORT_NORMAL;
        town.waterSupport = WATER_SUPPORT_NORMAL;
        game.party.status.outOfTown.active = false;
      }
    }

    const townState = {
      partyInDesert: false,
      partyDesertKnowledge: Math.floor(DESERT_KNOWLEDGE_MASTER * 0.05),

      backupFoodStock: 0,
      backupWaterStock: 0,

      goToDesert, // TODO: Don't expose the inner functions in this way
      leaveDesert,
    };
    town.state = townState;

    town.hooks = {
      onTownArrive: (game: Game) => {
      },
      onTownDepart: (game: Game) => {
        // If you beat the level while in the desert, then make sure the status is removed.
        game.party.status.outOfTown.active = false;
      },
      doTickActions: (game: Game) => {
        // The party gains knowledge of the desert the more time they spend there.
        if (townState.partyInDesert) {
          gainDesertKnowledge(1);
        }
      },
    };

    function gainDesertKnowledge(amount: number) {
      townState.partyDesertKnowledge = Math.min(DESERT_KNOWLEDGE_MASTER, townState.partyDesertKnowledge + amount);
    }

    town.events = [
      {
        name: 'Wander the Verees Desert',
        weight: 1,
        predicate: (game: Game) => townState.partyInDesert,
        action: (game: Game) => {
          // Same roll as town event Study the Verees Desert
          const knowledgeRatio = townState.partyDesertKnowledge / DESERT_KNOWLEDGE_MASTER;
          if (rollRatio() < knowledgeRatio) {
            game.log('Your party finds its way out from the Verees Desert.');
            leaveDesert(game);
          } else {
            game.log('Your party wanders the Verees Desert.');
          }
        },
      },
    ];

    town.quests = [
      {
        name: 'Study the Verees Desert',
        weight: 1,
        predicate: (game: Game) => townState.partyInDesert,
        action: (game: Game) => {
          gainDesertKnowledge(10);
          // Same roll as town event Wander the Verees Desert
          const knowledgeRatio = townState.partyDesertKnowledge / DESERT_KNOWLEDGE_MASTER;
          if (rollRatio() < knowledgeRatio) {
            game.log('Your party finds its way out from the Verees Desert.');
            leaveDesert(game);
          } else {
            game.log('Your party wanders the Verees Desert taking detailed notes.');
          }
        },
      },
      // TODO: Crispin 1
      {
        name: '', // TODO
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert,
        action: (game: Game) => {
        },
      },
      // TODO: Crispon 2
      // TODO: Dixie
      // TODO: Dox
      // TODO: Manual Labor (Repeat)
      // TODO: Desert Searching (Repeat)
      // TODO: Duke 1
      // TODO: Wix Waypoint
      // TODO: Verees Desert
      // TODO: Duke 2
    ];

    town.enemies = [
      // Prarie Hound will start above ground, but can go below to increase
      // defense. This will also reduce its attack.
      {
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert,
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
            burrow: true,
          };

          const self: Enemy = {
            name: 'Prarie Hound',
            health: 50,
            str: 12, int: 8,
            dex: 6,  wis: 10,
            con: 11, cha: 12,
            weapon: WEAPON_BELOW,
            armor: ARMOR_BELOW,
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
        predicate: (game: Game) => true,
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
      {
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert,
        roll: (game: Game) => {
          const state = {
          };

          const self: Enemy = {
            name: 'Cutlass Cat',
            health: 75,
            str:  8, int: 12,
            dex: 15, wis:  9,
            con: 11, cha:  7,
            weapon: {
              physical: 50,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: 10,
              magical: 0,
              elemental: 30,
            },
            state,
            events: [
              {
                name: 'Hiss',
                weight: 1,
                action: (game: Game) => {
                  game.log(rollChoice([
                    'Cutlass Cat lets out a wild hiss.',
                    'Cutlass Cat puffs up its tail.',
                    'Cutlass Cat\'s hair stands on end.',
                  ]);
                  self.weapon.physical += 4;
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(20, 25));
              loot(game);
            },
          };

          return self;
        },
      },
      // TODO: Territorial Gazelle
      // TODO: Crowe's Sentinel
      // TODO: River Imp
      {
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert,
        roll: (game: Game) => {
          const state = {
          };

          const self: Enemy = {
            name: 'Exsanguinated Corpse',
            health: 75,
            str: 11, int: 1,
            dex:  2, wis: 1,
            con: 30, cha: 2,
            weapon: {
              physical: -45,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: 10,
              magical: 0,
              elemental: 5,
            },
            state,
            events: [
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(15, 22));
              loot(game);
            },
          };

          return self;
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => townState.partyInDesert,
        roll: (game: Game) => {
          const state = {
          };

          const WEP = 34;

          const self: Enemy = {
            name: 'Floating Eyes',
            health: 45,
            str: rollDie(20), int: rollDie(20),
            dex: rollDie(20), wis: rollDie(20),
            con: rollDie(20), cha: rollDie(20),
            weapon: {
              physical: (rollBoolean() ? -1 : 1) * WEP,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: 20,
              magical: 0,
              elemental: -10,
            },
            state,
            events: [
              {
                name: 'Blink',
                weight: 1,
                action: (game: Game) => {
                  changeWeapon(game);
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(17, 22));
              loot(game);
            },
          };

          function changeWeapon(game: Game) {
            self.weapon.physical = 0;
            self.weapon.magical = 0;
            self.weapon.elemental = 0;
            const sideRoll = rollDie(2) - 1;
            const directionRoll = rollDie(3) - 1;
            const side = ['left', 'right'][sideRoll];
            const direction = ['up', 'straight ahead', 'down'][directionRoll];
            const amount = sideRoll == 0 ? -WEP : WEP;
            const stat = EQ_BROAD_CATEGORIES[directionRoll];
            self.weapon[stat] = amount;
            game.log('The ' + side + ' eye looks ' + direction + '.');
          }

          return self;
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => townState.partyInDesert,
        roll: (game: Game) => {
          const state = {
          };

          const WEP = 34;
          const ARM = 25;

          const self: Enemy = {
            name: 'Mirage',
            health: 45,
            str:  4, int: 3,
            dex: 18, wis: 2,
            con:  2, cha: 5,
            weapon: {
              physical: 0,
              magical: -WEP,
              elemental: 0,
            },
            armor: {
              physical: 100,
              magical: -ARM,
              elemental: 0,
            },
            state,
            events: [
              {
                name: 'Shimmer',
                weight: 1,
                action: (game: Game) => {
                  game.log('Mirage shimmers before you eyes.');
                  changeArms(game);
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(18, 23));
              loot(game);
            },
          };

          function changeArms(game: Game) {
            self.weapon.magical = (rollBoolean() ? -1 : 1) * WEP;
            self.armor.magical = (rollBoolean() ? -1 : 1) * ARM;
          }
          changeArms(game);

          return self;
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => townState.partyInDesert,
        roll: (game: Game) => {
          const state = {
          };

          const self: Enemy = {
            name: 'Thirst',
            health: 50,
            str:  1, int: 1,
            dex:  1, wis: 1,
            con:  1, cha: 1,
            weapon: {
              physical: -10,
              magical: 0,
              elemental: -50,
            },
            armor: {
              physical: 100,
              magical: 0,
              elemental: -50,
            },
            state,
            events: [
              {
                name: 'Just a Sip',
                weight: 1,
                action: (game: Game) => {
                  const r = (rollDie(20)
                    + modLinear(game.party.dex, 10)
                  );
                  if (r <= 10) {
                    game.log('Thirst takes a sip from your party\'s canteens.');
                    game.party.water = Math.max(0, game.party.water - 1);
                  } else {
                    game.log('Thirst licks its lips.');
                  }
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(18, 23));
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
      // TODO: Crowe and the Necromagicked Mega Worm
    ];

    return town;
  },
});
