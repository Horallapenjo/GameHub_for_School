const canvasIds = {
  hopper: document.getElementById('hopper-canvas'),
  blaster: document.getElementById('blaster-canvas'),
  breaker: document.getElementById('breaker-canvas'),
};

const ui = {
  hopperScore: document.getElementById('hopper-score'),
  hopperBest: document.getElementById('hopper-best'),
  blasterScore: document.getElementById('blaster-score'),
  blasterHp: document.getElementById('blaster-hp'),
  breakerScore: document.getElementById('breaker-score'),
  breakerLives: document.getElementById('breaker-lives'),
  gameLinks: document.querySelectorAll('.game-link'),
  gamePanels: document.querySelectorAll('.game-panel'),
  resetAll: document.getElementById('resetAll'),
};

const localBestKey = 'gameshub-best-v2';
const bestScores = {
  hopper: Number(localStorage.getItem(localBestKey + '-hopper') || 0),
  blaster: Number(localStorage.getItem(localBestKey + '-blaster') || 0),
  breaker: Number(localStorage.getItem(localBestKey + '-breaker') || 0),
};

const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  shoot: false,
};

const gameState = {
  active: 'hopper',
  hopper: null,
  blaster: null,
  breaker: null,
};

function makeHopper() {
  return {
    player: { x: 90, y: 440, w: 52, h: 52, vy: 0, onGround: true },
    obstacles: [],
    spawnTimer: 0,
    speed: 270,
    score: 0,
    best: bestScores.hopper,
    running: true,
    started: false,
  };
}

function makeBlaster() {
  return {
    player: { x: 150, y: 270, r: 20, hp: 5, cooldown: 0 },
    bullets: [],
    enemies: [],
    enemyBullets: [],
    score: 0,
    best: bestScores.blaster,
    nextEnemyTimer: 1.0,
    running: true,
    mouse: { x: 0, y: 0 },
  };
}

function makeBreaker() {
  return {
    paddle: { x: 420, y: 490, w: 160, h: 20 },
    ball: { x: 480, y: 340, r: 10, vx: 4.3, vy: -4.3 },
    bricks: [],
    score: 0,
    best: bestScores.breaker,
    lives: 3,
    running: true,
  };
}

function resetBreaker() {
  const state = makeBreaker();
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      state.bricks.push({
        x: 90 + col * 96,
        y: 70 + row * 34,
        w: 76,
        h: 24,
        alive: true,
      });
    }
  }
  gameState.breaker = state;
}

function resetBlaster() {
  gameState.blaster = makeBlaster();
}

function resetHopper() {
  gameState.hopper = makeHopper();
}

function updateBest(kind, value) {
  if (value > bestScores[kind]) {
    bestScores[kind] = value;
    localStorage.setItem(localBestKey + '-' + kind, String(value));
  }
}

function setActiveGame(gameName) {
  gameState.active = gameName;
  ui.gameLinks.forEach((button) => {
    button.classList.toggle('active', button.dataset.game === gameName);
  });
  ui.gamePanels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === gameName);
  });
}

function handleJump() {
  const hopper = gameState.hopper;
  if (!hopper) return;
  if (hopper.player.onGround) {
    hopper.player.vy = -14.5;
    hopper.player.onGround = false;
  }
}

function updateHopper(dt) {
  const hopper = gameState.hopper;
  if (!hopper || !hopper.running) return;

  const player = hopper.player;
  player.vy += 28 * dt;
  player.y += player.vy * 60 * dt;

  if (player.y >= 440) {
    player.y = 440;
    player.vy = 0;
    player.onGround = true;
  }

  hopper.spawnTimer -= dt;
  if (hopper.spawnTimer <= 0) {
    const height = 40 + Math.random() * 90;
    hopper.obstacles.push({
      x: 980,
      y: 520 - height,
      w: 38 + Math.random() * 30,
      h: height,
    });
    hopper.spawnTimer = 0.95 + Math.random() * 0.8;
  }

  const speed = hopper.speed + hopper.score * 0.025;
  hopper.obstacles.forEach((obstacle) => {
    obstacle.x -= speed * dt;
  });

  hopper.obstacles = hopper.obstacles.filter((obstacle) => obstacle.x + obstacle.w > -20);

  const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };
  let hit = false;
  hopper.obstacles.forEach((obstacle) => {
    if (
      playerBox.x < obstacle.x + obstacle.w &&
      playerBox.x + playerBox.w > obstacle.x &&
      playerBox.y < obstacle.y + obstacle.h &&
      playerBox.y + playerBox.h > obstacle.y
    ) {
      hit = true;
    }
  });

  if (hit) {
    hopper.running = false;
    updateBest('hopper', Math.floor(hopper.score));
    return;
  }

  hopper.score += dt * 26;
  ui.hopperScore.textContent = Math.floor(hopper.score);
  ui.hopperBest.textContent = Math.floor(hopper.best);
}

