import { library } from "./tone.js";
import { transpile } from "./block.js";


// Example usage
const code = transpile(`saw(lfo(100, 100, 240)).out(0)`);
let play = false
// play = true

if(play) {
    new Function(
        ...Object.keys(library), 
        code
    )(...Object.values(library));
}