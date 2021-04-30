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

class UIParty {
  game: Game;

  date: HTMLElement;
  size: HTMLElement;
  quests: HTMLElement;
  gold: HTMLElement;
  food: HTMLElement;
  water: HTMLElement;

  constructor(game: Game) {
    this.game = game;

    this.date = getElementById('panel-party-date-value');
    this.size = getElementById('panel-party-size-value');
    this.quests = getElementById('panel-party-quests-value');
    this.gold = getElementById('panel-party-gold-value');
    this.food = getElementById('panel-party-food-value');
    this.water = getElementById('panel-party-water-value');
  }

  show() {
    const game = this.game;

    {
      let text = '';
      switch (game.season) {
        case 0: text = 'Spring'; break;
        case 1: text = 'Summer'; break;
        case 2: text = 'Winter'; break;
        case 3: text = 'Fall'; break;
        default:
          throw new Error('Game season is out of bounds.');
      }
      text += ' ' + game.year;
      if (FLAGS.SHOW_TICKS) {
        text += ` (${ fmt02d(game.term) }:${ fmt02d(game.tock) }:${ fmt02d(game.tick) })`;
      }
      this.date.innerText = text;
    }

    this.size.innerText = '' + game.party.size;
    this.quests.innerText = '' + game.party.quests;
    this.gold.innerText = '' + game.party.gold;
    this.food.innerText = '' + game.party.food;
    this.water.innerText = '' + game.party.water;
    if (FLAGS.SHOW_HUNGER_THIRST) {
      this.food.innerText += ' (' + game.party.hunger + ')';
      this.water.innerText += ' (' + game.party.thirst + ')';
    }
  }
}

class UIEquipment {
  game: Game;

  weapon: HTMLElement;
  armor: HTMLElement;

  weaponPhysicalSlider: HTMLInputElement;
  weaponMagicalSlider: HTMLInputElement;
  weaponElementalSlider: HTMLInputElement;
  armorPhysicalSlider: HTMLInputElement;
  armorMagicalSlider: HTMLInputElement;
  armorElementalSlider: HTMLInputElement;

  constructor(game: Game) {
    this.game = game;

    this.weapon = getElementById('panel-equipment-weapon-value');
    this.armor = getElementById('panel-equipment-armor-value');

    this.weaponPhysicalSlider = getElementByIdAsType('panel-equipment-weapon-physical-slider', HTMLInputElement);
    this.weaponPhysicalSlider.onchange = this.onSliderChange.bind(this);
    this.weaponPhysicalSlider.value = '0';
    this.weaponMagicalSlider = getElementByIdAsType('panel-equipment-weapon-magical-slider', HTMLInputElement);
    this.weaponMagicalSlider.onchange = this.onSliderChange.bind(this);
    this.weaponMagicalSlider.value = '0';
    this.weaponElementalSlider = getElementByIdAsType('panel-equipment-weapon-elemental-slider', HTMLInputElement);
    this.weaponElementalSlider.onchange = this.onSliderChange.bind(this);
    this.weaponElementalSlider.value = '0';
    this.armorPhysicalSlider = getElementByIdAsType('panel-equipment-armor-physical-slider', HTMLInputElement);
    this.armorPhysicalSlider.onchange = this.onSliderChange.bind(this);
    this.armorPhysicalSlider.value = '0';
    this.armorMagicalSlider = getElementByIdAsType('panel-equipment-armor-magical-slider', HTMLInputElement);
    this.armorMagicalSlider.onchange = this.onSliderChange.bind(this);
    this.armorMagicalSlider.value = '0';
    this.armorElementalSlider = getElementByIdAsType('panel-equipment-armor-elemental-slider', HTMLInputElement);
    this.armorElementalSlider.onchange = this.onSliderChange.bind(this);
    this.armorElementalSlider.value = '0';
  }

