const _getElementByIdHistory = new Set<string>();

function getElementById(id: string) {
  if (_getElementByIdHistory.has(id)) {
    throw new Error('Element ' + id + ' already found. Please only grab elements once.');
  }
  const element = document.getElementById(id);
  if (!element) {
    throw new Error('Element ' + id + ' not found.');
  }
  _getElementByIdHistory.add(id);
  return element;
}

function getElementByIdAsType<T extends HTMLElement>(id: string, clazz: { new(): T }): T {
  const element = getElementById(id);
  if (!(element instanceof clazz)) {
    throw new Error('Element ' + id + ' is not a ' + clazz.prototype.constructor.name + '.');
  }
  return element;
}

function _cap(text: string): string {
  return text.length == 0 ? text : text[0].toUpperCase() + text.slice(1);
}

class UIParty {
  game: Game;

  date: HTMLElement;
  size: HTMLElement;
  health: HTMLElement;
  quests: HTMLElement;
  questsCompleted: HTMLElement;
  gold: HTMLElement;
  blood: HTMLElement;
  food: HTMLElement;
  water: HTMLElement;

  str: HTMLElement;
  dex: HTMLElement;
  con: HTMLElement;
  int: HTMLElement;
  wis: HTMLElement;
  cha: HTMLElement;

  status: HTMLElement;

  sacrificeButton: HTMLButtonElement;
  animateButton: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;

    this.date = getElementById('panel-party-date-value');
    this.size = getElementById('panel-party-size-value');
    this.health = getElementById('panel-party-health-value');
    this.quests = getElementById('panel-party-quests-value');
    this.questsCompleted = getElementById('panel-party-quests-completed-value');
    this.gold = getElementById('panel-party-gold-value');
    this.blood = getElementById('panel-party-blood-value');
    this.food = getElementById('panel-party-food-value');
    this.water = getElementById('panel-party-water-value');

    this.str = getElementById('panel-party-str-value');
    this.dex = getElementById('panel-party-dex-value');
    this.con = getElementById('panel-party-con-value');
    this.int = getElementById('panel-party-int-value');
    this.wis = getElementById('panel-party-wis-value');
    this.cha = getElementById('panel-party-cha-value');

    this.status = getElementById('panel-party-status-value');

    this.sacrificeButton = getElementByIdAsType('panel-party-sacrifice-button', HTMLButtonElement);
    this.sacrificeButton.onclick = (e) => {
      game.sacrifice();
    };
    this.animateButton = getElementByIdAsType('panel-party-animate-button', HTMLButtonElement);
    this.animateButton.onclick = (e) => {
      game.animate();
    };
  }

  show() {
    const game = this.game;

    {
      let text = _cap(SEASONS[game.season]);
      text += ' ' + game.year;
      if (FLAGS.SHOW_TICKS) {
        text += ` (${ SIGNS[clockToSign(game)] } ${ fmt02d(game.term) }:${ fmt02d(game.tock) }:${ fmt02d(game.tick) })`;
      }
      this.date.innerText = text;
    }

    this.size.innerText = '' + game.party.size;
    this.health.innerText = '' + game.party.health;
    this.quests.innerText = '' + game.party.quests;
    this.questsCompleted.innerText = '' + game.party.questsCompleted;
    this.gold.innerText = '' + game.party.gold;
    this.blood.innerText = '' + game.party.blood;
    this.food.innerText = '' + game.party.food;
    this.water.innerText = '' + game.party.water;
    if (FLAGS.SHOW_HUNGER_THIRST) {
      this.food.innerText += ' (' + game.party.hunger + ')';
      this.water.innerText += ' (' + game.party.thirst + ')';
    }

    this.str.innerText = '' + this.game.party.str;
    this.dex.innerText = '' + this.game.party.dex;
    this.con.innerText = '' + this.game.party.con;
    this.int.innerText = '' + this.game.party.int;
    this.wis.innerText = '' + this.game.party.wis;
    this.cha.innerText = '' + this.game.party.cha;

    const active: Array<string> = [];
    for (const status of STATUSES) {
      const s = this.game.party.status[status];
      if (s.active) {
        active.push(s.name);
      }
    }
    for (const status of this.game.party.status.other) {
      active.push(status.name);
    }
    this.status.innerText = active.join(', ');

    this.sacrificeButton.disabled = !game.canSacrifice();
    this.sacrificeButton.style.display = game.party.skills.sacrifice.level > 0 ? '' : 'none';
    this.animateButton.disabled = !game.canAnimate();
    this.animateButton.style.display = game.party.skills.animate.level > 0 ? '' : 'none';
  }
}

type UIEquipmentCheckboxes = [HTMLInputElement, HTMLInputElement, HTMLInputElement];
interface UIEquipmentType {
  blunt: UIEquipmentCheckboxes;
  slice: UIEquipmentCheckboxes;
  dark: UIEquipmentCheckboxes;
  light: UIEquipmentCheckboxes;
  fire: UIEquipmentCheckboxes;
  ice: UIEquipmentCheckboxes;
}

class UIEquipment {
  game: Game;

  weapon: HTMLElement;
  armor: HTMLElement;

  weaponConfig: UIEquipmentType;
  armorConfig: UIEquipmentType;

