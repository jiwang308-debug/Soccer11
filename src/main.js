const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const p1ScoreEl = document.getElementById("p1-score");
const p2ScoreEl = document.getElementById("p2-score");
const phaseEl = document.getElementById("phase");
const clockEl = document.getElementById("clock");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");

const FIELD = {
  width: 960,
  height: 540,
  goalHeight: 180,
  centerX: 480,
  centerY: 270,
  top: 0,
  left: 0,
  right: 960,
  bottom: 540,
};

const MATCH = {
  regularSeconds: 180,
  overtimeSeconds: 30,
};

const PLAYER = {
  radius: 18,
  speed: 240,
  shootCooldown: 2,
  tackleCooldown: 1.5,
  tackleRange: 48,
  tackleStunDuration: 0.5,
  collisionPush: 1.8,
};

const BALL = {
  radius: 10,
  friction: 0.992,
  minSpeed: 8,
  maxSpeed: 620,
  possessionDistance: 25,
  followDistance: 24,
};

const PHASES = {
  idle: "Idle",
  regular: "Regular Time",
  overtime: "Overtime",
  suddenDeath: "Sudden Death",
  finished: "Final",
};

const keysDown = new Set();

const state = {
  running: false,
  elapsed: 0,
  phase: PHASES.idle,
  winner: null,
  players: [
    createPlayer({
      id: 1,
      color: "#f97316",
      x: FIELD.width * 0.25,
      y: FIELD.centerY,
      controls: { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD", shoot: "KeyF", tackle: "KeyG" },
      facingX: 1,
      goalX: FIELD.right,
    }),
    createPlayer({
      id: 2,
      color: "#38bdf8",
      x: FIELD.width * 0.75,
      y: FIELD.centerY,
      controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        shoot: "KeyK",
        tackle: "KeyL",
      },
      facingX: -1,
      goalX: FIELD.left,
    }),
  ],
  ball: {
    x: FIELD.centerX,
    y: FIELD.centerY,
    vx: 0,
    vy: 0,
    ownerId: null,
  },
};

function createPlayer(config) {
  return {
    ...config,
    score: 0,
    shootCooldown: 0,
    tackleCooldown: 0,
    stunnedFor: 0,
    shootPressed: false,
    tacklePressed: false,
  };
}

function resetPositions() {
  const [p1, p2] = state.players;

  p1.x = FIELD.width * 0.25;
  p1.y = FIELD.centerY;
  p1.facingX = 1;
  p1.shootCooldown = 0;
  p1.tackleCooldown = 0;
  p1.stunnedFor = 0;
  p1.shootPressed = false;
  p1.tacklePressed = false;

  p2.x = FIELD.width * 0.75;
  p2.y = FIELD.centerY;
  p2.facingX = -1;
  p2.shootCooldown = 0;
  p2.tackleCooldown = 0;
  p2.stunnedFor = 0;
  p2.shootPressed = false;
  p2.tacklePressed = false;

  state.ball.x = FIELD.centerX;
  state.ball.y = FIELD.centerY;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.ball.ownerId = Math.random() < 0.5 ? 1 : 2;

  statusEl.textContent = "Kickoff!";
}

function startMatch() {
  state.running = true;
  state.elapsed = 0;
  state.phase = PHASES.regular;
  state.winner = null;

  state.players.forEach((player) => {
    player.score = 0;
  });

  resetPositions();
  startBtn.disabled = true;
  updateHud();
}

function endMatch(message) {
  state.running = false;
  state.phase = PHASES.finished;
  startBtn.disabled = false;
  statusEl.textContent = message;
}

function getRemainingSeconds() {
  if (state.phase === PHASES.regular) {
    return Math.max(0, MATCH.regularSeconds - state.elapsed);
  }

  if (state.phase === PHASES.overtime) {
    const overtimeElapsed = state.elapsed - MATCH.regularSeconds;
    return Math.max(0, MATCH.overtimeSeconds - overtimeElapsed);
  }

  return 0;
}

