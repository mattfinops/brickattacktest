// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Game canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const restartButton = document.getElementById('restartButton');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const powerupDisplay = document.getElementById('activePowerup');

    // Game dimensions
    canvas.width = 800;
    canvas.height = 600;

    // Game state
    const game = {
        score: 0,
        lives: 3,
        level: 1,
        running: false,
        paused: false,
        animationId: null,
        bricksDestroyed: 0
    };

    // Paddle properties
    const paddle = {
        x: canvas.width / 2 - 50,
        y: canvas.height - 30,
        width: 100,
        height: 15,
        dx: 8,
        color: '#4361ee',
        originalWidth: 100
    };

    // Ball properties
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        dx: 4,
        dy: -4,
        speed: 4,
        color: '#fff'
    };

    // Brick properties
    const brickRowCount = 5;
    const brickColumnCount = 9;
    const brickWidth = 80;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 60;
    const brickOffsetLeft = 35;

    // Input control
    const controls = {
        rightPressed: false,
        leftPressed: false
    };

    // Create bricks array
    const bricks = [];
    function createBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                
                // Assign different colors to rows
                let brickColor;
                switch (r) {
                    case 0:
                        brickColor = '#FF5252'; // Red
                        break;
                    case 1:
                        brickColor = '#FF9800'; // Orange
                        break;
                    case 2:
                        brickColor = '#FFEB3B'; // Yellow
                        break;
                    case 3:
                        brickColor = '#66BB6A'; // Green
                        break;
                    case 4:
                        brickColor = '#42A5F5'; // Blue
                        break;
                    default:
                        brickColor = '#9C27B0'; // Purple
                }
                
                bricks[c][r] = {
                    x: brickX,
                    y: brickY,
                    status: 1, // 1 = active, 0 = destroyed
                    color: brickColor
                };
            }
        }
    }

    // Draw paddle
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.fillStyle = paddle.color;
        ctx.fill();
        ctx.closePath();
    }

    // Draw ball
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }

    // Draw bricks
    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    ctx.beginPath();
                    ctx.rect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight);
                    ctx.fillStyle = bricks[c][r].color;
                    ctx.fill();
                    ctx.strokeStyle = '#222';
                    ctx.strokeRect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight);
                    ctx.closePath();
                }
            }
        }
    }

    // Collision detection
    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const brick = bricks[c][r];
                
                if (brick.status === 1) {
                    if (
                        ball.x + ball.radius > brick.x && 
                        ball.x - ball.radius < brick.x + brickWidth && 
                        ball.y + ball.radius > brick.y && 
                        ball.y - ball.radius < brick.y + brickHeight
                    ) {
                        ball.dy = -ball.dy;
                        brick.status = 0; // Destroy the brick
                        game.score += 10;
                        game.bricksDestroyed++;
                        scoreElement.textContent = game.score;
                        
                        // Check if all bricks are destroyed
                        if (game.bricksDestroyed === brickRowCount * brickColumnCount) {
                            gameWon();
                        }
                    }
                }
            }
        }
    }

    // Move paddle
    function movePaddle() {
        if (controls.rightPressed && paddle.x + paddle.width < canvas.width) {
            paddle.x += paddle.dx;
        } else if (controls.leftPressed && paddle.x > 0) {
            paddle.x -= paddle.dx;
        }
    }

    // Handle keyboard controls
    function keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            controls.rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            controls.leftPressed = true;
        } else if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
    }

    function keyUpHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            controls.rightPressed = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            controls.leftPressed = false;
        }
    }

    // Handle mouse and touch controls
    function mouseMoveHandler(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddle.x = relativeX - paddle.width / 2;
        }
    }

    function touchMoveHandler(e) {
        if (e.touches.length > 0) {
            const relativeX = e.touches[0].clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddle.x = relativeX - paddle.width / 2;
            }
        }
        e.preventDefault();
    }

    // Game over and win handlers
    function gameOver() {
        game.running = false;
        pauseButton.style.display = 'none';
        restartButton.style.display = 'inline-block';
        startButton.style.display = 'none';
        cancelAnimationFrame(game.animationId);
        
        // Display game over message
        ctx.font = '48px Arial';
        ctx.fillStyle = '#FF5252';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 40);
    }

    function gameWon() {
        game.running = false;
        pauseButton.style.display = 'none';
        restartButton.style.display = 'inline-block';
        startButton.style.display = 'none';
        cancelAnimationFrame(game.animationId);
        
        // Display victory message
        ctx.font = '48px Arial';
        ctx.fillStyle = '#4caf50';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 40);
    }

    // Draw pause overlay
    function drawPauseOverlay() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('GAME PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Click Resume to continue', canvas.width / 2, canvas.height / 2 + 40);
    }

    // Game loop
    function gameLoop() {
        // If game is paused, just draw the pause overlay and continue the loop
        if (game.paused) {
            drawPauseOverlay();
            game.animationId = requestAnimationFrame(gameLoop);
            return;
        }
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements
        drawBricks();
        drawPaddle();
        drawBall();
        
        // Move paddle
        movePaddle();
        
        // Collision detection
        collisionDetection();
        
        // Ball-wall collision detection
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }
        
        // Ball-top collision detection
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        }
        
        // Ball-paddle collision detection
        if (
            ball.y + ball.dy > canvas.height - ball.radius - paddle.height &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width
        ) {
            // Calculate new x direction based on where the ball hit the paddle
            const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            ball.dx = hitPoint * 5; // Adjust for angle
            ball.dy = -ball.dy;
        }
        
        // Ball-bottom collision detection (lose life)
        if (ball.y + ball.dy > canvas.height - ball.radius) {
            game.lives--;
            livesElement.textContent = game.lives;
            
            if (game.lives === 0) {
                gameOver();
                return;
            } else {
                // Reset ball and paddle
                ball.x = canvas.width / 2;
                ball.y = canvas.height / 2;
                ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                ball.dy = -4;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        }
        
        // Update ball position
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Continue animation if game is running
        if (game.running) {
            game.animationId = requestAnimationFrame(gameLoop);
        }
    }

    // Initialize the game
    function initGame() {
        game.score = 0;
        game.lives = 3;
        game.bricksDestroyed = 0;
        scoreElement.textContent = game.score;
        livesElement.textContent = game.lives;
        createBricks();
        
        // Reset ball and paddle
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -4;
        paddle.x = (canvas.width - paddle.width) / 2;
    }

    // Start the game
    function startGame() {
        console.log("Start button clicked");
        if (!game.running) {
            game.running = true;
            game.paused = false;
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            pauseButton.textContent = 'Pause Game';
            restartButton.style.display = 'inline-block';
            initGame();
            gameLoop();
        } else if (game.paused) {
            togglePause();
        }
    }

    // Toggle pause
    function togglePause() {
        console.log("Pause button clicked");
        if (game.running) {
            game.paused = !game.paused;
            console.log("Game paused:", game.paused);
            
            if (game.paused) {
                pauseButton.textContent = 'Resume Game';
            } else {
                pauseButton.textContent = 'Pause Game';
            }
        }
    }

    // Restart the game
    function restartGame() {
        console.log("Restart button clicked");
        game.running = true;
        game.paused = false;
        pauseButton.style.display = 'inline-block';
        pauseButton.textContent = 'Pause Game';
        initGame();
        gameLoop();
    }

    // Event listeners
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    
    // Button event listeners
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', restartGame);

    // Draw welcome screen
    function drawWelcomeScreen() {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '36px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Brick Attack', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText('Press Start to Play', canvas.width / 2, canvas.height / 2 + 20);
    }

    // Initial setup
    initGame();
    drawWelcomeScreen();
    console.log("Game initialized");
});