  constructor(game: Game) {
    this.game = game;

    this.weapon = getElementById('panel-equipment-weapon-value');
    this.armor = getElementById('panel-equipment-armor-value');

    this.weaponConfig = {
      blunt: [
        getElementByIdAsType('panel-equipment-weapon-blunt-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-blunt-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-blunt-3-checkbox', HTMLInputElement),
      ],
      slice: [
        getElementByIdAsType('panel-equipment-weapon-slice-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-slice-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-slice-3-checkbox', HTMLInputElement),
      ],
      dark: [
        getElementByIdAsType('panel-equipment-weapon-dark-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-dark-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-dark-3-checkbox', HTMLInputElement),
      ],
      light: [
        getElementByIdAsType('panel-equipment-weapon-light-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-light-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-light-3-checkbox', HTMLInputElement),
      ],
      fire: [
        getElementByIdAsType('panel-equipment-weapon-fire-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-fire-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-fire-3-checkbox', HTMLInputElement),
      ],
      ice: [
        getElementByIdAsType('panel-equipment-weapon-ice-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-ice-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-weapon-ice-3-checkbox', HTMLInputElement),
      ],
    };

    this.armorConfig = {
      blunt: [
        getElementByIdAsType('panel-equipment-armor-blunt-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-blunt-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-blunt-3-checkbox', HTMLInputElement),
      ],
      slice: [
        getElementByIdAsType('panel-equipment-armor-slice-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-slice-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-slice-3-checkbox', HTMLInputElement),
      ],
      dark: [
        getElementByIdAsType('panel-equipment-armor-dark-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-dark-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-dark-3-checkbox', HTMLInputElement),
      ],
      light: [
        getElementByIdAsType('panel-equipment-armor-light-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-light-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-light-3-checkbox', HTMLInputElement),
      ],
      fire: [
        getElementByIdAsType('panel-equipment-armor-fire-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-fire-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-fire-3-checkbox', HTMLInputElement),
      ],
      ice: [
        getElementByIdAsType('panel-equipment-armor-ice-1-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-ice-2-checkbox', HTMLInputElement),
        getElementByIdAsType('panel-equipment-armor-ice-3-checkbox', HTMLInputElement),
      ],
    };

    for (const fine of EQ_FINE_CATEGORIES) {
      for (let i = 0; i < 3; ++i) {
        this.weaponConfig[fine][i].checked = false;
        this.weaponConfig[fine][i].onclick = this.onChange.bind(this);
        // TODO: I'd like to have these in the HTML, but I don't want to type them there right now.
        this.weaponConfig[fine][i].setAttribute('data-type', 'weapon');
        this.weaponConfig[fine][i].setAttribute('data-fine', fine);
        this.weaponConfig[fine][i].setAttribute('data-number', '' + i);
        this.armorConfig[fine][i].checked = false;
        this.armorConfig[fine][i].onclick = this.onChange.bind(this);
        this.armorConfig[fine][i].setAttribute('data-type', 'armor');
        this.armorConfig[fine][i].setAttribute('data-fine', fine);
        this.armorConfig[fine][i].setAttribute('data-number', '' + i);
      }
    }
  }

  onChange(e: Event) {
    // e.target should be one of the check boxes.
    if (e.target instanceof HTMLInputElement && !e.target.disabled) {
      const num = parseInt(e.target.getAttribute('data-number') || '0');
      const fine = e.target.getAttribute('data-fine');
      const typ = e.target.getAttribute('data-type');
      if (typ != 'weapon' && typ != 'armor') {
        throw new Error('Invalid equipment type ' + JSON.stringify(typ) + '.');
      }
      if (fine == null) {
        throw new Error('Missing equipment fine category.');
      }
      // TODO: Couldn't do EQ_FINE_CATEGORIES.indexOf() to determine if is a fine category, had to expand all
      if (fine != 'blunt' && fine != 'slice' && fine != 'dark' && fine != 'light' && fine != 'fire' && fine != 'ice') {
        throw new Error('Invalid equipment fine category ' + JSON.stringify(fine) + '.');
      }
      const fineOpposite = { blunt: 'slice', slice: 'blunt', dark: 'light', light: 'dark', fire: 'ice', ice: 'fire' }[fine];
      if (fineOpposite != 'blunt' && fineOpposite != 'slice' && fineOpposite != 'dark' && fineOpposite != 'light' && fineOpposite != 'fire' && fineOpposite != 'ice') {
        throw new Error('Invalid equipment fine category ' + JSON.stringify(fineOpposite) + '.');
      }
      let decreased = false;
      const conf: UIEquipmentType = typ == 'weapon' ? this.weaponConfig : this.armorConfig;
      for (let n = 2; n > num; --n) {
        if (conf[fine][n].checked) {
          conf[fine][n].checked = false;
          decreased = true;
        }
      }
      for (let n = 0; n < 3; ++n) {
        conf[fineOpposite][n].checked = false;
      }
      if (decreased) {
        e.target.checked = true;
      }
    }

    if (this.weaponConfig.blunt[2].checked) { this.game.party.weaponConfig.physical = -3; }
    else if (this.weaponConfig.slice[2].checked) { this.game.party.weaponConfig.physical = 3; }
    else if (this.weaponConfig.blunt[1].checked) { this.game.party.weaponConfig.physical = -2; }
    else if (this.weaponConfig.slice[1].checked) { this.game.party.weaponConfig.physical = 2; }
    else if (this.weaponConfig.blunt[0].checked) { this.game.party.weaponConfig.physical = -1; }
    else if (this.weaponConfig.slice[0].checked) { this.game.party.weaponConfig.physical = 1; }
    else { this.game.party.weaponConfig.physical = 0; }
    if (this.weaponConfig.dark[2].checked) { this.game.party.weaponConfig.magical = -3; }
    else if (this.weaponConfig.light[2].checked) { this.game.party.weaponConfig.magical = 3; }
    else if (this.weaponConfig.dark[1].checked) { this.game.party.weaponConfig.magical = -2; }
    else if (this.weaponConfig.light[1].checked) { this.game.party.weaponConfig.magical = 2; }
    else if (this.weaponConfig.dark[0].checked) { this.game.party.weaponConfig.magical = -1; }
    else if (this.weaponConfig.light[0].checked) { this.game.party.weaponConfig.magical = 1; }
    else { this.game.party.weaponConfig.magical = 0; }
    if (this.weaponConfig.fire[2].checked) { this.game.party.weaponConfig.elemental = -3; }
    else if (this.weaponConfig.ice[2].checked) { this.game.party.weaponConfig.elemental = 3; }
    else if (this.weaponConfig.fire[1].checked) { this.game.party.weaponConfig.elemental = -2; }
    else if (this.weaponConfig.ice[1].checked) { this.game.party.weaponConfig.elemental = 2; }
    else if (this.weaponConfig.fire[0].checked) { this.game.party.weaponConfig.elemental = -1; }
    else if (this.weaponConfig.ice[0].checked) { this.game.party.weaponConfig.elemental = 1; }
    else { this.game.party.weaponConfig.elemental = 0; }

    if (this.armorConfig.blunt[2].checked) { this.game.party.armorConfig.physical = -3; }
    else if (this.armorConfig.slice[2].checked) { this.game.party.armorConfig.physical = 3; }
    else if (this.armorConfig.blunt[1].checked) { this.game.party.armorConfig.physical = -2; }
    else if (this.armorConfig.slice[1].checked) { this.game.party.armorConfig.physical = 2; }
    else if (this.armorConfig.blunt[0].checked) { this.game.party.armorConfig.physical = -1; }
    else if (this.armorConfig.slice[0].checked) { this.game.party.armorConfig.physical = 1; }
    else { this.game.party.armorConfig.physical = 0; }
    if (this.armorConfig.dark[2].checked) { this.game.party.armorConfig.magical = -3; }
    else if (this.armorConfig.light[2].checked) { this.game.party.armorConfig.magical = 3; }
    else if (this.armorConfig.dark[1].checked) { this.game.party.armorConfig.magical = -2; }
    else if (this.armorConfig.light[1].checked) { this.game.party.armorConfig.magical = 2; }
    else if (this.armorConfig.dark[0].checked) { this.game.party.armorConfig.magical = -1; }
    else if (this.armorConfig.light[0].checked) { this.game.party.armorConfig.magical = 1; }
    else { this.game.party.armorConfig.magical = 0; }
    if (this.armorConfig.fire[2].checked) { this.game.party.armorConfig.elemental = -3; }
    else if (this.armorConfig.ice[2].checked) { this.game.party.armorConfig.elemental = 3; }
    else if (this.armorConfig.fire[1].checked) { this.game.party.armorConfig.elemental = -2; }
    else if (this.armorConfig.ice[1].checked) { this.game.party.armorConfig.elemental = 2; }
    else if (this.armorConfig.fire[0].checked) { this.game.party.armorConfig.elemental = -1; }
    else if (this.armorConfig.ice[0].checked) { this.game.party.armorConfig.elemental = 1; }
    else { this.game.party.armorConfig.elemental = 0; }

    return false;
  }

