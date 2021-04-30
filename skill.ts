type SkillIdentifier = 'initiative' | 'inspire';
const SKILLS: Array<SkillIdentifier> = ['initiative', 'inspire'];

interface Skill extends ClockActions {
  level: number;

  name: string;
  levelMax: number;
  costTier: number;

  // TODO: Do I want an action for when the level goes up and down?
  doBuyActions?: (game: Game) => void;
}

class Skills {
  initiative: Skill;
  inspire: Skill;

  constructor() {
    const defaults = { level: 0 };

    this.initiative = {
      ...defaults,
      name: 'Initiative',
      levelMax: 9999,
      costTier: 1,
      doTickActions: (game: Game) => {
        // Party members show initiative and will pick up quests on their own periodically.
        // TODO: How will this handle really high levels where multiple quests should be
        //       taken per tick?
        if (rollRatio() < 0.01 * this.initiative.level) {
          if (game.town.need > 0) {
            if (FLAGS.DEBUG.SKILL.INITIATIVE) {
              game.log('Initiative tried to take a quest.');
            }
            game.takeQuest();
          }
        }
      },
    };

    this.inspire = {
      ...defaults,
      name: 'Inspire',
      levelMax: 9999,
      costTier: 2,
      doTickActions: (game: Game) => {
        const bonus = calcmod(game.party.cha, [[0, 0.000], [16, 0.001]]);
        if (rollRatio() < (0.005 + bonus) * this.inspire.level) {
          if (game.town.townsfolk > 0) {
            if (FLAGS.DEBUG.SKILL.INSPIRE) {
              game.log('Your party inspires some from the town to join.');
            }
            const count = Math.max(1, Math.floor(game.town.townsfolk * 0.01));
            game.joinPartyFromTown(count);
          }
        }
      }
    };
  }
}
