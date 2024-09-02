const canvas = document.getElementById('ponggame');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Global variables for the game configuration
var g_PADDLE_SPEED = 30;
var g_BALL_SPEED = 15;
var g_SOUND = true;
var g_SCORE_TO_WIN = 5;

const PaddleTypes = Object.freeze({
	LEFT1: 1,
	RIGHT1: 2,
	LEFT2: 3,
	RIGHT2: 4,
});

class Ball {
	constructor (score, nbPlayers, paddle1, paddle2, paddle3, paddle4) {
		this.width = canvas.width;
		this.height = canvas.height;
		this.ballMoving = false;
		this.ballX = this.width/2; // X position of the ball
		this.ballY = this.height/2; // Y position of the ball
		this.dx = 0; // Change in x direction
		this.dy = 0; // Change in y direction
		this.paddle1 = paddle1;
		this.paddle2 = paddle2;
		this.paddle3 = paddle3;
		this.paddle4 = paddle4;
		this.nbPlayers = nbPlayers;
		this.ballRadius = this.width/100;
		this.score = score;
		this.sound = new Sound("bounce.mp3");
	}

	drawBall() {
		ctx.fillStyle = 'white'; // Fill color

		//this.ballMoving = false; // Track if the ball is moving
		ctx.beginPath(); // Start a new path
		ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2, false); // Draw a circle
		ctx.fillStyle = 'white'; // Fill color
		ctx.fill(); // Fill the circle with color
		ctx.closePath(); // Close the path
	}

	ballStartAngle() {
		var min = -0.5;
		var max = 0.5;
		var angle = Math.random() * (max - min) + min;
		if (angle < 0.15 && angle > -0.15) {
			angle = 0.15;
		}
		return angle;
	}

	ballResetPosition() {
		this.ballX = this.width/2;
		this.ballY = this.height/2;
	}

	startBallMovement() {
		this.dx = this.ballStartAngle() * g_BALL_SPEED; // Initialize dx based on random angle
		this.dy = this.ballStartAngle() * g_BALL_SPEED; // Initialize dy based on random angle
		this.ballMoving = true; // Set flag to true to start movement
	}

	ballMove() {
		if (this.ballMoving) {
			// top and bottom walls
			if (this.ballY + this.dy + this.ballRadius > canvas.height - Pong.REC_HEIGHT_SIZE || this.ballY + this.dy - this.ballRadius < Pong.REC_HEIGHT_SIZE) {
				this.sound.play();
				this.dy = -this.dy;
			}
			// left paddle collision
			if (this.ballX + this.dx - this.ballRadius < this.paddle1.x + this.paddle1.paddleWidth && this.ballY > this.paddle1.y && this.ballY < this.paddle1.y + this.paddle1.paddleHeight) {
				this.sound.play();
				this.dx = -this.dx;
			}
			// right paddle collision
			if (this.ballX + this.dx + this.ballRadius > this.paddle2.x && this.ballY > this.paddle2.y && this.ballY < this.paddle2.y + this.paddle2.paddleHeight) {
				this.sound.play();
				this.dx = -this.dx;
			}

			if (this.nbPlayers == 4) {
				// left paddle collision (player 3)
				if (this.ballX + this.dx - this.ballRadius < this.paddle3.x + this.paddle3.paddleWidth && this.ballY > this.paddle3.y && this.ballY < this.paddle3.y + this.paddle3.paddleHeight) {
					this.sound.play();
					this.dx = -this.dx;
				}
				// right paddle collision (player 4)
				if (this.ballX + this.dx + this.ballRadius > this.paddle4.x && this.ballY > this.paddle4.y && this.ballY < this.paddle4.y + this.paddle4.paddleHeight) {
					this.sound.play();
					this.dx = -this.dx;
				}
			}

			this.ballX += this.dx;
			this.ballY += this.dy;

			this.updateScore();
		}
	}

	updateScore() {
		if (this.ballX < 0) {
			this.score.incrementScoreR();
			this.ballMoving = false;
			if (this.score.checkGameOver() === false) {
				this.ballResetPosition();
				this.startBallMovement();
			}

		}
		if (this.ballX > canvas.width) {
			this.score.incrementScoreL();
			this.ballMoving = false;
			if (this.score.checkGameOver() === false) {
				this.ballResetPosition();
				this.startBallMovement();
			}
		}
	}

}