  onSliderChange(e: Event) {
    const weapon = {
      physical: parseInt(this.weaponPhysicalSlider.value),
      magical: parseInt(this.weaponMagicalSlider.value),
      elemental: parseInt(this.weaponElementalSlider.value),
    };
    const armor = {
      physical: parseInt(this.armorPhysicalSlider.value),
      magical: parseInt(this.armorMagicalSlider.value),
      elemental: parseInt(this.armorElementalSlider.value),
    };
    this.game.adjustPartyEquipmentRelative(weapon, armor);
  }

  show() {
    const game = this.game;

    const { weapon, armor } = game.party;
    const weaponSize = Math.abs(weapon.physical) + Math.abs(weapon.magical) + Math.abs(weapon.elemental);
    const armorSize = Math.abs(armor.physical) + Math.abs(armor.magical) + Math.abs(armor.elemental);

    this.weapon.innerText = '' + weaponSize;
    this.armor.innerText = '' + armorSize;

    if (FLAGS.SHOW_EQ_DETAILS) {
      this.weapon.innerText += ` (${ weapon.physical }/${ weapon.magical }/${ weapon.elemental })`;
      this.armor.innerText += ` (${ armor.physical }/${ armor.magical }/${ armor.elemental })`;
    }
  }
}

class UIStats {
  game: Game;

  str: HTMLElement;
  dex: HTMLElement;
  con: HTMLElement;
  int: HTMLElement;
  wis: HTMLElement;
  cha: HTMLElement;

  constructor(game: Game) {
    this.game = game;

    this.str = getElementById('panel-stats-str-value');
    this.dex = getElementById('panel-stats-dex-value');
    this.con = getElementById('panel-stats-con-value');
    this.int = getElementById('panel-stats-int-value');
    this.wis = getElementById('panel-stats-wis-value');
    this.cha = getElementById('panel-stats-cha-value');
  }

  show() {
    this.str.innerText = '' + this.game.party.str;
    this.dex.innerText = '' + this.game.party.dex;
    this.con.innerText = '' + this.game.party.con;
    this.int.innerText = '' + this.game.party.int;
    this.wis.innerText = '' + this.game.party.wis;
    this.cha.innerText = '' + this.game.party.cha;
  }
}

class UITown {
  game: Game;

  townsfolk: HTMLElement;
  need: HTMLElement;
  boss: HTMLElement;

  takeQuest: HTMLButtonElement;
  fightBoss: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;

