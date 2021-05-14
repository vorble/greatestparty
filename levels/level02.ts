game.registerLevel({
  level: 2,
  newTown: (game: Game) => {
    const town = new Town();
    const boss = new Boss();

    town.name = 'Magma Town';
    town.townsfolk = 200;
    town.hireCost = 200;
    town.conscriptRatio = 0.4;
    town.conscriptViolenceRatio = 0.5;
    town.foodStock = 150;
    town.foodSupport = [3, 4, 3, 1];
    town.foodCostBuy = [3, 3, 4, 6];
    town.foodCostSell = [1, 1, 1, 4];
    town.waterStock = 150;
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
    town.needMax = 20;
    town.needRatio = 0.010;
    town.boss = 4000;
    town.bossReward = 350;


    function loot(game: Game) {
      if (rollRatio() <= 0.4) {
        const typ = rollChoice(['weapon', 'armor']);
        const fine = rollChoice(EQ_FINE_CATEGORIES);
        const inv = typ == 'weapon' ? game.party.inventoryWeapon : game.party.inventoryArmor;
        inv[fine] += 1;
        game.log('You loot 1 ' + fine + ' ' + typ + '.');
      }
    }

    function linearMod(number: number) {
      return mod(number, [[0,-5],[2,-4],[4,-3],[6,-2],[8,-1],[10,0],[12,1],[14,2],[16,3],[18,4],[20,5]]);
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
        name: "A Faux Pas",
        weight: 3,
        predicate: (game: Game) => {
          return !game.party.status.angeredGods.active
        },
        action: (game: Game) => {
          // Being charasmatic helps you avoid making a faux pas at a local ceremony.
          const r = rollDie(20) + mod(game.party.cha, [[0, -1], [5, 0], [14, 1]]);
          if (r <= 4) {
            game.party.status.angeredGods.active = true;
            setStatusExpiry(game, game.party.status.angeredGods, { term: 75 });
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
        predicate: (game: Game) => {
          return game.party.status.angeredGods.active;
        },
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
        name: 'Digging lava irrigation',
        weight: 5,
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
        name: 'Farm Aid',
        weight: 5,
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
          if ( rollDie(20) + linearMod(game.party.int) <= 15 ) {       //Being smart helps you trap the outlaws
            game.log('Your party tries to ambush the outlaws, but the outlaws escape and regroup.');
                                                                       //You must be strong and dexterous
                                                                       //to defeat the outlaws in a brawl
            if ( rollDie(20) + linearMod(game.party.str) <= 10 && rollDie(20) + linearMod(game.party.dex) <= 10 ) {
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
            if ( rollDie(20) + linearMod(game.party.str) <= 6 ) {       //theres still a chance they could over power you
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

    const bossState = new (class BossStateWrapper {
      get chargingAttack(): boolean { return game.boss.state.flags[1]; }
      set chargingAttack(value: boolean) { game.boss.state.flags[1] = value; }
      get attackCharged(): boolean { return game.boss.state.flags[2]; }
      set attackCharged(value: boolean) { game.boss.state.flags[2] = value; }
    });

    boss.name = 'Magma Elemental';
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
        name: 'Charging attack',
        weight: 1,
        predicate: (game: Game) => {
          return !bossState.chargingAttack && !bossState.attackCharged;
        },
        action: (game: Game) => {
          bossState.chargingAttack = true;
          game.log('Magma elemental starts to glow with a red hot intensity and holds its hands over its head.');
        },
      },
      {
        name: 'Finished Charging',
        weight: 10,
        predicate: (game: Game) => {
          return bossState.chargingAttack;
        },
        action: (game: Game) => {
          bossState.chargingAttack = false;
          bossState.attackCharged = true;
          game.log('Magma flows from the magma elemental\'s hands into a ball over its head.');
        },
      },
      {
        name: 'Kahmehamagma',
        weight: 10,
        predicate: (game: Game) => {
          return bossState.attackCharged;
        },
        action: (game: Game) => {
          bossState.attackCharged = false;
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
    ];

    return { town, boss };
  },
});
