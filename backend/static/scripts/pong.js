let canvas = null;
let ctx = null;
let game = null;

// Global variables for the game configuration
const gameConfig = {
    "Easy": { paddleSpeed: 15, ballSpeed: 7 },
    "Medium": { paddleSpeed: 30, ballSpeed: 15 },
    "Hard": { paddleSpeed: 60, ballSpeed: 30 },
};

var g_PADDLE_SPEED = 10;
var g_BALL_SPEED = 10;
var g_SOUND = true;
var g_SCORE_TO_WIN = 5;
var g_CURRENT_LEVEL = "Medium";
var g_fillColor = 'black';
var g_ballRadius;
var g_ballColor = 'white';
var g_paddleWidth;
var g_paddleHeight;

const PaddleTypes = Object.freeze({
	LEFT1:	1,
	RIGHT1:	2,
	LEFT2:	3,
	RIGHT2:	4,
});

class Ball {
	constructor(score, nbPlayers, paddle1, paddle2, paddle3, paddle4) {
		this.width = canvas.width;
		this.height = canvas.height;
		this.ballMoving = false;
		this.ballX = this.width / 2; // X position of the ball
		this.ballY = this.height / 2; // Y position of the ball
		this.dx = 0; // Change in x direction
		this.dy = 0; // Change in y direction
		this.paddle1 = paddle1;
		this.paddle2 = paddle2;
		this.paddle3 = paddle3;
		this.paddle4 = paddle4;
		this.nbPlayers = nbPlayers;
		this.ballRadius = canvas.width / 100;
		g_ballRadius = this.ballRadius;
		this.score = score;
		this.sound = new Sound("../static/sound/bounce.mp3");
		this.angle = 0.0;
	}

	drawBall() {
		ctx.fillStyle = g_ballColor;
		ctx.beginPath();
		ctx.arc(this.ballX, this.ballY, g_ballRadius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
	}

	ballRandomSign() {
		return Math.random() > 0.5 ? -1 : 1;
	}

	startBallMovement() {
		this.prevSpeed = g_BALL_SPEED;
		this.angleXsign = this.ballRandomSign();
		this.angleYsign = this.ballRandomSign();
        this.angle = Math.random();
        this.dx = Math.cos(this.angle) * g_BALL_SPEED * this.angleXsign;
        this.dy = Math.sin(this.angle) * g_BALL_SPEED * this.angleYsign;
        this.ballMoving = true;
    }

    ballResetPosition() {
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
    }

	resumeBallMovement() {
		this.dx =  (this.dx/this.prevSpeed) * g_BALL_SPEED;
		this.dy =  (this.dy/this.prevSpeed) * g_BALL_SPEED;
		this.prevSpeed = g_BALL_SPEED;
		this.ballMoving = true;
	}

	doLinesIntersect(line1, line2) {
		// Unpack the lines into points
		const [p1, p2] = line1;
		const [p3, p4] = line2;

		// Calculate the determinant
		const det = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);

		if (det === 0) {
			// The lines are parallel
			return false;
		}

		// Calculate the parameters
		const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
		const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

		// Check if the intersection point lies on both line segments
		return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
	}

