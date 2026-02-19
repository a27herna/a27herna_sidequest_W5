/*
Week 5 — Example 4: Data-driven world with JSON + Smooth Camera

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows

Learning goals:
- Extend the JSON-driven world to include camera parameters
- Implement smooth camera follow using interpolation (lerp)
- Separate camera behavior from player/world logic
- Tune motion and feel using external data instead of hard-coded values
- Maintain player visibility with soft camera clamping
- Explore how small math changes affect “game feel”
*/

const VIEW_W = 800;
const VIEW_H = 480;

let worldData;
let level;
let player;

let camX = 0;
let camY = 0;

function preload() {
  worldData = loadJSON("world.json"); // load JSON before setup [web:122]
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("sans-serif");
  textSize(14);

  level = new WorldLevel(worldData);

  const start = worldData.playerStart ?? { x: 300, y: 300, speed: 3 };
  player = new Player(start.x, start.y, start.speed);

  camX = player.x - width / 2;
  camY = player.y - height / 2;
}

function draw() {
  player.updateInput();

  // Keep player inside world
  player.x = constrain(player.x, 0, level.w);
  player.y = constrain(player.y, 0, level.h);

  const maxCamX = max(0, level.w - width);
  const maxCamY = max(0, level.h - height);

  // Target camera (center on player)
  let targetX = player.x - width / 2;
  let targetY = player.y - height / 2;

  let camTargetting = false;

  for (p of level.pois) {
    if (p.d) {
      if (dist(player.x, player.y, p.x, p.y) <= p.d / 2 + max(player.w, player.h) / 2) {
        targetX = p.x - width / 2;
        targetY = p.y - height / 2;
        camTargetting = true;
      }
    }
    if (overlapAABB(player, p)) {
      targetX = p.x + p.w / 2 - width / 2;
      targetY = p.y + p.h / 2 - height / 2;
      camTargetting = true;
    }
  }

  // for (const s of platforms) {
  //   if (overlapAABB(box, s)) {
  //     // If moving right, snap to the left side of the platform.
  //     if (this.vx > 0) box.x = s.x - box.w;
  //     // If moving left, snap to the right side of the platform.
  //     else if (this.vx < 0) box.x = s.x + s.w;

  //     // Cancel horizontal velocity after collision.
  //     this.vx = 0;
  //   }
  // }

  // Clamp target camera safely
  if (!camTargetting) {
    targetX = constrain(targetX, 0, maxCamX);
    targetY = constrain(targetY, 0, maxCamY);
  }

  // Smooth follow using the JSON knob
  const camLerp = level.camLerp; // ← data-driven now
  camX = lerp(camX, targetX, camLerp);
  camY = lerp(camY, targetY, camLerp);

  level.drawBackground();

  push();
  translate(-camX, -camY);
  level.drawWorld();
  player.draw();
  pop();

  level.drawHUD(player, camX, camY);
}

function keyPressed() {
  if (key === "r" || key === "R") {
    const start = worldData.playerStart ?? { x: 300, y: 300, speed: 3 };
    player = new Player(start.x, start.y, start.speed);
  }
}
