const canvas = document.getElementById('ponggame');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const PaddleTypes = Object.freeze({
	LEFT1: 1,
	RIGHT1: 2,
	LEFT2: 3,
	RIGHT2: 4,
});

class Ball {
	constructor ()
	{
		this.width = canvas.width;
		this.height = canvas.height;
	}

	drawBall() {
		ctx.fillStyle = 'white'; // Fill color
		var ballX = this.width/2; // X position of the ball
		var ballY = this.height/2; // Y position of the ball
		var ballRadius = 3; // Radius of the ball
		ctx.beginPath(); // Start a new path
		ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false); // Draw a circle
		ctx.fillStyle = 'white'; // Fill color
		ctx.fill(); // Fill the circle with color
		ctx.closePath(); // Close the path
	}
}

class Paddle {
	constructor(paddleType) {
		this.paddleType = paddleType;
		this.width = canvas.width; // Canvas width in pixels
		this.height = canvas.height; // Canvas height in pixels
		if (this.paddleType == PaddleTypes.LEFT1) {
			this.x = 2;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.RIGHT1) {
			this.x = this.width - 2 - this.width / 50;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.LEFT2) {
			this.x = this.width / 50 + 2 + 3;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.RIGHT2) {
			this.x = this.width - 5 - this.width / 50 - this.width / 50;
			this.y = this.height / 2.5;
		}
	}
	up() {
		if (this.y > Pong.REC_HEIGHT_SIZE + 5) {
			this.y -= Pong.PADDLE_SPEED; // pixels to move per key event
		}
	}

	// Check if the paddle is not at the bottom of the canvas
	down() {
		if (this.y < this.height - Pong.REC_HEIGHT_SIZE - this.height/8 - 5) {

			this.y += Pong.PADDLE_SPEED;
		}
	}


	drawPaddle() {
		ctx.fillStyle = 'white'; // Fill color players 1 and 2
		if (this.paddleType == PaddleTypes.LEFT1)
		ctx.fillRect(this.x, this.y, this.width/50, this.height/8); // Draw a rectangle (x, y, width, height)
		if (this.paddleType == PaddleTypes.RIGHT1)
			ctx.fillRect(this.x, this.y, this.width/50, this.height/8);
		ctx.fillStyle = '#dc3545'; // Fill color players 3 and 4
		if (this.paddleType == PaddleTypes.LEFT2)
			ctx.fillRect(this.x, this.y, this.width/50, this.height/8);
		if (this.paddleType == PaddleTypes.RIGHT2)
			ctx.fillRect(this.x, this.y, this.width/50, this.height/8);
	}
}

class Pong {
	static REC_HEIGHT_SIZE = 20;
	static PADDLE_SPEED = 30;
	constructor(nbPlayers) {
		// Get canvas attributes
		this.width = canvas.width; // Canvas width in pixels
		this.height = canvas.height; // Canvas height in pixels

		this.nbPlayers = nbPlayers;
		this.paddle1 = new Paddle(PaddleTypes.LEFT1);
		this.paddle2 = new Paddle(PaddleTypes.RIGHT1);
		this.score = new Score();

		if (this.nbPlayers == 4) {
			this.paddle3 = new Paddle(PaddleTypes.LEFT2);
			this.paddle4 = new Paddle(PaddleTypes.RIGHT2);
		}
	}
	start() {
		setInterval(this.pongRender.bind(this), 1000 / 60); // 60 FPS (frames per second)
		document.addEventListener('keydown', this.handleKeyboardEvent.bind(this)); // addEventListener is a system function
	}
	drawSquare() {
		ctx.fillStyle = 'black'; // Fill color
		ctx.fillRect(0, 0, this.width, this.height); // Draw a rectangle (x, y, width, height)

		// Set properties for the rectangle
		ctx.fillStyle = 'white'; // Fill color
		ctx.fillRect(0, 0, this.width, Pong.REC_HEIGHT_SIZE); // Draw a rectangle (x, y, width, height)
		console.log(this.height);
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
	pongRender() {
		this.drawSquare();
		this.paddle1.drawPaddle();
		this.paddle2.drawPaddle();
		if (this.nbPlayers == 4) {
			this.paddle3.drawPaddle();
			this.paddle4.drawPaddle();
		}
		this.score.drawScore();

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
		this.finalScore = 11; // TO DO: final score: allow custom score
	}
	//if(ball.x < 0) {
	//	this.scoreR++;

	//}
	//if(ball.x > canvas.width) {
	//this.scoreL++;
	//if (this.scoreL === finalScore || this.scoreR === finalScore) {
	// Game over
	//}

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













pong = new Pong(4);
pong.start();