class Paddle {
	constructor(paddleType) {
		this.paddleType = paddleType;
		this.width = canvas.width; // Canvas width in pixels
		this.height = canvas.height; // Canvas height in pixels
		this.paddleWidth = this.width/50;
		this.paddleHeight = this.height/8;
		if (this.paddleType == PaddleTypes.LEFT1) {
			this.x = 2;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.RIGHT1) {
			this.x = this.width - 2 - this.paddleWidth;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.LEFT2) {
			this.x = this.paddleWidth + 2 + 3;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.RIGHT2) {
			this.x = this.width - 5 - this.paddleWidth - this.paddleWidth;
			this.y = this.height / 2.5;
		}
	}
	up() {
		if (this.y - g_PADDLE_SPEED - Pong.REC_HEIGHT_SIZE < 0) {
			this.y = Pong.REC_HEIGHT_SIZE; // pixels to move per key event
		}
		else if (this.y > Pong.REC_HEIGHT_SIZE) {
			this.y -= g_PADDLE_SPEED; // pixels to move per key event
		}
	}

	// Check if the paddle is not at the bottom of the canvas
	down() {
		if (this.y + Pong.REC_HEIGHT_SIZE + this.paddleHeight + 5 > this.height) {
			this.y = this.height - Pong.REC_HEIGHT_SIZE - this.paddleHeight - 5;
		}
		else if (this.y < this.height - Pong.REC_HEIGHT_SIZE - this.paddleHeight - 5) {
			this.y += g_PADDLE_SPEED;
		}
	}

	// TO DO: Implement paddle collision when the ball hits the paddle on the top or bottom of the paddle

	drawPaddle() {
		ctx.fillStyle = 'white'; // Fill color players 1 and 2
		if (this.paddleType == PaddleTypes.LEFT1)
		{
			ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight); // Draw a rectangle (x, y, width, height)
		}

		if (this.paddleType == PaddleTypes.RIGHT1)
			ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
		ctx.fillStyle = '#dc3545'; // Fill color players 3 and 4
		if (this.paddleType == PaddleTypes.LEFT2)
			ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
		if (this.paddleType == PaddleTypes.RIGHT2)
			ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
	}
}

class Pong {
	static REC_HEIGHT_SIZE = 20;

	constructor(nbPlayers) {
		// Get canvas attributes
		this.width = canvas.width; // Canvas width in pixels
		this.height = canvas.height; // Canvas height in pixels
		this.nbPlayers = nbPlayers;
		this.paddle1 = new Paddle(PaddleTypes.LEFT1);
		this.paddle2 = new Paddle(PaddleTypes.RIGHT1);
		this.score = new Score();
		this.countdown = new Countdown(this);

		if (this.nbPlayers == 4) {
			this.paddle3 = new Paddle(PaddleTypes.LEFT2);
			this.paddle4 = new Paddle(PaddleTypes.RIGHT2);
			this.ball = new Ball(this.score, 4, this.paddle1, this.paddle2, this.paddle3, this.paddle4);
		}
		else
		{
			this.ball = new Ball(this.score, 2, this.paddle1, this.paddle2);
		}
		this.intervalId =0;
	}
	start() {
		this.render();
		this.countdown.start();
	}