  show() {
    const game = this.game;

    const { weapon, weaponConfig, armor, armorConfig } = game.party;
    const weaponSize = Math.abs(weapon.physical) + Math.abs(weapon.magical) + Math.abs(weapon.elemental);
    const armorSize = Math.abs(armor.physical) + Math.abs(armor.magical) + Math.abs(armor.elemental);

    this.weapon.innerText = '' + weaponSize;
    this.armor.innerText = '' + armorSize;

    if (FLAGS.SHOW_EQ_DETAILS) {
      this.weapon.innerText += ` (${ weapon.physical }/${ weapon.magical }/${ weapon.elemental })`;
      this.armor.innerText += ` (${ armor.physical }/${ armor.magical }/${ armor.elemental })`;
    }

    let weaponPhysicalMax = game.party.weaponPoints - Math.abs(weaponConfig.magical) - Math.abs(weaponConfig.elemental);
    let weaponMagicalMax = game.party.weaponPoints - Math.abs(weaponConfig.physical) - Math.abs(weaponConfig.elemental);
    let weaponElementalMax = game.party.weaponPoints - Math.abs(weaponConfig.physical) - Math.abs(weaponConfig.magical);
    this.weaponConfig.blunt[0].checked = weaponConfig.physical <= -1;
    this.weaponConfig.blunt[1].checked = weaponConfig.physical <= -2;
    this.weaponConfig.blunt[2].checked = weaponConfig.physical <= -3;
    this.weaponConfig.blunt[0].disabled = weaponPhysicalMax < 1;
    this.weaponConfig.blunt[1].disabled = weaponPhysicalMax < 2;
    this.weaponConfig.blunt[2].disabled = weaponPhysicalMax < 3;
    this.weaponConfig.slice[0].checked = weaponConfig.physical >= 1;
    this.weaponConfig.slice[1].checked = weaponConfig.physical >= 2;
    this.weaponConfig.slice[2].checked = weaponConfig.physical >= 3;
    this.weaponConfig.slice[0].disabled = weaponPhysicalMax < 1;
    this.weaponConfig.slice[1].disabled = weaponPhysicalMax < 2;
    this.weaponConfig.slice[2].disabled = weaponPhysicalMax < 3;
    this.weaponConfig.dark[0].checked = weaponConfig.magical <= -1;
    this.weaponConfig.dark[1].checked = weaponConfig.magical <= -2;
    this.weaponConfig.dark[2].checked = weaponConfig.magical <= -3;
    this.weaponConfig.dark[0].disabled = weaponMagicalMax < 1;
    this.weaponConfig.dark[1].disabled = weaponMagicalMax < 2;
    this.weaponConfig.dark[2].disabled = weaponMagicalMax < 3;
    this.weaponConfig.light[0].checked = weaponConfig.magical >= 1;
    this.weaponConfig.light[1].checked = weaponConfig.magical >= 2;
    this.weaponConfig.light[2].checked = weaponConfig.magical >= 3;
    this.weaponConfig.light[0].disabled = weaponMagicalMax < 1;
    this.weaponConfig.light[1].disabled = weaponMagicalMax < 2;
    this.weaponConfig.light[2].disabled = weaponMagicalMax < 3;
    this.weaponConfig.fire[0].checked = weaponConfig.elemental <= -1;
    this.weaponConfig.fire[1].checked = weaponConfig.elemental <= -2;
    this.weaponConfig.fire[2].checked = weaponConfig.elemental <= -3;
    this.weaponConfig.fire[0].disabled = weaponElementalMax < 1;
    this.weaponConfig.fire[1].disabled = weaponElementalMax < 2;
    this.weaponConfig.fire[2].disabled = weaponElementalMax < 3;
    this.weaponConfig.ice[0].checked = weaponConfig.elemental >= 1;
    this.weaponConfig.ice[1].checked = weaponConfig.elemental >= 2;
    this.weaponConfig.ice[2].checked = weaponConfig.elemental >= 3;
    this.weaponConfig.ice[0].disabled = weaponElementalMax < 1;
    this.weaponConfig.ice[1].disabled = weaponElementalMax < 2;
    this.weaponConfig.ice[2].disabled = weaponElementalMax < 3;

    let armorPhysicalMax = game.party.armorPoints - Math.abs(armorConfig.magical) - Math.abs(armorConfig.elemental);
    let armorMagicalMax = game.party.armorPoints - Math.abs(armorConfig.physical) - Math.abs(armorConfig.elemental);
    let armorElementalMax = game.party.armorPoints - Math.abs(armorConfig.physical) - Math.abs(armorConfig.magical);
    this.armorConfig.blunt[0].checked = armorConfig.physical <= -1;
    this.armorConfig.blunt[1].checked = armorConfig.physical <= -2;
    this.armorConfig.blunt[2].checked = armorConfig.physical <= -3;
    this.armorConfig.blunt[0].disabled = armorPhysicalMax < 1;
    this.armorConfig.blunt[1].disabled = armorPhysicalMax < 2;
    this.armorConfig.blunt[2].disabled = armorPhysicalMax < 3;
    this.armorConfig.slice[0].checked = armorConfig.physical >= 1;
    this.armorConfig.slice[1].checked = armorConfig.physical >= 2;
    this.armorConfig.slice[2].checked = armorConfig.physical >= 3;
    this.armorConfig.slice[0].disabled = armorPhysicalMax < 1;
    this.armorConfig.slice[1].disabled = armorPhysicalMax < 2;
    this.armorConfig.slice[2].disabled = armorPhysicalMax < 3;
    this.armorConfig.dark[0].checked = armorConfig.magical <= -1;
    this.armorConfig.dark[1].checked = armorConfig.magical <= -2;
    this.armorConfig.dark[2].checked = armorConfig.magical <= -3;
    this.armorConfig.dark[0].disabled = armorMagicalMax < 1;
    this.armorConfig.dark[1].disabled = armorMagicalMax < 2;
    this.armorConfig.dark[2].disabled = armorMagicalMax < 3;
    this.armorConfig.light[0].checked = armorConfig.magical >= 1;
    this.armorConfig.light[1].checked = armorConfig.magical >= 2;
    this.armorConfig.light[2].checked = armorConfig.magical >= 3;
    this.armorConfig.light[0].disabled = armorMagicalMax < 1;
    this.armorConfig.light[1].disabled = armorMagicalMax < 2;
    this.armorConfig.light[2].disabled = armorMagicalMax < 3;
    this.armorConfig.fire[0].checked = armorConfig.elemental <= -1;
    this.armorConfig.fire[1].checked = armorConfig.elemental <= -2;
    this.armorConfig.fire[2].checked = armorConfig.elemental <= -3;
    this.armorConfig.fire[0].disabled = armorElementalMax < 1;
    this.armorConfig.fire[1].disabled = armorElementalMax < 2;
    this.armorConfig.fire[2].disabled = armorElementalMax < 3;
    this.armorConfig.ice[0].checked = armorConfig.elemental >= 1;
    this.armorConfig.ice[1].checked = armorConfig.elemental >= 2;
    this.armorConfig.ice[2].checked = armorConfig.elemental >= 3;
    this.armorConfig.ice[0].disabled = armorElementalMax < 1;
    this.armorConfig.ice[1].disabled = armorElementalMax < 2;
    this.armorConfig.ice[2].disabled = armorElementalMax < 3;
  }
}