    //  Left Paddel
    //               ***
    //   ###       *  |   *
    //   * *      *______ *
    //   * *       *DL|  *
    //   * *      /  ***
    //   * *
    //   ***
    //      Top line of the paddel
	ballColisionLeftPaddelTopLine(paddle) {
		var ballPositionDown = [{ x: this.ballX, y: this.ballY }, { x: this.ballX, y: this.ballY + this.dy + this.ballRadius }];
		//TOP line of the paddle
		var line1 = [{ x: paddle.x, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y }];
		//this.drawLine(line1[0].x, line1[0].y,line1[1].x, line1[1].y)
		//this.drawLine('red',ballPositionDown[0].x, ballPositionDown[0].y,ballPositionDown[1].x, ballPositionDown[1].y)
		//this.drawLine('red',line1[0].x, line1[0].y,line1[1].x, line1[1].y)
		if (this.doLinesIntersect(ballPositionDown, line1)) {
			console.log("intercept paddel1 TOP line");
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***
    //   **#       *  |   *
    //   * #      *______ *
    //   * #       *DL|  *
    //   * #      /  ***
    //   * #
    //   **#
    //      Right line of the paddel
	ballColisionLeftPaddelRightLineInDownLeftPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX - Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('gray',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line DL dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***
    //   **#      \*UL|   *
    //   * #      *______ *
    //   * #       *  |  *
    //   * #         ***
    //   * #
    //   **#
    //      Right line of the paddel
	ballColisionLeftPaddelRightLineInUpLeftPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX - Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('green',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line UL dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***  /
    //   #**       *  |UR*
    //   # *      *______ *
    //   # *       *  |  *
    //   # *         ***
    //   # *
    //   #**
    //      Left line of the paddel
	ballColisionLeftPaddelLeftLineInUpRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('brown',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line UL dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***  /
    //   ***       *  |UR*
    //   * *      *______ *
    //   * *       *  |  *
    //   * *         ***
    //   * *
    //   ###
    //      Bottom line of the paddel
	ballColisionLeftPaddelBottomLineInUpRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelBottom = [{ x: paddle.x, y: paddle.y + paddle.paddleHeight }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('brown',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelBottom[0].x, linePaddelBottom[0].y, linePaddelBottom[1].x, linePaddelBottom[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelBottom)) {
			console.log("intercept paddel1 BOTTOM line UR dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}


    //  Left Paddel ******************
    //               ***
    //   #**       *  |   *
    //   # *      *______ *
    //   # *       *  | DR*
    //   # *         ***   \
    //   # *
    //   #**
    //      Right line of the paddel
	ballColisionLeftPaddelLeftLineInDownRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('red',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('green', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 LEFT line DR dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			// this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}


    //  Left Paddel ******************
    //               ***
    //   ###       *  |   *
    //   * *      *______ *
    //   * *       *  | DR*
    //   * *         ***   \
    //   * *
    //   ***
    //      Top line of the paddel
	ballColisionLeftPaddelTopLineInDownRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelTop = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('red',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('green', linePaddelTop[0].x, linePaddelTop[0].y, linePaddelTop[1].x, linePaddelTop[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelTop)) {
			console.log("intercept paddel1 TOP line DR dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}


	ballCollisionLeftPaddelRightLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy - this.ballRadius }];
		//Right line of the paddle
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('yellow',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
			return true;
		}
		return false;
	}

	ballCollisionLeftPaddelLeftLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy - this.ballRadius }];
		//Right line of the paddle
		var linePaddelLeft = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		// this.drawLine('pink',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelLeft[0].x, linePaddelLeft[0].y, linePaddelLeft[1].x, linePaddelLeft[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelLeft)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
			return true;
		}
		return false;
	}

	ballCollisionLeftPaddelBottomLine(paddle) {
		var ballPositionUp = [{ x: this.ballX, y: this.ballY }, { x: this.ballX, y: this.ballY + this.dy - this.ballRadius }];
		//BOTTOM line of the paddle
		var lineBottom = [{ x: paddle.x, y: paddle.y + paddle.paddleHeight }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('blue',ballPositionUp[0].x, ballPositionUp[0].y,ballPositionUp[1].x, ballPositionUp[1].y)
		//this.drawLine('gray', lineBottom[0].x, lineBottom[0].y, lineBottom[1].x, lineBottom[1].y)
		if (this.doLinesIntersect(ballPositionUp, lineBottom)) {
			console.log("intercept paddel1 TOP line");
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

	//Right paddle
	ballCollisionRightPaddelRightLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy + this.ballRadius }];
		//Right line of the paddle
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
			return true;
		}
		return false;
	}

	ballCollisionRightPaddelLeftLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy + this.ballRadius }];
		//Right line of the paddle

		var linePaddelLeft = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('gray', linePaddelLeft[0].x, linePaddelLeft[0].y, linePaddelLeft[1].x, linePaddelLeft[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelLeft)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
			return true;
		}
		return false;
	}

	collision(paddle) {
		if (!this.ballColisionLeftPaddelTopLine(paddle)) {
			if (!this.ballCollisionLeftPaddelRightLine(paddle)) {
				if (!this.ballCollisionLeftPaddelBottomLine(paddle)) {
					if (!this.ballCollisionLeftPaddelLeftLine(paddle)) {
						if (!this.ballColisionLeftPaddelRightLineInDownLeftPartOfBall(paddle)) {
							if (!this.ballColisionLeftPaddelRightLineInUpLeftPartOfBall(paddle)) {
								if (!this.ballColisionLeftPaddelLeftLineInUpRightPartOfBall(paddle)) {
									if (!this.ballColisionLeftPaddelLeftLineInDownRightPartOfBall(paddle)) {
										if (!this.ballColisionLeftPaddelBottomLineInUpRightPartOfBall(paddle)) {
											if (!this.ballColisionLeftPaddelTopLineInDownRightPartOfBall(paddle)) {
												return false;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return true;
	}

	ballMove() {
		this.ballRadius = g_ballRadius;
		if (this.ballMoving) {
			// top and bottom wall collision
			if (this.ballY + this.dy + this.ballRadius > canvas.height ||
                this.ballY + this.dy - this.ballRadius < 0) {
				this.dy = -this.dy;
				this.sound.play();
			}

			this.collision(this.paddle1);
			this.collision(this.paddle2);
			if (this.nbPlayers === 4) {
				this.collision(this.paddle3);
				this.collision(this.paddle4);
			}
			this.ballX += this.dx;
			this.ballY += this.dy;

			this.updateScore();
		}
	}

	updateScore() {
		if (this.ballX < 0) { // Right player scored
			this.score.incrementScoreR();
			this.ballMoving = false;
			if (this.score.checkGameOver() === false) {
				this.ballResetPosition();
				this.startBallMovement();
			}
		}

		if (this.ballX > canvas.width) { // Left player scored
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
        this.paddleWidth = this.width / 50;
        this.paddleHeight = this.height / 8;
        g_paddleWidth = this.width / 50;
        g_paddleHeight = this.height / 8;

        this.resetPosition();
        this.ballRef = null;
    }

	setBallRef(ballRef) {
		this.ballRef = ballRef;
	}

    up() {
        if (this.y - g_PADDLE_SPEED < 0)
            this.y = 0; // Prevent paddle from going out of bounds
        else
            this.y -= g_PADDLE_SPEED; // Move paddle up

        if (this.ballRef.collision(this))
            this.y += g_PADDLE_SPEED;
    }

	// Check if the paddle is not at the bottom of the canvas
    down() {
        if (this.y + g_PADDLE_SPEED + this.paddleHeight > this.height)
            this.y = this.height - this.paddleHeight; // Prevent paddle from going out of bounds
        else
            this.y += g_PADDLE_SPEED; // Move paddle down

        if (this.ballRef.collision(this))
            this.y -= g_PADDLE_SPEED;
    }

	drawPaddle() {
        if (this.paddleHeight != g_paddleHeight) {
            this.paddleHeight = g_paddleHeight;
            this.paddleWidth = g_paddleWidth;
            this.resetPosition();
        }

        ctx.fillStyle = 'white'; // Fill color players 1 and 2
        if (this.paddleType === PaddleTypes.LEFT2 || this.paddleType === PaddleTypes.RIGHT2)
            ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
	}

	resetPosition() {
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
}

class Pong {
	constructor(nbPlayers, isTournament = false, notifyWinner = null) {
		// Get canvas attributes
		this.width = canvas.width; // Canvas width in pixels
		this.height = canvas.height; // Canvas height in pixels
		this.nbPlayers = nbPlayers;
		this.paddle1 = new Paddle(PaddleTypes.LEFT1);
		this.paddle2 = new Paddle(PaddleTypes.RIGHT1);
		this.score = new Score();
		this.countdown = new Countdown(this);
		this.notifyWinner = notifyWinner;
		this.isTournament = isTournament;
		this.isGameRunning = false;

		if (this.nbPlayers === 4) {
			this.paddle3 = new Paddle(PaddleTypes.LEFT2);
			this.paddle4 = new Paddle(PaddleTypes.RIGHT2);
			this.ball = new Ball(this.score, 4, this.paddle1, this.paddle2, this.paddle3, this.paddle4);
			this.paddle1.setBallRef(this.ball);
			this.paddle2.setBallRef(this.ball);
			this.paddle3.setBallRef(this.ball);
			this.paddle4.setBallRef(this.ball);
		}
		else {
			this.ball = new Ball(this.score, 2, this.paddle1, this.paddle2);
			this.paddle1.setBallRef(this.ball);
			this.paddle2.setBallRef(this.ball);
		}
		this.intervalId = 0;

        this.keys = {};
	}

	initialDisplay() {
		ctx.font = "72px 'Press Start 2P'";
		var textWidth = ctx.measureText("PONG").width;
		ctx.fillText("PONG", (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) - 100);
		ctx.font = "32px 'Press Start 2P'";
		var textWidth1 = ctx.measureText("Press Enter to Start or").width;
		var textWidth2 = ctx.measureText("Select Visual Impairment Mode").width;
		ctx.fillText("Press Enter to Start or", (canvas.width / 2) - (textWidth1 / 2), (canvas.height / 2) + 100);
		ctx.fillText("Select Visual Impairment Mode", (canvas.width / 2) - (textWidth2 / 2), (canvas.height / 2 + 100) + 100);
	}

	start() {
		this.paddle1.resetPosition();
		this.paddle2.resetPosition();
		if (this.nbPlayers === 4) {
			this.paddle3.resetPosition();
			this.paddle4.resetPosition();
		}
		this.score.resetScore();
		this.render();
		this.initialDisplay();
		const handleEnter = (event) => {
			if (event.key === 'Enter') {
				this.countdown.start();
				document.removeEventListener('keydown', handleEnter);
			}
		};
		document.addEventListener('keydown', handleEnter);
	}

	startGame() {
		this.isGameRunning = true;
		this.score.resetScore();
		this.ball.ballResetPosition();
		document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
		document.addEventListener('keyup', this.handleKeyboardEvent.bind(this));
		this.intervalId = setInterval(this.pongRender.bind(this), 1000 / 60); // 60 FPS (frames per second)
		this.ball.startBallMovement();
	}

	pause() {
			clearInterval(this.intervalId);
	}

	resume() {
		this.ball.resumeBallMovement();
		this.intervalId = setInterval(this.pongRender.bind(this), 1000 / 60);
	}

	stop() {
		clearInterval(this.intervalId);
		document.removeEventListener('keydown', this.handleKeyboardEvent.bind(this));
		document.removeEventListener('keyup', this.handleKeyboardEvent.bind(this));
		this.isGameRunning = false;
	}

	reset() {
		this.stop();
		this.score.resetScore();
	}

	drawSquare() {
		ctx.fillStyle = g_fillColor; // Original fill color is black
		ctx.fillRect(0, 0, this.width, this.height); // Draw a rectangle (x, y, width, height)

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
		var myModal = new bootstrap.Modal('#winnerpopup');
		myModal.show();
	}

	render() {
		this.drawSquare();
		this.paddle1.drawPaddle();
		this.paddle2.drawPaddle();
		if (this.nbPlayers === 4) {
			this.paddle3.drawPaddle();
			this.paddle4.drawPaddle();
		}
		this.score.drawScore();
		this.ball.drawBall();
	}

	getWinner() {
		if (this.score.scoreL == g_SCORE_TO_WIN) {
			return ("left");
		}
		else {
			return ("right");
		}
	}

	pongRender() {
        this.render();
        this.ball.ballMove(); // Move the ball
        this.updatePaddles(); // Update the paddles asynchronously

        if (this.score.checkGameOver() === true) {
            if (this.isTournament === false)
                this.displayWinner();
            else
                this.notifyWinner(this.getWinner());
            this.stop();
            this.render();
        }
    }

    handleKeyboardEvent(event) {
        if (event.type === 'keydown')
            this.keys[event.key] = true;
        else if (event.type === 'keyup')
            this.keys[event.key] = false;
    }

    updatePaddles() {
        if (this.keys['q']) this.paddle1.up();
        if (this.keys['a']) this.paddle1.down();
        if (this.keys['p']) this.paddle2.up();
        if (this.keys['l']) this.paddle2.down();

        // Handle additional paddles for 4 players
        if (this.nbPlayers === 4) {
            if (this.keys['d']) this.paddle3.up();
            if (this.keys['c']) this.paddle3.down();
            if (this.keys['j']) this.paddle4.up();
            if (this.keys['n']) this.paddle4.down();
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
        ctx.fillStyle = 'white';
        ctx.font = "72px 'Press Start 2P'";
        ctx.fillText(this.scoreL, canvas.width / 4, 100); // Left player score
        ctx.fillText(this.scoreR, 3 * canvas.width / 4, 100); // Right player score
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
		if (g_SOUND)
			this.sound.play();
	}
}

class Countdown {
	constructor(pong) {
		this.pong = pong;
		this.count = 3;
		this.intervalId = 0;
	}

	start() {
		this.count = 3;
		this.drawCountdown();
		this.intervalId = setInterval(this.countdown.bind(this), 1000);
	}

	pause()	{
		clearInterval(this.intervalId);
	}

	resume() {
		this.count = 3;
		this.intervalId = setInterval(this.countdown.bind(this), 1000);
	}

	countdown() {
		if (this.count === 1) {
			clearInterval(this.intervalId);
			setTimeout(() => {
				this.pong.startGame();
			}, 200);
		}
		else {
			this.count--;
			this.drawCountdown();
		}
	}

	drawCountdown() {
		this.pong.render();
		ctx.font = "280px 'Press Start 2P'";
		ctx.fillStyle = 'red';
		var textWidth = ctx.measureText(this.count).width;
		ctx.fillText(this.count, (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) + (textWidth / 2));
	}
}

class Game {
	constructor(isTournament, players) {
		this.isTournament = isTournament;
		if (this.isTournament == true)
			this.tournament = new Tournament(players);
		else
			this.pong = new Pong(players.length);

		if (isTournament === true || players.length == 2) {
			document.getElementById('3rdplayer').style.display = 'none';
			document.getElementById('4thplayer').style.display = 'none';
		}
	}

	start() {
		if (this.isTournament == true) {
			this.tournament.start();
		}
		else {
			this.pong.start();
		}
	}

	reset() {
		if (this.isTournament == true) {
			this.tournament.reset();
		}
		else {
			this.pong.reset();
		}
	}

	isGameRunning() {
		if (this.isTournament == true) {
			return (this.tournament.pong.isGameRunning);
		}
		else {
			return (this.pong.isGameRunning);
		}
	}

	forceRefresh() {
		if (this.isTournament == true) {
			this.tournament.pong.render();
		}
		else {
			this.pong.render();
		}
	}

	pause() {
		if (this.isTournament == true) {
			this.tournament.pong.pause();
			this.tournament.pong.countdown.pause();
		}
		else {
			this.pong.pause();
			this.pong.countdown.pause();
		}
	}

	resume() {
		if (this.isGameRunning() == true) {
			if (this.isTournament == true) {
				this.tournament.pong.resume();
			}
			else {
				this.pong.resume();
			}
		} else {
			if (this.isTournament == true) {
				this.tournament.pong.countdown.resume();
			}
			else {
				this.pong.countdown.resume();
			}
		}
	}
}

function playAgain() {
	game.reset();
	game.start();
	document.getElementById("ponggame").focus();
}

function refreshConfig() {
	document.getElementById('playerspeed').value = g_PADDLE_SPEED;
	document.getElementById('ballspeed').value = g_BALL_SPEED;
	document.getElementById('customSwitch').checked = g_SOUND;
}

function loadConfiguration() {
	game.pause();
	refreshConfig();
}

function applyConfiguration() {
	g_PADDLE_SPEED = parseInt(document.getElementById('playerspeed').value, 10);
	g_BALL_SPEED = parseInt(document.getElementById('ballspeed').value, 10);
	g_SOUND = document.getElementById('customSwitch').checked;
	game.resume();
	var myModalEl = document.getElementById('configModal');
	var modal = bootstrap.Modal.getInstance(myModalEl)
	modal.hide();
	// lose focus
	setTimeout(function(){
		document.getElementById("ponggame").focus();
	},500);
}

class Tournament {
    constructor(players) {
        this.players = players;
        this.pong = new Pong(2, true, this.winnerCallback);

        this.playerArray = (this.players.length == 3)
            ? this.getUniqueRandomPlayers(3)
            : this.getUniqueRandomPlayers(4);

        this.keyboardEventHandlerBind = this.handleKeyboardEvent.bind(this);
        this.currentPlayer1 = this.players[this.playerArray[0]];
        this.currentPlayer2 = this.players[this.playerArray[1]];
        this.winner = null;
        this.isFinalGame = false;
        this.semiFinalWinner1 = null;
        this.semiFinalWinner2 = null;

        this.updatePlayerNamesUI();
    }

    static GAME_TYPE_PRELIMINARY = "Preliminary Match";
    static GAME_TYPE_FINAL = "Final";

    winnerCallback = (winner) => {
        const winnerElement = document.getElementById('winnerT');
        const finalWinnerElement = document.getElementById('winnerF');

        this.winner = (winner === 'left') ? this.currentPlayer1 : this.currentPlayer2;

        winnerElement.innerText = `${this.winner} wins this match!`;
        finalWinnerElement.innerText = `${this.winner} won the Tournament!`;

        if (this.players.length === 4)
            this.updateSemiFinalWinner();

        const modalId = this.isFinalGame ? '#winnerFinalpopup' : '#winnerTpopup';
        const myModal = new bootstrap.Modal(modalId);
        myModal.show();
    }

    updateSemiFinalWinner() {
        if (!this.semiFinalWinner1)
            this.semiFinalWinner1 = this.winner;
        else if (!this.semiFinalWinner2)
            this.semiFinalWinner2 = this.winner;
    }

    getUniqueRandomPlayers(playerCount) {
        const playerIndexes = Array.from({ length: playerCount }, (_, i) => i);
        return this.shuffleArray(playerIndexes);
    }

    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    start() {
        this.displayGameAnnouncement(Tournament.GAME_TYPE_PRELIMINARY, this.currentPlayer1, this.currentPlayer2);
        document.addEventListener('keydown', this.keyboardEventHandlerBind);
    }

    reset() {
        document.removeEventListener('keydown', this.keyboardEventHandlerBind);
        this.pong.stop();
    }

    nextMatch() {
        if (this.players.length === 4)
            this.handleNextMatchForFourPlayers();
        else
            this.prepareFinalMatch(this.winner, this.players[this.playerArray[2]]);

        document.addEventListener('keydown', this.keyboardEventHandlerBind);
        this.updatePlayerNamesUI();
    }

    handleNextMatchForFourPlayers() {
        if (this.semiFinalWinner1 && !this.semiFinalWinner2) {
            this.currentPlayer1 = this.players[this.playerArray[2]];
            this.currentPlayer2 = this.players[this.playerArray[3]];
            this.displayGameAnnouncement(Tournament.GAME_TYPE_PRELIMINARY, this.currentPlayer1, this.currentPlayer2);
        }
        else if (this.semiFinalWinner2)
            this.prepareFinalMatch(this.semiFinalWinner1, this.semiFinalWinner2);
    }

    prepareFinalMatch(player1, player2) {
        this.displayGameAnnouncement(Tournament.GAME_TYPE_FINAL, player1, player2);
        this.currentPlayer1 = player1;
        this.currentPlayer2 = player2;
        this.isFinalGame = true;
    }

    handleKeyboardEvent(event) {
        if (event.key === 'Enter') {
            document.removeEventListener('keydown', this.keyboardEventHandlerBind);

            this.pong.start();
        }
    }

    displayGameAnnouncement(gameType, player1, player2) {
        const messages = [
            { text: gameType, y: canvas.height / 2 - 200 },
            { text: `${player1} X ${player2}`, y: canvas.height / 2 - 50 },
            { text: "Press Enter to Start Match", y: canvas.height / 2 + 100 }
        ]

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'red';
        ctx.font = "50px 'Press Start 2P'";

        messages.forEach(({ text, y }) => {
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), y);
        });
    }

    updatePlayerNamesUI() {
        const player1Element = document.getElementById('player1name');
        const player2Element = document.getElementById('player2name');

        player1Element.innerText = this.getDisplayableName(this.currentPlayer1);
        player2Element.innerText = this.getDisplayableName(this.currentPlayer2);
    }

    getDisplayableName(playerName) {
        return playerName.length > 5 ? playerName.slice(0, 5) + '.' : playerName;
    }
}

function nextGame() {
	game.tournament.nextMatch();
}

function setupDropdownListeners() {
    const modal = document.getElementById('configModal');
    const dropdownMenu = modal.querySelector('.dropdown-menu');

    dropdownMenu.addEventListener('click', (event) => {
        const selectedItem = event.target.closest('.dropdown-item');
        if (selectedItem) {
            event.preventDefault();

            const selectedText = selectedItem.textContent.trim();
            const dropdownButton = modal.querySelector('.dropdown-toggle');
            dropdownButton.textContent = selectedText;

            if (selectedText in gameConfig) {
                document.getElementById("customConfig").style.display = "none";
                g_PADDLE_SPEED = gameConfig[selectedText].paddleSpeed;
                g_BALL_SPEED = gameConfig[selectedText].ballSpeed;
                refreshConfig();
            }
            else if (selectedText === "Custom")
                document.getElementById("customConfig").style.display = "block";
            else {
                alert('Invalid difficulty level selected');
                getPage('404');
            }

            // Hide the dropdown menu after selection
            const dropdown = new bootstrap.Dropdown(dropdownButton);
            dropdown.hide();
        }
    });
}

function visual() {
    if (game.isGameRunning() == true) {
        game.pause();
        let myModal = new bootstrap.Modal('#visualmodal');
        myModal.show();
        return;
    }

	if(!document.getElementById("buttonQ").classList.contains("visual-impairement")){
		document.getElementById("buttonQ").classList.add("visual-impairement");
		document.getElementById("buttonA").classList.add("visual-impairement");
		document.getElementById("buttonP").classList.add("visual-impairement");
		document.getElementById("buttonL").classList.add("visual-impairement");
		document.getElementById("buttonD").classList.add("visual-impairement");
		document.getElementById("buttonC").classList.add("visual-impairement");
		document.getElementById("buttonJ").classList.add("visual-impairement");
		document.getElementById("buttonN").classList.add("visual-impairement");
		document.getElementById("backhome").classList.add("visual-impairement-icon");
		document.getElementById("impaired").classList.add("visual-impairement-icon");
		document.getElementById("gear").classList.add("visual-impairement-icon");
		document.getElementById("help").classList.add("visual-impairement-icon");
	}else{
		document.getElementById("buttonQ").classList.remove("visual-impairement");
		document.getElementById("buttonA").classList.remove("visual-impairement");
		document.getElementById("buttonP").classList.remove("visual-impairement");
		document.getElementById("buttonL").classList.remove("visual-impairement");
		document.getElementById("buttonD").classList.remove("visual-impairement");
		document.getElementById("buttonC").classList.remove("visual-impairement");
		document.getElementById("buttonJ").classList.remove("visual-impairement");
		document.getElementById("buttonN").classList.remove("visual-impairement");
		document.getElementById("backhome").classList.remove("visual-impairement-icon");
		document.getElementById("impaired").classList.remove("visual-impairement-icon");
		document.getElementById("gear").classList.remove("visual-impairement-icon");
		document.getElementById("help").classList.remove("visual-impairement-icon");
	}



    if (g_fillColor === 'black') {
        g_fillColor = 'blue';
        g_ballRadius = canvas.width / 40;
        g_ballColor = 'yellow';
        g_paddleHeight = canvas.height / 4;
        g_paddleWidth = canvas.width / 25;
    }
    else {
        g_fillColor = 'black'
        g_ballRadius = canvas.width / 100;
        g_ballColor = 'white';
        g_paddleHeight = canvas.height / 8;
        g_paddleWidth = canvas.width / 50;
    }

    game.forceRefresh();
}

function launchGame(playerNames, isTournament = false) {
    canvas = document.getElementById('ponggame');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    game = new Game(isTournament, playerNames);
    window.addEventListener('popstate', () => game.pong.stop());

    document.fonts.load('10pt "Press Start 2P"')
        .then(() => {
            return document.fonts.ready;
        })
        .then(() => {
            game.start();
            setupDropdownListeners();

            document.getElementById("pongContainer").style.display = "flex";
        })
        .catch(error => {
            console.error("Error loading font:", error);
        });
}