    this.townsfolk = getElementById('panel-town-townsfolk-value');
    this.need = getElementById('panel-town-need-value');
    this.boss = getElementById('panel-town-boss-value');

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
    this.need.innerText = '' + game.town.need;
    this.boss.innerText = '' + (game.fightingBoss ? game.boss.size : game.town.boss);

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
  weaponSliceCostBuy: HTMLElement;
  weaponSliceCostSell: HTMLElement;
  weaponDarkCostBuy: HTMLElement;
  weaponDarkCostSell: HTMLElement;
  weaponLightCostBuy: HTMLElement;
  weaponLightCostSell: HTMLElement;
  weaponFireCostBuy: HTMLElement;
  weaponFireCostSell: HTMLElement;
  weaponIceCostBuy: HTMLElement;
  weaponIceCostSell: HTMLElement;
  armorBluntCostBuy: HTMLElement;
  armorBluntCostSell: HTMLElement;
  armorSliceCostBuy: HTMLElement;
  armorSliceCostSell: HTMLElement;
  armorDarkCostBuy: HTMLElement;
  armorDarkCostSell: HTMLElement;
  armorLightCostBuy: HTMLElement;
  armorLightCostSell: HTMLElement;
  armorFireCostBuy: HTMLElement;
  armorFireCostSell: HTMLElement;
  armorIceCostBuy: HTMLElement;
  armorIceCostSell: HTMLElement;

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
    this.weaponSliceCostBuy = getElementById('panel-shop-weapon-slice-buy-cost-value');
    this.weaponSliceCostSell = getElementById('panel-shop-weapon-slice-sell-cost-value');
    this.weaponDarkCostBuy = getElementById('panel-shop-weapon-dark-buy-cost-value');
    this.weaponDarkCostSell = getElementById('panel-shop-weapon-dark-sell-cost-value');
    this.weaponLightCostBuy = getElementById('panel-shop-weapon-light-buy-cost-value');
    this.weaponLightCostSell = getElementById('panel-shop-weapon-light-sell-cost-value');
    this.weaponFireCostBuy = getElementById('panel-shop-weapon-fire-buy-cost-value');
    this.weaponFireCostSell = getElementById('panel-shop-weapon-fire-sell-cost-value');
    this.weaponIceCostBuy = getElementById('panel-shop-weapon-ice-buy-cost-value');
    this.weaponIceCostSell = getElementById('panel-shop-weapon-ice-sell-cost-value');
    this.armorBluntCostBuy = getElementById('panel-shop-armor-blunt-buy-cost-value');
    this.armorBluntCostSell = getElementById('panel-shop-armor-blunt-sell-cost-value');
    this.armorSliceCostBuy = getElementById('panel-shop-armor-slice-buy-cost-value');
    this.armorSliceCostSell = getElementById('panel-shop-armor-slice-sell-cost-value');
    this.armorDarkCostBuy = getElementById('panel-shop-armor-dark-buy-cost-value');
    this.armorDarkCostSell = getElementById('panel-shop-armor-dark-sell-cost-value');
    this.armorLightCostBuy = getElementById('panel-shop-armor-light-buy-cost-value');
    this.armorLightCostSell = getElementById('panel-shop-armor-light-sell-cost-value');
    this.armorFireCostBuy = getElementById('panel-shop-armor-fire-buy-cost-value');
    this.armorFireCostSell = getElementById('panel-shop-armor-fire-sell-cost-value');
    this.armorIceCostBuy = getElementById('panel-shop-armor-ice-buy-cost-value');
    this.armorIceCostSell = getElementById('panel-shop-armor-ice-sell-cost-value');

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

    this.foodCostBuy.innerText = '' + game.town.foodCostBuy;
    this.foodCostSell.innerText = '' + game.town.foodCostSell;
    this.waterCostBuy.innerText = '' + game.town.waterCostBuy;
    this.waterCostSell.innerText = '' + game.town.waterCostSell;
    this.weaponBluntCostBuy.innerText = '' + game.town.inventoryWeaponBuy.blunt;
    this.weaponBluntCostSell.innerText = '' + game.town.inventoryWeaponSell.blunt;
    this.weaponSliceCostBuy.innerText = '' + game.town.inventoryWeaponBuy.slice;
    this.weaponSliceCostSell.innerText = '' + game.town.inventoryWeaponSell.slice;
    this.weaponDarkCostBuy.innerText = '' + game.town.inventoryWeaponBuy.dark;
    this.weaponDarkCostSell.innerText = '' + game.town.inventoryWeaponSell.dark;
    this.weaponLightCostBuy.innerText = '' + game.town.inventoryWeaponBuy.light;
    this.weaponLightCostSell.innerText = '' + game.town.inventoryWeaponSell.light;
    this.weaponFireCostBuy.innerText = '' + game.town.inventoryWeaponBuy.fire;
    this.weaponFireCostSell.innerText = '' + game.town.inventoryWeaponSell.fire;
    this.weaponIceCostBuy.innerText = '' + game.town.inventoryWeaponBuy.ice;
    this.weaponIceCostSell.innerText = '' + game.town.inventoryWeaponSell.ice;
    this.armorBluntCostBuy.innerText = '' + game.town.inventoryArmorBuy.blunt;
    this.armorBluntCostSell.innerText = '' + game.town.inventoryArmorSell.blunt;
    this.armorSliceCostBuy.innerText = '' + game.town.inventoryArmorBuy.slice;
    this.armorSliceCostSell.innerText = '' + game.town.inventoryArmorSell.slice;
    this.armorDarkCostBuy.innerText = '' + game.town.inventoryArmorBuy.dark;
    this.armorDarkCostSell.innerText = '' + game.town.inventoryArmorSell.dark;
    this.armorLightCostBuy.innerText = '' + game.town.inventoryArmorBuy.light;
    this.armorLightCostSell.innerText = '' + game.town.inventoryArmorSell.light;
    this.armorFireCostBuy.innerText = '' + game.town.inventoryArmorBuy.fire;
    this.armorFireCostSell.innerText = '' + game.town.inventoryArmorSell.fire;
    this.armorIceCostBuy.innerText = '' + game.town.inventoryArmorBuy.ice;
    this.armorIceCostSell.innerText = '' + game.town.inventoryArmorSell.ice;

