const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
let gameOver = false;

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 20,
    dx: 0,
    dy: 0,
    gravity: 0.5,
    jumpForce: -12,
    color: '#ff6b6b'
};

// Platforms
const platforms = [];
const platformWidth = 100;
const platformHeight = 20;
const platformGap = 200;
const platformCount = 5;

// Generate initial platforms
for (let i = 0; i < platformCount; i++) {
    platforms.push({
        x: Math.random() * (canvas.width - platformWidth),
        y: canvas.height - (i * platformGap),
        width: platformWidth,
        height: platformHeight,
        color: '#4ecdc4'
    });
}

// Input handling
let keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' && ball.dy === 0) ball.dy = ball.jumpForce;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// Game loop
function update() {
    if (gameOver) return;

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

    // Platform collision
    for (let platform of platforms) {
        if (ball.y + ball.radius > platform.y &&
            ball.y - ball.radius < platform.y + platform.height &&
            ball.x + ball.radius > platform.x &&
            ball.x - ball.radius < platform.x + platform.width) {
            
            if (ball.dy > 0) {
                ball.y = platform.y - ball.radius;
                ball.dy = 0;
            }
        }
    }

    // Generate new platforms
    if (platforms[0].y > canvas.height) {
        platforms.shift();
        platforms.push({
            x: Math.random() * (canvas.width - platformWidth),
            y: platforms[platforms.length - 1].y - platformGap,
            width: platformWidth,
            height: platformHeight,
            color: '#4ecdc4'
        });
        score++;
        scoreElement.textContent = score;
    }

    // Game over condition
    if (ball.y > canvas.height) {
        gameOver = true;
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
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
        ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 80);
    }
}

// Restart game
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        gameOver = false;
        score = 0;
        scoreElement.textContent = score;
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 50;
        ball.dx = 0;
        ball.dy = 0;
        platforms.length = 0;
        for (let i = 0; i < platformCount; i++) {
            platforms.push({
                x: Math.random() * (canvas.width - platformWidth),
                y: canvas.height - (i * platformGap),
                width: platformWidth,
                height: platformHeight,
                color: '#4ecdc4'
            });
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