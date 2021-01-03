import CPU from "./cpu";
const canvas = document.querySelector("canvas");
const cpu = new CPU(canvas);

let prevSelected: HTMLLIElement = document.querySelector("li");

const roms = document.querySelectorAll("li");
roms.forEach((rom) => {
	rom.addEventListener("click", (e) => {
		window.cancelAnimationFrame(loop);
		// @ts-ignore
		init(e.target.textContent);
		prevSelected.classList.remove("selected");
		rom.classList.add("selected");
		prevSelected = rom;
	});
});

let fps = 60,
	fpsInterval,
	startTime,
	now,
	then,
	elapsed,
	loop;

async function init(romName) {
	fpsInterval = 1000 / fps;
	then = Date.now();
	startTime = then;

	cpu.reset();

	if (romName !== "None") {
		canvas.classList.add("animate");
		cpu.loadSpritesIntoMemory();
		await cpu.loadRom(romName);
		canvas.classList.remove("animate");
		loop = requestAnimationFrame(step);
	}
}

function step() {
	now = Date.now();
	elapsed = now - then;
	if (elapsed > fpsInterval) {
		cpu.cycle();
	}
	loop = requestAnimationFrame(step);
}
