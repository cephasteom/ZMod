import { library } from "./tone.js";
import { sine, tri, saw, square, out, lfo } from "./block.js";


// Example usage
// @ts-ignore
const code = saw(lfo(100, 100, 240)).out(0).compile().lines.join("\n");
let play = false
// play = true

if(play) {
    new Function(
        ...Object.keys(library), 
        code
    )(...Object.values(library));
}