function formatClock(seconds) {
  const whole = Math.ceil(seconds);
  const mins = Math.floor(whole / 60)
    .toString()
    .padStart(2, "0");
  const secs = (whole % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function updatePhase() {
  const [p1, p2] = state.players;
  if (state.phase === PHASES.regular && state.elapsed >= MATCH.regularSeconds) {
    if (p1.score !== p2.score) {
      const winner = p1.score > p2.score ? "Player 1" : "Player 2";
      endMatch(`${winner} wins ${p1.score}-${p2.score}`);
      return;
    }

    state.phase = PHASES.overtime;
    statusEl.textContent = "Tie game. Overtime begins!";
  }

  if (state.phase === PHASES.overtime && state.elapsed >= MATCH.regularSeconds + MATCH.overtimeSeconds) {
    if (p1.score !== p2.score) {
      const winner = p1.score > p2.score ? "Player 1" : "Player 2";
      endMatch(`${winner} wins in overtime ${p1.score}-${p2.score}`);
      return;
    }

    state.phase = PHASES.suddenDeath;
    statusEl.textContent = "Sudden death: next goal wins!";
  }
}

function resolvePlayerCollision() {
  const [a, b] = state.players;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = PLAYER.radius * 2;

  if (distance === 0 || distance >= minDistance) {
    return;
  }

  const overlap = minDistance - distance;
  const nx = dx / distance;
  const ny = dy / distance;
  const pushX = nx * overlap * 0.5 * PLAYER.collisionPush;
  const pushY = ny * overlap * 0.5 * PLAYER.collisionPush;

  a.x -= pushX;
  a.y -= pushY;
  b.x += pushX;
  b.y += pushY;

  clampPlayerToField(a);
  clampPlayerToField(b);
}

function clampPlayerToField(player) {
  player.x = Math.max(PLAYER.radius, Math.min(FIELD.width - PLAYER.radius, player.x));
  player.y = Math.max(PLAYER.radius, Math.min(FIELD.height - PLAYER.radius, player.y));
}

function applyMovement(player, dt) {
  if (player.stunnedFor > 0) {
    return;
  }

  const inputX = Number(keysDown.has(player.controls.right)) - Number(keysDown.has(player.controls.left));
  const inputY = Number(keysDown.has(player.controls.down)) - Number(keysDown.has(player.controls.up));

  if (inputX === 0 && inputY === 0) {
    return;
  }

  const magnitude = Math.hypot(inputX, inputY);
  const nx = inputX / magnitude;
  const ny = inputY / magnitude;

  player.x += nx * PLAYER.speed * dt;
  player.y += ny * PLAYER.speed * dt;

  if (Math.abs(nx) > 0.1) {
    player.facingX = nx;
  }

  clampPlayerToField(player);
}

function tryShoot(player) {
  const isPressed = keysDown.has(player.controls.shoot);
  const pressedNow = isPressed && !player.shootPressed;
  player.shootPressed = isPressed;

  if (!pressedNow || player.shootCooldown > 0 || state.ball.ownerId !== player.id) {
    return;
  }

  const distToGoal = Math.abs(player.goalX - player.x);
  const closeness = 1 - Math.min(1, distToGoal / FIELD.width);
  const speed = 360 + closeness * 280;
  const spread = (1 - closeness) * 0.55;
  const baseAngle = player.goalX === FIELD.right ? 0 : Math.PI;
  const shotAngle = baseAngle + (Math.random() * 2 - 1) * spread;

  state.ball.ownerId = null;
  state.ball.vx = Math.cos(shotAngle) * speed;
  state.ball.vy = Math.sin(shotAngle) * speed;
  state.ball.x = player.x + Math.cos(shotAngle) * (PLAYER.radius + BALL.radius + 2);
  state.ball.y = player.y + Math.sin(shotAngle) * (PLAYER.radius + BALL.radius + 2);

  player.shootCooldown = PLAYER.shootCooldown;
}

function tryTackle(player, opponent) {
  const isPressed = keysDown.has(player.controls.tackle);
  const pressedNow = isPressed && !player.tacklePressed;
  player.tacklePressed = isPressed;

  if (!pressedNow || player.tackleCooldown > 0 || player.stunnedFor > 0) {
    return;
  }

  player.tackleCooldown = PLAYER.tackleCooldown;

  if (state.ball.ownerId !== opponent.id) {
    return;
  }

  const distance = Math.hypot(player.x - opponent.x, player.y - opponent.y);
  if (distance > PLAYER.tackleRange) {
    return;
  }

  if (Math.random() <= 0.6) {
    state.ball.ownerId = player.id;
    statusEl.textContent = `Player ${player.id} won a tackle!`;
    return;
  }

  player.stunnedFor = PLAYER.tackleStunDuration;
  statusEl.textContent = `Player ${player.id} missed tackle and is stunned.`;
}

function updateCooldowns(player, dt) {
  player.shootCooldown = Math.max(0, player.shootCooldown - dt);
  player.tackleCooldown = Math.max(0, player.tackleCooldown - dt);
  player.stunnedFor = Math.max(0, player.stunnedFor - dt);
}

function updateBall(dt) {
  if (state.ball.ownerId !== null) {
    const owner = state.players.find((player) => player.id === state.ball.ownerId);
    if (!owner) {
      state.ball.ownerId = null;
      return;
    }

    state.ball.x = owner.x + owner.facingX * BALL.followDistance;
    state.ball.y = owner.y;
    state.ball.vx = 0;
    state.ball.vy = 0;
    return;
  }

  state.ball.x += state.ball.vx * dt;
  state.ball.y += state.ball.vy * dt;

  state.ball.vx *= BALL.friction;
  state.ball.vy *= BALL.friction;

  const speed = Math.hypot(state.ball.vx, state.ball.vy);
  if (speed > BALL.maxSpeed) {
    const scale = BALL.maxSpeed / speed;
    state.ball.vx *= scale;
    state.ball.vy *= scale;
  }

  if (speed < BALL.minSpeed) {
    state.ball.vx = 0;
    state.ball.vy = 0;
  }

  const goalTop = FIELD.centerY - FIELD.goalHeight / 2;
  const goalBottom = FIELD.centerY + FIELD.goalHeight / 2;

  if (state.ball.y - BALL.radius <= FIELD.top || state.ball.y + BALL.radius >= FIELD.bottom) {
    state.ball.vy *= -1;
    state.ball.y = Math.max(BALL.radius, Math.min(FIELD.height - BALL.radius, state.ball.y));
  }

  const inGoalLane = state.ball.y >= goalTop && state.ball.y <= goalBottom;
  if (!inGoalLane) {
    if (state.ball.x - BALL.radius <= FIELD.left || state.ball.x + BALL.radius >= FIELD.right) {
      state.ball.vx *= -1;
      state.ball.x = Math.max(BALL.radius, Math.min(FIELD.width - BALL.radius, state.ball.x));
    }
  }

  state.players.forEach((player) => {
    const distance = Math.hypot(player.x - state.ball.x, player.y - state.ball.y);
    if (distance <= BALL.possessionDistance && state.ball.ownerId === null) {
      state.ball.ownerId = player.id;
      statusEl.textContent = `Player ${player.id} gained possession.`;
    }
  });
}

function checkGoal() {
  const goalTop = FIELD.centerY - FIELD.goalHeight / 2;
  const goalBottom = FIELD.centerY + FIELD.goalHeight / 2;
  const inGoalLane = state.ball.y >= goalTop && state.ball.y <= goalBottom;

  if (!inGoalLane) {
    return;
  }

  if (state.ball.x + BALL.radius < FIELD.left) {
    handleGoal(2);
    return;
  }

  if (state.ball.x - BALL.radius > FIELD.right) {
    handleGoal(1);
  }
}

function handleGoal(scoringPlayerId) {
  const scorer = state.players.find((player) => player.id === scoringPlayerId);
  if (!scorer) {
    return;
  }

  scorer.score += 1;
  statusEl.textContent = `Goal! Player ${scoringPlayerId} scores.`;

  if (state.phase === PHASES.suddenDeath) {
    endMatch(`Sudden death winner: Player ${scoringPlayerId}`);
    return;
  }

  resetPositions();
}

function updateHud() {
  const [p1, p2] = state.players;
  p1ScoreEl.textContent = `P1 ${p1.score}`;
  p2ScoreEl.textContent = `P2 ${p2.score}`;
  phaseEl.textContent = state.phase;

  if (state.phase === PHASES.suddenDeath) {
    clockEl.textContent = "--:--";
    return;
  }

  clockEl.textContent = formatClock(getRemainingSeconds());
}

function renderPitch() {
  ctx.fillStyle = "#0b7a38";
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  ctx.fillStyle = "#0f8a42";
  const stripeWidth = FIELD.width / 8;
  for (let i = 0; i < 8; i += 2) {
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, FIELD.height);
  }

  const goalTop = FIELD.centerY - FIELD.goalHeight / 2;

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;

  ctx.strokeRect(2, goalTop, 10, FIELD.goalHeight);
  ctx.strokeRect(FIELD.width - 12, goalTop, 10, FIELD.goalHeight);

  ctx.beginPath();
  ctx.moveTo(FIELD.centerX, 0);
  ctx.lineTo(FIELD.centerX, FIELD.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(FIELD.centerX, FIELD.centerY, 56, 0, Math.PI * 2);
  ctx.stroke();
}

function renderPlayer(player) {
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, PLAYER.radius, 0, Math.PI * 2);
  ctx.fill();

  const facingDx = player.facingX * PLAYER.radius;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + facingDx, player.y);
  ctx.stroke();

  if (player.stunnedFor > 0) {
    ctx.fillStyle = "#f8fafc";
    ctx.font = "12px sans-serif";
    ctx.fillText("STUN", player.x - 16, player.y - 26);
  }
}

function renderBall() {
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, BALL.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function render() {
  renderPitch();
  state.players.forEach(renderPlayer);
  renderBall();
}

let previousTimestamp = 0;

function gameLoop(timestamp) {
  if (!previousTimestamp) {
    previousTimestamp = timestamp;
  }

  const dt = Math.min(0.033, (timestamp - previousTimestamp) / 1000);
  previousTimestamp = timestamp;

  if (state.running) {
    state.elapsed += dt;
    state.players.forEach((player) => {
      updateCooldowns(player, dt);
      applyMovement(player, dt);
    });

    resolvePlayerCollision();

    const [p1, p2] = state.players;
    tryShoot(p1);
    tryShoot(p2);
    tryTackle(p1, p2);
    tryTackle(p2, p1);

    updateBall(dt);
    checkGoal();
    updatePhase();
  }

  updateHud();
  render();
  requestAnimationFrame(gameLoop);
}

function setupInput() {
  window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }

    keysDown.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    keysDown.delete(event.code);
  });

  window.addEventListener("blur", () => {
    keysDown.clear();
  });
}

function init() {
  setupInput();
  updateHud();
  render();
  requestAnimationFrame(gameLoop);

  startBtn.addEventListener("click", () => {
    startMatch();
  });
}

init();
