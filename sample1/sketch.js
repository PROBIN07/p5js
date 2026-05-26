let xPos, xDir;
let yPos, yDir;
let diam;
let speed;
let padX, targetPadX;
let padWidth;
let bricks = [];
let score = 0;
let lives;
let gameState;
let totalBricks;
let difficulty;
let level = 1;
let maxLevel = 3;
let ballHue = 0;
let particles = [];
let bgm, hitSound;

function preload() {
  //효과음 코드 삽입 필요하나 효과음이 없어 공란으로 제출.
}

function setup() {
  createCanvas(600, 600);
  gameState = 'menu';
  padX = width / 2;
  targetPadX = width / 2;
}

function draw() {
  if (gameState === 'menu') {
    displayMenu();
  } else if (gameState === 'playing') {
    background(30, 30, 40);
    bricksDrawing();
    drawParticles();
    padDrawingMovement();
    ballDrawingMovement();
    ballBouncing();
    bricksBallCollision();
    checkGameOver();
    checkWin();
    displayScoreAndLevel();
    displayLives();
  } else if (gameState === 'gameover') {
    displayGameOver();
  } else if (gameState === 'win') {
    displayWin();
  }
}

function displayMenu() {
  background(40, 45, 60);
  
  fill(255, 200, 100);
  textSize(70);
  textAlign(CENTER, CENTER);
  text('벽돌깨기', width / 2, 140);
  
  fill(200);
  textSize(15);
  text('by Park Jae Hyung', width / 2, 195);
  
  fill(255);
  textSize(30);
  text('난이도 선택', width / 2, 280);
  
  drawButton(width / 2 - 200, 330, 120, 60, '쉬움', mouseX > width / 2 - 200 && mouseX < width / 2 - 80 && mouseY > 330 && mouseY < 390);
  fill(0, 255, 100);
  textSize(16);
  text('공 속도 느림', width / 2 - 140, 420);

  drawButton(width / 2 - 60, 330, 120, 60, '보통', mouseX > width / 2 - 60 && mouseX < width / 2 + 60 && mouseY > 330 && mouseY < 390);
  fill(255, 255, 100);
  textSize(16);
  text('공 속도 중간', width / 2, 420);

  drawButton(width / 2 + 80, 330, 120, 60, '어려움', mouseX > width / 2 + 80 && mouseX < width / 2 + 200 && mouseY > 330 && mouseY < 390);
  fill(255, 100, 100);
  textSize(16);
  text('공 속도 빠름', width / 2 + 140, 420);
}

function drawButton(x, y, w, h, label, hover) {
  if (hover) {
    fill(100, 180, 255);
    cursor(HAND);
  } else {
    fill(60, 120, 220);
    cursor(ARROW);
  }
  stroke(255, 255, 255, 150);
  strokeWeight(2);
  rect(x, y, w, h);
  
  fill(255);
  noStroke();
  textSize(24);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

function mousePressed() {
  if (gameState === 'menu') {
    if (mouseX > width / 2 - 200 && mouseX < width / 2 - 80 && mouseY > 330 && mouseY < 390) {
      difficulty = 'easy';
      startGame();
    }
    if (mouseX > width / 2 - 60 && mouseX < width / 2 + 60 && mouseY > 330 && mouseY < 390) {
      difficulty = 'normal';
      startGame();
    }
    if (mouseX > width / 2 + 80 && mouseX < width / 2 + 200 && mouseY > 330 && mouseY < 390) {
      difficulty = 'hard';
      startGame();
    }
  }
}

function startGame() {
  score = 0;
  lives = 3;
  level = 1;
  loadLevel(level);
  gameState = 'playing';
}

function loadLevel(lvl) {
  bricks = [];
  if (lvl === 1) {
    for (let r = 0; r < 4; r++) {
      let row = [];
      for (let c = 0; c < 12; c++) row.push(1);
      bricks.push(row);
    }
  } else if (lvl === 2) {
    for (let r = 0; r < 5; r++) {
      let row = [];
      for (let c = 0; c < 12; c++) row.push((r + c) % 2 === 0 ? 1 : 0);
      bricks.push(row);
    }
  } else if (lvl === 3) {
    for (let r = 0; r < 6; r++) {
      let row = [];
      for (let c = 0; c < 12; c++) {
        if (c >= 5 - r && c <= 6 + r && r < 4) row.push(1);
        else row.push(0);
      }
      bricks.push(row);
    }
  }
  
  countTotalBricks();
  variableInitialization();
}

function countTotalBricks() {
  totalBricks = 0;
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      if (bricks[r][c] === 1) totalBricks++;
    }
  }
}

function variableInitialization() {
  if (difficulty === 'easy') speed = 4;
  else if (difficulty === 'normal') speed = 6;
  else if (difficulty === 'hard') speed = 8;
  
  speed += (level - 1); 
  
  xPos = width / 2;
  xDir = speed;
  yPos = height - 120;
  yDir = -speed;
  diam = 18;
  padWidth = 140;
  targetPadX = width / 2 - padWidth / 2;
  padX = targetPadX;
  particles = [];
}

