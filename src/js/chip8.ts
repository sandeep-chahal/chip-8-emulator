import CPU from "./cpu";
const cpu = new CPU();

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

function init(romName) {
	fpsInterval = 1000 / fps;
	then = Date.now();
	startTime = then;

	cpu.reset();

	if (romName !== "None") {
		cpu.loadSpritesIntoMemory();
		cpu.loadRom(romName);
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