function drawHopper() {
  const canvas = canvasIds.hopper;
  const ctx = canvas.getContext('2d');
  const hopper = gameState.hopper;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#13263d');
  bg.addColorStop(1, '#08131d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#7ed6ff';
  for (let i = 0; i < 50; i += 1) {
    const x = (i * 97 + (hopper ? hopper.score * 1.2 : 0)) % (canvas.width + 50);
    const y = (i * 61) % 200;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = '#1a3d42';
  ctx.fillRect(0, 500, canvas.width, 40);

  if (!hopper) return;

  if (!hopper.running) {
    ctx.fillStyle = 'rgba(10, 10, 12, 0.72)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ecf6ff';
    ctx.font = '700 38px Inter';
    ctx.fillText('Run over', 390, 250);
    ctx.font = '500 22px Inter';
    ctx.fillStyle = '#a0bfd7';
    ctx.fillText('Press Space to restart', 370, 290);
    return;
  }

  hopper.obstacles.forEach((obstacle) => {
    ctx.fillStyle = '#53d1b9';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(obstacle.x + 8, obstacle.y + 8, obstacle.w - 16, obstacle.h - 16);
  });

  const player = hopper.player;
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#0e1d2a';
  ctx.fillRect(player.x + 12, player.y + 14, 10, 10);
  ctx.fillRect(player.x + 30, player.y + 14, 10, 10);
}

function startBlasterRound() {
  const blaster = gameState.blaster;
  if (!blaster) return;
  blaster.running = true;
  blaster.player.hp = 5;
  blaster.score = 0;
  blaster.bullets = [];
  blaster.enemies = [];
  blaster.enemyBullets = [];
}

function fireBlasterBullet() {
  const blaster = gameState.blaster;
  if (!blaster || !blaster.running) return;
  const player = blaster.player;

  if (player.cooldown > 0) return;
  const targetX = blaster.mouse.x || player.x + 150;
  const targetY = blaster.mouse.y || player.y;
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const len = Math.hypot(dx, dy) || 1;
  blaster.bullets.push({ x: player.x + 18, y: player.y, vx: (dx / len) * 9, vy: (dy / len) * 9, r: 5 });
  player.cooldown = 0.18;
}

function updateBlaster(dt) {
  const blaster = gameState.blaster;
  if (!blaster || !blaster.running) return;

  const player = blaster.player;
  player.cooldown = Math.max(0, player.cooldown - dt);

  let dx = 0;
  let dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    player.x += (dx / len) * 260 * dt;
    player.y += (dy / len) * 260 * dt;
  }

  player.x = Math.max(30, Math.min(930, player.x));
  player.y = Math.max(30, Math.min(500, player.y));

  if (keys.shoot) fireBlasterBullet();

  blaster.bullets.forEach((bullet) => {
    bullet.x += bullet.vx * 60 * dt;
    bullet.y += bullet.vy * 60 * dt;
  });

  blaster.nextEnemyTimer -= dt;
  if (blaster.nextEnemyTimer <= 0) {
    const side = Math.floor(Math.random() * 4);
    const enemy = { x: 0, y: 0, r: 16 + Math.random() * 12, hp: 1 };
    if (side === 0) { enemy.x = -30; enemy.y = Math.random() * 540; }
    if (side === 1) { enemy.x = 990; enemy.y = Math.random() * 540; }
    if (side === 2) { enemy.x = Math.random() * 960; enemy.y = -30; }
    if (side === 3) { enemy.x = Math.random() * 960; enemy.y = 570; }
    blaster.enemies.push(enemy);
    blaster.nextEnemyTimer = 1.1;
  }

  const playerPoint = { x: player.x, y: player.y };
  blaster.enemies.forEach((enemy) => {
    const dxE = playerPoint.x - enemy.x;
    const dyE = playerPoint.y - enemy.y;
    const len = Math.hypot(dxE, dyE) || 1;
    enemy.x += (dxE / len) * 70 * dt;
    enemy.y += (dyE / len) * 70 * dt;

    if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.r + enemy.r) {
      player.hp -= 1;
      enemy.x = -400;
      enemy.y = -400;
    }

    if (Math.random() < 0.012) {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      blaster.enemyBullets.push({ x: enemy.x, y: enemy.y, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6, r: 5 });
    }
  });

  blaster.bullets = blaster.bullets.filter((bullet) => {
    let alive = true;
    blaster.enemies = blaster.enemies.filter((enemy) => {
      if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.r + enemy.r) {
        alive = false;
        blaster.score += 10;
        return false;
      }
      return true;
    });
    return alive && bullet.x > -10 && bullet.x < 1010 && bullet.y > -10 && bullet.y < 560;
  });

  blaster.enemyBullets = blaster.enemyBullets.filter((bullet) => {
    const collided = Math.hypot(player.x - bullet.x, player.y - bullet.y) < player.r + bullet.r;
    if (collided) {
      player.hp -= 1;
    }
    return !collided && bullet.x > -10 && bullet.x < 1010 && bullet.y > -10 && bullet.y < 560;
  });

  if (player.hp <= 0) {
    blaster.running = false;
    updateBest('blaster', blaster.score);
  }

  ui.blasterScore.textContent = blaster.score;
  ui.blasterHp.textContent = player.hp;
}

