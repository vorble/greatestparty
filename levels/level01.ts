game.registerLevel({
  level: 1,
  newTown: (game: Game) => {
    const town = new Town();

    // A small, yet functional town by the sea. Named after the Saint Rumaa who settled here in
    // 112 after being dismissed from the church order after the new rules took over after the war.
    town.name = 'Saint Rumaa';
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
    town.enemyRatio = 0.05;

    const townState = new (class TownStateWrapper {
      get bodiesOutToSea(): number { return game.town.state.numbers[0] || 0; }
      set bodiesOutToSea(value: number) { game.town.state.numbers[0] = value; }
      get bodiesInTheAir(): number { return game.town.state.numbers[1] || 0; }
      set bodiesInTheAir(value: number) { game.town.state.numbers[1] = value; }
      get ticksReturnBodies(): number { return game.town.state.numbers[2] || 0; }
      set ticksReturnBodies(value: number) { game.town.state.numbers[2] = value; }
      get ticksMaybeInflictIslandCurse(): number { return game.town.state.numbers[3] || 0; }
      set ticksMaybeInflictIslandCurse(value: number) { game.town.state.numbers[3] = value; }
      get questHermitRockGood(): number { return game.town.state.numbers[4] || 0; }
      set questHermitRockGood(value: number) { game.town.state.numbers[4] = value; }
      get questKidShellTalk(): number { return game.town.state.numbers[5] || 0; }
      set questKidShellTalk(value: number) { game.town.state.numbers[5] = value; }
      get questCliffsCliffTalk(): number { return game.town.state.numbers[6] || 0; }
      set questCliffsCliffTalk(value: number) { game.town.state.numbers[6] = value; }

      get questHermitRockIntroduced(): boolean { return game.town.state.flags[0] || false; }
      set questHermitRockIntroduced(value: boolean) { game.town.state.flags[0] = value; }
      get questHermitTreasureAvailable(): boolean { return game.town.state.flags[1] || false; }
      set questHermitTreasureAvailable(value: boolean) { game.town.state.flags[1] = value; }
      get questHermitTreasureIntroduced(): boolean { return game.town.state.flags[2] || false; }
      set questHermitTreasureIntroduced(value: boolean) { game.town.state.flags[2] = value; }
      get questKidShellIntroduced(): boolean { return game.town.state.flags[3] || false; }
      set questKidShellIntroduced(value: boolean) { game.town.state.flags[3] = value; }
      get questKidShellFinished(): boolean { return game.town.state.flags[4] || false; }
      set questKidShellFinished(value: boolean) { game.town.state.flags[4] = value; }
      get questCliffsCliffIntroduced(): boolean { return game.town.state.flags[5] || false; }
      set questCliffsCliffIntroduced(value: boolean) { game.town.state.flags[5] = value; }
      get questCliffsCliffFinished(): boolean { return game.town.state.flags[6] || false; }
      set questCliffsCliffFinished(value: boolean) { game.town.state.flags[6] = value; }
    });

    function maybeInflictIslandCurse(game: Game) {
      if (!game.party.status.islandCurse.active) {
        // Being wise lets you avoid picking up the cursed item, avoiding the curse.
        const r = rollDie(20) + mod(game.party.wis, [[0, -1], [5, 0], [14, 1]]);
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

    function returnBodies(game: Game) {
      if (townState.bodiesOutToSea > 0) {
        if (rollDie(8) == 1) {
          --townState.bodiesOutToSea;
          game.log('A body washes ashore.');
        }
      }
      if (townState.bodiesInTheAir > 0) {
        // These return to land much faster than from the sea.
        if (rollDie(3) == 1) {
          --townState.bodiesInTheAir;
          game.log('A body falls from the sky.');
        }
      }
    }

    function loot(game: Game) {
      if (rollRatio() <= 0.4) {
        const typ = rollChoice(['weapon', 'armor']);
        const fine = rollChoice(EQ_FINE_CATEGORIES);
        const inv = typ == 'weapon' ? game.party.inventoryWeapon : game.party.inventoryArmor;
        inv[fine] += 1;
        game.log('Your party receives 1 ' + fine + ' ' + typ + '.');
      }
      if (rollRatio() <= 0.1) {
        const name = rollChoice(ITEM_NAMES_POTION);
        game.party.items[name].quantity += 1;
        game.log('Your party receives 1 ' + game.party.items[name].name + '.');
      }
      if (rollRatio() <= 0.01) {
        const name = rollChoice(ITEM_NAMES_BOOST);
        game.party.items[name].quantity += 1;
        game.log('Your party receives 1 ' + game.party.items[name].name + '.');
      }
    }

    function lootTrash(game: Game) {
      if (rollRatio() <= 0.3) {
        const typ = rollChoice(['soiled shoe', 'worn leather strap', 'ragged cap', 'mold covered slacks', 'used monocle']);
        game.log('Your party receives 1 ' + typ + '.');
      }
    }

    town.hooks = {
      onTownArrive: (game: Game) => {
        townState.ticksReturnBodies = rollDie(TICKS_PER_TOCK * 5);
        townState.ticksMaybeInflictIslandCurse = rollDie(TICKS_PER_TOCK * 5);
      },
      onTownDepart: (game: Game) => {
      },
      doTickActions: (game: Game) => {
        ++townState.ticksReturnBodies;
        while (townState.ticksReturnBodies >= TICKS_PER_TOCK * 5) {
          returnBodies(game);
          townState.ticksReturnBodies -= TICKS_PER_TOCK * 5;
        }

        ++townState.ticksMaybeInflictIslandCurse;
        while (townState.ticksMaybeInflictIslandCurse >= TICKS_PER_TOCK * 5) {
          maybeInflictIslandCurse(game);
          townState.ticksMaybeInflictIslandCurse -= TICKS_PER_TOCK * 5;
        }
      },
    };

    // Town events occur periodically on their own, independly from quest events.
    town.events = [
      {
        name: 'Call of the Sea',
        weight: 1,
        predicate: (game: Game) => {
          return game.party.status.islandCurse.active;
        },
        action: (game: Game) => {
          const r = (rollDie(20)
            + mod(game.party.con, [[0, 0], [12, 1]])
            + mod(game.party.cha, [[0, 0], [16, 1]])
          );
          if (r <= 5) {
            game.log('A member of your party is drawn toward the sea, swims toward the horizon, and dies.');
            game.killPartyMembers(1);
            ++townState.bodiesOutToSea;
          } else {
            game.log('A member of your party is drawn toward the sea.');
          }
        },
      },
      {
        name: 'Unwelcome Here',
        weight: 1,
        predicate: (game: Game) => game.town.alignment <= -20,
        action: (game: Game) => {
          const roll = (rollDie(20)
            + mod(game.town.alignment, [[-100, -19], [-50, -5], [-20, 0]])
          );
          if (roll <= 3) {
            game.log('The townsfolk chase a member of your party through the streets and kill them.');
            game.killPartyMembers(1);
            game.adjustAlignment(4);
          } else {
            game.log('The townsfolk chase a member of your party through the streets.');
            game.adjustAlignment(1);
          }
        },
      },
      {
        name: 'Beloved Heroes',
        weight: 1,
        predicate: (game: Game) => game.town.alignment >= 40,
        action: (game: Game) => {
          const roll = (rollDie(20)
            + mod(game.town.alignment, [[40, 0], [70, 5], [100, 10]])
          );
          if (roll <= 17) {
            game.log('The townsfolk cheer you on as you make your way through town.');
          } else {
            game.log('The townsfolk shower you with gold and items as you make your way through town.');
            game.receiveGold(10);
            loot(game);
            loot(game);
            loot(game);
            game.adjustAlignment(-1);
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
            game.log('Dark clouds roll in from the sea whipping up raging winds that carry one party member into the sky.');
            game.killPartyMembers(1);
            ++townState.bodiesInTheAir;
          } else {
            game.log('Dark clouds roll in from the sea whipping up raging winds nearly carrying someone away.');
          }
        },
      },
    ];

    // Completing a quest activates a quest event. Quests should use townState to "gate" the
    // party's progress (you must do one thing before you may do the next thing, a gate).
    // However, there should be some quests that can be repeated and have no gate.
    town.quests = [
      // Not very creative trash quest.
      {
        name: 'The Flavor of Saint Rumaa',
        weight: 1,
        action: (game: Game) => {
          const action = rollChoice([
            'herds', 'chases', 'hunts', 'rides', 'jousts', 'pets',
          ]);
          const what = rollChoice([
            'sea shells', 'sea horses', 'sea gulls', 'waves', 'polished rocks',
          ]);
          const who = rollChoice([
            'aspiring adventurers', 'Ferdinand and his wife',
            'Grand-rumaa Sweing Consortium', 'local trappers',
            'Cliff', 'the hermit',
          ]);
          game.log(`Your party ${ action } ${ what } with ${ who }.`);
          loot(game);
          game.receiveGold(rollRange(1, 10));
        }
      },
      {
        // Do 5 satisfactory arrangements of rocks to learn about the hermit and get access to a
        // new quest to find the Hermit's tresure on one of the islands.
        name: 'The Hermit\'s Rocks',
        weight: 1,
        predicate: (game: Game) => {
          // After 5 good designs, the hermit tells you about his treasure, ending this quest.
          return townState.questHermitRockGood < 5;
        },
        action: (game: Game) => {
          if (!townState.questHermitRockIntroduced) {
            game.log(
              'You come across a hermit living on the other side of the hills outside of town.'
              + ' The hermit is tending to his rock garden, but is struggling to make progress against the large stones.'
            );
            townState.questHermitRockIntroduced = true;
          }
          const roll = (rollDie(20)
            + mod(game.party.cha, [[0, 1], [8, 0]]) // Hermit likes you more if you have social problems.
            + mod(game.party.wis, [[0, 0], [12, 1]]) // Common sense leads to a better design.
            + (game.party.str < 11 ? ( // Being weak makes this task quite difficult...
                game.party.int < 12 ? -2 : 0 // Unless you are smart enough.
              ) : 0)
          );
          if (roll <= 2) {
            game.log('Your party volunteers to help the hermit move the rocks and one of your party members is crushed to death by a rolling boulder.');
            game.killPartyMembers(1);
          } else {
            if (game.party.str <= 13) {
              game.log('Your party volunteers to help the hermit move the rocks and your party struggles to arrange them.');
            } else {
              game.log('Your party volunteers to help the hermit move the rocks and your party arranges them with some effort.');
            }
            if (roll >= 12) {
              let saying = 'ERR';
              switch (++townState.questHermitRockGood) {
                case 1: saying = 'Yes, yes. This was what I was going for.'; break;
                case 2: saying = 'I was already tired of your last arrangement, but this is fine.'; break;
                case 3: saying = 'Say, are there fewer of you this time? This is design is quite refreshing.'; break;
                case 4: saying = 'This place is really starting to come together.'; break;
                case 5: saying = 'This is perfection!'; break;
              }
              game.log('The hermit is satisfied with the new design, "' + saying + '"');
              game.receiveGold(5);
              loot(game);
              if (townState.questHermitRockGood >= 5) {
                // A chachech is a type of local fish with legs that can walk on land.
                game.log('The hermit continues, "I\'ll tell you about a place I used to call home. It was on Chachech Island, but those damned fish have taken over the entire place. When I fled, all of my posessions were left behind, save for the clothes on my back and my family\'s crest. Here, see how the pattern accents the design of the rock garden? You\'ve helped an old man lift his spirits. I don\'t have much, but please take this gold as thanks."');
                game.receiveGold(15);
                game.log('Perhaps there is something useful on Chachech Island.');
                townState.questHermitTreasureAvailable = true;
              }
            } else {
              game.log('The hermit is less than satisfied with the new design.');
              lootTrash(game);
            }
          }
        },
      },
      {
        // Help the local children find shells to learn something about the town and the lives of
        // the young in it.
        name: 'Big Kids, Big Shells',
        weight: 1,
        predicate: (game: Game) => {
          return !townState.questKidShellFinished;
        },
        action: (game: Game) => {
          if (!townState.questKidShellIntroduced) {
            game.log(
              'Your party comes across a pair of youths scouring the white beach for big sea shells.'
              + ' The boy, noticing your party, hurridly turns toward and shouts to the girl, "Mariaaaa! It\'s those people! They came here!"'
            );
            townState.questKidShellIntroduced = true;
          }
          const r = rollDie(20) + mod(game.party.wis, [[0, -1], [6, 0]]); // Being unwise could lead you into the crab nest.
          if (r <= 2) {
            game.log('Your party searches the beach for shells with the youths, but a careless member disturbs a giant crab nest, leading to their death.');
            game.killPartyMembers(1);
          } else if (r <= 10) {
            game.log('Your party searches the beach for shells with the youths and finds nothing special.');
          } else {
            let kind = 'ERR';
            switch (rollDie(9)) {
              case 1: case 2: kind = 'really big'; break;
              case 3: case 4: kind = 'ornate looking'; break;
              case 5: case 6: kind = 'fist sized'; break;
              case 7: case 8: kind = 'hefty'; break;
              case 9: kind = 'monsterous'; break;
            }
            game.log('Your party searches the beach for shells with the youths and find a ' + kind + ' shell.');
            game.receiveGold(2);
            if (kind == 'monsterous') {
              game.log('Your party presents the monster shell to the youths. Maria exclaims "Holy smokes! Dad was right about the monster shell!" and James joins in "Woaah! Look at that!"');
              game.log('Maria approaches your party excitedly, "My mom gave me this, but you can have it."');
              loot(game);
              loot(game);
              loot(game);
              game.receiveGold(15);
              townState.questKidShellFinished = true;
            } else {
              if (townState.questKidShellTalk < 5) {
                let sayer = 'ERR';
                let saying = 'ERR';
                switch (++townState.questKidShellTalk) {
                  case 1: sayer = 'Maria'; saying = 'James can run really fast and he always finds the good shells! Yours is pretty good though!'; break;
                  case 2: sayer = 'James'; saying = 'Maria really appreciates it when I play with her since her dad died.'; break;
                  case 3: sayer = 'Maria'; saying = 'James is always in trouble with his parents! My mom say\'s I\'m the most well behaved daughter anyone has ever had!'; break;
                  case 4: sayer = 'James'; saying = 'My parents are really hard on me, but I\'m the only friend Maria has so I sneak away from home sometimes to play.'; break;
                  case 5: sayer = 'Maria'; saying = 'My dad said there was a ginormous shell somewhere on this beach!'; break;
                }
                game.log(sayer + ' says "' + saying + '"');
              }
            }
          }
        },
      },
      {
        // Scale the cliffs to find out about "Cliff" and redeem him from a life of menial work.
        name: 'A Cliff Is a Terrible Thing to Waste',
        weight: 1,
        predicate: (game: Game) => {
          return !townState.questCliffsCliffFinished;
        },
        action: (game: Game) => {
          if (!townState.questCliffsCliffIntroduced) {
            game.log('Along the well traveled road leading east out of town along the coast, the land rises giving way to shear cliffs with gentle waves crashing along their bottom. A man stands precariously at the edge, desperately looking for something, muttering to himself "Or was it about here?"');
            game.log('As your party approaches he waves you down, "You wouldn\'t mind helping ol\' Cliff by climbing down there and taking a peek into the inlet, would you?"');
            townState.questCliffsCliffIntroduced = true;
          }
          const roll = (rollDie(20)
            + mod(game.party.str, [[0, -2], [5, -1], [9, 0]]) // Might be too weak to climb well
            + mod(game.party.dex, [[0, -2], [5, -1], [9, 0]]) // Nagivaging the cliffs is dangerous without dex.
            + mod(game.party.int, [[0, 0], [10, 1], [14, 2]]) // Being smart might help finding something useful.
            + (game.party.cha >= 13 && game.party.wis <= 7 ? -2 : 0) // On a dare, one might do something stupid.
          );
          if (roll <= 3) {
            game.log('Your party scales the cliffs to look for the inlet, but one member falls to their death.');
            game.killPartyMembers(1);
          } else if (roll <= 10) {
            game.log('Your party scales the cliffs to look for the inlet, but finds only sheer rock face.');
          } else if (roll <= 22) {
            if (townState.questCliffsCliffTalk < 5) {
              let saying = 'ERR';
              switch (++townState.questCliffsCliffTalk) {
                case 1: saying = 'Maybe it was just a little farther down.'; break;
                case 2: saying = 'Or was it over there?'; break;
                case 3: saying = 'When I was fishing I saw it about three quarters of the way up this cliff, or was it half way?'; break;
                case 4: saying = 'When we find the inlet, Hansen and his toadies won\'t have anything to pester me about anymore.'; break;
                case 5: saying = 'It has to be around here! I know I saw it! Why did I ever say anything... now...'; break;
              }
              game.log('Your party scales the cliffs to look for the inlet, but only finds a section large enough for one person. Cliff helps the last of your climbers back onto land "' + saying + '" He gives you something for your trouble.');
              loot(game);
              game.receiveGold(rollRange(2, 4));
            } else {
              game.log('Your party scales the cliffs to look for the inlet, but only finds a section large enough for one person. Cliff helps the last of your climbers back onto land with a somber look.');
              game.log('"Maybe they\'re right, maybe I didn\'t see the inlet. They think of me as a fool and tell me the only way a drunk like me can be welcome in Rumaa is if I patrol this road along the cliffs. Maybe I should just accept my place..." he trails off, stares for a while, and resumes speaking "Here, take this, I was saving it to buy a hoist to pull up whatever might have been inside, but, well, yeah."');
              game.receiveGold(rollRange(15, 25));
              townState.questCliffsCliffFinished = true;
              loot(game);
              loot(game);
            }
          } else {
            game.log('Your party scales the cliffs to look for the inlet, but disconvers some ancient runes that when spoken summons a light drawing one party member into the sky.');
            game.killPartyMembers(1);
            game.log('Cliff shouts from above, "God damn! Did you all just see that! I\'m getting out of here!"');
            townState.questCliffsCliffFinished = true;
            loot(game);
            loot(game);
            loot(game);
          }
        },
      },
    ];

    town.enemies = [
      {
        weight: 1,
        predicate: (game: Game) => {
          return true;
        },
        roll: (game: Game) => {
          // Scaly, slimy, and ready to fight.
          return {
            name: 'Surly Chachech',
            health: 25,
            str: 8,  int: 5,
            dex: 11, wis: 7,
            con: 7,  cha: 2,
            weapon: {
              physical: 8,
              magical: 0,
              elemental: 4,
            },
            armor: {
              physical: -1,
              magical: -1,
              elemental: 0,
            },
            state: {},
            events: [
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(8, 12));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => {
          return true;
        },
        roll: (game: Game) => {
          return {
            name: 'Sea Spirit',
            health: 18,
            str: 3,  int: 8,
            dex: 5,  wis: 3,
            con: 11, cha: 4,
            weapon: {
              physical: 0,
              magical: -13,
              elemental: 0,
            },
            armor: {
              physical: 1,
              magical: -1,
              elemental: 0,
            },
            state: {},
            events: [
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(10, 15));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => {
          return true;
        },
        roll: (game: Game) => {
          return {
            name: 'Reticent Crab',
            health: 22,
            str: 11, int: 7,
            dex: 8,  wis: 4,
            con: 15, cha: 11,
            weapon: {
              physical: 20,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: 2,
              magical: 0,
              elemental: 1,
            },
            state: {},
            events: [
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(12, 14));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => {
          return true;
        },
        roll: (game: Game) => {
          return {
            name: 'Fleeting Spark',
            health: 28,
            str: 3,  int: 10,
            dex: 14, wis: 2,
            con: 3,  cha: 18,
            weapon: {
              physical: 2,
              magical: 0,
              elemental: -15,
            },
            armor: {
              physical: 0,
              magical: 0,
              elemental: 0,
            },
            state: {},
            events: [
            ],
            win: (game: Game) => {
              game.receiveGold(rollRange(12, 14));
              loot(game);
            },
          };
        },
      },
      {
        weight: 1,
        predicate: (game: Game) => {
          return game.town.townsfolk > 0 && game.town.alignment < -60;
        },
        roll: (game: Game) => {
          return {
            name: 'Irate Townsfolk',
            health: 30,
            str: 12, int: 8,
            dex: 9,  wis: 7,
            con: 13, cha: 10 + rollDie(4),
            weapon: {
              physical: (rollBoolean() ? 1 : -1) * 17,
              magical: 0,
              elemental: 0,
            },
            armor: {
              physical: 2,
              magical: 0,
              elemental: 1,
            },
            state: {},
            events: [
            ],
            win: (game: Game) => {
              game.killTownsfolk(1);
              game.receiveGold(30);
              loot(game);
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
            inStaringContest: false,
            wonStaringContest: false,
          };

          return {
            name: 'Octopod',
            health: 500,
            str: 17, int: 7,
            dex: 13, wis: 8,
            con:  9, cha: 6,
            weapon: {
              physical: -12,
              magical: 0,
              elemental: 8,
            },
            armor: {
              physical: -12,
              magical: 0,
              elemental: 8,
            },
            state,
            events: [
              {
                name: 'Staring Contest',
                weight: 1,
                predicate: (game: Game) => {
                  return !state.inStaringContest && !state.wonStaringContest;
                },
                action: (game: Game) => {
                  state.inStaringContest = true;
                  game.log('Octopod becomes still as it gazes over your party...');
                },
              },
              {
                name: 'Lose Staring Contest',
                weight: 1,
                predicate: (game: Game) => {
                  return state.inStaringContest;
                },
                action: (game: Game) => {
                  state.inStaringContest = false;
                  game.log('Octopod blinks!');
                },
              },
              {
                name: 'Win Staring Contest',
                weight: 1,
                predicate: (game: Game) => {
                  return state.inStaringContest;
                },
                action: (game: Game) => {
                  state.inStaringContest = false;
                  state.wonStaringContest = true;
                  game.log('Octopod squirms with delight!');
                },
              },
              {
                name: 'Tentacle Swipe',
                weight: 1,
                predicate: (game: Game) => {
                  return state.wonStaringContest;
                },
                action: (game: Game) => {
                  state.wonStaringContest = false;
                  game.log('A member of your party disappears under Octopod\'s tentacle.');
                  game.killPartyMembers(1);
                },
              },
            ],
            win: (game: Game) => {
              game.receiveGold(300);
            },
          };
        },
      },
    ];

    return town;
  },
});
