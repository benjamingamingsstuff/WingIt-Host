import { Howl } from "howler";
/* ...existing code... */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;

const ui = {
  score: document.getElementById("score"),
  menu: document.getElementById("menu"),
  over: document.getElementById("gameover"),
  final: document.getElementById("finalScore"),
  startBtn: document.getElementById("playBtn"),
  restartBtn: document.getElementById("restartBtn"),
  tournamentBtn: document.getElementById("tournamentBtn"),
  shopBtn: document.getElementById("shopBtn"),
  birdsBtn: document.getElementById("birdsBtn"),
  roadmapBtn: document.getElementById("roadmapBtn"),
  birdsPanel: document.getElementById("birdsPanel"),
  toTitleBtn: document.getElementById("toTitleBtn"),
  shopPanel: document.getElementById("shopPanel"),
  shopItems: document.getElementById("shopItems"),
  spinBtn: document.getElementById("spinBtn"),
  coinsLabel: document.getElementById("coins"),
  roadmapPanel: document.getElementById("roadmapPanel"),
  roadmapClose: document.getElementById("roadmapClose"),
  wheel: document.getElementById("wheel"),
};

const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const BIRD_SCALE = 0.78;
const PIPE_HIT_INSET = 0; // no inset for coarser, less exact pipe hitboxes
function resize() {
  const w = Math.floor(window.innerWidth * DPR);
  const h = Math.floor(window.innerHeight * DPR);
  canvas.width = w; canvas.height = h;
  canvas.style.width = "100%"; canvas.style.height = "100%";
}
window.addEventListener("resize", resize, { passive: true });
resize();
/* ...existing code... */
const ASSETS = {
  bg: loadImage("/BG.jpeg"),
  bird: loadImage("/Bird_1.png"),
  pipeTop: loadImage("/Pipe_1_top.png"),
  pipeBottom: loadImage("/Pipe_1_bottom.png"),
  coin: loadImage("/Coin.png"),
};
function loadImage(src) { const i = new Image(); i.src = src; return i; }
/* ...existing code... */
const SFX = {
  // Create Howl safely; if audio subsystem can't start, provide a no-op fallback
  flap: createSafeHowl(["./sfx_flap.mp3"], { volume: 0.6 }),
  score: createSafeHowl(["./sfx_score.mp3"], { volume: 0.5 }),
  hit: createSafeHowl(["./sfx_hit.mp3"], { volume: 0.6 }),
  coin: createSafeHowl(["./sfx_coin.mp3"], { volume: 0.7 }) // new coin collection sound
};
// Safe Howl factory: returns a Howl if possible, otherwise a stub with play() noop
function createSafeHowl(src, opts = {}) {
  try {
    const h = new Howl(Object.assign({ src }, opts));
    // wrap play to catch runtime exceptions
    const origPlay = h.play.bind(h);
    h.play = (...a) => { try { return origPlay(...a); } catch(_) { return null; } };
    return h;
  } catch (_) {
    return { play: ()=>null };
  }
}
const safePlay = (howl) => { try { howl.play(); } catch(_) {} };
try { Howler.autoUnlock = true; } catch(_) {}
// Ensure pointer interaction attempts to resume audio context but don't throw
window.addEventListener("pointerdown", ()=>{ try { Howler.ctx?.resume?.(); } catch(_) {} }, { once:true, passive:true });
// Robust global handler: silence known audio/device startup failures to avoid noisy unhandledRejection
window.addEventListener("unhandledrejection", (e)=>{
  try {
    const r = e.reason || "";
    const msg = typeof r === "string" ? r : (r && (r.message || r.toString())) || "";
    const low = String(msg).toLowerCase();
    if (low.includes("audio") || low.includes("device") || low.includes("context") || low.includes("web audio")) {
      e.preventDefault();
    }
  } catch(_) {}
});
/* ...existing code... */
const state = { mode: "menu", score: 0, time: 0 };
const world = {
  gravity: 1700, jump: -520, speed: 180,
  gap: 180, pipeSpacing: 420, lastPipeX: 0
};
const bird = { x: 0, y: 0, vy: 0, r: 14 * BIRD_SCALE, w: 34, h: 24, rot: 0 };
const pipes = [];
/* ...existing code... */
// Bird selection state
let selectedBirdSrc = "/Bird_1.png";
// open birds panel should render latest owned birds
ui.birdsBtn.addEventListener("click", ()=>{
  ui.birdsPanel.hidden = !ui.birdsPanel.hidden;
  ui.shopPanel.hidden = true;
  ui.roadmapPanel.hidden = true;
  if (!ui.birdsPanel.hidden) renderBirds();
});
document.querySelectorAll(".bird-select").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const id = btn.dataset.bird;
    if (store.owned.has(id)) {
      selectedBirdSrc = id;
      ASSETS.bird = loadImage(selectedBirdSrc);
      ui.birdsPanel.hidden = true;
    } else {
      // prompt purchase by opening shop
      ui.birdsPanel.hidden = true;
      ui.shopPanel.hidden = false;
      renderShopItems();
    }
  });
});
ui.tournamentBtn.addEventListener("click", ()=>{ alert("Tournaments coming soon — place #1 and earn rewards (USDT/TON)"); });
// Shop state & items
const store = {
  coins: Number(localStorage.getItem("coins") || 0),
  owned: new Set(JSON.parse(localStorage.getItem("owned") || '["/Bird_1.png"]')),
  items: [
    { id: "/Bird_2.png", name: "Verdant Wren", price: 10 },
    { id: "/Bird_3.png", name: "Ember Sparrow", price: 25 } // new bird added to shop
  ]
};
function saveStore() {
  localStorage.setItem("coins", String(store.coins));
  localStorage.setItem("owned", JSON.stringify(Array.from(store.owned)));
}
// render birds menu showing only owned birds
function renderBirds() {
  const list = document.getElementById("birdsList");
  list.innerHTML = "";
  // show owned birds only
  const ownedBirds = Array.from(store.owned);
  for (const id of ownedBirds) {
    const btn = document.createElement("button");
    btn.className = "bird-select";
    btn.dataset.bird = id;
    const img = document.createElement("img");
    img.src = id;
    img.alt = id;
    btn.appendChild(img);
    btn.addEventListener("click", ()=> {
      selectedBirdSrc = id;
      ASSETS.bird = loadImage(selectedBirdSrc);
      ui.birdsPanel.hidden = true;
    });
    list.appendChild(btn);
  }
}
renderBirds();
function renderShopItems() {
  ui.shopItems.innerHTML = "";
  for (const it of store.items) {
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `<img src="${it.id}" alt="${it.name}"><div style="font-weight:700">${it.name}</div><div style="display:flex;align-items:center;gap:6px;"><span>${it.price}</span><img src="/Coin.png" alt="coin" style="width:18px;height:18px;image-rendering:pixelated"></div>`;
    const btn = document.createElement("button");
    if (store.owned.has(it.id)) { btn.textContent = "Owned"; btn.disabled = true; }
    else { btn.textContent = "Buy"; btn.addEventListener("click", ()=>{ buyItem(it); }); }
    div.appendChild(btn);
    ui.shopItems.appendChild(div);
  }
  ui.coinsLabel.textContent = String(store.coins);
  // disable spin button if on cooldown
  if (!spinAvailable()) { ui.spinBtn.disabled = true; ui.spinBtn.classList.add("spin-disabled"); }
  else { ui.spinBtn.disabled = false; ui.spinBtn.classList.remove("spin-disabled"); }
}
function buyItem(item) {
  if (store.coins >= item.price) {
    store.coins -= item.price; store.owned.add(item.id); saveStore(); renderShopItems(); renderBirds();
    if (item.id.endsWith(".png") && item.id.includes("Bird")) {
      selectedBirdSrc = item.id; ASSETS.bird = loadImage(selectedBirdSrc);
    }
  } else {
    alert("Not enough coins");
  }
}
ui.shopBtn.addEventListener("click", ()=>{
  ui.birdsPanel.hidden = true; ui.roadmapPanel.hidden = true;
  ui.shopPanel.hidden = !ui.shopPanel.hidden;
  renderShopItems();
});
ui.roadmapBtn.addEventListener("click", ()=>{
  ui.birdsPanel.hidden = true; ui.shopPanel.hidden = true;
  ui.roadmapPanel.hidden = !ui.roadmapPanel.hidden;
});
ui.roadmapClose.addEventListener("click", ()=>{ ui.roadmapPanel.hidden = true; });
// Spin cooldown (5 minutes)
const SPIN_COOLDOWN_MS = 5 * 60 * 1000;
// change rewards to make 1 less common (weighted distribution)
const SPIN_REWARDS = [1,1,2,2,3,5,8,12]; // fewer 1s relative to larger rewards
let lastSpin = Number(localStorage.getItem("lastSpin") || 0);
function setLastSpin(ts) { lastSpin = ts; localStorage.setItem("lastSpin", String(ts)); }
function spinAvailable() { return Date.now() - lastSpin >= SPIN_COOLDOWN_MS; }
ui.spinBtn.addEventListener("click", ()=>{
  // cooldown check
  if (!spinAvailable()) {
    const remain = Math.ceil((SPIN_COOLDOWN_MS - (Date.now() - lastSpin)) / 1000);
    alert(`Spin available in ${Math.floor(remain/60)}:${String(remain%60).padStart(2,"0")}`);
    return;
  }
  ui.spinBtn.disabled = true;
  ui.spinBtn.classList.add("spin-disabled");
  setLastSpin(Date.now());
  const rewards = SPIN_REWARDS;
  // Decide reward after spin; random sector
  const idx = Math.floor(Math.random()*rewards.length);
  const reward = rewards[idx];
  // Animate wheel: rotate several full turns + land on sector
  const sectorAngle = 360 / rewards.length;
  const targetDeg = 360*5 + (idx * sectorAngle) + (sectorAngle/2) + (Math.random()* (sectorAngle/2) - sectorAngle/4);
  ui.wheel.style.transition = "transform 2.4s cubic-bezier(.1,.8,.2,1)";
  // force reflow then apply
  void ui.wheel.offsetWidth;
  ui.wheel.style.transform = `rotate(${targetDeg}deg)`;
  // show reward text briefly on wheel center
  const prevHtml = ui.wheel.innerHTML;
  ui.wheel.textContent = "";
  const center = document.createElement("div"); center.style.pointerEvents="none"; center.style.fontWeight="700";
  // use coin icon instead of ¢ symbol
  const img = document.createElement("img"); img.src = "/Coin.png"; img.style.width = "20px"; img.style.height = "20px"; img.style.imageRendering="pixelated"; img.style.verticalAlign="middle";
  center.textContent = `${reward} `; center.appendChild(img); ui.wheel.appendChild(center);
  safePlay(SFX.score);
  setTimeout(()=>{
    // finalize
    store.coins += reward; saveStore(); renderShopItems();
    // reset wheel rotation (keep visual) and re-enable after cooldown remaining
    ui.spinBtn.disabled = false; ui.spinBtn.classList.remove("spin-disabled");
    // keep lastSpin in storage; next click will check cooldown
  }, 2500);
});
renderShopItems();

