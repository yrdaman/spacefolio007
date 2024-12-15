// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get buttons and score elements
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreElement = document.getElementById('score');
// Global variables for background
const backgroundImage = new Image();
backgroundImage.src = 'background.jpg'; // Replace with the correct path to your background image
let backgroundY = 0; // Starting Y position for the background
const scrollSpeed = 0.5; // Speed at which the background scrolls (adjust as needed)

// Game variables
let player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
  health: 3,
  isRapidFire: false,
  isInvulnerable: false, // New property for invulnerability
  blink: false
};

let bullets = [];
let enemies = [];
let powerUps = [];
let score = 0;
let gameInterval;
let isGameOver = false;

// Load sounds
const shootSound = new Audio('shoot.mp3');
const explosionSound = new Audio('explosion.mp3');
const backgroundMusic = new Audio('background-music.mp3');
shootSound.load();
explosionSound.load();
backgroundMusic.load();
backgroundMusic.loop = true;
// image files
let playerImage = new Image();
playerImage.src = 'player.png'; // Replace with your player image path
let enemyImage = new Image();
enemyImage.src = 'enemy.png'; // Replace with your enemy image path
let bulletImage = new Image();
bulletImage.src = 'bullet.png'; // Replace with your bullet image path
let explosionGif = new Image();
explosionGif.src = 'explosion.gif';

let explosionPlaying = false; // Flag to prevent multiple explosions
let gameOverFlag = false; // Flag to track if the game is over
let explosionDuration = 2000; // Duration for the explosion to be shown (in milliseconds)
let explosionStartTime = 0; 
// Event listener for keypresses
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Keydown handler
function keyDownHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    player.dx = player.speed;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    player.dx = -player.speed;
  } else if (e.key == ' ' || e.key == 'Spacebar') {
    shootBullet();
  }
}



// Keyup handler
function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight' || e.key == 'Left' || e.key == 'ArrowLeft') {
    player.dx = 0;
  }
}

// Start the game
function startGame() {
  score = 0;
  player.health = 3;
  isGameOver = false;
  bullets = [];
  enemies = [];
  powerUps = [];
  startBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  backgroundMusic.play().catch(error => {
    console.error("Error playing background music:", error);
  });
  
  gameInterval = requestAnimationFrame(update);
}

// Restart the game
function restartGame() {
  startGame();
}

// Draw player
function drawPlayer() {
    if (player.isInvulnerable) {
      // Blink effect for invulnerability
      if (Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5; // Make the player semi-transparent
      }
    }
  
    // Draw the player image
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  
    // Reset transparency
    ctx.globalAlpha = 1.0;
}
// Draw bullets
function drawBullets() {
    ctx.fillStyle = 'white';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });
  }

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
      ctx.drawImage(enemyImage, enemy.x, enemy.y, 50, 50); // Use enemy image
    });
  }

  // Function to draw the background image with slow vertical scroll
function drawBackground() {
    // Draw the background image twice to ensure seamless scrolling
    ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);
  
    // Update the backgroundY to scroll it slowly downwards
    backgroundY += scrollSpeed;
  
    // If the background has scrolled past the canvas height, reset it
    if (backgroundY >= canvas.height) {
      backgroundY = 0; // Reset to create a seamless loop
    }
  }
  
// Draw power-ups
function drawPowerUps() {
  powerUps.forEach(powerUp => {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(powerUp.x, powerUp.y, 20, 20);
  });
}

// Move player
function movePlayer() {
  player.x += player.dx;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Update background position
function updateBackground() {
    backgroundX -= backgroundSpeed; 
    if (backgroundX <= -canvas.width) {
      backgroundX = 0; 
    }
  }
// Move bullets
function moveBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y += -7;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);  // Remove bullet if it's off-screen
      i--;
    }
  }
}

// Move enemies
function moveEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].y += 3;
    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);  // Remove enemy if it's off-screen
      i--;
    }
  }
}

// Move power-ups
function movePowerUps() {
  for (let i = 0; i < powerUps.length; i++) {
    powerUps[i].y += 3;
    if (powerUps[i].y > canvas.height) {
      powerUps.splice(i, 1);  // Remove power-up if it's off-screen
      i--;
    }
  }
}

// Spawn enemies
function spawnEnemies() {
    if (Math.random() < 0.02) {
      let x = Math.random() * (canvas.width - 50);
      let type = Math.random() < 0.2 ? 'shooting' : 'normal';
      enemies.push({ x, y: 0, type });
    }
  }

// Spawn power-ups
function spawnPowerUps() {
  if (Math.random() < 0.005) {
    let x = Math.random() * (canvas.width - 20);
    let y = 0;
    powerUps.push({ x, y });
  }
}