class UITown {
  game: Game;

  townsfolk: HTMLElement;
  hireCost: HTMLElement;
  need: HTMLElement;
  boss: HTMLElement;
  enemy: HTMLElement;

  hire: HTMLButtonElement;
  conscript: HTMLButtonElement;
  takeQuest: HTMLButtonElement;
  fightBoss: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;

    this.townsfolk = getElementById('panel-town-townsfolk-value');
    this.hireCost = getElementById('panel-town-hire-cost-value');
    this.need = getElementById('panel-town-need-value');
    this.boss = getElementById('panel-town-boss-value');
    this.enemy = getElementById('panel-town-enemy-value');

    this.hire = getElementByIdAsType('panel-town-hire-button', HTMLButtonElement);
    this.hire.onclick = (e) => {
      game.hire();
    };
    this.conscript = getElementByIdAsType('panel-town-conscript-button', HTMLButtonElement);
    this.conscript.onclick = (e) => {
      game.conscript();
    };
    this.takeQuest = getElementByIdAsType('panel-town-take-quest-button', HTMLButtonElement);
    this.takeQuest.onclick = (e) => {
      game.takeQuest();
    };
    this.fightBoss = getElementByIdAsType('panel-town-fight-boss-button', HTMLButtonElement);
    this.fightBoss.onclick = (e) => {
      game.fightBoss();
    };
  }

  show() {
    const game = this.game;

    this.townsfolk.innerText = '' + game.town.townsfolk;
    this.hireCost.innerText = '' + game.town.hireCost;
    this.need.innerText = '' + game.town.need;
    this.boss.innerText = '' + (game.fightingBoss ? game.boss.health : game.town.boss);
    this.enemy.innerText = '' + (game.enemy ? game.enemy.health : 0);

    this.hire.disabled = !game.canHire();
    this.conscript.disabled = !game.canConscript();
    this.conscript.style.display = game.party.skills.conscript.level > 0 ? '' : 'none';
    this.takeQuest.disabled = game.town.need <= 0 || game.party.quests >= game.party.size;
    this.fightBoss.disabled = game.fightingBoss;
  }
}

class UIShop {
  game: Game;

  foodCostBuy: HTMLElement;
  foodCostSell: HTMLElement;
  waterCostBuy: HTMLElement;
  waterCostSell: HTMLElement;
  weaponBluntCostBuy: HTMLElement;
  weaponBluntCostSell: HTMLElement;
  weaponBluntCount: HTMLElement;
  weaponSliceCostBuy: HTMLElement;
  weaponSliceCostSell: HTMLElement;
  weaponSliceCount: HTMLElement;
  weaponDarkCostBuy: HTMLElement;
  weaponDarkCostSell: HTMLElement;
  weaponDarkCount: HTMLElement;
  weaponLightCostBuy: HTMLElement;
  weaponLightCostSell: HTMLElement;
  weaponLightCount: HTMLElement;
  weaponFireCostBuy: HTMLElement;
  weaponFireCostSell: HTMLElement;
  weaponFireCount: HTMLElement;
  weaponIceCostBuy: HTMLElement;
  weaponIceCostSell: HTMLElement;
  weaponIceCount: HTMLElement;
  armorBluntCostBuy: HTMLElement;
  armorBluntCostSell: HTMLElement;
  armorBluntCount: HTMLElement;
  armorSliceCostBuy: HTMLElement;
  armorSliceCostSell: HTMLElement;
  armorSliceCount: HTMLElement;
  armorDarkCostBuy: HTMLElement;
  armorDarkCostSell: HTMLElement;
  armorDarkCount: HTMLElement;
  armorLightCostBuy: HTMLElement;
  armorLightCostSell: HTMLElement;
  armorLightCount: HTMLElement;
  armorFireCostBuy: HTMLElement;
  armorFireCostSell: HTMLElement;
  armorFireCount: HTMLElement;
  armorIceCostBuy: HTMLElement;
  armorIceCostSell: HTMLElement;
  armorIceCount: HTMLElement;

  foodBuyButton: HTMLButtonElement;
  foodSellButton: HTMLButtonElement;
  waterBuyButton: HTMLButtonElement;
  waterSellButton: HTMLButtonElement;
  weaponBluntBuyButton: HTMLButtonElement;
  weaponBluntSellButton: HTMLButtonElement;
  weaponSliceBuyButton: HTMLButtonElement;
  weaponSliceSellButton: HTMLButtonElement;
  weaponDarkBuyButton: HTMLButtonElement;
  weaponDarkSellButton: HTMLButtonElement;
  weaponLightBuyButton: HTMLButtonElement;
  weaponLightSellButton: HTMLButtonElement;
  weaponFireBuyButton: HTMLButtonElement;
  weaponFireSellButton: HTMLButtonElement;
  weaponIceBuyButton: HTMLButtonElement;
  weaponIceSellButton: HTMLButtonElement;
  armorBluntBuyButton: HTMLButtonElement;
  armorBluntSellButton: HTMLButtonElement;
  armorSliceBuyButton: HTMLButtonElement;
  armorSliceSellButton: HTMLButtonElement;
  armorDarkBuyButton: HTMLButtonElement;
  armorDarkSellButton: HTMLButtonElement;
  armorLightBuyButton: HTMLButtonElement;
  armorLightSellButton: HTMLButtonElement;
  armorFireBuyButton: HTMLButtonElement;
  armorFireSellButton: HTMLButtonElement;
  armorIceBuyButton: HTMLButtonElement;
  armorIceSellButton: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;