    this.foodBuyButton.disabled = game.party.gold < game.town.foodCostBuy || game.town.foodStock <= 0;
    this.foodSellButton.disabled = game.party.food <= 0;
    this.waterBuyButton.disabled = game.party.gold < game.town.waterCostBuy || game.town.waterStock <= 0;
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

class UIStatus {
  game: Game;

  listing: HTMLElement;

  constructor(game: Game) {
    this.game = game;

    this.listing = getElementById('panel-status-listing-value');
  }

  show() {
    const active: Array<string> = [];
    for (const status of STATUSES) {
      const s = this.game.party.status[status];
      if (s.active) {
        active.push(s.name);
      }
    }
    this.listing.innerText = active.join('\n');
  }
}

class UISkills {
  game: Game;

  initiativeBuy: HTMLElement;
  initiativeLevel: HTMLElement;
  initiativeBuyButton: HTMLButtonElement;
  inspireBuy: HTMLElement;
  inspireLevel: HTMLElement;
  inspireBuyButton: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;

    this.initiativeBuy = getElementById('panel-skills-initiative-buy-cost-value');
    this.initiativeLevel = getElementById('panel-skills-initiative-level-value');
    this.initiativeBuyButton = getElementByIdAsType('panel-skills-initiative-buy-button', HTMLButtonElement);
    this.initiativeBuyButton.onclick = (e) => {
      game.buySkill('initiative');
    };
    this.inspireBuy = getElementById('panel-skills-inspire-buy-cost-value');
    this.inspireLevel = getElementById('panel-skills-inspire-level-value');
    this.inspireBuyButton = getElementByIdAsType('panel-skills-inspire-buy-button', HTMLButtonElement);
    this.inspireBuyButton.onclick = (e) => {
      game.buySkill('inspire');
    };
  }

  show() {
    {
      // TODO: Maybe iterate over SKILLS
      const cost = this.game.getSkillCost('initiative');
      this.initiativeBuy.innerText = '' + cost;
      this.initiativeLevel.innerText = '' + this.game.party.skills.initiative.level;
      this.initiativeBuyButton.disabled = !this.game.canBuySkill('initiative');
    }
    {
      const cost = this.game.getSkillCost('inspire');
      this.inspireBuy.innerText = '' + cost;
      this.inspireLevel.innerText = '' + this.game.party.skills.inspire.level;
      this.inspireBuyButton.disabled = !this.game.canBuySkill('inspire');
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
  stats: UIStats;
  town: UITown;
  shop: UIShop;
  status: UIStatus;
  log: UILog;

  constructor(game: Game) {
    this.party = new UIParty(game);
    this.equipment = new UIEquipment(game);
    this.skills = new UISkills(game);
    this.stats = new UIStats(game);
    this.town = new UITown(game);
    this.shop = new UIShop(game);
    this.status = new UIStatus(game);
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
    this.stats.show();
    this.town.show();
    this.shop.show();
    this.status.show();
    this.log.show();
  }
}

let ui: UI;

function initUI(game: Game) {
  ui = new UI(game);
}
