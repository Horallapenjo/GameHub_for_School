const STORAGE_KEY = 'gameshub-save-v1';

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

const defaultState = {
  clicker: {
    pixels: 0,
    totalPixels: 0,
    clickLevel: 1,
    autoLevel: 0,
    clickCost: 10,
    autoCost: 25,
    perTap: 1,
    autoPerSec: 0,
  },
  miner: {
    ore: 0,
    totalOre: 0,
    workers: 0,
    drills: 0,
    workerCost: 15,
    drillCost: 80,
    orePerSec: 0,
  },
  forge: {
    flux: 0,
    totalFlux: 0,
    smelters: 0,
    bots: 0,
    smelterCost: 20,
    botCost: 90,
    fluxPerSec: 0,
  },
};

const state = loadState();

const els = {
  pixelButton: document.getElementById('pixelButton'),
  pixelCount: document.getElementById('pixelCount'),
  pixelPerTap: document.getElementById('pixelPerTap'),
  pixelClickUpgradeCost: document.getElementById('pixelClickUpgradeCost'),
  pixelAutoUpgradeCost: document.getElementById('pixelAutoUpgradeCost'),

  oreCount: document.getElementById('oreCount'),
  orePerSecond: document.getElementById('orePerSecond'),
  minerWorkers: document.getElementById('minerWorkers'),
  minerWorkerCost: document.getElementById('minerWorkerCost'),
  minerDrillCost: document.getElementById('minerDrillCost'),

  fluxCount: document.getElementById('fluxCount'),
  fluxPerSecond: document.getElementById('fluxPerSecond'),
  forgeSmelters: document.getElementById('forgeSmelters'),
  forgeSmelterCost: document.getElementById('forgeSmelterCost'),
  forgeBotCost: document.getElementById('forgeBotCost'),

  resetAll: document.getElementById('resetAll'),
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return cloneDefaultState();

  try {
    const parsed = JSON.parse(saved);
    return {
      clicker: { ...defaultState.clicker, ...parsed.clicker },
      miner: { ...defaultState.miner, ...parsed.miner },
      forge: { ...defaultState.forge, ...parsed.forge },
    };
  } catch {
    return cloneDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatNumber(value) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(2) + 'K';
  return Math.floor(value).toString();
}

function addPixels(amount) {
  state.clicker.pixels += amount;
  state.clicker.totalPixels += amount;
}

function addOre(amount) {
  state.miner.ore += amount;
  state.miner.totalOre += amount;
}

function addFlux(amount) {
  state.forge.flux += amount;
  state.forge.totalFlux += amount;
}

function updateClickerUI() {
  const clicker = state.clicker;
  els.pixelCount.textContent = formatNumber(clicker.pixels);
  els.pixelPerTap.textContent = clicker.perTap.toString();
  els.pixelClickUpgradeCost.textContent = formatNumber(clicker.clickCost);
  els.pixelAutoUpgradeCost.textContent = formatNumber(clicker.autoCost);
}

function updateMinerUI() {
  const miner = state.miner;
  els.oreCount.textContent = formatNumber(miner.ore);
  els.orePerSecond.textContent = formatNumber(miner.orePerSec);
  els.minerWorkers.textContent = formatNumber(miner.workers);
  els.minerWorkerCost.textContent = formatNumber(miner.workerCost);
  els.minerDrillCost.textContent = formatNumber(miner.drillCost);
}

function updateForgeUI() {
  const forge = state.forge;
  els.fluxCount.textContent = formatNumber(forge.flux);
  els.fluxPerSecond.textContent = formatNumber(forge.fluxPerSec);
  els.forgeSmelters.textContent = formatNumber(forge.smelters);
  els.forgeSmelterCost.textContent = formatNumber(forge.smelterCost);
  els.forgeBotCost.textContent = formatNumber(forge.botCost);
}

function renderAll() {
  updateClickerUI();
  updateMinerUI();
  updateForgeUI();
}

function buyClickUpgrade() {
  const clicker = state.clicker;
  if (clicker.pixels < clicker.clickCost) return;

  clicker.pixels -= clicker.clickCost;
  clicker.clickLevel += 1;
  clicker.perTap = clicker.clickLevel;
  clicker.clickCost = Math.floor(clicker.clickCost * 1.6) + 4;
  renderAll();
  saveState();
}

function buyAutoUpgrade() {
  const clicker = state.clicker;
  if (clicker.pixels < clicker.autoCost) return;

  clicker.pixels -= clicker.autoCost;
  clicker.autoLevel += 1;
  clicker.autoPerSec = clicker.autoLevel;
  clicker.autoCost = Math.floor(clicker.autoCost * 1.8) + 8;
  renderAll();
  saveState();
}

function buyMinerWorker() {
  const miner = state.miner;
  if (miner.ore < miner.workerCost) return;

  miner.ore -= miner.workerCost;
  miner.workers += 1;
  miner.orePerSec = miner.workers + miner.drills * 2;
  miner.workerCost = Math.floor(miner.workerCost * 1.7) + 5;
  renderAll();
  saveState();
}

function buyMinerDrill() {
  const miner = state.miner;
  if (miner.ore < miner.drillCost) return;

  miner.ore -= miner.drillCost;
  miner.drills += 1;
  miner.orePerSec = miner.workers + miner.drills * 2;
  miner.drillCost = Math.floor(miner.drillCost * 1.9) + 12;
  renderAll();
  saveState();
}

function buySmelter() {
  const forge = state.forge;
  if (forge.flux < forge.smelterCost) return;

  forge.flux -= forge.smelterCost;
  forge.smelters += 1;
  forge.fluxPerSec = forge.smelters + forge.bots * 3;
  forge.smelterCost = Math.floor(forge.smelterCost * 1.75) + 7;
  renderAll();
  saveState();
}

function buyForgeBot() {
  const forge = state.forge;
  if (forge.flux < forge.botCost) return;

  forge.flux -= forge.botCost;
  forge.bots += 1;
  forge.fluxPerSec = forge.smelters + forge.bots * 3;
  forge.botCost = Math.floor(forge.botCost * 1.8) + 15;
  renderAll();
  saveState();
}

function bindEvents() {
  els.pixelButton.addEventListener('click', () => {
    addPixels(state.clicker.perTap);
    renderAll();
    saveState();
  });

  document.querySelectorAll('[data-game="clicker"]').forEach((button) => {
    button.addEventListener('click', () => {
      const upgrade = button.dataset.upgrade;
      if (upgrade === 'click') buyClickUpgrade();
      if (upgrade === 'auto') buyAutoUpgrade();
    });
  });

  document.querySelectorAll('[data-game="miner"]').forEach((button) => {
    button.addEventListener('click', () => {
      const upgrade = button.dataset.upgrade;
      if (upgrade === 'worker') buyMinerWorker();
      if (upgrade === 'drill') buyMinerDrill();
    });
  });

  document.querySelectorAll('[data-game="forge"]').forEach((button) => {
    button.addEventListener('click', () => {
      const upgrade = button.dataset.upgrade;
      if (upgrade === 'smelter') buySmelter();
      if (upgrade === 'bot') buyForgeBot();
    });
  });

  els.resetAll.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, cloneDefaultState());
    renderAll();
  });
}

function tick() {
  const clicker = state.clicker;
  if (clicker.autoPerSec > 0) {
    addPixels(clicker.autoPerSec * 0.2);
  }

  const miner = state.miner;
  if (miner.orePerSec > 0) {
    addOre(miner.orePerSec * 0.2);
  }

  const forge = state.forge;
  if (forge.fluxPerSec > 0) {
    addFlux(forge.fluxPerSec * 0.2);
  }

  renderAll();
  saveState();
}

bindEvents();
renderAll();
setInterval(tick, 200);