    this.foodCostBuy = getElementById('panel-shop-food-buy-cost-value');
    this.foodCostSell = getElementById('panel-shop-food-sell-cost-value');
    this.waterCostBuy = getElementById('panel-shop-water-buy-cost-value');
    this.waterCostSell = getElementById('panel-shop-water-sell-cost-value');
    this.weaponBluntCostBuy = getElementById('panel-shop-weapon-blunt-buy-cost-value');
    this.weaponBluntCostSell = getElementById('panel-shop-weapon-blunt-sell-cost-value');
    this.weaponBluntCount = getElementById('panel-shop-weapon-blunt-count-value');
    this.weaponSliceCostBuy = getElementById('panel-shop-weapon-slice-buy-cost-value');
    this.weaponSliceCostSell = getElementById('panel-shop-weapon-slice-sell-cost-value');
    this.weaponSliceCount = getElementById('panel-shop-weapon-slice-count-value');
    this.weaponDarkCostBuy = getElementById('panel-shop-weapon-dark-buy-cost-value');
    this.weaponDarkCostSell = getElementById('panel-shop-weapon-dark-sell-cost-value');
    this.weaponDarkCount = getElementById('panel-shop-weapon-dark-count-value');
    this.weaponLightCostBuy = getElementById('panel-shop-weapon-light-buy-cost-value');
    this.weaponLightCostSell = getElementById('panel-shop-weapon-light-sell-cost-value');
    this.weaponLightCount = getElementById('panel-shop-weapon-light-count-value');
    this.weaponFireCostBuy = getElementById('panel-shop-weapon-fire-buy-cost-value');
    this.weaponFireCostSell = getElementById('panel-shop-weapon-fire-sell-cost-value');
    this.weaponFireCount = getElementById('panel-shop-weapon-fire-count-value');
    this.weaponIceCostBuy = getElementById('panel-shop-weapon-ice-buy-cost-value');
    this.weaponIceCostSell = getElementById('panel-shop-weapon-ice-sell-cost-value');
    this.weaponIceCount = getElementById('panel-shop-weapon-ice-count-value');
    this.armorBluntCostBuy = getElementById('panel-shop-armor-blunt-buy-cost-value');
    this.armorBluntCostSell = getElementById('panel-shop-armor-blunt-sell-cost-value');
    this.armorBluntCount = getElementById('panel-shop-armor-blunt-count-value');
    this.armorSliceCostBuy = getElementById('panel-shop-armor-slice-buy-cost-value');
    this.armorSliceCostSell = getElementById('panel-shop-armor-slice-sell-cost-value');
    this.armorSliceCount = getElementById('panel-shop-armor-slice-count-value');
    this.armorDarkCostBuy = getElementById('panel-shop-armor-dark-buy-cost-value');
    this.armorDarkCostSell = getElementById('panel-shop-armor-dark-sell-cost-value');
    this.armorDarkCount = getElementById('panel-shop-armor-dark-count-value');
    this.armorLightCostBuy = getElementById('panel-shop-armor-light-buy-cost-value');
    this.armorLightCostSell = getElementById('panel-shop-armor-light-sell-cost-value');
    this.armorLightCount = getElementById('panel-shop-armor-light-count-value');
    this.armorFireCostBuy = getElementById('panel-shop-armor-fire-buy-cost-value');
    this.armorFireCostSell = getElementById('panel-shop-armor-fire-sell-cost-value');
    this.armorFireCount = getElementById('panel-shop-armor-fire-count-value');
    this.armorIceCostBuy = getElementById('panel-shop-armor-ice-buy-cost-value');
    this.armorIceCostSell = getElementById('panel-shop-armor-ice-sell-cost-value');
    this.armorIceCount = getElementById('panel-shop-armor-ice-count-value');

