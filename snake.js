window.onload = function () {
    // BOARD
    let blockSize = 40;
    let rows = 12;
    let cols = 23;
    let canvas = document.getElementById("board");
    canvas.height = rows * blockSize;
    canvas.width = cols * blockSize;
    let context = canvas.getContext("2d"); //used for drawing on the board

    // SCORE
    let score = 0;
    let scoreText = document.getElementById("score");
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

    // Audio elements
    const eatSound = new Audio("./sounds/snake-eat-sound.mp3"); // Replace 'path/to/eat-sound.mp3' with the actual path to your eat sound file
    const collisionSound = new Audio("./sounds/wall-collision.mp3"); // Replace 'path/to/collision-sound.mp3' with the actual path to your collision sound file
    //const gameOverSound = new Audio("./sounds/game-over.mp3"); // Replace 'path/to/game-over-sound.mp3' with the actual path to your game over sound file
    
    placeFood();
    document.addEventListener("keyup", changeDirection);

     // Speech recognition setup

     const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
     recognition.continuous = true;
     recognition.lang = "en-US";
     recognition.interimResults = true; // Enable interim results
 
     // Set a shorter end timeout to minimize the delay
 
     recognition.endTimeout = 0; // Default is 700 milliseconds
     recognition.maxAlternatives = 1; // Getting the top confidence for the words
     let commandProcessed = true; // Flag for filtering multiple speech requests
 
     // Start speech recognition
     recognition.start();

    let periodOfExecution = setInterval(update, 3000 / 10); // every 300 milliseconds it is going to run the update function

    function update() {
        keyTimeFrame = false;

        if (isGameOver) {
           // gameOverSound.play();
            clearInterval(periodOfExecution)
            setTimeout(showGameOverScreen ,1500);
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
        if (!snakeBody.length) {
            snakeBody.push([foodX, foodY]);
        }

        // snakeX += velocityX * blockSize;
        // snakeY += velocityY * blockSize;
        context.fillRect(snakeX, snakeY, blockSize - 5, blockSize - 5);

        if (snakeX == foodX && snakeY == foodY) {
            snakeBody.push([foodX, foodY]);
            placeFood();
            scoreText.innerHTML = formatToThreeDigits(++score);

            // Play eat sound when snake eats food
            eatSound.play();
        }

        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }

        //food
        context.beginPath();
        let radiusArc = blockSize / 3;
        let xArc = foodX + (blockSize / 2) - (radiusArc/4);
        let yArc = foodY + (blockSize / 2) - (radiusArc/4);
        let startAngleArc = 0;
        let endAngleArc = 2 * Math.PI;
        context.arc(xArc, yArc, radiusArc, startAngleArc, endAngleArc);
        context.fillStyle = "#202c1c";
        context.fill();
        context.closePath();

        for (let i = 0; i < snakeBody.length; i++) {
            context.fillRect(
                snakeBody[i][0],
                snakeBody[i][1],
                blockSize - 5,
                blockSize - 5
            );
        }

        checkSelfCollision();
    }

    function placeFood() {
        // Math.random() returns a value between 0 and 1
        foodX = Math.floor(Math.random() * cols) * blockSize;
        foodY = Math.floor(Math.random() * rows) * blockSize;
    }

    function changeDirection(e) {
        if (keyTimeFrame) return;

        if (e.code == "ArrowUp" && velocityY != 1) {
            velocityX = 0;
            velocityY = -1;
        } else if (e.code == "ArrowDown" && velocityY != -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (e.code == "ArrowLeft" && velocityX != 1) {
            velocityX = -1;
            velocityY = 0;
        } else if (e.code == "ArrowRight" && velocityX != -1) {
            velocityX = 1;
            velocityY = 0;
        }

        keyTimeFrame = true;
    }

    recognition.onresult = function (event) {
        const arrOfAllowedWords = ["up", "down", "left", "right"];
        const currentSpeech = event.results[event.results.length - 1][0];

        const inputText = currentSpeech.transcript.toLowerCase();
        const isFinal = event.results[event.results.length - 1].isFinal;

        // Only process final results to reduce delay
        if (inputText !== " " && isFinal && commandProcessed) {
            console.log(currentSpeech);
            const command = arrOfAllowedWords.find((word) => inputText.includes(word));
            if (command) {
                commandProcessed = false; // Set the flag to false

                // Delay of 0s before executing the command
                setTimeout(() => {
                    switch (command) {
                        case "up":
                            if (velocityY !== 1) {
                                velocityX = 0;
                                velocityY = -1;
                            }
                            break;
                        case "down":
                            if (velocityY !== -1) {
                                velocityX = 0;
                                velocityY = 1;
                            }
                            break;
                        case "left":
                            if (velocityX !== 1) {
                                velocityX = -1;
                                velocityY = 0;
                            }
                            break;
                        case "right":
                            if (velocityX !== -1) {
                                velocityX = 1;
                                velocityY = 0;
                            }
                            break;
                    }

                    commandProcessed = true; // Set the flag to true after processing
                }, 0);
            }
        }
    };

    // Handle speech recognition errors
    recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
    };

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

    function checkSelfCollision() {
        // Game over condition
        for (let i = 1; i < snakeBody.length; i++) {
            if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
                isGameOver = true;
                collisionSound.play();
                break;
            }
        }
    }

    function formatToThreeDigits(number) {
        return String(number).padStart(3, "0");
    }

    function showGameOverScreen() {
        // Hide game container, show game-over screen
        document.getElementById("game-container").classList.add("d-none");
        document.getElementById("game-over").classList.remove("d-none");
        document.getElementById("header").classList.add("d-none")

        document.getElementById("final-score").innerText = "Final Score: " + score;

    
        // Restart game when restart button is clicked
        document.getElementById("restart-btn").addEventListener("click", function () {
            resetGame();
            document.getElementById("game-container").classList.remove("d-none");
            document.getElementById("game-over").classList.add("d-none");
            periodOfExecution = setInterval(update, 3000 / 10);
        });
    }
    
    function resetGame() {
        // Reset game variables
        document.getElementById("header").classList.remove("d-none")
        score = 0;
        snakeX = blockSize * 5;
        snakeY = blockSize * 5;
        snakeBody = [];
        velocityX = 0;
        velocityY = 0;
        isGameOver = false;
        scoreText.innerHTML = formatToThreeDigits(score);
        placeFood();
    }
};
