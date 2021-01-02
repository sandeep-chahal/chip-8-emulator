class Monitor {
	cols = 64;
	rows = 32;
	scale: number;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	display: Array<number>;
	constructor(canvas: HTMLCanvasElement, scale: number) {
		this.scale = scale;

		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		this.canvas.width = this.cols * this.scale;
		this.canvas.height = this.rows * this.scale;

		this.display = new Array(this.cols * this.rows);
	}

	setPixel(x, y) {
		// if pixel goes off the screen
		if (x > this.cols) x -= this.cols;
		else if (x < 0) x += this.cols;

		if (y > this.rows) y -= this.rows;
		else if (y < 0) y += this.rows;

		// get pixel location
		let pixel = x + y * this.cols;

		// on/off pixel
		this.display[pixel] = this.display[pixel] ^ 1;

		return !this.display[pixel];
	}

	reset() {
		// reset the display
		this.display = new Array(this.cols * this.rows);
	}

	render() {
		// clear the canvas
		this.ctx.fillStyle = "#04040b";
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (let i = 0; i < this.cols * this.rows; i++) {
			// get pixel location
			let x = (i % this.cols) * this.scale;
			let y = Math.floor(i / this.cols) * this.scale;

			// draw the pixel if it's on
			if (this.display[i]) {
				this.ctx.fillStyle = "#fffc3a";
				this.ctx.fillRect(x, y, this.scale, this.scale);
			}
		}
	}
}

export default Monitor;
