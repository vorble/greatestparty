game.registerLevel({
  level: 2,
  newTown: (game: Game) => {
    const town = new Town();

    const DESERT_KNOWLEDGE_MASTER = TICKS_PER_TOCK * TOCKS_PER_TERM * TERMS_PER_SEASON; // 1 season.

    const FOOD_SUPPORT_NORMAL: TownSeasonVector = [25, 30, 40, 15];
    const FOOD_SUPPORT_DESERT: TownSeasonVector = [1, 0, 0, 1];

    const WATER_SUPPORT_NORMAL: TownSeasonVector = [30, 15, 20, 20];
    const WATER_SUPPORT_DESERT: TownSeasonVector = [1, 0, 0, 1];

    const BRANCHES = [
      'twisting switch',
      'bent limb',
      'bushy leafage',
      'deep grooved root',
      'protruding knot',
    ];
    rollShuffle(BRANCHES); // first 3 are the right combo.

    town.name = 'Spindling Plains';
    town.townsfolk = 450;
    town.hireCost = 100;
    town.conscriptRatio = 0.5;
    town.conscriptViolenceRatio = 0.4;
    town.foodStock = 250;
    town.foodSupport = FOOD_SUPPORT_NORMAL;
    town.foodCostBuy = [4, 4, 2, 5];
    town.foodCostSell = [2, 2, 1, 4];
    town.waterStock = 150;
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
    town.needRatio = 0.024;
    town.enemyRatio = 0.08; // TODO: In flux.

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
        + modLinear(game.party.wis, 10) // Need moderate wisdom to know to be careful.
      );
      if (r <= 8) {
        goToDesert(game);
      }
    }

    function goToDesert(game: Game) {
      if (!townState.partyInDesert) {
        game.log('Your party finds itself lost on wind-swept red sands of the Verees Desert.');
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

      crispin1Introduced: false,
      crispin1Gossip: 0,
      crispin1Done: false,

      crispin2Introduced: false,
      crispin2Hauling: 0,
      crispin2WoodDelivered: 0,
      crispin2Done: false,

      dixieIntroduced: false,
      dixieGossip: 0,
      dixieDone: false,

      doxIntroduced: false,
      doxMeatDelivered: 0,
      doxDone: false,

      duke1CluesFound: 0,
      duke1Done: false,

      wixIntroduced: false,
      wixDone: false,

      vereesIntroduced: false,
      vereesActivity: 0,
      vereesDone: false,
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
      {
        name: 'Strange Disappearance',
        weight: 1,
        predicate: (game: Game) => game.town.townsfolk > 0,
        action: (game: Game) => {
          if (rollRatio() < 0.35) {
            if (townState.duke1Done) {
              game.log('Someone from town is abducted and forced to join Duke Wolvren\'s undead army.');
            } else {
              game.log('Someone from town has gone missing.');
            }
            game.town.townsfolk -= 1;
          }
        },
      },
      // TODO: If town alignment is low, screw with party
    ];

    town.quests = [
      {
        name: 'Study the Verees Desert',
        weight: 1,
        predicate: (game: Game) => townState.partyInDesert,
        action: (game: Game) => {
          gainDesertKnowledge(2);
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
      {
        name: 'Crispin, Wooden Merchant',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && !townState.crispin1Done,
        action: (game: Game) => {
          if (!townState.crispin1Introduced) {
            game.log('As your party makes its way through the wide and well trodden streets of Spindling,'
              + ' they come across a man venting his frustrations while holding several small bits of finely laquered wood.'
              + ' the man takes notice of your precession and waves you down.'
              + ' "Could you lend me your backs for a while? Maybe pick up a few of the bigger pieces?"');
            townState.crispin1Introduced = true;
          }
          const r = (rollDie(20)
            + modLinear(game.party.str, 12) // Should be pretty strong to move this furniture.
            + modLinear(game.party.cha, 10) // Maybe easier to strike up a conversation.
          );
          if (r <= 3) {
            game.log('Your party helps the man collect his wooden wares strewn about the street, but a heavy chest of drawers falls on one party member, flattening them.');
            game.killPartyMembers(1);
          } else if (r <= 10) { // There should always be a chance to progress the story, so base progress on the raw roll
            game.log('Your party helps the man collect his wooden wares strewn about the street.');
          } else {
            let saying = 'ERR';
            switch (++townState.crispin1Gossip) {
              case 1: saying = 'Brigands inside the town? I can hardly believe it.'; break;
              case 2: saying = 'There\'s been a rash of disappearances lately, did you know that? Why, Markle, just down the way ain\'t been seen in two weeks.'; break;
              case 3: saying = 'I saw Markle a couple weeks back at the Dixie and Dox for supper, normal as he ever was.'; break;
              case 4: saying = 'Maybe brigands took him, maybe he fell down a hole, I dunno. Nobody around here took Markle for the split the town type.'; break;
              case 5: saying = 'I\'d certainly pitch in some coin if you adventuring types found any word about what\'s been going on around here.'; break;
            }
            game.log('Your party helps the man collect his wooden wares strewn about the street, "' + saying + '"');
            if (townState.crispin1Gossip >= 5) {
              game.log('He continues, "Name\'s Crispin, I sell the finest wood you\'ll ever sit on or fill up. Each coin goes toward my dream of working with ever more exotic woods and refining my craft. My wares will be in the halls of kings, you wait and see!"');
              game.receiveGold(rollRange(65, 75));
              townState.crispin1Done = true;
            }
          }
        },
      },
      {
        name: 'Crispin, Visionary',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && townState.crispin1Done && !townState.crispin2Done,
        action: (game: Game) => {
          if (!townState.crispin2Introduced) {
            game.log('Crispin flags your party down, "Now that my wares are in order, I need more materials! You should check along the river, Sam\'s Torrent we call it, lots of trees grow out there."');
            townState.crispin2Introduced = true;
          }
          // Not hauling, go out to the river and chop a tree.
          // While hauling, head back to town and hope to avoid calamity.
          if (townState.crispin2Hauling <= 0) {
            const descriptor = rollChoice([
              'ancient', 'burly', 'tall', 'straight',
              'magnificient', 'monsterous',
            ]);
            const article = descriptor[0] == 'a' ? 'an' : 'a';
            const tree = rollChoice([
              'helmwood tree', 'ridgelrod tree', 'three-eyed willow tree',
              'duskmire tree', 'sporrel tree',
            ]);
            const r = (rollDie(20)
              + modLinear(game.party.str, 12)
              + modLinear(game.party.wis, 10)
            );
            if (r <= 4) {
              game.log(`Your party finds ${ article } ${ descriptor } ${ tree } and chops it down, but it falls onto one party member, killing them.`);
              game.killPartyMembers(1);
            } else {
              game.log(`Your party finds ${ article } ${ descriptor } ${ tree } and chops it down.`);
              townState.crispin2Hauling = rollRange(3, 6);
            }
          } else {
            const r = (rollDie(20)
              + modLinear(game.party.str, 10)
              + modLinear(game.party.int, 12)
            );
            if (r <= 4) {
              game.log(`Your party struggles to haul the wood to town and an insecure log falls onto one party member, killing them.`);
              game.killPartyMembers(1);
            } else {
              game.log(`Your party struggles to haul the wood to town.`);
              --townState.crispin2Hauling;
              if (townState.crispin2Hauling == 0) {
                let saying = 'ERR';
                switch (++townState.crispin2WoodDelivered) {
                  case 1: saying = 'This is a fine specimine! I know just what to do with it!'; break;
                  case 2: saying = 'Just imagine how ornate this would look with a nice dark stain, it would really bring the grain to life.'; break;
                  case 3: saying = 'Wow! I never thought I\'d get my hands on some of this!'; break;
                }
                game.log(`Your party delivers the wood to Crispin, "${ saying }"`);
                game.receiveGold(rollRange(70, 85));
                loot(game);
              }
            }
          }
          if (townState.crispin2WoodDelivered == 3) {
            game.log(`Some unsavory types hurridly surround Crispin and your party. "Just come with us and it won\'t get ugly!" screeches one. Crispin, considering his next move says, "I won\'t go with you savages!"`);
            game.log(`The brutes press toward Crispin and your party, grabbing him and one of yours, carrying them away despite their protest.`);
            game.killPartyMembers(1);
            townState.crispin2Done = true;
          }
        },
      },
      {
        name: 'Dixie\'s New Flavor',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && !townState.dixieDone,
        action: (game: Game) => {
          if (!townState.dixieIntroduced) {
            game.log('Along a main artery through the town of Spindling, a crown is gathered around a local eatery.'
              + ' The proprietress deftfully orders the staff to serve the crowd.'
              + ' As the crown wanes, the proprietress approaches your party and says'
              + ' "These crowds will look puny compared to what I have cooked up for them next.'
              + ' I\'m Dixie and I\'m looking for exotic produce. Could you find some for me?"');
            townState.dixieIntroduced = true;
          }
          const scenario = rollChoice([
            {
              name: 'lance cucumber',
              prefix: 'Your party comes across a bramble of lance cucumber plants ',
              good: 'and your party harvests a bountiful load of them.',
              bad: 'and a member of your party gets impaled to death by the lances.',
            },
            {
              name: 'gazing rice',
              prefix: 'Your party wades through a patty of gazing rice ',
              good: 'and your party reaps and threshes several bushels.',
              bad: 'and a predator emerges from a suspicious patch, tackling and killing one party member.',
            },
            {
              name: 'razor pepper',
              prefix: 'Your party finds a few razor pepper plants ',
              good: 'and your party carefully harvests several.',
              bad: 'and a member of your party mishandles one, releasing some juice which cuts through their flesh fatally.',
            },
          ]);
          const r = (rollDie(20)
            + modLinear(game.party.wis, 12) // Being wise lets you know these are dangerous plants.
          );
          if (r <= 4) {
            game.log(scenario.prefix + scenario.bad);
            game.killPartyMembers(1);
          } else if (r <= 10) {
            game.log(scenario.prefix + scenario.good);
          } else {
            game.log(scenario.prefix + scenario.good);
            let saying = 'ERR';
            switch (++townState.dixieGossip) {
              case 1: saying = 'These are wonderful!'; break;
              case 2: saying = 'I can\'t believe you actually made it back!'; break;
              case 3: saying = 'You all have been to the desert, haven\'t you?'; break;
              case 4: saying = 'I\'ve never seen these so fresh! This is going to start a riot!'; break;
              case 5: saying = 'If you want more medicinal plants, you can find them on the outskirts of the desert.'; break;
            }
            game.log('Dixie waves your party down as you bring the haul, "' + saying + '"');
            if (townState.dixieGossip >= 5) {
              game.log('She continues, "I never imagined you would find all of these and so fresh. I have to give you this."');
              game.receiveGold(rollRange(76, 90));
              townState.dixieDone = true;
            }
          }
        },
      },
      {
        name: 'Dox\'s Top Taste',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && townState.dixieDone && !townState.doxDone,
        action: (game: Game) => {
          if (!townState.doxIntroduced) {
            game.log('As your party makes its way past the Dixie and Dox a new voice bursts out "Morning, lackeys!'
              + ' Saw what you got done for my sister Dixie--I\'m Dox by the way--think you can help me get one up on her?'
              + ' Oh yeah, it\'s dangerous, but I don\'t want to hear any whining. Find me some fresh game, will ya?"');
            townState.doxIntroduced = true;
          }
          const scenario = rollChoice([
            {
              name: 'hydra bison',
              prefix: 'Your party approaches a lone hydra bison who is left behind from the herd',
              good: ' and manages to corner and kill it, collecting meat from its great flank.',
              bad: ', but its three heads confuse a party member who gets trampled by the beast.',
              roll: () => rollDie(20) + modLinear(game.party.dex, 10),
            },
            {
              name: 'cleaver rabbit',
              prefix: 'Your party notices a cleaver rabbit grazing in the long grass of a meadow',
              good: ' and successfully sets a trap, catching the rabbit, from which two petit steaks are butchered.',
              bad: ', but this cleaver rabbit is infected, splits in half down its spine, and springs tentacles toward a party member which make contact causing their blood to seep through their skin.',
              roll: () => rollDie(20) + modLinear(game.party.int, 10),
            },
            {
              name: 'longmole',
              prefix: 'Your party explores the burrow of a longmole',
              good: ' and manage to corner and kill it collecting a long rack of ribs.',
              bad: ', but one party member falls to his death in a vertical shaft hidden in the darkness.',
              roll: () => rollDie(20) + modLinear(game.party.wis, 10),
            },
          ]);
          const r = scenario.roll();
          if (r <= 5) {
            game.log(`${ scenario.prefix }${ scenario.bad }`);
            game.killPartyMembers(1);
          } else {
            let saying = 'ERR';
            switch (++townState.doxMeatDelivered) {
              case 1: saying = 'Is your mouth watering? I know mine is!'; break;
              case 2: saying = 'Dixie can eat it, then eat some of this!'; break;
              case 3: saying = 'I\'ve got a special sauce for this slab of meat!'; break;
              case 4: saying = 'Who wants to eat vegetables anyway?'; break;
              case 5: saying = 'MORE MEAT!'; break;
              case 6: saying = 'If I take any more meat, it\'s going to spoil before I can serve it.'; break;
            }
            game.log(`${ scenario.prefix }${ scenario.good } "${ saying }"`);
          }
          if (townState.doxMeatDelivered >= 6) {
            game.log('While delivering the last of the meat, some unsavory types come upon Dixie, Dox, and your party.'
              + ' One with a callous gaze shouts "Just come with us and this won\'t get messy!"'
              + ' Dixie and Dox look to eachother, then to your party, but the brutes are too numerous to stop.'
              + ' They make off with both sisters and two members of your party.');
            game.killPartyMembers(2);
            townState.doxDone = true;
          }
        },
      },
      {
        name: 'Manual Labor',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && townState.crispin1Done,
        action: (game: Game) => {
          const act = rollChoice([
            () => {
              let r = (rollDie(20)
                + modLinear(game.party.wis, 12)
              );
              if (r <= 4) {
                game.log('Your party operates the machines at the local saw mill, but one of your party members gets caught in the gears and is crushed to death.');
                game.killPartyMembers(1);
              } else {
                game.log('Your party operates the machiens at the local saw mill.');
                game.receiveGold(rollRange(10, 20));
                loot(game);
              }
            },
            () => {
              let r = (rollDie(20)
                + modLinear(game.party.str, 12)
                + modLinear(game.party.con, 10)
              );
              if (r <= 4) {
                game.log('Your party swings sledges at the local quarry, but a loose stone falls onto one party member, flattening them to death.');
                game.killPartyMembers(1);
              } else {
                game.log('Your party swings sledges at the local quarry.');
                game.receiveGold(rollRange(10, 20));
                loot(game);
              }
            },
            () => {
              let r = (rollDie(20)
                + modLinear(game.party.cha, 14) // Be a sweet talker to get a less dangerous job
              );
              if (r <= 4) {
                game.log('Your party helps pull weeds in a local field, but a nest of killer hornets is disturbed killing one party member.');
                game.killPartyMembers(1);
              } else {
                game.log('Your party helps pull weeds in a local field.');
                game.receiveGold(rollRange(10, 20));
                loot(game);
              }
            },
          ]);
          act();
        },
      },
      {
        name: 'Searching the Desert',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && townState.dixieDone,
        action: (game: Game) => {
          const act = rollChoice([
            () => {
              let r = (rollDie(20)
                + modLinear(game.party.con, 12) // It's in the desert.
                + modLinear(game.party.int, 10) // Knowledge of spider hives helps avoid them.
              );
              if (r <= 4) {
                game.log('Your party searches the outskirts of the Verees Desert for mirror stones, but a hive of spiders drain one members blood completely, killing them.');
                game.killPartyMembers(1);
              } else {
                game.log('Your party searches the outskirts of the Verees Desert for mirror stones.');
                game.receiveGold(rollRange(10, 20));
                loot(game);
              }
            },
            () => {
              let r = (rollDie(20)
                + modLinear(game.party.str, 10)
                + modLinear(game.party.dex, 10)
              );
              if (r <= 4) {
                game.log('Your party searches the outskirts of the Verees Desert for giant lizard tails, but one tail was still attached to the lizard which maims one party member to death.');
                game.killPartyMembers(1);
              } else {
                game.log('Your party searches the outskirts of the Verees Desert for giant lizard tails.');
                game.receiveGold(rollRange(10, 20));
                loot(game);
              }
            },
            () => {
              let r = (rollDie(20)
                + modLinear(game.party.wis, 12) // Being wise lets you more intuitively find the cactuses, handle them.
                + modLinear(game.party.cha, 12) // Sweet talk some locals into giving tips for where to find the cactus.
              );
              if (r <= 4) {
                game.log('Your party searches the outskirts of the Verees Desert for medicinal cacti, but upon picking one up, the needles puncture one party member\'s skin, paralyzing them and they quickly suffocate.');
                game.killPartyMembers(1);
              } else {
                game.log('Your party searches the outskirts of the Verees Desert for medicinal cacti.');
                game.receiveGold(rollRange(10, 20));
                loot(game);
              }
            },
          ]);
          act();
          maybeGoToDesert(game);
        },
      },
      {
        name: 'All The Duke\'s Men',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && townState.doxDone && townState.crispin2Done && !townState.duke1Done,
        action: (game: Game) => {
          const scenario = rollChoice([
            {
              roll: () => rollDie(20) + modLinear(game.party.str, 12),
              prefix: 'Your party tracks one of the ruffians who have been abducting the towlsfolk',
              bad: ', but they are too powerful and manage to kill one party member before escaping.',
              good: ', wrestle them to the ground, and manage to get some details in confession.',
            },
            {
              roll: () => rollDie(20) + modLinear(game.party.dex, 12),
              prefix: 'A member of your party challenges one of the ruffians to a duel',
              bad: ', but isn\'t quick enough with their sword and gets impaled.',
              good: ' and outperforms them thoroughly, so the ruffian is honor bound to give you some details.',
            },
            {
              roll: () => rollDie(20) + modLinear(game.party.con, 12),
              prefix: 'Your party challenges one of the ruffians to a drinking contest',
              bad: ', but a passed out party member aspirates and dies.',
              good: ' and your party holds its own until the ruffian\'s mouth starts giving details.',
            },
            {
              roll: () => rollDie(20) + modLinear(game.party.int, 12),
              prefix: 'Your party watches the ruffians\'s movements from afar',
              bad: ', but a member of your party is spotted while moving between cover, gets captured, and taken away.',
              good: ' and your party notices their movements eastward out of town.',
            },
            {
              roll: () => rollDie(20) + modLinear(game.party.wis, 12),
              prefix: 'Your party appeals to the local magistrate to look into the abductions',
              bad: ', but a member of your party is identified as being a longstanding thief and is taken into custody instead.',
              good: ' and they order any information on the ruffians be shared.',
            },
            {
              roll: () => rollDie(20) + modLinear(game.party.cha, 12),
              prefix: 'Your party approaches the ruffians to parley',
              bad: ', but one party members inability to use words good leads to his tongue being cut out and they die.',
              good: ' and everyone involved has a good laugh and your party leaves with several clues.',
            },
          ]);
          const r = scenario.roll();
          if (r <= 10) {
            game.log(scenario.prefix + scenario.bad);
            game.killPartyMembers(1);
          } else {
            let clue = 'ERR';
            switch (++townState.duke1CluesFound) {
              case 1: clue = 'Clue: The ruffians take their captives eastward out of town.'; break;
              case 2: clue = 'Clue: The ruffians are being paid by someone.'; break;
              case 4: clue = 'Clue: The ruffians show signs that they camp in some place muddy.'; break;
              case 3: clue = 'Clue: The ruffians use old, damaged, but formerly fine weaponry and armor.'; break;
              case 5: clue = 'Clue: The ruffians are camped near Sam\'s Torrent.'; break;
            }
            game.log(clue);
          }
          if (townState.duke1CluesFound >= 5) {
            game.log('Your party approaches Sam\'s Torrent and notice the ruffian\'s encampment. However, it is covered in royal standard of Duke Wolvren, giving your party enough pause to avoid rushing into the camp.');
            game.log('Your party observes a dark, bloody ritual performed on an abducted townsfolk. The corpse picks itself back up slowly and trudges untiring, doing menial tasks around the camp.');
            game.log('Your party arrives back in Spindling to deliver the news when an elder speaks up, "Dark magic is not unheard of in these parts, but few of us have seen it in our lifetimes.'
              + ' Wrigley was a holy cleric who fought against such magic with a blessed maul and cloak.'
              + ' Find the relics hidden long ago and put an end to the duke\'s madness!"');
            game.receiveGold(rollRange(100, 150));
            loot(game);
            loot(game);
            loot(game);
            townState.duke1Done = true;
          }
        },
      },
      {
        name: 'Wix Waypoint',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && townState.duke1Done && !townState.wixDone,
        action: (game: Game) => {
          if (!townState.wixIntroduced) {
            game.log('Your party comes across an increasingly thick grove of trees dotted in the center with one ancient, towering tree. Wix Waypoint, house of Wrigley\'s Blessed Maul.');
            townState.wixIntroduced = true;
          }
          if (game.party.size < 3) {
            game.log('Your party stares puzzingly at the tree.');
            return;
          }
          const rolls = [];
          while (rolls.length < 3) {
            const r = rollInt(BRANCHES.length);
            if (rolls.indexOf(r) < 0) {
              rolls.push(r);
            }
          }
          const prefix = `Three members of your party grab the ${ BRANCHES[rolls[0]] }, the ${ BRANCHES[rolls[1]] }, and the ${ BRANCHES[rolls[2]] }.`;
          rolls.sort();
          if (rolls[0] == 0 && rolls[1] == 1 && rolls[2] == 2) {
            game.log(prefix + ' The trunk of the tree opens up, revealing Wrigley\'s Blessed Maul.');
            game.receiveGold(rollRange(100, 120));
            loot(game);
            loot(game);
            loot(game);
            townState.wixDone = true;
          } else {
            game.log(prefix + ' The skin of each agonizingly turns to wood and they fall off of the tree.');
            game.killPartyMembers(3);
          }
        },
      },
      {
        name: 'Verees Desert',
        weight: 1,
        predicate: (game: Game) => !townState.partyInDesert && townState.duke1Done && !townState.vereesDone,
        action: (game: Game) => {
          if (!townState.vereesIntroduced) {
            game.log('Your party arrives at the red sands of the Verees Desert and comes across an old battlement. It is said to hold Wrigley\'s Blessed Cloak.');
            townState.vereesIntroduced = true;
          }
          const ACTIVITIES = [
            {
              text: 'searching for the trigger switch',
              success: 'presses it, unlocking a hole in the wall',
            },
            {
              text: 'trying combinations on the puzzle wall',
              success: 'finds the solution, disarming the traps in the floor',
            },
            {
              text: 'raising and lowering scaffolding',
              success: 'creates a path along the moving wall allowing your party to proceed',
            },
            {
              text: 'climbing through the duct system',
              success: 'finds the other side of the door and unlocks it',
            },
            {
              text: 'prying at the majestic chest',
              success: 'opens it to reveal Wrigley\'s Blessed Cloak',
            },
          ];
          const activity = ACTIVITIES[townState.vereesActivity];
          const r = rollDie(20);
          if (r <= 16) {
            game.log('A member of your party is frozen in place and slowly turns to red sand while ' + activity.text + '.');
            game.killPartyMembers(1);
          } else {
            game.log('A member of your party is ' + activity.text + ' and ' + activity.success + '.');
            ++townState.vereesActivity;
          }
          if (townState.vereesActivity >= ACTIVITIES.length) {
            game.receiveGold(rollRange(100, 120));
            loot(game);
            loot(game);
            loot(game);
            townState.vereesDone = true;
          } else {
            maybeGoToDesert(game);
          }
        },
      },
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
                  ]));
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
            // TODO: Should the left/rightness be based on the party's perspective or the eyes'?
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
      {
        weight: 1,
        roll: (game: Game) => {
          const state = {
          };

          return {
            // Crowe and the Necromagicked Megaworm
            name: 'Crowe and the Necromagicked Megaworm',
            health: 6000,
            // Stats are for Crowe
            str: 10, int: 18,
            dex:  9, wis: 16,
            con: 11, cha: 12,
            weapon: {
              physical: 0,
              magical: -75,
              elemental: 30,
            },
            armor: {
              physical: 40,
              magical: 20,
              elemental: -10,
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
              game.receiveGold(900);
            },
          };
        },
      },
    ];

    return town;
  },
});