    this.foodBuyButton = getElementByIdAsType('panel-shop-food-buy-button', HTMLButtonElement);
    this.foodBuyButton.onclick = (e) => {
      game.buyFood();
    };
    this.foodSellButton = getElementByIdAsType('panel-shop-food-sell-button', HTMLButtonElement);
    this.foodSellButton.onclick = (e) => {
      game.sellFood();
    };
    this.waterBuyButton = getElementByIdAsType('panel-shop-water-buy-button', HTMLButtonElement);
    this.waterBuyButton.onclick = (e) => {
      game.buyWater();
    };
    this.waterSellButton = getElementByIdAsType('panel-shop-water-sell-button', HTMLButtonElement);
    this.waterSellButton.onclick = (e) => {
      game.sellWater();
    };
    this.weaponBluntBuyButton = getElementByIdAsType('panel-shop-weapon-blunt-buy-button', HTMLButtonElement);
    this.weaponBluntBuyButton.onclick = (e) => {
      game.buyEquipment('weapon', 'blunt');
    };
    this.weaponBluntSellButton = getElementByIdAsType('panel-shop-weapon-blunt-sell-button', HTMLButtonElement);
    this.weaponBluntSellButton.onclick = (e) => {
      game.sellEquipment('weapon', 'blunt');
    };
    this.weaponSliceBuyButton = getElementByIdAsType('panel-shop-weapon-slice-buy-button', HTMLButtonElement);
    this.weaponSliceBuyButton.onclick = (e) => {
      game.buyEquipment('weapon', 'slice');
    };
    this.weaponSliceSellButton = getElementByIdAsType('panel-shop-weapon-slice-sell-button', HTMLButtonElement);
    this.weaponSliceSellButton.onclick = (e) => {
      game.sellEquipment('weapon', 'slice');
    };
    this.weaponDarkBuyButton = getElementByIdAsType('panel-shop-weapon-dark-buy-button', HTMLButtonElement);
    this.weaponDarkBuyButton.onclick = (e) => {
      game.buyEquipment('weapon', 'dark');
    };
    this.weaponDarkSellButton = getElementByIdAsType('panel-shop-weapon-dark-sell-button', HTMLButtonElement);
    this.weaponDarkSellButton.onclick = (e) => {
      game.sellEquipment('weapon', 'dark');
    };
    this.weaponLightBuyButton = getElementByIdAsType('panel-shop-weapon-light-buy-button', HTMLButtonElement);
    this.weaponLightBuyButton.onclick = (e) => {
      game.buyEquipment('weapon', 'light');
    };
    this.weaponLightSellButton = getElementByIdAsType('panel-shop-weapon-light-sell-button', HTMLButtonElement);
    this.weaponLightSellButton.onclick = (e) => {
      game.sellEquipment('weapon', 'light');
    };
    this.weaponFireBuyButton = getElementByIdAsType('panel-shop-weapon-fire-buy-button', HTMLButtonElement);
    this.weaponFireBuyButton.onclick = (e) => {
      game.buyEquipment('weapon', 'fire');
    };
    this.weaponFireSellButton = getElementByIdAsType('panel-shop-weapon-fire-sell-button', HTMLButtonElement);
    this.weaponFireSellButton.onclick = (e) => {
      game.sellEquipment('weapon', 'fire');
    };
    this.weaponIceBuyButton = getElementByIdAsType('panel-shop-weapon-ice-buy-button', HTMLButtonElement);
    this.weaponIceBuyButton.onclick = (e) => {
      game.buyEquipment('weapon', 'ice');
    };
    this.weaponIceSellButton = getElementByIdAsType('panel-shop-weapon-ice-sell-button', HTMLButtonElement);
    this.weaponIceSellButton.onclick = (e) => {
      game.sellEquipment('weapon', 'ice');
    };
    this.armorBluntBuyButton = getElementByIdAsType('panel-shop-armor-blunt-buy-button', HTMLButtonElement);
    this.armorBluntBuyButton.onclick = (e) => {
      game.buyEquipment('armor', 'blunt');
    };
    this.armorBluntSellButton = getElementByIdAsType('panel-shop-armor-blunt-sell-button', HTMLButtonElement);
    this.armorBluntSellButton.onclick = (e) => {
      game.sellEquipment('armor', 'blunt');
    };
    this.armorSliceBuyButton = getElementByIdAsType('panel-shop-armor-slice-buy-button', HTMLButtonElement);
    this.armorSliceBuyButton.onclick = (e) => {
      game.buyEquipment('armor', 'slice');
    };
    this.armorSliceSellButton = getElementByIdAsType('panel-shop-armor-slice-sell-button', HTMLButtonElement);
    this.armorSliceSellButton.onclick = (e) => {
      game.sellEquipment('armor', 'slice');
    };
    this.armorDarkBuyButton = getElementByIdAsType('panel-shop-armor-dark-buy-button', HTMLButtonElement);
    this.armorDarkBuyButton.onclick = (e) => {
      game.buyEquipment('armor', 'dark');
    };
    this.armorDarkSellButton = getElementByIdAsType('panel-shop-armor-dark-sell-button', HTMLButtonElement);
    this.armorDarkSellButton.onclick = (e) => {
      game.sellEquipment('armor', 'dark');
    };
    this.armorLightBuyButton = getElementByIdAsType('panel-shop-armor-light-buy-button', HTMLButtonElement);
    this.armorLightBuyButton.onclick = (e) => {
      game.buyEquipment('armor', 'light');
    };
    this.armorLightSellButton = getElementByIdAsType('panel-shop-armor-light-sell-button', HTMLButtonElement);
    this.armorLightSellButton.onclick = (e) => {
      game.sellEquipment('armor', 'light');
    };
    this.armorFireBuyButton = getElementByIdAsType('panel-shop-armor-fire-buy-button', HTMLButtonElement);
    this.armorFireBuyButton.onclick = (e) => {
      game.buyEquipment('armor', 'fire');
    };
    this.armorFireSellButton = getElementByIdAsType('panel-shop-armor-fire-sell-button', HTMLButtonElement);
    this.armorFireSellButton.onclick = (e) => {
      game.sellEquipment('armor', 'fire');
    };
    this.armorIceBuyButton = getElementByIdAsType('panel-shop-armor-ice-buy-button', HTMLButtonElement);
    this.armorIceBuyButton.onclick = (e) => {
      game.buyEquipment('armor', 'ice');
    };
    this.armorIceSellButton = getElementByIdAsType('panel-shop-armor-ice-sell-button', HTMLButtonElement);
    this.armorIceSellButton.onclick = (e) => {
      game.sellEquipment('armor', 'ice');
    };
  }

  show() {
    const game = this.game;

    this.foodCostBuy.innerText = '' + game.town.foodCostBuy[game.season];
    this.foodCostSell.innerText = '' + game.town.foodCostSell[game.season];
    this.waterCostBuy.innerText = '' + game.town.waterCostBuy[game.season];
    this.waterCostSell.innerText = '' + game.town.waterCostSell[game.season];
    this.weaponBluntCostBuy.innerText = '' + game.town.inventoryWeaponBuy.blunt;
    this.weaponBluntCostSell.innerText = '' + game.town.inventoryWeaponSell.blunt;
    this.weaponBluntCount.innerText = '' + game.party.inventoryWeapon.blunt;
    this.weaponSliceCostBuy.innerText = '' + game.town.inventoryWeaponBuy.slice;
    this.weaponSliceCostSell.innerText = '' + game.town.inventoryWeaponSell.slice;
    this.weaponSliceCount.innerText = '' + game.party.inventoryWeapon.slice;
    this.weaponDarkCostBuy.innerText = '' + game.town.inventoryWeaponBuy.dark;
    this.weaponDarkCostSell.innerText = '' + game.town.inventoryWeaponSell.dark;
    this.weaponDarkCount.innerText = '' + game.party.inventoryWeapon.dark;
    this.weaponLightCostBuy.innerText = '' + game.town.inventoryWeaponBuy.light;
    this.weaponLightCostSell.innerText = '' + game.town.inventoryWeaponSell.light;
    this.weaponLightCount.innerText = '' + game.party.inventoryWeapon.light;
    this.weaponFireCostBuy.innerText = '' + game.town.inventoryWeaponBuy.fire;
    this.weaponFireCostSell.innerText = '' + game.town.inventoryWeaponSell.fire;
    this.weaponFireCount.innerText = '' + game.party.inventoryWeapon.fire;
    this.weaponIceCostBuy.innerText = '' + game.town.inventoryWeaponBuy.ice;
    this.weaponIceCostSell.innerText = '' + game.town.inventoryWeaponSell.ice;
    this.weaponIceCount.innerText = '' + game.party.inventoryWeapon.ice;
    this.armorBluntCostBuy.innerText = '' + game.town.inventoryArmorBuy.blunt;
    this.armorBluntCostSell.innerText = '' + game.town.inventoryArmorSell.blunt;
    this.armorBluntCount.innerText = '' + game.party.inventoryArmor.blunt;
    this.armorSliceCostBuy.innerText = '' + game.town.inventoryArmorBuy.slice;
    this.armorSliceCostSell.innerText = '' + game.town.inventoryArmorSell.slice;
    this.armorSliceCount.innerText = '' + game.party.inventoryArmor.slice;
    this.armorDarkCostBuy.innerText = '' + game.town.inventoryArmorBuy.dark;
    this.armorDarkCostSell.innerText = '' + game.town.inventoryArmorSell.dark;
    this.armorDarkCount.innerText = '' + game.party.inventoryArmor.dark;
    this.armorLightCostBuy.innerText = '' + game.town.inventoryArmorBuy.light;
    this.armorLightCostSell.innerText = '' + game.town.inventoryArmorSell.light;
    this.armorLightCount.innerText = '' + game.party.inventoryArmor.light;
    this.armorFireCostBuy.innerText = '' + game.town.inventoryArmorBuy.fire;
    this.armorFireCostSell.innerText = '' + game.town.inventoryArmorSell.fire;
    this.armorFireCount.innerText = '' + game.party.inventoryArmor.fire;
    this.armorIceCostBuy.innerText = '' + game.town.inventoryArmorBuy.ice;
    this.armorIceCostSell.innerText = '' + game.town.inventoryArmorSell.ice;
    this.armorIceCount.innerText = '' + game.party.inventoryArmor.ice;

    this.foodBuyButton.disabled = game.party.gold < game.town.foodCostBuy[game.season] || game.town.foodStock <= 0;
    this.foodSellButton.disabled = game.party.food <= 0;
    this.waterBuyButton.disabled = game.party.gold < game.town.waterCostBuy[game.season] || game.town.waterStock <= 0;
    this.waterSellButton.disabled = game.party.water <= 0;
    this.weaponBluntBuyButton.disabled = game.party.gold < game.town.inventoryWeaponBuy.blunt || game.town.inventoryWeapon.blunt <= 0;
    this.weaponBluntSellButton.disabled = game.party.inventoryWeapon.blunt <= 0;
    this.weaponSliceBuyButton.disabled = game.party.gold < game.town.inventoryWeaponBuy.slice || game.town.inventoryWeapon.slice <= 0;
    this.weaponSliceSellButton.disabled = game.party.inventoryWeapon.slice <= 0;
    this.weaponDarkBuyButton.disabled = game.party.gold < game.town.inventoryWeaponBuy.dark || game.town.inventoryWeapon.dark <= 0;
    this.weaponDarkSellButton.disabled = game.party.inventoryWeapon.dark <= 0;
    this.weaponLightBuyButton.disabled = game.party.gold < game.town.inventoryWeaponBuy.light || game.town.inventoryWeapon.light <= 0;
    this.weaponLightSellButton.disabled = game.party.inventoryWeapon.light <= 0;
    this.weaponFireBuyButton.disabled = game.party.gold < game.town.inventoryWeaponBuy.fire || game.town.inventoryWeapon.fire <= 0;
    this.weaponFireSellButton.disabled = game.party.inventoryWeapon.fire <= 0;
    this.weaponIceBuyButton.disabled = game.party.gold < game.town.inventoryWeaponBuy.ice || game.town.inventoryWeapon.ice <= 0;
    this.weaponIceSellButton.disabled = game.party.inventoryWeapon.ice <= 0;
    this.armorBluntBuyButton.disabled = game.party.gold < game.town.inventoryArmorBuy.blunt || game.town.inventoryArmor.blunt <= 0;
    this.armorBluntSellButton.disabled = game.party.inventoryArmor.blunt <= 0;
    this.armorSliceBuyButton.disabled = game.party.gold < game.town.inventoryArmorBuy.slice || game.town.inventoryArmor.slice <= 0;
    this.armorSliceSellButton.disabled = game.party.inventoryArmor.slice <= 0;
    this.armorDarkBuyButton.disabled = game.party.gold < game.town.inventoryArmorBuy.dark || game.town.inventoryArmor.dark <= 0;
    this.armorDarkSellButton.disabled = game.party.inventoryArmor.dark <= 0;
    this.armorLightBuyButton.disabled = game.party.gold < game.town.inventoryArmorBuy.light || game.town.inventoryArmor.light <= 0;
    this.armorLightSellButton.disabled = game.party.inventoryArmor.light <= 0;
    this.armorFireBuyButton.disabled = game.party.gold < game.town.inventoryArmorBuy.fire || game.town.inventoryArmor.fire <= 0;
    this.armorFireSellButton.disabled = game.party.inventoryArmor.fire <= 0;
    this.armorIceBuyButton.disabled = game.party.gold < game.town.inventoryArmorBuy.ice || game.town.inventoryArmor.ice <= 0;
    this.armorIceSellButton.disabled = game.party.inventoryArmor.ice <= 0;
  }
}

