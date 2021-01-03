import Monitor from "./monitor";
import Speaker from "./speaker";
import Keyboard from "./keyboard";

class CPU {
	monitor: Monitor;
	speaker: Speaker;
	keyboard: Keyboard;
	memory: Uint8Array;
	i: number;
	v: Uint8Array;
	delayTimer: number;
	soundTimer: number;
	pc: number;
	stack: Array<any>;
	paused: boolean;
	speed: number;
	constructor(canvas: HTMLCanvasElement) {
		this.monitor = new Monitor(canvas, 10);
		this.speaker = new Speaker();
		this.keyboard = new Keyboard();
		this.reset();
	}

	reset() {
		this.memory = new Uint8Array(4096);

		this.v = new Uint8Array(16);

		this.i = 0;

		this.delayTimer = 0;
		this.soundTimer = 0;

		this.pc = 0x200;

		this.stack = new Array();

		this.paused = false;
		this.speed = 10;
		this.monitor.reset();
		this.monitor.render();
	}

	loadSpritesIntoMemory() {
		const sprites = [
			0xf0,
			0x90,
			0x90,
			0x90,
			0xf0,
			0x20,
			0x60,
			0x20,
			0x20,
			0x70,
			0xf0,
			0x10,
			0xf0,
			0x80,
			0xf0,
			0xf0,
			0x10,
			0xf0,
			0x10,
			0xf0,
			0x90,
			0x90,
			0xf0,
			0x10,
			0x10,
			0xf0,
			0x80,
			0xf0,
			0x10,
			0xf0,
			0xf0,
			0x80,
			0xf0,
			0x90,
			0xf0,
			0xf0,
			0x10,
			0x20,
			0x40,
			0x40,
			0xf0,
			0x90,
			0xf0,
			0x90,
			0xf0,
			0xf0,
			0x90,
			0xf0,
			0x10,
			0xf0,
			0xf0,
			0x90,
			0xf0,
			0x90,
			0x90,
			0xe0,
			0x90,
			0xe0,
			0x90,
			0xe0,
			0xf0,
			0x80,
			0x80,
			0x80,
			0xf0,
			0xe0,
			0x90,
			0x90,
			0x90,
			0xe0,
			0xf0,
			0x80,
			0xf0,
			0x80,
			0xf0,
			0xf0,
			0x80,
			0xf0,
			0x80,
			0x80,
		];

		for (let i = 0; i < sprites.length; i++) {
			this.memory[i] = sprites[i];
		}
	}

	loadProgramIntoMemory(program) {
		for (let loc = 0; loc < program.length; loc++) {
			this.memory[0x200 + loc] = program[loc];
		}
	}

	async loadRom(romName) {
		const res = await fetch(
			`https://cors-anywhere.herokuapp.com/https://github.com/sandeep-chahal/chip-8-emulator/blob/main/public/roms/${romName}?raw=true`
		);
		const buffer = await res.arrayBuffer();
		const program = new Uint8Array(buffer);
		this.loadProgramIntoMemory(program);
	}

	updateTimers() {
		if (this.delayTimer > 0) {
			this.delayTimer -= 1;
		}

		if (this.soundTimer > 0) {
			this.soundTimer -= 1;
		}
	}

	playSound() {
		if (this.soundTimer > 0) {
			this.speaker.play(400);
		} else {
			this.speaker.stop();
		}
	}

