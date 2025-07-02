import { transpile } from "./transpile.js";
import { compile } from "./tone.js";

const code = transpile(`fm(lfo(1,100,150),lfo(0.5,1,11),lfo(0.75,100,1)).out(0)`);

false &&
compile(code);