function drawBlaster() {
  const canvas = canvasIds.blaster;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#111d30');
  gradient.addColorStop(1, '#070d16');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blaster = gameState.blaster;
  if (!blaster) return;

  for (let i = 0; i < 60; i += 1) {
    const x = (i * 77) % (canvas.width + 30);
    const y = (i * 139) % (canvas.height + 30);
    ctx.fillStyle = 'rgba(121, 214, 255, 0.3)';
    ctx.fillRect(x, y, 2, 2);
  }

  if (!blaster.running) {
    ctx.fillStyle = 'rgba(8, 12, 17, 0.74)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ecf6ff';
    ctx.font = '700 36px Inter';
    ctx.fillText('Ship down', 385, 250);
    ctx.font = '500 22px Inter';
    ctx.fillStyle = '#a0bfd7';
    ctx.fillText('Press R to restart', 395, 292);
    return;
  }

  blaster.enemies.forEach((enemy) => {
    ctx.fillStyle = '#ff7bd7';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
    ctx.fill();
  });

  blaster.bullets.forEach((bullet) => {
    ctx.fillStyle = '#79d6ff';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
    ctx.fill();
  });

  blaster.enemyBullets.forEach((bullet) => {
    ctx.fillStyle = '#ff6c7c';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const player = blaster.player;
  ctx.fillStyle = '#7ef0b1';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ecf6ff';
  ctx.fillRect(player.x - 22, player.y - 6, 44, 14);
}

function resetBreakout() {
  gameState.breaker = makeBreaker();
  const state = gameState.breaker;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      state.bricks.push({
        x: 120 + col * 90,
        y: 70 + row * 32,
        w: 72,
        h: 22,
        alive: true,
      });
    }
  }
}

function updateBreaker(dt) {
  const breaker = gameState.breaker;
  if (!breaker || !breaker.running) return;

  if (keys.left) breaker.paddle.x -= 420 * dt;
  if (keys.right) breaker.paddle.x += 420 * dt;
  breaker.paddle.x = Math.max(70, Math.min(860, breaker.paddle.x));

  breaker.ball.x += breaker.ball.vx * 60 * dt;
  breaker.ball.y += breaker.ball.vy * 60 * dt;

  if (breaker.ball.x <= 10 || breaker.ball.x >= 950) breaker.ball.vx *= -1;
  if (breaker.ball.y <= 10) breaker.ball.vy *= -1;

  const pad = breaker.paddle;
  if (
    breaker.ball.y + breaker.ball.r > pad.y &&
    breaker.ball.y - breaker.ball.r < pad.y + pad.h &&
    breaker.ball.x > pad.x &&
    breaker.ball.x < pad.x + pad.w &&
    breaker.ball.vy > 0
  ) {
    breaker.ball.vy *= -1;
    breaker.ball.vx += (breaker.ball.x - (pad.x + pad.w / 2)) * 0.08;
  }

  for (const brick of breaker.bricks) {
    if (!brick.alive) continue;
    if (
      breaker.ball.x + breaker.ball.r > brick.x &&
      breaker.ball.x - breaker.ball.r < brick.x + brick.w &&
      breaker.ball.y + breaker.ball.r > brick.y &&
      breaker.ball.y - breaker.ball.r < brick.y + brick.h
    ) {
      brick.alive = false;
      breaker.ball.vy *= -1;
      breaker.score += 10;
      updateBest('breaker', breaker.score);
      break;
    }
  }

  if (breaker.ball.y > 560) {
    breaker.lives -= 1;
    if (breaker.lives <= 0) {
      breaker.running = false;
      updateBest('breaker', breaker.score);
    } else {
      breaker.ball.x = 480;
      breaker.ball.y = 340;
      breaker.ball.vx = 4.5;
      breaker.ball.vy = -4.5;
      breaker.paddle.x = 420;
    }
  }

  ui.breakerScore.textContent = breaker.score;
  ui.breakerLives.textContent = breaker.lives;
}

