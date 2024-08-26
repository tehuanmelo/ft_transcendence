const canvas = document.getElementById('ponggame');
const ctx = canvas.getContext('2d');

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
	constructor (paddleType)
	{
		this.paddleType = paddleType;
		this.width = canvas.width; // Canvas width in pixels
        this.height = canvas.height; // Canvas height in pixels
	}
	drawPaddle() {
		ctx.fillStyle = 'white'; // Fill color
		if (this.paddleType == PaddleTypes.LEFT1)
		ctx.fillRect(2, this.height/2.5, this.width/50, this.height/8); // Draw a rectangle (x, y, width, height)
		if (this.paddleType == PaddleTypes.LEFT2)
			ctx.fillRect(this.width/50 + 2 + 3, this.height/2.5, this.width/50, this.height/8);
		if (this.paddleType == PaddleTypes.RIGHT1)
			ctx.fillRect(this.width - 2 - this.width/50, this.height/2.5, this.width/50, this.height/8);
		if (this.paddleType == PaddleTypes.RIGHT2)
			ctx.fillRect(this.width - 5 - this.width/50 -this.width/50, this.height/2.5, this.width/50, this.height/8);
	}
}

class Pong {
	constructor(nbPlayers) {
		this.nbPlayers = nbPlayers;

        // Get canvas attributes
        this.width = canvas.width; // Canvas width in pixels
        this.height = canvas.height; // Canvas height in pixels
	}
	drawSquare() {
		ctx.fillStyle = 'black'; // Fill color
		ctx.fillRect(0, 0, this.width, this.height); // Draw a rectangle (x, y, width, height)

		// Set properties for the rectangle
		ctx.fillStyle = 'white'; // Fill color
		ctx.fillRect(0, 0, this.width, 5); // Draw a rectangle (x, y, width, height)
		ctx.fillRect(0, this.height - 5, this.width, 5); // Draw a rectangle (x, y, width, height)
		ctx.strokeStyle = 'white'; // Line color
		ctx.lineWidth = 2; // line Width
		ctx.setLineDash([6, 3]); // LineDash: 6px and 3px space
		ctx.beginPath();
		ctx.moveTo(this.width / 2, 0); // Line initial point
		ctx.lineTo(this.width / 2, this.height); //  Line final point
		ctx.stroke(); // Apply line stile and draw
	}
}
paddle1 = new Paddle(PaddleTypes.LEFT1);
paddle2 = new Paddle(PaddleTypes.RIGHT1);
paddle3 = new Paddle(PaddleTypes.LEFT2);
paddle4 = new Paddle(PaddleTypes.RIGHT2);
pong = new Pong(2);
ball = new Ball();

pong.drawSquare();
paddle1.drawPaddle();
paddle2.drawPaddle();
paddle3.drawPaddle();
paddle4.drawPaddle();
ball.drawBall();