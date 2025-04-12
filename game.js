const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const comboElement = document.getElementById('combo');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
let combo = 0;
let gameOver = false;
let particles = [];
let powerUps = [];
let obstacles = [];

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 20,
    dx: 0,
    dy: 0,
    gravity: 0.5,
    jumpForce: -12,
    color: '#ff6b6b',
    isInvincible: false,
    isDoubleJump: false,
    hasDoubleJumped: false
};

// Platform types
const PLATFORM_TYPES = {
    NORMAL: 'normal',
    MOVING: 'moving',
    DISAPPEARING: 'disappearing',
    BOUNCY: 'bouncy'
};

// Platforms
const platforms = [];
const platformWidth = 100;
const platformHeight = 20;
const platformGap = 200;
const platformCount = 5;

// Generate initial platforms
for (let i = 0; i < platformCount; i++) {
    platforms.push(createPlatform(canvas.height - (i * platformGap)));
}

// Create platform with random type
function createPlatform(y) {
    const types = Object.values(PLATFORM_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const platform = {
        x: Math.random() * (canvas.width - platformWidth),
        y: y,
        width: platformWidth,
        height: platformHeight,
        color: '#4ecdc4',
        type: type,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: 2,
        disappearTimer: 0,
        isVisible: true
    };

    // Set platform color based on type
    switch(type) {
        case PLATFORM_TYPES.MOVING:
            platform.color = '#ff9f43';
            break;
        case PLATFORM_TYPES.DISAPPEARING:
            platform.color = '#ff6b6b';
            break;
        case PLATFORM_TYPES.BOUNCY:
            platform.color = '#4ecdc4';
            break;
    }

    return platform;
}

// Power-up types
const POWER_UP_TYPES = {
    INVINCIBLE: 'invincible',
    DOUBLE_JUMP: 'doubleJump',
    SCORE_MULTIPLIER: 'scoreMultiplier'
};

// Create power-up
function createPowerUp(x, y) {
    const types = Object.values(POWER_UP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
        x: x,
        y: y,
        width: 20,
        height: 20,
        type: type,
        color: type === POWER_UP_TYPES.INVINCIBLE ? '#ffd700' :
               type === POWER_UP_TYPES.DOUBLE_JUMP ? '#4ecdc4' : '#ff6b6b'
    };
}

// Create particle effect
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 2,
            color: color,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            life: 1
        });
    }
}

// Input handling
let keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ') {
        if (ball.dy === 0) {
            ball.dy = ball.jumpForce;
            createParticles(ball.x, ball.y + ball.radius, ball.color);
        } else if (ball.isDoubleJump && !ball.hasDoubleJumped) {
            ball.dy = ball.jumpForce * 0.8;
            ball.hasDoubleJumped = true;
            createParticles(ball.x, ball.y + ball.radius, '#4ecdc4');
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// Game loop
function update() {
    if (gameOver) return;

    // Update particles
    particles = particles.filter(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.02;
        return particle.life > 0;
    });

    // Update power-ups
    powerUps = powerUps.filter(powerUp => {
        powerUp.y += 2;
        return powerUp.y < canvas.height;
    });

    // Apply gravity
    ball.dy += ball.gravity;

    // Handle horizontal movement
    if (keys.left) ball.dx = -5;
    else if (keys.right) ball.dx = 5;
    else ball.dx = 0;

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.dx = 0;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.dx = 0;
    }

    // Platform collision and updates
    for (let platform of platforms) {
        // Update platform based on type
        if (platform.type === PLATFORM_TYPES.MOVING) {
            platform.x += platform.speed * platform.direction;
            if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
                platform.direction *= -1;
            }
        } else if (platform.type === PLATFORM_TYPES.DISAPPEARING && !platform.isVisible) {
            platform.disappearTimer++;
            if (platform.disappearTimer > 120) {
                platform.isVisible = true;
                platform.disappearTimer = 0;
            }
        }

        // Check collision
        if (platform.isVisible && ball.y + ball.radius > platform.y &&
            ball.y - ball.radius < platform.y + platform.height &&
            ball.x + ball.radius > platform.x &&
            ball.x - ball.radius < platform.x + platform.width) {
            
            if (ball.dy > 0) {
                ball.y = platform.y - ball.radius;
                ball.dy = 0;
                ball.hasDoubleJumped = false;

                // Platform type effects
                if (platform.type === PLATFORM_TYPES.DISAPPEARING) {
                    platform.isVisible = false;
                } else if (platform.type === PLATFORM_TYPES.BOUNCY) {
                    ball.dy = ball.jumpForce * 1.2;
                    createParticles(ball.x, ball.y + ball.radius, platform.color);
                }

                // Update combo
                combo++;
                comboElement.textContent = `Combo: ${combo}x`;
                
                // Chance to spawn power-up
                if (Math.random() < 0.1) {
                    powerUps.push(createPowerUp(platform.x + platform.width/2, platform.y));
                }
            }
        }
    }

    // Power-up collision
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (ball.x + ball.radius > powerUp.x &&
            ball.x - ball.radius < powerUp.x + powerUp.width &&
            ball.y + ball.radius > powerUp.y &&
            ball.y - ball.radius < powerUp.y + powerUp.height) {
            
            // Apply power-up effect
            switch(powerUp.type) {
                case POWER_UP_TYPES.INVINCIBLE:
                    ball.isInvincible = true;
                    setTimeout(() => ball.isInvincible = false, 5000);
                    break;
                case POWER_UP_TYPES.DOUBLE_JUMP:
                    ball.isDoubleJump = true;
                    setTimeout(() => ball.isDoubleJump = false, 10000);
                    break;
                case POWER_UP_TYPES.SCORE_MULTIPLIER:
                    score += combo * 2;
                    break;
            }
            
            createParticles(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.color);
            powerUps.splice(i, 1);
        }
    }

    // Generate new platforms
    if (platforms[0].y > canvas.height) {
        platforms.shift();
        platforms.push(createPlatform(platforms[platforms.length - 1].y - platformGap));
        score += combo;
        scoreElement.textContent = score;
    }

    // Game over condition
    if (ball.y > canvas.height) {
        if (!ball.isInvincible) {
            gameOver = true;
        } else {
            ball.y = canvas.height - ball.radius;
            ball.dy = ball.jumpForce;
        }
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    for (let particle of particles) {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw platforms
    for (let platform of platforms) {
        if (platform.isVisible) {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    }

    // Draw power-ups
    for (let powerUp of powerUps) {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.isInvincible ? '#ffd700' : ball.color;
    ctx.fill();
    ctx.closePath();

    // Draw game over screen
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`Highest Combo: ${combo}x`, canvas.width / 2, canvas.height / 2 + 80);
        ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 120);
    }
}

// Restart game
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        gameOver = false;
        score = 0;
        combo = 0;
        scoreElement.textContent = score;
        comboElement.textContent = 'Combo: 0x';
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 50;
        ball.dx = 0;
        ball.dy = 0;
        ball.isInvincible = false;
        ball.isDoubleJump = false;
        ball.hasDoubleJumped = false;
        platforms.length = 0;
        powerUps.length = 0;
        particles.length = 0;
        for (let i = 0; i < platformCount; i++) {
            platforms.push(createPlatform(canvas.height - (i * platformGap)));
        }
    }
});

// Animation loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop(); 