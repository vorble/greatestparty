game.registerLevel({
  level: 1,
  newTown: (game: Game) => {
    const town = new Town();

    // As the town began to form just a short while ago, before it had a name,
    // the townsfolk got busy with the volcano so they named it after what
    // they had an abundance of, magma.
    town.name = 'Magma Town';
    town.townsfolk = 200;
    town.hireCost = 200;
    town.conscriptRatio = 0.4;
    town.conscriptViolenceRatio = 0.65;
    town.foodStock = 150;
    town.foodSupport = [3, 3, 4, 3];
    town.foodCostBuy = [4, 5, 3, 3];
    town.foodCostSell = [2, 3, 1, 1];
    town.waterStock = 150;
    town.waterSupport = [2, 2, 1, 2];
    town.waterCostBuy = [3, 3, 5, 3];
    town.waterCostSell = [1, 2, 3, 2];
    for (const cat of EQ_FINE_CATEGORIES) {
      town.inventoryWeapon[cat] = 100;
      town.inventoryWeaponBuy[cat] = 5;
      town.inventoryWeaponSell[cat] = 3;
      town.inventoryArmor[cat] = 100;
      town.inventoryArmorBuy[cat] = 5;
      town.inventoryArmorSell[cat] = 3;
    }
    town.need = 10;
    town.needMax = 15;
    town.needRatio = 0.010;
    town.enemyRatio = 0.05;
    town.goldPerQuest = 10;

    const OPPOSITION_STATS = game.rollPartyStats();

    const townState = {
      OPPOSITION_STATS,

      blazingShardsIntroduced: false,
      blazingShardsCollected: 0,
      blazingShardsDone: false,

      cliffsIntroduced: false,
      cliffsMurders: 0,
      cliffsDone: false,

      pyreIntroduced: false,
      pyreMurders: 0,
      pyreDone: false,

      snuffIntroduced: false,
      snuffSuccess: 0,
      snuffDone: false,
    };
    town.state = townState;

    function loot(game: Game) {
      if (rollRatio() <= 0.4) {
        const typ = rollChoice(['weapon', 'armor']);
        const fine = rollChoice(EQ_FINE_CATEGORIES);
        const inv = typ == 'weapon' ? game.party.inventoryWeapon : game.party.inventoryArmor;
        inv[fine] += 1;
        game.log('You loot 1 ' + fine + ' ' + typ + '.');
      }
      if (rollRatio() <= 0.1) {
        const name = rollChoice([
          ...ITEM_NAMES_STAT_BUFF,
          ...ITEM_NAMES_CONSUMABLE,
        ]);
        game.party.items[name].quantity += 1;
        game.log('Your party receives 1 ' + game.party.items[name].name + '.');
      }
      if (rollRatio() <= 0.01) {
        const name = rollChoice(ITEM_NAMES_EQUIPMENT_BOOST);
        game.party.items[name].quantity += 1;
        game.log('Your party receives 1 ' + game.party.items[name].name + '.');
      }
      if (rollRatio() <= 0.005) {
        const name = rollChoice(ITEM_NAMES_STAT_BOOST);
        game.party.items[name].quantity += 1;
        game.log('Your party receives 1 ' + game.party.items[name].name + '.');
      }
    }

    function rollLoseEquipment (game: Game) {
      const weaponChoices = EQ_FINE_CATEGORIES
        .filter((cat) => game.party.inventoryWeapon[cat] > 0)
        .map((cat) => { return { weight: 1, inv: game.party.inventoryWeapon, typ: 'weapon', cat }; });
      const armorChoices = EQ_FINE_CATEGORIES
        .filter((cat) => game.party.inventoryArmor[cat] > 0)
        .map((cat) => { return { weight: 1, inv: game.party.inventoryArmor, typ: 'armor', cat }; });
      const c = rollChoiceWeighted(weaponChoices.concat(armorChoices));
      c.inv[c.cat] -= 1;
      game.log('You lose 1 ' + c.cat + ' ' + c.typ + '.');
    }

    town.events = [
      {
        name: 'A Faux Pas',
        weight: 3,
        predicate: (game: Game) => !game.party.status.angeredGods.active,
        action: (game: Game) => {
          // Being charasmatic helps you avoid making a faux pas at a local ceremony.
          const r = rollDie(20) + mod(game.party.cha, [[0, -1], [5, 0], [14, 1]]);
          if (r <= 4) {
            game.party.status.angeredGods.active = true;
            statusSetExpiry(game, game.party.status.angeredGods, { term: 75 });
            game.log('A party member commits a faux pas at a ceremony with some townsfolk.');
          } else {
            if (game.party.wis >= 14) { //Being wise tells you not to make a fool of yourself at the ceremony.
              game.log('A party member is invited to a ceremony by some townsfolk, but declines.');
              game.adjustAlignment(-1);
            } else {
              game.log('A party member goes to a ceremony with some townsfolk and has a good time.');
              game.adjustAlignment(1);
            }
          }
        },
      },
      {
        name: 'Angered Gods',
        weight: 50,
        predicate: (game: Game) => game.party.status.angeredGods.active,
        action: (game: Game) => {
          const r = rollDie(20); // random chance that the angry volcano gods will kill a party member
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
        name: 'Exploring the Caldera',
        weight: 5,
        action: (game: Game) => {
          if (!game.party.status.angeredGods.active) { //exploring is safe if the gods arent mad
            game.log('Some members of your party go exploring the caldera.');
          } else {
            game.log('Some members of your party go exploring the caldera when the gound begins to shake beneath them.');
            const r = rollDie(12); //chance to have to fight boss AND a small chance some of the party dies.
            if ( r <= 1 ) {
              const dead = rollDie(3) + 1;
              game.log('The caldera collapses killing ' + dead + ' party members!');
              game.killPartyMembers(dead);
            }
            if ( r <= 3 && !game.fightingBoss) {
              game.log('A magma elemental appears!');
              game.fightBoss();
            }
          }
          loot(game);
        },
      },
      {
        name: 'From the Ashes',
        weight: 5,
        action: (game: Game) => {
          game.log('Members of your party help rebuild after pyroclastic flow detroys some of the town');
        },
      },
      {
        name: 'Vigilantism',
        weight: 3,
        action: (game: Game) => {
          game.log('Your party takes on some outlaws that have been harrasing the townfolks.');
          if ( rollDie(20) + modLinear(game.party.int, 10) <= 15 ) {       //Being smart helps you trap the outlaws
            game.log('Your party tries to ambush the outlaws, but the outlaws escape and regroup.');
                                                                       //You must be strong and dexterous
                                                                       //to defeat the outlaws in a brawl
            if ( rollDie(20) + modLinear(game.party.str, 10) <= 10 && rollDie(20) + modLinear(game.party.dex, 10) <= 10 ) {
              game.log('The outlaws return and start a brawl, making off with some gold and equipment.');
              game.adjustAlignment(-3);                                //but you lost and now the towns people dislike you
              let gold = 0;                                            //and the outlaws will take the next 7 lines to rob you
              for (let i = rollDie(4) + 2; i >= 0; --i) {
                gold += rollDie(10);
                rollLoseEquipment(game);
              }
              if (gold > game.party.gold) {  game.receiveGold(-game.party.gold); }
              else { game.receiveGold(-gold); }
              if ( rollDie(20) <= 8 ) {                                 //also theres a 40% chance outlaws kill a party member
                game.log('One party member dies in the brawl.');
                game.killPartyMembers(1);
              }
            } else {                                                    //If you hadn't of been so slow and weak
              game.log('The outlaws return and start a brawl, with the help of some townsfolk your party manages to drive them out of town.');                                                        //you would have won.
              game.adjustAlignment(-2);                                 //but town is still upset that you instigated a brawl
              for (let i = rollDie(3); i >= 0; --i) { loot(game); }     // at least you walk off with some equipment
            }
          } else {                                                      //If you had  been smart about the ambush
            if ( rollDie(20) + modLinear(game.party.str, 10) <= 6 ) {       //theres still a chance they could over power you
              const dead = rollDie(3);
              game.log('Your party ambushes the outlaws, but they over power the party members and escape. '+dead+' party members are killed.');
              game.killPartyMembers(dead);
            } else {                                                    //If you had been smart about the ambush and strong
                                                                        //in its execution, you'd get members and equipment
              game.log('Your party manages to ambush some of the outlaws, take their weapons, and even convice some of them to join the party. The rest are executed.');
              for (let i = rollDie(3) + 3; i >= 0; --i) {
                loot(game);
                if (rollRatio() <= 0.3) { game.addPartyMembers(1); }
              }
            }
          }
        },
      },
    ];

    town.quests = [
      {
        name: 'Digging lava irrigation',
        weight: 1,
        action: (game: Game) => {
          const wis = rollDie(20) + mod(game.party.wis, [[0, -1], [6, 0],[12, +1]]); // Wisdom tells you not to stand in the way of pyroclastic flow
          const dex = rollDie(20) + mod(game.party.dex, [[0, -1], [6, 0],[12, +1],[16, +2]]); // Dexterity helps you get out of the way when you do stand in the way of pyroclastic flow
          if ( wis <= 7) {
            if ( dex <= 12 ) {
              game.log('Some members of your party dig an irrigation ditch to divert some of the lava flow away from the town. One party member is overcome by pyroclastic flow and dies.');
              game.killPartyMembers(1);
            } else {
              game.log('Some members of your party dig an irrigation ditch to divert some of the lava flow away from the town. One party member is nearly overcome by pyroclastic flow, but manages to escape with their life.');
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
        },
      },
      {
        name: 'Farm Aid',
        weight: 1,
        action: (game: Game) => {
            if ( game.town.alignment <= 30 ) {
              game.log('Your party dedicates some time to help local farmers.');
              game.adjustAlignment(1);
            } else {
              const r = (rollDie(4) + mod(game.town.alignment, [[30, 0], [40, 1], [50, 2]]));
              game.log('Your party dedicates some time to help local farmers. They donate ' + r + ' food to your party as thanks!');
              game.party.food += r;
            }
          loot(game);
        },
      },
      {
        name: 'Blazing Shards',
        weight: 2,
        predicate: (game: Game) => !townState.blazingShardsDone,
        action: (game: Game) => {
          if (!townState.blazingShardsIntroduced) {
            game.log('While some of your party members walk through a freshly dug diversion ditch, they notice a gathering up on a vegetagted hill outside oftown. Your party goes to inspect.');
            townState.blazingShardsIntroduced = true;
          }
          const r = (rollDie(20)
            + modLinear(game.party.int, 10) // Be smart to sneak quietly.
          );
          if (r <= 6) {
            game.log('Your party makes its way quite loudly through the ruffage toward the suspicious gathering and one party member disturbs a trip wire and is bludgeoned to death by a swinging log.');
            game.killPartyMembers(1);
          } else if (r <= 15) {
            game.log('Your party makes its way quite loudly through the ruffage toward the suspicious gathering and the others notice and clear out before your party can arrive.');
          } else {
            game.log('Your party makes its way through the ruffage toward the suspicious gathering and they manage to take the others by surprise. The others flee, leaving behind a pile of glowind red blazing shards which your party collects.');
            if (++townState.blazingShardsCollected >= 3) {
              game.log('Your party takes all of the blazing shards back to Magma Town and show them to scholars. "These shards have been used through history to summon titanic beasts from the land. This must be why the volcano is threatening to erupt. Who is behind this? Another party, you say?"');
              loot(game);
              game.receiveGold(rollRange(6, 12));
              townState.blazingShardsDone = true;
            }
          }
        },
      },
      {
        name: 'Scaling the Cliffs',
        weight: 2,
        predicate: (game: Game) => townState.blazingShardsDone && !townState.cliffsDone,
        action: (game: Game) => {
          if (!townState.cliffsIntroduced) {
            game.log('Your party takes notice of a precession, lead by another party, heading up the cliffs of the volcanic mountain. Glowing red shards can be seen in tow, undoubtedly intended to be used in a summoning ritual.');
            townState.cliffsIntroduced = true;
          }
          const r = (rollDie(20)
            + modLinear(game.party.str, 10) // Be strong to scale the cliffs with ease
            + modLinear(game.party.con, 10) // Have constitution to keep your cool on the cliffs
          );
          if (r <= 6) {
            if (rollBoolean()) {
              game.log('Members of your party pull themselves up the side of the steep cliffs, but one party member loses their grip and falls to their death.');
            } else {
              game.log('Members of your party pull themselves up the side of the steep cliffs, but one party member loses their nerve and their grip, falling to their death.');
            }
            game.killPartyMembers(1);
          } else if (r <= 14) {
            game.log('Members of your party pull themselves up the side of the steep cliffs, getting closer to members of the other party.');
          } else {
            game.log('Members of your party pull themselves up the side the steep cliffs and grab hold of the ankle of one of the other party\'s members, releasing them from the cliff.');
            if (++townState.cliffsMurders >= 6) {
              game.log('As the other party\'s member falls to their death, they shout "You\'re too late! You can\'t stop us! They\'re already at the summit!"');
              loot(game);
              game.receiveGold(rollRange(8, 14));
              townState.cliffsDone = true;
            }
          }
        },
      },
      {
        name: 'Summoning Pyre',
        weight: 2,
        predicate: (game: Game) => townState.cliffsDone && !townState.pyreDone,
        action: (game: Game) => {
          if (!townState.pyreIntroduced) {
            game.log('A great flame shoots up into the ashy sky from the summit of the volcano, causing the sky to glow and flicker in orange. The summoning ritual has started.');
            townState.pyreIntroduced = true;
          }
          const r = rollDie(20);
          if (r <= 5) {
            game.log('Your party confronts the opposing party on the summit, but flames from the summoning pyre obey their masters and consume one of your party members.');
            game.killPartyMembers(1);
          } else if (r <= 16) {
            switch (rollRange(1, 2)) {
              case 1:
                game.log('Your party confronts the opposing party on the summit and a member of your party jumps out of the way of a poison aerosol.');
                break;
              case 2:
                game.log('Your party confronts the opposing party on the summit and a member of your party dodges a moving column of fire.');
                break;
              default:
                game.log('ERR');
                break;
            }
          } else {
            game.log('Your party confronts the opposing party on the summit and a member of your party cuts down an opposition member participating in the ritual.');
            if (++townState.pyreMurders >= 5) {
              game.log('As the final summoner falls to the ground, spilling their blood they mutter, "He... let... us... die..."');
              loot(game);
              game.receiveGold(rollRange(14, 20));
              townState.pyreDone = true;
            }
          }
        },
      },
      {
        name: 'Scaling the Cliffs',
        weight: 2,
        predicate: (game: Game) => townState.pyreDone && !townState.snuffDone,
        action: (game: Game) => {
          if (!townState.snuffIntroduced) {
            game.log('Your party comes upon the opposing party\'s camp nestled between the faces of a mountainous cleft boulder.');
            townState.snuffIntroduced = true;
          }
          const action = rollChoice([
            {
              stat: game.party.str,
              prefix: 'Your party pushes on the unsecured wall of a makeshift structure',
              good: ' and it falls down into a heap.',
              bad: ', but your party is not able to stop the falling debris from burying and killing one party member.',
            },
            {
              stat: game.party.dex,
              prefix: 'Your party chases several opposing party members around the camp',
              good: ' and strikes one down into a pool of blood.',
              bad: ', but a member of your party trips and falls onto their weapon.',
            },
            {
              stat: game.party.con,
              prefix: 'Your party encircles a wounded opposing party member to put them out of their misery',
              good: '.',
              bad: ', but a member of your party hesistates leaving an opportunity for the other the strike and kill them.',
            },
            {
              stat: game.party.int,
              prefix: 'Your party chases an opposing party member up a long pole in the camp',
              good: ' and set it on fire to get them down.',
              bad: ' and set it on fire to get them down, but the fire spreads too quickly and consumes one member of your party.',
            },
            {
              stat: game.party.wis,
              prefix: 'Your party rummages through the various tents in the camp',
              good: ' and carefully check that no ambushers are lying in wait.',
              bad: ', but in the bustle one party member is attacked to death by am ambusher lying in wait.',
            },
            {
              stat: game.party.cha,
              prefix: 'Your party corners some opposing party members in a narrow cave',
              good: ' and your party manages to talk them out to be captured.',
              bad: ', but a member of your party gets impatient and goes in after them, but is stabbed to death.',
            },
          ]);
          const r = (rollDie(20)
            + modLinear(action.stat, 10)
          );
          if (r <= 10) {
            game.log(action.prefix + action.bad);
            game.killPartyMembers(1);
          } else {
            game.log(action.prefix + action.good);
            if (++townState.snuffSuccess >= 10) {
              game.log('Your party takes a look around at the destroyed camp. The opposing party has been vanquished.');
              loot(game);
              loot(game);
              loot(game);
              loot(game);
              loot(game);
              game.receiveGold(rollRange(20, 30));
              townState.snuffDone = true;
            }
          }
        },
      },
    ];

    town.enemies = [
      {
        weight: 1,
        predicate: (game: Game) => townState.blazingShardsDone && !townState.snuffDone,
        roll: (game: Game) => {
          return {
            name: 'Opposing Party Member',
            health: 28,
            ...OPPOSITION_STATS,
            weapon: {
              physical: 5,
              magical: -5,
              elemental: 3,
            },
            armor: {
              physical: -1,
              magical: 1,
              elemental: -1,
            },
            state: {},
            events: [
              {
                name: 'Poison Aerosol',
                weight: 1,
                action: (game: Game) => {
                  const r = (rollDie(20)
                    + modLinear(game.party.con, 8)
                  );
                  if (r <= 6) {
                    game.log('Opposing Party Member sprays an aerosol of poison from their mouth and your party members breath it in.');
                    game.party.status.poison.active = true;
                    statusSetExpiry(game, game.party.status.poison, { tock: 15 });

                  } else {
                    game.log('Opposing Party Member sprays an aerosol of poison from their mouth and your party members breath it in, but it doesn\'t seem to be effective.');
                  }
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(9, 11));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => true,
        roll: (game: Game) => {
          return {
            name: 'Wild Dog',
            health: 24,
            str: 9,  int: 7,
            dex: 13, wis: 5,
            con: 9,  cha: 12, // Doggo can get pets when it wants
            weapon: {
              physical: 13,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: -2,
              magical: 0,
              elemental: 0,
            },
            state: {},
            events: [
              {
                name: 'Yip',
                weight: 1,
                action: (game: Game) => {
                  game.log('Wild Dog lets out a yip.');
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(9, 11));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => true,
        roll: (game: Game) => {
          const state = {
            windUp: false,
          };
          return {
            name: 'Baked Clay Golem',
            health: 45,
            str: 14, int: 5,
            dex:  6, wis: 3,
            con: 20, cha: 2,
            weapon: {
              physical: -17,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: 0,
              magical: 0,
              elemental: 0,
            },
            state: {},
            events: [
              {
                name: 'Wind Up',
                weight: 1,
                predicate: (game: Game) => !state.windUp,
                action: (game: Game) => {
                  game.log('Baked Clay Golem winds up for a big swing of its fist.');
                  state.windUp = true;
                },
              },
              {
                name: 'Big Swing',
                weight: 1,
                predicate: (game: Game) => state.windUp,
                action: (game: Game) => {
                  const r = (rollDie(20)
                    + modLinear(game.party.dex, 14)
                  );
                  if (r <= 10) {
                    game.log('Baked Clay Golem takes a big swing at your party and bashes one party member to death, others are left scrambling to regain composure.');
                    game.killPartyMembers(1);
                    game.party.status.addStatus(game, {
                      name: 'Scrambling',
                      tock: 10,
                      dexmod: -3,
                      conmod: -2,
                    });
                  } else {
                    game.log('Baked Clay Golem takes a big swing at your party, but fails to connect.');
                  }
                  state.windUp = false;
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(9, 11));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => true,
        roll: (game: Game) => {
          return {
            name: 'Blight Wing',
            health: 19,
            str: 5,  int: 9,
            dex: 17, wis: 4,
            con: 14, cha: 6,
            weapon: {
              physical: -10,
              magical: -10,
              elemental: 0,
            },
            armor: {
              physical: 4,
              magical: -1,
              elemental: 1,
            },
            state: {},
            events: [
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(12, 13));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => true,
        roll: (game: Game) => {
          return {
            name: 'Ash Skeleton',
            health: 22,
            str:  8, int:  4,
            dex:  4, wis:  2,
            con: 30, cha: 14, // Always smiling.
            weapon: {
              physical: -12,
              magical: -5,
              elemental: -2,
            },
            armor: {
              physical: 5,
              magical: 0,
              elemental: -20,
            },
            state: {},
            events: [
              {
                name: 'Void Socket',
                weight: 1,
                action: (game: Game) => {
                  game.log('Ash Skeleton stares at your party silently with its pair of void sockets. Your party feels weak.');
                  game.party.status.addStatus(game, {
                    name: 'Anemia',
                    tock: 17, // Enough for 3 stacks
                    strmod: -1,
                    dexmod: -1,
                    conmod: -1,
                    intmod: -1,
                    wismod: -1,
                    chamod: -1,
                  });
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(13, 17));
              loot(game);
            },
          };
        },
      },
    ];

    town.bosses = [
      {
        weight: 1,
        roll: (game: Game) => {
          const state = {
            chargingAttack: false,
            attackCharged: false,
          };

          return {
            name: 'Magma Elemental',
            health: 650,
            str: 14, int: 8,
            dex: 15, wis: 8,
            con:  9, cha: 7,
            weapon: {
              physical: -20, // blunt
              magical: -1, // dark
              elemental: -45, // fire
            },
            armor: {
              physical: -18, // blunt
              magical: 0,
              elemental: -18, // fire
            },
            state,
            events: [
              {
                name: 'Charging attack',
                weight: 1,
                predicate: (game: Game) => {
                  return !state.chargingAttack && !state.attackCharged;
                },
                action: (game: Game) => {
                  state.chargingAttack = true;
                  game.log('Magma elemental starts to glow with a red hot intensity and holds its hands over its head.');
                },
              },
              {
                name: 'Finished Charging',
                weight: 10,
                predicate: (game: Game) => {
                  return state.chargingAttack;
                },
                action: (game: Game) => {
                  state.chargingAttack = false;
                  state.attackCharged = true;
                  game.log('Magma flows from the magma elemental\'s hands into a ball over its head.');
                },
              },
              {
                name: 'Kahmehamagma',
                weight: 10,
                predicate: (game: Game) => {
                  return state.attackCharged;
                },
                action: (game: Game) => {
                  state.attackCharged = false;
                  const r = rollDie(20) + mod(game.party.dex, [[-50, -1], [8, 0], [16, 1], [18,2]]);
                  if ( r <=18 ) {
                    game.log('The magma elemental throws its hands down and the ball of magma shoots forward toward a party member!');
                    game.killPartyMembers(1);
                  } else {
                    game.log('The magma elemental throws its hands down and the ball of magma shoots forward narrowly missing a party member!');
                  }
                },
              },
              {
                name: 'Stomp',
                weight: 1,
                action: (game: Game) => {
                  game.log('The magma elemental lifts its leg high and stops on the ground creating a shock wave! The party\'s dexterity decreases by 2.');
                  game.party.dexmod += -2;
                  game.setTimeout(() => {
                    game.party.dexmod += 2;
                  }, { term: 1});
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(350);
            },
          };
        },
      },
    ];

    return town;
  },
});