// Replace the payWithStars implementation
function waitForTelegramAPI(callback) {
  const checkInterval = setInterval(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      clearInterval(checkInterval);
      callback();
    }
  }, 100);
}

function payWithStars() {
  waitForTelegramAPI(() => {
    const paymentData = {
      title: '1,000 Coins - Wing It!',
      description: 'Use coins to buy birds and enter Tournaments',
      payload: 'purchase_coins_10',
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: '10 Stars', amount: 10 }]
    };

    Telegram.WebApp.openInvoice(paymentData, (status) => {
      if (status === 'paid') {
        console.log('Payment was successful!');
        // Update the game state here
      } else if (status === 'cancelled') {
        console.log('Payment was cancelled.');
      } else if (status === 'failed') {
        console.error('Payment failed.');
      }
    });
  });
}

// Wire the new button (safe if element exists)
const buyStarsBtn = document.getElementById("buyStarsBtn");
if (buyStarsBtn) buyStarsBtn.addEventListener("click", payWithStars);

function start() {
  // hide menus, reset world and switch to playing mode
  ui.menu.hidden = true;
  ui.over.hidden = true;
  ui.score.textContent = "0";
  reset();
  state.mode = "playing";
}

function reset() {
  state.score = 0; state.time = 0; pipes.length = 0;
  coins.length = 0; // clear any leftover coins from previous games
  // ensure selected bird asset is active
  ASSETS.bird = loadImage(selectedBirdSrc);
  bird.x = canvas.width * 0.32; bird.y = canvas.height * 0.45; bird.vy = 0; bird.rot = 0;
  world.lastPipeX = canvas.width; spawnInitialPipes();
  // reset per-game counters so coin spawning is limited per play session
  pipeCount = 0;
  coinsSpawnedThisGame = 0;
}

