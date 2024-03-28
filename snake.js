window.onload = function () {
    // BOARD    
    let blockSize = 40;
    let rows = 12;
    let cols = 23;
    let canvas = document.getElementById('board');
    canvas.height = rows * blockSize;
    canvas.width = cols * blockSize;
    let context = canvas.getContext("2d"); //used for drawing on the board

    // SCORE
    let score = 0;
    let scoreText = document.getElementById('score');
    scoreText.innerHTML = formatToThreeDigits(score);
    
    // SNAKE HEAD
    let snakeX = blockSize * 5;
    let snakeY = blockSize * 5;

    //SNAKE LENGTH (SNAKE BODY)
    let snakeBody = [];

    // FOOD
    let foodX;
    let foodY;

    // change direction
    let velocityX = 0;
    let velocityY = 0;

    // don't let the snake bite itself
    let isGameOver = false;

    // don't let the game crash when pressing keys fast
    let keyTimeFrame = false;

    placeFood();
    document.addEventListener("keyup", changeDirection);
    //update();
    setInterval(update, 3000 / 10); // every 300 milliseconds it is going to run the update function

    function update() {
        keyTimeFrame = false;

        if (isGameOver) {
            return;
        }

        hasTeleported = false;

        teleportingOnTheOtherSideWhenOutOfBounds();
        context.fillStyle = "#acd414";
        context.fillRect(0, 0, canvas.width, canvas.height);

        //Snake head
        context.fillStyle = "#202c1c";
        if (!hasTeleported) {
        // Only update the snake's position if it hasn't teleported in this update
            snakeX += velocityX * blockSize;
            snakeY += velocityY * blockSize;
        }
        if(!snakeBody.length){
            snakeBody.push([foodX, foodY]);
        }

        // snakeX += velocityX * blockSize;
        // snakeY += velocityY * blockSize;
        context.fillRect(snakeX, snakeY, blockSize - 5, blockSize - 5);

        if (snakeX == foodX && snakeY == foodY) {
            snakeBody.push([foodX, foodY]);
            placeFood();
            scoreText.innerHTML = formatToThreeDigits(++score);
        }

        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }

        //food
        context.beginPath();
        let radiusArc = blockSize / 2;
        let xArc = foodX + blockSize / 2;
        let yArc = foodY + blockSize / 2;
        let startAngleArc = 0;
        let endAngleArc = 2 * Math.PI;
        context.arc(xArc, yArc, radiusArc, startAngleArc, endAngleArc);
        context.fillStyle = "#202c1c";
        context.fill();
        context.closePath();

        for (let i = 0; i < snakeBody.length; i++) {
            context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize - 5, blockSize - 5);
        }

        checkSelfCollision();
    }

    function placeFood() {
        // Math.random() returns a value between 0 and 1
        foodX = Math.floor(Math.random() * cols) * blockSize;
        foodY = Math.floor(Math.random() * rows) * blockSize;
    }

    function changeDirection(e) {
        if(keyTimeFrame) return;

        if (e.code == "ArrowUp" && velocityY != 1) {
            velocityX = 0;
            velocityY = -1;
        }
        else if (e.code == "ArrowDown" && velocityY != -1) {
            velocityX = 0;
            velocityY = 1;
        }
        else if (e.code == "ArrowLeft" && velocityX != 1) {
            velocityX = -1;
            velocityY = 0;
        }
        else if (e.code == "ArrowRight" && velocityX != -1) {
            velocityX = 1;
            velocityY = 0;
        }

        keyTimeFrame = true;
    }

    function teleportingOnTheOtherSideWhenOutOfBounds() {
        if (snakeX >= canvas.width) {
            snakeX = 0;
            hasTeleported = true;
        } else if (snakeX < 0) {
            snakeX = canvas.width - blockSize;
            hasTeleported = true;
        }

        if (snakeY >= canvas.height) {
            snakeY = 0;
            hasTeleported = true;
        } else if (snakeY < 0) {
            snakeY = canvas.height - blockSize;
            hasTeleported = true;
        }  
    }

    function checkSelfCollision(){
        // Game over condition
        for (let i = 1; i < snakeBody.length; i++) {
            if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]){
                isGameOver = true;
                alert("Game Over");
                break;
            }
        }
    }

    function formatToThreeDigits(number) {
        return String(number).padStart(3, '0');
      }
}