class UISkills {
  game: Game;

  initiativeEntry: HTMLElement;
  initiativeBuy: HTMLElement;
  initiativeLevel: HTMLElement;
  initiativeBuyButton: HTMLButtonElement;
  inspireEntry: HTMLElement;
  inspireBuy: HTMLElement;
  inspireLevel: HTMLElement;
  inspireBuyButton: HTMLButtonElement;
  sacrificeEntry: HTMLElement;
  sacrificeBuy: HTMLElement;
  sacrificeLevel: HTMLElement;
  sacrificeBuyButton: HTMLButtonElement;
  conscriptEntry: HTMLElement;
  conscriptBuy: HTMLElement;
  conscriptLevel: HTMLElement;
  conscriptBuyButton: HTMLButtonElement;
  animateEntry: HTMLElement;
  animateBuy: HTMLElement;
  animateLevel: HTMLElement;
  animateBuyButton: HTMLButtonElement;
  sabotageEntry: HTMLElement;
  sabotageBuy: HTMLElement;
  sabotageLevel: HTMLElement;
  sabotageBuyButton: HTMLButtonElement;
  acclaimEntry: HTMLElement;
  acclaimBuy: HTMLElement;
  acclaimLevel: HTMLElement;
  acclaimBuyButton: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;

    this.initiativeEntry = getElementById('panel-skills-initiative');
    this.initiativeBuy = getElementById('panel-skills-initiative-buy-cost-value');
    this.initiativeLevel = getElementById('panel-skills-initiative-level-value');
    this.initiativeBuyButton = getElementByIdAsType('panel-skills-initiative-buy-button', HTMLButtonElement);
    this.initiativeBuyButton.onclick = (e) => {
      game.buySkill('initiative');
    };
    this.inspireEntry = getElementById('panel-skills-inspire');
    this.inspireBuy = getElementById('panel-skills-inspire-buy-cost-value');
    this.inspireLevel = getElementById('panel-skills-inspire-level-value');
    this.inspireBuyButton = getElementByIdAsType('panel-skills-inspire-buy-button', HTMLButtonElement);
    this.inspireBuyButton.onclick = (e) => {
      game.buySkill('inspire');
    };
    this.sacrificeEntry = getElementById('panel-skills-sacrifice');
    this.sacrificeBuy = getElementById('panel-skills-sacrifice-buy-cost-value');
    this.sacrificeLevel = getElementById('panel-skills-sacrifice-level-value');
    this.sacrificeBuyButton = getElementByIdAsType('panel-skills-sacrifice-buy-button', HTMLButtonElement);
    this.sacrificeBuyButton.onclick = (e) => {
      game.buySkill('sacrifice');
    };
    this.conscriptEntry = getElementById('panel-skills-conscript');
    this.conscriptBuy = getElementById('panel-skills-conscript-buy-cost-value');
    this.conscriptLevel = getElementById('panel-skills-conscript-level-value');
    this.conscriptBuyButton = getElementByIdAsType('panel-skills-conscript-buy-button', HTMLButtonElement);
    this.conscriptBuyButton.onclick = (e) => {
      game.buySkill('conscript');
    };
    this.animateEntry = getElementById('panel-skills-animate');
    this.animateBuy = getElementById('panel-skills-animate-buy-cost-value');
    this.animateLevel = getElementById('panel-skills-animate-level-value');
    this.animateBuyButton = getElementByIdAsType('panel-skills-animate-buy-button', HTMLButtonElement);
    this.animateBuyButton.onclick = (e) => {
      game.buySkill('animate');
    };
    this.sabotageEntry = getElementById('panel-skills-sabotage');
    this.sabotageBuy = getElementById('panel-skills-sabotage-buy-cost-value');
    this.sabotageLevel = getElementById('panel-skills-sabotage-level-value');
    this.sabotageBuyButton = getElementByIdAsType('panel-skills-sabotage-buy-button', HTMLButtonElement);
    this.sabotageBuyButton.onclick = (e) => {
      game.buySkill('sabotage');
    };
    this.acclaimEntry = getElementById('panel-skills-acclaim');
    this.acclaimBuy = getElementById('panel-skills-acclaim-buy-cost-value');
    this.acclaimLevel = getElementById('panel-skills-acclaim-level-value');
    this.acclaimBuyButton = getElementByIdAsType('panel-skills-acclaim-buy-button', HTMLButtonElement);
    this.acclaimBuyButton.onclick = (e) => {
      game.buySkill('acclaim');
    };
  }

  show() {
    {
      // TODO: Maybe iterate over SKILLS
      const cost = this.game.getSkillCost('initiative');
      this.initiativeBuy.innerText = '' + cost;
      this.initiativeLevel.innerText = '' + this.game.party.skills.initiative.level;
      this.initiativeBuyButton.disabled = !this.game.canBuySkill('initiative');
      this.initiativeEntry.style.display = this.game.party.questsCompleted < this.game.party.skills.initiative.unlockAtCompletedQuests ? 'none' : '';
    }
    {
      const cost = this.game.getSkillCost('inspire');
      this.inspireBuy.innerText = '' + cost;
      this.inspireLevel.innerText = '' + this.game.party.skills.inspire.level;
      this.inspireBuyButton.disabled = !this.game.canBuySkill('inspire');
      this.inspireEntry.style.display = this.game.party.questsCompleted < this.game.party.skills.inspire.unlockAtCompletedQuests ? 'none' : '';
    }
    {
      const cost = this.game.getSkillCost('sacrifice');
      this.sacrificeBuy.innerText = '' + cost;
      this.sacrificeLevel.innerText = '' + this.game.party.skills.sacrifice.level;
      this.sacrificeBuyButton.disabled = !this.game.canBuySkill('sacrifice');
      this.sacrificeEntry.style.display = this.game.party.questsCompleted < this.game.party.skills.sacrifice.unlockAtCompletedQuests ? 'none' : '';
    }
    {
      const cost = this.game.getSkillCost('conscript');
      this.conscriptBuy.innerText = '' + cost;
      this.conscriptLevel.innerText = '' + this.game.party.skills.conscript.level;
      this.conscriptBuyButton.disabled = !this.game.canBuySkill('conscript');
      this.conscriptEntry.style.display = this.game.party.questsCompleted < this.game.party.skills.conscript.unlockAtCompletedQuests ? 'none' : '';
    }
    {
      const cost = this.game.getSkillCost('animate');
      this.animateBuy.innerText = '' + cost;
      this.animateLevel.innerText = '' + this.game.party.skills.animate.level;
      this.animateBuyButton.disabled = !this.game.canBuySkill('animate');
      this.animateEntry.style.display = this.game.party.questsCompleted < this.game.party.skills.animate.unlockAtCompletedQuests ? 'none' : '';
    }
    {
      const cost = this.game.getSkillCost('sabotage');
      this.sabotageBuy.innerText = '' + cost;
      this.sabotageLevel.innerText = '' + this.game.party.skills.sabotage.level;
      this.sabotageBuyButton.disabled = !this.game.canBuySkill('sabotage');
      this.sabotageEntry.style.display = this.game.party.questsCompleted < this.game.party.skills.sabotage.unlockAtCompletedQuests ? 'none' : '';
    }
    {
      const cost = this.game.getSkillCost('acclaim');
      this.acclaimBuy.innerText = '' + cost;
      this.acclaimLevel.innerText = '' + this.game.party.skills.acclaim.level;
      this.acclaimBuyButton.disabled = !this.game.canBuySkill('acclaim');
      this.acclaimEntry.style.display = this.game.party.questsCompleted < this.game.party.skills.acclaim.unlockAtCompletedQuests ? 'none' : '';
    }
  }
}