	cycle() {
		for (let i = 0; i < this.speed; i++) {
			if (!this.paused) {
				const opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
				this.executeInstruction(opcode);
			}
		}
		if (!this.paused) {
			this.updateTimers();
		}

		this.playSound();
		this.monitor.render();
	}
	executeInstruction(opcode) {
		this.pc += 2;

		let x = (opcode & 0x0f00) >> 8;

		let y = (opcode & 0x00f0) >> 4;

		switch (opcode & 0xf000) {
			case 0x0000:
				switch (opcode) {
					case 0x00e0:
						this.monitor.reset();
						break;
					case 0x00ee:
						this.pc = this.stack.pop();
						break;
				}

				break;
			case 0x1000:
				this.pc = opcode & 0xfff;
				break;
			case 0x2000:
				this.stack.push(this.pc);
				this.pc = opcode & 0xfff;
				break;
			case 0x3000:
				if (this.v[x] === (opcode & 0xff)) this.pc += 2;
				break;
			case 0x4000:
				if (this.v[x] != (opcode & 0xff)) this.pc += 2;
				break;
			case 0x5000:
				if (this.v[x] === this.v[y]) this.pc += 2;
				break;
			case 0x6000:
				this.v[x] = opcode & 0xff;
				break;
			case 0x7000:
				this.v[x] += opcode & 0xff;
				break;
			case 0x8000:
				switch (opcode & 0xf) {
					case 0x0:
						this.v[x] = this.v[y];
						break;
					case 0x1:
						this.v[x] = this.v[x] | this.v[y];
						break;
					case 0x2:
						this.v[x] = this.v[x] & this.v[y];
						break;
					case 0x3:
						this.v[x] = this.v[x] ^ this.v[y];
						break;
					case 0x4:
						this.v[x] = this.v[x] + this.v[y];
						this.v[0xf] = this.v[x] > 0xff ? 1 : 0;
						break;
					case 0x5:
						this.v[0xf] = this.v[x] > this.v[y] ? 1 : 0;
						this.v[x] = this.v[x] - this.v[y];
						break;
					case 0x6:
						this.v[0xf] = this.v[x] & 0x1;
						this.v[x] >>= 1;
						break;
					case 0x7:
						this.v[0xf] = this.v[y] > this.v[x] ? 1 : 0;
						this.v[x] = this.v[y] - this.v[x];
						break;
					case 0xe:
						this.v[0xf] = this.v[x] & 0x80;
						this.v[x] <<= 1;
						break;
				}

				break;
			case 0x9000:
				if (this.v[x] !== this.v[y]) this.pc += 2;
				break;
			case 0xa000:
				this.i = opcode & 0xfff;
				break;
			case 0xb000:
				this.pc = (opcode & 0xfff) + this.v[0];
				break;
			case 0xc000:
				this.v[x] = Math.floor(Math.random() * 0xff) & (opcode & 0xff);
				break;
			case 0xd000:
				let width = 8;
				let height = opcode & 0xf;

				for (let row = 0; row < height; row++) {
					let sprite = this.memory[this.i + row];
					for (let col = 0; col < width; col++) {
						if ((sprite & 0x80) > 0) {
							if (this.monitor.setPixel(this.v[x] + col, this.v[y] + row)) {
								this.v[0xf] = 1;
							} else this.v[0xf] = 0;
						}
						sprite <<= 1;
					}
				}
				break;
			case 0xe000:
				switch (opcode & 0xff) {
					case 0x9e:
						if (this.keyboard.isKeyPressed(this.v[x])) {
							this.pc += 2;
						}
						break;
					case 0xa1:
						if (!this.keyboard.isKeyPressed(this.v[x])) {
							this.pc += 2;
						}
						break;
				}

				break;
			case 0xf000:
				switch (opcode & 0xff) {
					case 0x07:
						this.v[x] = this.delayTimer;
						break;
					case 0x0a:
						this.paused = true;
						this.keyboard.onNextKeyPress = function (key) {
							this.v[x] = key;
							this.paused = false;
						}.bind(this);
						break;
					case 0x15:
						this.delayTimer = this.v[x];

						break;
					case 0x18:
						this.soundTimer = this.v[x];
						break;
					case 0x1e:
						this.i += this.v[x];
						break;
					case 0x29:
						this.i = this.v[x] * 5;
						break;
					case 0x33:
						// @ts-ignore
						this.memory[this.i] = parseInt(this.v[x] / 100);
						// @ts-ignore
						this.memory[this.i + 1] = parseInt((this.v[x] % 100) / 10);
						// @ts-ignore
						this.memory[this.i + 2] = parseInt(this.v[x] % 10);
						break;
					case 0x55:
						for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
							this.memory[this.i + registerIndex] = this.v[registerIndex];
						}
						break;
					case 0x65:
						for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
							this.v[registerIndex] = this.memory[this.i + registerIndex];
						}
						break;
				}

				break;

			default:
				throw new Error("Unknown opcode " + opcode);
		}
	}
}

export default CPU;
