import { transpile } from "./transpile.js";
import { compile } from "./tone.js";


// Example usage
const code = transpile(`sine(lfo(0.5,100,200)).out(0)`);
let play = false
// play = true

if(play) {
    compile(code);
}