class UILog {
  game: Game;

  oldInnerText: string;

  log: HTMLElement;

  constructor(game: Game) {
    this.game = game;

    this.oldInnerText = '';

    this.log = getElementById('panel-log-log');
  }

  show() {
    const start = Math.max(game.textLog.length - 100, 0);
    const newInnerText = game.textLog.slice(start).join('\n');
    if (newInnerText != this.oldInnerText) {
      this.log.innerText = game.textLog.slice(start).join('\n');
      this.log.scrollIntoView({ block: 'end' });
      this.oldInnerText = newInnerText;
    }
  }
}

class UI {
  party: UIParty;
  equipment: UIEquipment;
  skills: UISkills;
  town: UITown;
  shop: UIShop;
  log: UILog;

  constructor(game: Game) {
    this.party = new UIParty(game);
    this.equipment = new UIEquipment(game);
    this.skills = new UISkills(game);
    this.town = new UITown(game);
    this.shop = new UIShop(game);
    this.log = new UILog(game);

    // Whenever any button is clicked, the data being displayed will be updated.
    for (const element of document.getElementsByTagName('button')) {
      element.addEventListener('click', (e) => {
        this.show();
      });
    }
  }

  show() {
    this.party.show();
    this.equipment.show();
    this.skills.show();
    this.town.show();
    this.shop.show();
    this.log.show();
  }
}

let ui: UI;

function initUI(game: Game) {
  ui = new UI(game);
}