function spawnInitialPipes() {
  // spawn 3 initial pipes spaced by world.pipeSpacing so player has upcoming obstacles
  const startX = canvas.width + world.pipeSpacing * DPR;
  for (let i = 0; i < 3; i++) {
    spawnPipe(startX + i * world.pipeSpacing * DPR);
  }
}

// Add coin entities and spawning every 10 pipes
let pipeCount = 0;
let coinsSpawnedThisGame = 0; // limit to 10 per game
const coins = []; // { x, y, value, picked }

function spawnPipe(x) {
  pipeCount++;
  const minGapTop = 80 * DPR, minGapBottom = 100 * DPR;
  const gap = world.gap * DPR;
  const maxY = canvas.height - minGapBottom - gap;
  const gapY = Math.floor(minGapTop + Math.random() * Math.max(1, maxY - minGapTop));
  pipes.push({ x, gapY, passed: false, id: pipeCount });
  // every 10 pipes spawn a collectible coin in middle of the gap, limited to 10 coins per game
  if (pipeCount % 10 === 0 && coinsSpawnedThisGame < 10) {
    const value = [1,2,3,5,8][Math.floor(Math.random()*5)];
    // position coin in the horizontal center of the pipe and vertically centered in the gap
    const px = x + (pipeWEstimate() * 0.5 * DPR);
    coins.push({ x: px, y: gapY, value, picked: false });
    coinsSpawnedThisGame++;
  }
}
function pipeWEstimate(){ return ASSETS.pipeTop.naturalWidth || 80; }