function drawBreaker() {
  const canvas = canvasIds.breaker;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0d1b2c');
  gradient.addColorStop(1, '#050d15');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const breaker = gameState.breaker;
  if (!breaker) return;

  if (!breaker.running) {
    ctx.fillStyle = 'rgba(8, 12, 17, 0.76)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ecf6ff';
    ctx.font = '700 36px Inter';
    ctx.fillText('Game over', 390, 250);
    ctx.font = '500 22px Inter';
    ctx.fillStyle = '#a0bfd7';
    ctx.fillText('Press R to restart', 395, 292);
    return;
  }

  breaker.bricks.forEach((brick) => {
    if (!brick.alive) return;
    ctx.fillStyle = '#79d6ff';
    ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
  });

  ctx.fillStyle = '#ffd166';
  ctx.fillRect(breaker.paddle.x, breaker.paddle.y, breaker.paddle.w, breaker.paddle.h);

  ctx.fillStyle = '#ecf6ff';
  ctx.beginPath();
  ctx.arc(breaker.ball.x, breaker.ball.y, breaker.ball.r, 0, Math.PI * 2);
  ctx.fill();
}

function resetAllGames() {
  resetHopper();
  resetBlaster();
  resetBreakout();
  ui.hopperScore.textContent = 0;
  ui.hopperBest.textContent = bestScores.hopper;
  ui.blasterScore.textContent = 0;
  ui.blasterHp.textContent = 5;
  ui.breakerScore.textContent = 0;
  ui.breakerLives.textContent = 3;
}

function restartFromKey() {
  if (gameState.active === 'hopper') {
    resetHopper();
  }
  if (gameState.active === 'blaster') {
    resetBlaster();
  }
  if (gameState.active === 'breaker') {
    resetBreakout();
  }
}

function handleKeyDown(event) {
  if (event.code === 'Space' || event.code === 'KeyW' || event.code === 'ArrowUp') {
    handleJump();
  }
  if (event.code === 'KeyR') {
    restartFromKey();
  }
  if (event.code === 'KeyA' || event.code === 'ArrowLeft') keys.left = true;
  if (event.code === 'KeyD' || event.code === 'ArrowRight') keys.right = true;
  if (event.code === 'KeyW' || event.code === 'ArrowUp') keys.up = true;
  if (event.code === 'KeyS' || event.code === 'ArrowDown') keys.down = true;
  if (event.code === 'Space') keys.shoot = true;
}

function handleKeyUp(event) {
  if (event.code === 'KeyA' || event.code === 'ArrowLeft') keys.left = false;
  if (event.code === 'KeyD' || event.code === 'ArrowRight') keys.right = false;
  if (event.code === 'KeyW' || event.code === 'ArrowUp') keys.up = false;
  if (event.code === 'KeyS' || event.code === 'ArrowDown') keys.down = false;
  if (event.code === 'Space') keys.shoot = false;
}

function bindCanvasInput() {
  Object.values(canvasIds).forEach((canvas) => {
    canvas.addEventListener('pointerdown', () => {
      if (gameState.active === 'hopper') handleJump();
      if (gameState.active === 'blaster') fireBlasterBullet();
    });
  });

  canvasIds.blaster.addEventListener('pointermove', (event) => {
    const rect = canvasIds.blaster.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvasIds.blaster.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvasIds.blaster.height;
    if (gameState.blaster) {
      gameState.blaster.mouse.x = x;
      gameState.blaster.mouse.y = y;
    }
  });
}

function bindUI() {
  ui.gameLinks.forEach((button) => {
    button.addEventListener('click', () => setActiveGame(button.dataset.game));
  });

  ui.resetAll.addEventListener('click', () => {
    bestScores.hopper = 0;
    bestScores.blaster = 0;
    bestScores.breaker = 0;
    localStorage.setItem(localBestKey + '-hopper', '0');
    localStorage.setItem(localBestKey + '-blaster', '0');
    localStorage.setItem(localBestKey + '-breaker', '0');
    resetAllGames();
  });
}

let lastFrame = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastFrame) / 1000 || 0.016, 0.033);
  lastFrame = timestamp;

  if (gameState.hopper) updateHopper(dt);
  if (gameState.blaster) updateBlaster(dt);
  if (gameState.breaker) updateBreaker(dt);

  drawHopper();
  drawBlaster();
  drawBreaker();

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

resetAllGames();
bindUI();
bindCanvasInput();
setActiveGame('hopper');
requestAnimationFrame(gameLoop);
