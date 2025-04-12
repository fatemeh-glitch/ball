window.onload = function() {
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
    const platformGap = 150;
    const platformCount = 5;

    // Generate initial platforms
    function initPlatforms() {
        platforms.length = 0;
        for (let i = 0; i < platformCount; i++) {
            platforms.push({
                x: Math.random() * (canvas.width - platformWidth),
                y: canvas.height - (i * platformGap) - 200,
                width: platformWidth,
                height: platformHeight,
                color: '#4ecdc4'
            });
        }
    }

    initPlatforms();

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
    const keys = {
        left: false,
        right: false
    };

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'a') keys.left = true;
        if (e.key.toLowerCase() === 'd') keys.right = true;
        if (e.key.toLowerCase() === 'r' && gameOver) resetGame();
        e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        if (e.key.toLowerCase() === 'a') keys.left = false;
        if (e.key.toLowerCase() === 'd') keys.right = false;
        e.preventDefault();
    });

    function resetGame() {
        gameOver = false;
        score = 0;
        combo = 0;
        scoreElement.textContent = score;
        comboElement.textContent = 'Combo: 0x';
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 50;
        ball.dx = 0;
        ball.dy = 0;
        initPlatforms();
    }

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

        // Platform collision and auto-jump
        for (let platform of platforms) {
            if (ball.y + ball.radius > platform.y &&
                ball.y - ball.radius < platform.y + platform.height &&
                ball.x + ball.radius > platform.x &&
                ball.x - ball.radius < platform.x + platform.width) {
                
                if (ball.dy > 0) {
                    ball.y = platform.y - ball.radius;
                    ball.dy = ball.jumpForce; // Auto-jump when hitting platform
                    combo++;
                    comboElement.textContent = `Combo: ${combo}x`;
                }
            }
        }

        // Move platforms and update score
        if (ball.y < canvas.height / 2 && ball.dy < 0) {
            for (let platform of platforms) {
                platform.y -= ball.dy;
            }

            // Generate new platform when the lowest one goes off screen
            if (platforms[0].y > canvas.height) {
                platforms.shift();
                platforms.push({
                    x: Math.random() * (canvas.width - platformWidth),
                    y: platforms[platforms.length - 1].y - platformGap,
                    width: platformWidth,
                    height: platformHeight,
                    color: '#4ecdc4'
                });
                score += combo;
                scoreElement.textContent = score;
            }
        }

        // Game over condition
        if (ball.y > canvas.height + 300) {
            gameOver = true;
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
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
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
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
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

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    gameLoop();
}; 