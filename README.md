# Greatest Party

Build your party, embark on quests, experience misadventure, and fight powerful
foes to prove that your party is the greatest party.

## Player Guide

Greatest Party embraces the idea that losing the game can still be a fun
experience. Playtime is intended to be about 1.5 hours for a victory. The
general flow of the game is as follows:

* Press "Take Quest" to take a quest.
* Complete quests to unlock new skills.
* Buy skills to give your party an advantage.
* Fight the boss when you think you're ready.
* Beat the boss to proceed to the next level.

#### Tips

* Be sure to equip weapons and armor.
* Be sure to keep food and water in stock.

### Weapons and Armor

Weapons and armor are equipped by allocating points in the weapon and armor
grids. Your party begins with three points that may be allocated in each of the
weapon and armor grids.

Weapons and armor have three broad damage categories:

* Physical
* Magical
* Elemental

Each category has two mutually exclusive, complementary damage types:

* Blunt vs. Slice
* Dark vs. Light
* Fire vs. Ice

Each point assigned in the weapon and armor grids allocates an equipment power
equal to about one third of your party size. Increase your party size to further
increase equipment power.

### Skills

* Initiative - Your party automatically takes quests.
* Inspire - Townsfolk join your party.
* Sacrifice - Sacrifice members of your party to acquire blood (for Animate).
* Conscript - Allow townsfolk to be forcibly added to your party.
* Animate - Reanimate a party member from acquired blood.
* Sabotage - Create additional need for quests in town by sabotaging the town.
* Acclaim - Your acclaim as a party creates additional need for quests in town.
* Rationing - Your party has reduced need for food and water.

### Clock and Calendar

The game clock and calendar is split into time units:

* Tick - 20 ticks per tock, lasts around a quarter second for the player.
* Tock - 20 tocks per term.
* Term - 25 terms per season.
* Season - 4 seasons per year (spring, summer, fall, winter).
* Year - Lasts around three hours for the player.

Example date: Winter 332 (Yurn 14:01:08).

* Winter - The current season.
* 332 - The current year.
* Yurn - The astrological sign for the year.
* 14:01:08 - The current term, tock, and tick.

#### Signs

The year determines the astrological sign:

* Err
* Goh
* Yurn
* Joyn
* Ryna
* Sil

Depending on the astrological sign, different events may happen to your party.

## Developer Guide

To build the game:

* Install NodeJS 14 or later.
* Install TypeScript 4 or later. `npm install --global typescript`.
* Install GNU Make.
* Build this project by running `make`, this will create the directory `build/`.
* Run the game by opening `build/index.html`
