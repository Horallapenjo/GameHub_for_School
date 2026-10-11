const STORAGE_KEY = 'gameshub-save-v2';

const defaultState = {
  clicker: {
    pixels: 0,
    clickLevel: 1,
    autoLevel: 0,
    clickCost: 10,
    autoCost: 25,
    perTap: 1,
    autoPerSec: 0,
  },
  miner: {
    ore: 0,
    workers: 0,
    drills: 0,
    workerCost: 15,
    drillCost: 80,
    orePerSec: 0,
  },
  forge: {
    flux: 0,
    smelters: 0,
    bots: 0,
    smelterCost: 20,
    botCost: 90,
    fluxPerSec: 0,
  },
  memory: {
    moves: 0,
    pairs: 0,
    deck: [],
    selected: [],
    locked: false,
    solved: 0,
  },
  reflex: {
    best: 0,
    status: 'ready',
    waiting: false,
    startTime: 0,
    timerId: null,
  },
};

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

const state = loadState();

const ui = {
  statusPill: document.getElementById('statusPill'),
  resetAll: document.getElementById('resetAll'),
  pixelButton: document.getElementById('pixelButton'),
  pixelCount: document.getElementById('pixelCount'),
  pixelPerTap: document.getElementById('pixelPerTap'),
  pixelAutoRate: document.getElementById('pixelAutoRate'),
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
  memoryGrid: document.getElementById('memoryGrid'),
  memoryMoves: document.getElementById('memoryMoves'),
  memoryPairs: document.getElementById('memoryPairs'),
  reflexButton: document.getElementById('reflexButton'),
  reflexStatus: document.getElementById('reflexStatus'),
  reflexBest: document.getElementById('reflexBest'),
  gameLinks: document.querySelectorAll('.game-link'),
  gamePanels: document.querySelectorAll('[data-game-panel]'),
};

function formatShort(value) {
  if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
  return Math.floor(value).toString();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneDefaultState();

  try {
    const parsed = JSON.parse(raw);
    return {
      clicker: { ...defaultState.clicker, ...parsed.clicker },
      miner: { ...defaultState.miner, ...parsed.miner },
      forge: { ...defaultState.forge, ...parsed.forge },
      memory: { ...defaultState.memory, ...parsed.memory },
      reflex: { ...defaultState.reflex, ...parsed.reflex },
    };
  } catch {
    return cloneDefaultState();
  }
}

function setStatus(text) {
  ui.statusPill.textContent = text;
}

function activateGame(gameName) {
  ui.gameLinks.forEach((link) => {
    const active = link.dataset.game === gameName;
    link.classList.toggle('active', active);
  });

  ui.gamePanels.forEach((panel) => {
    const active = panel.dataset.gamePanel === gameName;
    panel.classList.toggle('active', active);
  });
}

function updateClickerUI() {
  const clicker = state.clicker;
  ui.pixelCount.textContent = formatShort(clicker.pixels);
  ui.pixelPerTap.textContent = String(clicker.perTap);
  ui.pixelAutoRate.textContent = String(clicker.autoPerSec);
  ui.pixelClickUpgradeCost.textContent = formatShort(clicker.clickCost);
  ui.pixelAutoUpgradeCost.textContent = formatShort(clicker.autoCost);
}

function updateMinerUI() {
  const miner = state.miner;
  ui.oreCount.textContent = formatShort(miner.ore);
  ui.orePerSecond.textContent = String(miner.orePerSec);
  ui.minerWorkers.textContent = String(miner.workers);
  ui.minerWorkerCost.textContent = formatShort(miner.workerCost);
  ui.minerDrillCost.textContent = formatShort(miner.drillCost);
}

function updateForgeUI() {
  const forge = state.forge;
  ui.fluxCount.textContent = formatShort(forge.flux);
  ui.fluxPerSecond.textContent = String(forge.fluxPerSec);
  ui.forgeSmelters.textContent = String(forge.smelters);
  ui.forgeSmelterCost.textContent = formatShort(forge.smelterCost);
  ui.forgeBotCost.textContent = formatShort(forge.botCost);
}

function renderMemory() {
  const memory = state.memory;
  ui.memoryMoves.textContent = String(memory.moves);
  ui.memoryPairs.textContent = `${memory.pairs}/8`;

  ui.memoryGrid.innerHTML = '';
  memory.deck.forEach((tile, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `memory-tile ${tile.revealed || tile.matched ? '' : 'hidden'} ${tile.matched ? 'matched' : ''}`;
    button.textContent = tile.revealed || tile.matched ? tile.symbol : '';
    button.disabled = tile.matched || memory.locked || tile.revealed;
    button.addEventListener('click', () => pickMemoryTile(index));
    ui.memoryGrid.appendChild(button);
  });
}

function renderReflex() {
  const reflex = state.reflex;
  ui.reflexStatus.textContent = reflex.status === 'go' ? 'GO!' : reflex.status === 'wait' ? 'Wait...' : reflex.status === 'early' ? 'Too soon' : 'Ready';
  ui.reflexButton.textContent = reflex.status === 'go' ? 'Click now!' : reflex.status === 'early' ? 'Try again' : reflex.status === 'wait' ? 'Wait...' : 'Wait for green';
  ui.reflexButton.classList.toggle('ready', reflex.status === 'go');
  ui.reflexBest.textContent = reflex.best ? `${reflex.best.toFixed(0)}ms` : '0ms';
}

function renderAll() {
  updateClickerUI();
  updateMinerUI();
  updateForgeUI();
  renderMemory();
  renderReflex();
}

