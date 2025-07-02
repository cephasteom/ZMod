import { transpile } from "./transpile.js";
import { compile } from "./tone.js";

const code = transpile(`sine(lfo(sig(1),100,200)).out(0)`);

false &&
compile(code);