function flap() {
  // If not playing, start the game (tapping title screen should start)
  if (state.mode !== "playing") { start(); return; }
  // Apply jump impulse and quick upward rotation, play sound
  bird.vy = world.jump;
  bird.rot = -0.6;
  safePlay(SFX.flap);
}

function update(dt) {
  if (state.mode !== "playing") return;
  state.time += dt;
  bird.vy += world.gravity * dt;
  bird.y += bird.vy * dt;
  bird.rot = Math.atan2(bird.vy, 300);

  const move = world.speed * DPR * dt;
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= move;
    if (!p.passed && p.x + 60 * DPR < bird.x) {
      p.passed = true; state.score++; ui.score.textContent = String(state.score); safePlay(SFX.score);
      // award coins every 10 score
      if (state.score % 10 === 0) {
        const rewardOptions = [1,1,2,2,3,5,8]; // weighted distribution
        const reward = rewardOptions[Math.floor(Math.random()*rewardOptions.length)];
        store.coins += reward; saveStore(); renderShopItems();
        safePlay(SFX.coin);
      }
    }
    if (p.x < -200 * DPR) pipes.splice(i, 1);
  }
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width + world.pipeSpacing * 0.5) {
    spawnPipe((pipes[pipes.length - 1]?.x || canvas.width) + world.pipeSpacing * DPR);
  }

  const groundY = canvas.height - 2;
  if (bird.y + bird.r > groundY || bird.y - bird.r < 0) { gameOver(); }

  // move coins with world
  for (let i = coins.length-1; i>=0; i--) {
    const c = coins[i];
    c.x -= world.speed * DPR * dt;
    const dx = c.x - bird.x, dy = c.y - bird.y;
    const dist = Math.hypot(dx, dy);
    if (!c.picked && dist < (bird.r + 14*DPR)) {
      c.picked = true;
      store.coins += c.value; saveStore(); renderShopItems();
      safePlay(SFX.coin);
      // remove visually
      coins.splice(i,1);
    } else if (c.x < -100*DPR) {
      coins.splice(i,1);
    }
  }

  // Collision with pipes
  const pipeW = ASSETS.pipeTop.naturalWidth || 80;
  const inset = PIPE_HIT_INSET * DPR;
  for (const p of pipes) {
    const gapTop = p.gapY - world.gap * 0.5 * DPR;
    const gapBottom = p.gapY + world.gap * 0.5 * DPR;
    const bx = bird.x, by = bird.y, br = bird.r;
    const withinX = bx + br > p.x + inset && bx - br < p.x + pipeW - inset;
    const hitTop = withinX && by - br < gapTop;
    const hitBottom = withinX && by + br > gapBottom;
    if (hitTop || hitBottom) { gameOver(); break; }
  }
}