function checkCollisions() {
    // Arrays to store indices of elements to remove
    let enemiesToRemove = [];
    let bulletsToRemove = [];
    let powerUpsToRemove = [];
  
    // Enemy-Bullet Collisions
    for (let i = 0; i < enemies.length; i++) {
      for (let j = 0; j < bullets.length; j++) {
        if (
          bullets[j].x >= enemies[i].x &&
          bullets[j].x <= enemies[i].x + 50 &&
          bullets[j].y <= enemies[i].y + 50
        ) {
          // Store the indices to be removed later
          enemiesToRemove.push(i);
          bulletsToRemove.push(j);
  
          // Update score and play sound
          score += 10;
          scoreElement.textContent = 'Score: ' + score;
          explosionSound.currentTime = 0;  // Reset the sound to start
         explosionSound.play(); 
        createExplosionEffect(enemies.x, enemies.y);  // Example of an explosion effect
        break; 
        }
      }
    }
    function createExplosionEffect(x, y) {
        // You can add explosion animations here
        // For example, showing an explosion sprite or effect at the collision point (x, y)
        console.log('Explosion at: ', x, y);
      }
    // Player-Enemy Collisions
    for (let i = 0; i < enemies.length; i++) {
        // Check if the enemy and player collide
        if (
          player.x < enemies[i].x + 50 &&
          player.x + player.width > enemies[i].x &&
          player.y < enemies[i].y + 50 &&
          player.y + player.height > enemies[i].y
        ) {
          if (!player.isInvulnerable) { // Check if player is not invulnerable
            // Decrease player health
            player.health -= 1;
      
            // Make player invulnerable and start blinking
            if (!player.isInvulnerable) {
              player.isInvulnerable = true;
              
              
              setTimeout(() => { player.isInvulnerable = false; }, 2000); // 2 seconds of invulnerability
            }
      
            // Blink effect for invulnerability (making the player semi-transparent)
            if (player.isInvulnerable) {
              player.blink = !player.blink; // Toggle blink state
              ctx.globalAlpha = player.blink ? 0.5 : 1; // Apply blink effect
            } else {
              ctx.globalAlpha = 1; // No transparency when not invulnerable
            }
      
            // Draw the player image
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
      
            // Reset transparency after drawing player
            ctx.globalAlpha = 1;
            explosionSound.currentTime = 0; 
            // Play explosion sound
            explosionSound.play();
      
            // Draw explosion GIF at the player's location
            ctx.drawImage(explosionGif, player.x, player.y, 50, 50); // Adjust size as needed
      
            // Remove the current enemy
            enemiesToRemove.push(i);
      
            // End the game if health reaches 0
            if (player.health <= 0) {
              gameOver();
              return; // Exit the function to prevent further checks
            }
          }
        }
      }
      
  
    // Player-Power-up Collisions
    for (let i = 0; i < powerUps.length; i++) {
      if (
        player.x < powerUps[i].x + 20 &&
        player.x + player.width > powerUps[i].x &&
        player.y < powerUps[i].y + 20 &&
        player.y + player.height > powerUps[i].y
      ) {
        // Store the index to be removed later
        powerUpsToRemove.push(i);
  
        // Enable rapid fire for 5 seconds
        player.isRapidFire = true;
        setTimeout(() => (player.isRapidFire = false), 5000);
  
        break; // Stop further power-up checks
      }
    }
  
    // Remove elements after all collision checks
    for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
      enemies.splice(enemiesToRemove[i], 1);
    }
    for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
      bullets.splice(bulletsToRemove[i], 1);
    }
    for (let i = powerUpsToRemove.length - 1; i >= 0; i--) {
      powerUps.splice(powerUpsToRemove[i], 1);
    }
  }
  

// Shoot bullet
function shootBullet() {
    if (player.isRapidFire) {
      bullets.push({ x: player.x + 10, y: player.y });
      bullets.push({ x: player.x + player.width - 10, y: player.y });
    } else {
      bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
    }
  
    // Reset and play the shoot sound every time a bullet is shot
    shootSound.currentTime = 0;  // Reset sound to the beginning
    shootSound.play();  // Play the sound
  }

// Clear canvas and redraw
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
let highScore=0;
// Game Over function
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameInterval);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    if (player.health > 0) {
      ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    } else {
      ctx.fillText('You Lose!', canvas.width / 2 - 100, canvas.height / 2);
    }
    ctx.fillText('Final Score: ' + score, canvas.width / 2 - 100, canvas.height / 2 + 50);
    restartBtn.style.display = 'block';
    if (score > highScore) {
        highScore = score; // Update high score
    }
    
    // Display high score correctly
    document.getElementById('highScore').textContent = 'High Score: ' + highScore;// Correctly update the text content

    restartBtn.style.display = 'block';
    backgroundMusic.pause();// Stop music
  }
  

// Update game loop
// Update game loop
function update() {
    if (isGameOver) return;
    
    clear();
    
    // Draw the background (this ensures the vertical scroll)
    drawBackground();
    
    // Handle other game logic
    movePlayer();
    moveBullets();
    moveEnemies();
    movePowerUps();
    spawnEnemies();
    spawnPowerUps();
    checkCollisions();
    
    // Draw player, bullets, enemies, power-ups
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerUps();
  
    // Continue the game loop
    gameInterval = requestAnimationFrame(update);
  }
  

// Event listeners for buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
startBtn.addEventListener('click', () => {
    startGame();
    backgroundMusic.play().catch(error => {
      console.error("Background music could not be played:", error);
    });
  });
  
  

  