function getBrickColor(r) {
  let colors = [
    color(255, 80, 80),
    color(255, 180, 80),
    color(255, 230, 80),
    color(80, 255, 120),
    color(80, 180, 255),
    color(200, 80, 255)
  ];
  return colors[r % colors.length];
}

function bricksDrawing() {
  stroke(30, 30, 40);
  strokeWeight(3);
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      if (bricks[r][c] === 1) {
        fill(getBrickColor(r));
        rect(c * 50, r * 40 + 60, 50, 40);
      }
    }
  }
}

function bricksBallCollision() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      if (bricks[r][c] === 1) {
        let bX = c * 50;
        let bY = r * 40 + 60;
        
        if (xPos + diam/2 > bX && xPos - diam/2 < bX + 50 &&
            yPos + diam/2 > bY && yPos - diam/2 < bY + 40) {
            
          bricks[r][c] = 0;
          score++;
          
          createParticles(bX + 25, bY + 20, getBrickColor(r));
          if (hitSound) hitSound.play();
          
          let prevX = xPos - xDir;
          let prevY = yPos - yDir;
          
          if (prevX + diam/2 <= bX || prevX - diam/2 >= bX + 50) {
            xDir *= -1;
          } else {
            yDir *= -1;
          }
          return;
        }
      }
    }
  }
}

function ballDrawingMovement() {
  ballHue = (ballHue + 3) % 360;
  colorMode(HSB);
  let ballColor = color(ballHue, 80, 100);
  colorMode(RGB);

  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = ballColor;
  
  fill(ballColor);
  noStroke();
  ellipse(xPos, yPos, diam, diam);
  
  drawingContext.shadowBlur = 0;
  
  xPos = xPos + xDir;
  yPos = yPos + yDir;
}

function padDrawingMovement() {
  targetPadX = constrain(mouseX - padWidth / 2, 0, width - padWidth);
  padX = lerp(padX, targetPadX, 0.2); 

  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(0, 150, 255);
  
  fill(50, 180, 255);
  noStroke();
  rect(padX, height - 40, padWidth, 15);
  
  drawingContext.shadowBlur = 0;
}

function ballBouncing() {
  if (xPos - diam / 2 < 0 || xPos + diam / 2 > width) {
    xDir *= -1;
    xPos = constrain(xPos, diam/2, width - diam/2);
  }
  if (yPos - diam / 2 < 0) {
    yDir *= -1;
    yPos = diam/2;
  }
  if (yDir > 0 && yPos + diam / 2 >= height - 40 && yPos - diam / 2 <= height - 25) {
    if (xPos > padX && xPos < padX + padWidth) {
      yDir *= -1;
      let hitPoint = xPos - (padX + padWidth / 2);
      xDir = hitPoint * 0.15; 
      yPos = height - 40 - diam / 2;
    }
  }
}

function createParticles(x, y, col) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-4, 4),
      vy: random(-4, 4),
      life: 255,
      color: col
    });
  }
}

function drawParticles() {
  noStroke();
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    fill(red(p.color), green(p.color), blue(p.color), p.life);
    ellipse(p.x, p.y, random(3, 6));
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 15;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function checkGameOver() {
  if (yPos - diam / 2 > height) {
    lives--;
    if (lives > 0) {
      variableInitialization();
    } else {
      gameState = 'gameover';
    }
  }
}

function checkWin() {
  let remainingBricks = 0;
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      if (bricks[r][c] === 1) remainingBricks++;
    }
  }
  
  if (remainingBricks === 0) {
    if (level < maxLevel) {
      level++;
      loadLevel(level);
    } else {
      gameState = 'win';
    }
  }
}

function displayScoreAndLevel() {
  fill(255);
  noStroke();
  textSize(20);
  textAlign(LEFT);
  text(`레벨: ${level}   점수: ${score}`, 15, 30);
}

function displayLives() {
  fill(255, 100, 100);
  noStroke();
  textSize(20);
  textAlign(RIGHT);
  let hearts = "♥".repeat(lives);
  text(`목숨: ${hearts}`, width - 15, 30);
}

function displayGameOver() {
  background(40, 20, 20);
  fill(255, 100, 100);
  textSize(60);
  textAlign(CENTER, CENTER);
  text('GAME OVER', width / 2, height / 2 - 50);
  
  fill(255);
  textSize(30);
  text(`최종 점수: ${score}`, width / 2, height / 2 + 30);
}

function displayWin() {
  background(20, 40, 20);
  fill(100, 255, 100);
  textSize(60);
  textAlign(CENTER, CENTER);
  text('CLEAR!', width / 2, height / 2 - 50);
  
  fill(255);
  textSize(30);
  text(`모든 레벨 완료! 최종 점수: ${score}`, width / 2, height / 2 + 30);
}
