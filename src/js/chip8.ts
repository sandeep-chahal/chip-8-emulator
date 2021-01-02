import Monitor from "./monitor";
import Speaker from "./speaker";
import Keyboard from "./keyboard";

const monitor = new Monitor(document.querySelector("canvas"), 10);
const speaker = new Speaker();
const keyboard = new Keyboard();
