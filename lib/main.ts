import { transpile } from "./transpile.js";
import { compile } from "./tone.js";

const run = document.getElementById("run");
const stop = document.getElementById("stop");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;
let graph: any;
let lastTranspiledCode: string = ''

const dispose = (graph: any) => {
    graph?.volume?.rampTo(-Infinity, 0.1); // Fade out volume
    setTimeout(() => {
        graph?.dispose?.(); // Dispose of the node after fade out
        console.log("Node disposed after fade out.");
    }, 1000); // Allow time for fade out
}


run?.addEventListener("click", () => {
    const code = codeInput.value;
    try {
        const transpiledCode = transpile(code);
        if (transpiledCode === lastTranspiledCode) return;
        lastTranspiledCode = transpiledCode;
        dispose(graph); // Fade out and dispose of previous graph if it exists
        graph = compile(transpiledCode);
    } catch (error) {
        console.error("Error compiling code:", error);
    }
});

stop?.addEventListener("click", () => {
    dispose(graph)
    graph = null; // Clear the graph reference
    lastTranspiledCode = ''; // Reset the last transpiled code
})