function gainPixels(amount) {
  state.clicker.pixels += amount;
}

function gainOre(amount) {
  state.miner.ore += amount;
}

function gainFlux(amount) {
  state.forge.flux += amount;
}

function buyClickUpgrade() {
  const clicker = state.clicker;
  if (clicker.pixels < clicker.clickCost) return;
  clicker.pixels -= clicker.clickCost;
  clicker.clickLevel += 1;
  clicker.perTap = clicker.clickLevel;
  clicker.clickCost = Math.floor(clicker.clickCost * 1.6) + 4;
  setStatus('Tap power upgraded');
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
  setStatus('Auto miner online');
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
  setStatus('Workers hired');
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
  setStatus('Drills upgraded');
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
  setStatus('New smelter online');
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
  setStatus('Automation bot synced');
  renderAll();
  saveState();
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createMemoryDeck() {
  const icons = ['⚡', '✨', '🎯', '🎲', '👾', '⭐', '🎮', '🧠'];
  const deck = shuffle([...icons, ...icons]).map((symbol, index) => ({
    id: `${symbol}-${index}-${Math.random()}`,
    symbol,
    revealed: false,
    matched: false,
  }));

  state.memory.deck = deck;
  state.memory.moves = 0;
  state.memory.pairs = 0;
  state.memory.selected = [];
  state.memory.locked = false;
  state.memory.solved = 0;
}

function pickMemoryTile(index) {
  const tile = state.memory.deck[index];
  if (state.memory.locked || tile.matched || tile.revealed) return;

  tile.revealed = true;
  state.memory.selected.push(index);
  renderMemory();

  if (state.memory.selected.length === 2) {
    state.memory.moves += 1;
    const [firstIndex, secondIndex] = state.memory.selected;
    const firstTile = state.memory.deck[firstIndex];
    const secondTile = state.memory.deck[secondIndex];

    if (firstTile.symbol === secondTile.symbol) {
      firstTile.matched = true;
      secondTile.matched = true;
      state.memory.selected = [];
      state.memory.pairs += 1;
      state.memory.solved += 1;
      if (state.memory.solved === 8) {
        setStatus('Memory cleared');
      }
      renderMemory();
      saveState();
      return;
    }

    state.memory.locked = true;
    setTimeout(() => {
      firstTile.revealed = false;
      secondTile.revealed = false;
      state.memory.selected = [];
      state.memory.locked = false;
      renderMemory();
      saveState();
    }, 500);
  }

  saveState();
}

function resetReflexGame() {
  const reflex = state.reflex;
  if (reflex.timerId) {
    clearTimeout(reflex.timerId);
  }
  reflex.status = 'ready';
  reflex.waiting = false;
  reflex.startTime = 0;
  reflex.timerId = null;
  ui.reflexButton.textContent = 'Wait for green';
  renderReflex();
}

function triggerReflex() {
  const reflex = state.reflex;
  if (reflex.status === 'wait' || reflex.status === 'go') {
    return;
  }

  reflex.status = 'wait';
  reflex.waiting = true;
  ui.reflexButton.classList.remove('ready');
  renderReflex();

  const delay = 1200 + Math.random() * 2200;
  reflex.timerId = setTimeout(() => {
    reflex.status = 'go';
    reflex.startTime = performance.now();
    renderReflex();
  }, delay);
}

function clickReflexButton() {
  const reflex = state.reflex;

  if (reflex.status === 'ready') {
    triggerReflex();
    return;
  }

  if (reflex.status === 'wait') {
    if (reflex.timerId) clearTimeout(reflex.timerId);
    reflex.status = 'early';
    reflex.waiting = false;
    ui.reflexButton.textContent = 'Too soon';
    renderReflex();
    setTimeout(() => resetReflexGame(), 700);
    return;
  }

  if (reflex.status === 'go') {
    const reaction = performance.now() - reflex.startTime;
    reflex.best = reflex.best ? Math.min(reflex.best, reaction) : reaction;
    reflex.status = 'ready';
    reflex.waiting = false;
    ui.reflexButton.textContent = `${reaction.toFixed(0)}ms`;
    setStatus('Reaction locked in');
    renderReflex();
    setTimeout(() => resetReflexGame(), 700);
    saveState();
  }
}

function tick() {
  const clicker = state.clicker;
  if (clicker.autoPerSec > 0) {
    gainPixels(clicker.autoPerSec * 0.2);
  }

  const miner = state.miner;
  if (miner.orePerSec > 0) {
    gainOre(miner.orePerSec * 0.2);
  }

  const forge = state.forge;
  if (forge.fluxPerSec > 0) {
    gainFlux(forge.fluxPerSec * 0.2);
  }

  renderAll();
  saveState();
}

function bindEvents() {
  ui.gameLinks.forEach((link) => {
    link.addEventListener('click', () => activateGame(link.dataset.game));
  });

  ui.pixelButton.addEventListener('click', () => {
    gainPixels(state.clicker.perTap);
    setStatus('Pixel burst');
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

  ui.resetAll.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, cloneDefaultState());
    createMemoryDeck();
    resetReflexGame();
    setStatus('Save reset');
    renderAll();
  });

  ui.reflexButton.addEventListener('click', clickReflexButton);
}

function boot() {
  if (!state.memory.deck.length) {
    createMemoryDeck();
  }
  resetReflexGame();
  bindEvents();
  activateGame('clicker');
  renderAll();
  setInterval(tick, 200);
}

boot();