	startGame() {
		this.score.resetScore();
		this.ball.ballResetPosition();
		this.intervalId =setInterval(this.pongRender.bind(this), 1000 / 60); // 60 FPS (frames per second)
		document.addEventListener('keydown', this.handleKeyboardEvent.bind(this)); // addEventListener is a system function
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				this.ball.startBallMovement(); // Start ball movement on Enter key press
			}
		});
	}

	pause()	{
		clearInterval(this.intervalId);
	}

	resume(){
		this.ball.startBallMovement();
		this.intervalId =setInterval(this.pongRender.bind(this), 1000 / 60);

	}

	stop() {
		clearInterval(this.intervalId);
		document.removeEventListener('keydown', this.handleKeyboardEvent.bind(this));
	}

	drawSquare() {
		ctx.fillStyle = 'black'; // Fill color
		ctx.fillRect(0, 0, this.width, this.height); // Draw a rectangle (x, y, width, height)

		// Set properties for the rectangle
		ctx.fillStyle = 'white'; // Fill color
		ctx.fillRect(0, 0, this.width, Pong.REC_HEIGHT_SIZE); // Draw a rectangle (x, y, width, height)
		ctx.fillRect(0, this.height - Pong.REC_HEIGHT_SIZE, this.width, Pong.REC_HEIGHT_SIZE); // Draw a rectangle (x, y, width, height)
		ctx.strokeStyle = 'white'; // Line color
		ctx.lineWidth = 2; // line Width
		ctx.setLineDash([6, 3]); // LineDash: 6px and 3px space
		ctx.beginPath();
		ctx.moveTo(this.width / 2, 0); // Line initial point
		ctx.lineTo(this.width / 2, this.height); //  Line final point
		ctx.stroke(); // Apply line stile and draw
	}
	drawControlText(line) {
		// Set text style
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'white';

		// Define the starting y position for the first line of text
		lineHeight = fontSize * 0.8; // Space between lines
		let startY = canvasHeight / 2 - (lineHeight * (textLines.length - 0.8)) / 2;
		ctx.fillText(line, canvasWidth / 2, startY);

	}

	displayWinner() {
		var element = document.getElementById('winner');

		if (this.score.scoreL == g_SCORE_TO_WIN) {
			element.innerText = "Left Player wins!";
		}
		else {
			element.innerText = "Right Player wins!";
		}
		var myModal = new bootstrap.Modal(document.getElementById('winnerpopup'));
			myModal.show(); // Show the modal
	}

	render() {
		this.drawSquare();
		this.paddle1.drawPaddle();
		this.paddle2.drawPaddle();
		if (this.nbPlayers == 4) {
			this.paddle3.drawPaddle();
			this.paddle4.drawPaddle();
		}
		this.score.drawScore();
		this.ball.drawBall(); // Draw the ball
	}

	pongRender() {
		this.render();
		this.ball.ballMove(); // Move the ball
		if (this.score.checkGameOver() == true) {
			this.displayWinner();
			this.stop();
			this.render();
		}
	}

	handleKeyboardEvent(event) {
		// Check if the key is a letter or control key
		if (event.key === 'q') {
			this.paddle1.up();
		} else if (event.key === 'a') {
			this.paddle1.down();
		}
		if (event.key === 'p') {
			this.paddle2.up();
		}
		else if (event.key === 'l') {
			this.paddle2.down();
		}
		if (this.nbPlayers == 4) {
			if (event.key === 'd') {
				this.paddle3.up();
			} else if (event.key === 'c') {
				this.paddle3.down();
			}
			if (event.key === 'j') {
				this.paddle4.up();
			}
			else if (event.key === 'n') {
				this.paddle4.down();
			}
		}
	}
}


class Score {
	constructor() {
		this.scoreL = 0;
		this.scoreR = 0;
	}

	incrementScoreR() {
		this.scoreR++;
	}

	incrementScoreL() {
		this.scoreL++;
	}

	checkGameOver() {
		if (this.scoreL === g_SCORE_TO_WIN || this.scoreR === g_SCORE_TO_WIN) {
			return true;
		}
		return false;
	}


	drawScore() {
	ctx.font = "72px Bungee Tint";
	ctx.fillText(this.scoreL, canvas.width / 4, Pong.REC_HEIGHT_SIZE * 5); // Left player score
	ctx.fillText(this.scoreR, 3 * canvas.width / 4, Pong.REC_HEIGHT_SIZE * 5); // Right player score
	}

	resetScore() {
	this.scoreL = 0;
	this.scoreR = 0;
	}
}

class Sound {
	constructor(src) {
		this.sound = document.createElement("audio");
		this.sound.src = src;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
		}
		play() {
			if (g_SOUND) {
				this.sound.play();
			}
		}
}

class Countdown {
	constructor(pong) {
		this.pong = pong;
		this.count = 3;
		this.intervalId = 0;
	}

	start() {
		this.intervalId = setInterval(this.countdown.bind(this), 1000);
	}

	countdown() {
		if (this.count === 0) {
			clearInterval(this.intervalId);
			this.pong.startGame();
		}
		else {
			this.drawCountdown();
			this.count--;
		}
	}
	drawCountdown() {
		this.pong.render();
		ctx.font = "180px Bungee Tint";
		ctx.fillText(this.count, canvas.width / 2, canvas.height / 2);
	}
}

pong = new Pong(4);
pong.start();


function playAgain() {
	pong.start();
}


function loadConfiguration() {
	pong.pause();
	document.getElementById('playerspeed').value = g_PADDLE_SPEED;
	document.getElementById('ballspeed').value = g_BALL_SPEED;
	document.getElementById('score').value = g_SCORE_TO_WIN;
	document.getElementById('customSwitch').checked = g_SOUND;
	document.getElementById('currentScore').innerText= "Score - " + g_SCORE_TO_WIN;
}

function applyConfiguration() {
	g_PADDLE_SPEED = parseInt(document.getElementById('playerspeed').value, 10);
	g_BALL_SPEED = parseInt(document.getElementById('ballspeed').value, 10);
	g_SCORE_TO_WIN = parseInt(document.getElementById('score').value, 10);
	g_SOUND = document.getElementById('customSwitch').checked;
	pong.resume();
}


// Add 2 balls?
// Add sound effects?
// Custom score? DONE
// Add different ball speeds? DONE
// Add different paddle speeds? DONE


// Add different backgrounds/themes?