function gameOver() {
  if (state.mode === "over") return;
  state.mode = "over";
  safePlay(SFX.hit);
  // show game over UI
  ui.over.hidden = false;
  ui.menu.hidden = true;
  ui.final.textContent = `Score: ${state.score}`;
  // freeze bird on ground and clamp position
  bird.vy = 0;
  bird.y = Math.min(bird.y, canvas.height - bird.r - 2);
}

function render() {
  // Background
  if (ASSETS.bg.complete) {
    // Cover
    const iw = ASSETS.bg.naturalWidth, ih = ASSETS.bg.naturalHeight;
    const s = Math.max(canvas.width / iw, canvas.height / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(ASSETS.bg, (canvas.width - dw)/2, (canvas.height - dh)/2, dw, dh);
  } else {
    ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  // Pipes
  const pipeW = ASSETS.pipeTop.naturalWidth || 80;
  for (const p of pipes) {
    const gapTop = p.gapY - world.gap * 0.5 * DPR;
    const gapBottom = p.gapY + world.gap * 0.5 * DPR;

    const topH = Math.max(0, gapTop);
    if (ASSETS.pipeTop.complete) {
      ctx.drawImage(ASSETS.pipeTop, p.x, 0, pipeW, topH);
    } else {
      ctx.fillStyle = "#4ec0ca"; ctx.fillRect(p.x, 0, pipeW, topH);
    }
    const bottomY = gapBottom, bottomH = canvas.height - bottomY;
    if (ASSETS.pipeBottom.complete) {
      ctx.drawImage(ASSETS.pipeBottom, p.x, bottomY, pipeW, bottomH);
    } else {
      ctx.fillStyle = "#4ec0ca"; ctx.fillRect(p.x, bottomY, pipeW, bottomH);
    }
  }

  // draw coins
  for (const c of coins) {
    const size = 22 * DPR;
    const img = ASSETS.coin;
    if (img && img.complete) ctx.drawImage(img, c.x - size/2, c.y - size/2, size, size);
  }

  // Bird
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(Math.max(-0.5, Math.min(0.6, bird.rot)));
  const bw = ASSETS.bird.naturalWidth || bird.w;
  const bh = ASSETS.bird.naturalHeight || bird.h;
  if (ASSETS.bird.complete) {
    const sw = bw * BIRD_SCALE, sh = bh * BIRD_SCALE;
    ctx.drawImage(ASSETS.bird, -sw/2, -sh/2, sw, sh);
  } else {
    ctx.fillStyle = "#1e90ff"; ctx.beginPath(); ctx.arc(0,0,bird.r,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();

  // Dim overlay in menus
  if (state.mode !== "playing") {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}
/* ...existing code... */
canvas.addEventListener("pointerdown", (e)=>{ e.preventDefault(); if(state.mode==="over"){ start(); } else { flap(); } }, { passive:false });
window.addEventListener("keydown", (e)=>{ if(e.code==="Space"){ e.preventDefault(); if(state.mode==="over"){ start(); } else { flap(); } }});
ui.startBtn.addEventListener("click", start);
ui.restartBtn.addEventListener("click", start);
// show title/menu from game over
ui.toTitleBtn.addEventListener("click", ()=>{
  ui.over.hidden = true;
  ui.menu.hidden = false;
  state.mode = "menu";
});
/* ...existing code... */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
  update(dt); render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);