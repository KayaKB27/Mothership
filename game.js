const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rows = 5, cols = 10;
const alienSize = 32, playerSize = 32, bulletSize = 4;
const shieldCount = 3;
const shieldWidth = 64;

let player = {
  x: canvas.width / 2 - playerSize / 2,
  y: canvas.height - 50,
  width: playerSize,
  height: playerSize,
  lives: 3,
  bullets: []
};

let aliens = [];
let alienDirection = 1;
let alienSpeed = 0.5;
let alienBullets = [];

let shields = [];
let score = 0;

function createAliens() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      aliens.push({
        x: 50 + c * 40,
        y: 50 + r * 40,
        width: alienSize,
        height: alienSize,
        alive: true,
        type: r % 2 === 0 ? 'tv' : 'alien'
      });
    }
  }
}

function createShields() {
  const gap = canvas.width / (shieldCount + 1);
  for (let i = 0; i < shieldCount; i++) {
    shields.push({
      x: gap * (i + 1) - shieldWidth / 2,
      y: canvas.height - 100,
      width: shieldWidth,
      height: 20,
      hp: 3
    });
  }
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawPlayer() {
  drawRect(player.x, player.y, player.width, player.height, '#00ffcc');
}

function drawAliens() {
  for (const alien of aliens) {
    if (alien.alive) drawRect(alien.x, alien.y, alien.width, alien.height, alien.type === 'tv' ? '#ff66ff' : '#00ffcc');
  }
}

function drawShields() {
  for (const shield of shields) {
    if (shield.hp > 0) drawRect(shield.x, shield.y, shield.width, shield.height, '#6666ff');
  }
}

function updateAliens() {
  let edgeReached = false;
  for (const alien of aliens) {
    if (!alien.alive) continue;
    alien.x += alienDirection * alienSpeed;
    if (alien.x < 0 || alien.x + alien.width > canvas.width) edgeReached = true;
  }
  if (edgeReached) {
    alienDirection *= -1;
    for (const alien of aliens) alien.y += 10;
  }

  if (Math.random() < 0.02) {
    let shooters = aliens.filter(a => a.alive);
    if (shooters.length > 0) {
      let shooter = shooters[Math.floor(Math.random() * shooters.length)];
      alienBullets.push({ x: shooter.x + shooter.width/2, y: shooter.y + shooter.height, dy: 3 });
    }
  }
}

function updateBullets() {
  for (let bullet of player.bullets) bullet.y -= 5;
  player.bullets = player.bullets.filter(b => b.y > 0);

  for (let bullet of alienBullets) bullet.y += bullet.dy;
  alienBullets = alienBullets.filter(b => b.y < canvas.height);
}

function detectCollisions() {
  for (let bullet of player.bullets) {
    for (let alien of aliens) {
      if (alien.alive && bullet.x > alien.x && bullet.x < alien.x + alien.width && bullet.y < alien.y + alien.height && bullet.y > alien.y) {
        alien.alive = false;
        score += 10;
        bullet.y = -10;
      }
    }
  }

  for (let bullet of alienBullets) {
    if (bullet.x > player.x && bullet.x < player.x + player.width && bullet.y > player.y && bullet.y < player.y + player.height) {
      player.lives--;
      bullet.y = canvas.height + 1;
    }
    for (let shield of shields) {
      if (shield.hp > 0 && bullet.x > shield.x && bullet.x < shield.x + shield.width && bullet.y > shield.y && bullet.y < shield.y + shield.height) {
        shield.hp--;
        bullet.y = canvas.height + 1;
      }
    }
  }

  document.getElementById('score').innerText = score;
  document.getElementById('lives').innerText = player.lives;
}

function drawBullets() {
  for (let b of player.bullets) drawRect(b.x, b.y, bulletSize, bulletSize, '#ffffff');
  for (let b of alienBullets) drawRect(b.x, b.y, bulletSize, bulletSize, '#ff0033');
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawAliens();
  drawShields();
  drawBullets();
}

function gameLoop() {
  if (player.lives <= 0 || aliens.some(a => a.alive && a.y + a.height >= player.y)) {
    alert("Game Over! Score: " + score);
    window.location.reload();
  }

  updateAliens();
  updateBullets();
  detectCollisions();
  draw();

  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.x -= 10;
  if (e.key === 'ArrowRight') player.x += 10;
  if (e.key === ' ' && player.bullets.length < 3) {
    player.bullets.push({ x: player.x + player.width / 2, y: player.y });
  }
});

createAliens();
createShields();
gameLoop();