import { transpile } from "./transpile.js";
import { compile } from "./tone.js";

let graph: any;
let lastTranspiledCode: string = ''

const runButton = document.getElementById("run");
const stopButton = document.getElementById("stop");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;

const dispose = (graph: any) => {
    graph?.volume?.rampTo(-Infinity, 0.1); // Fade out volume
    setTimeout(() => {
        graph?.dispose?.(); // Dispose of the node after fade out
        console.log("Node disposed after fade out.");
    }, 1000); // Allow time for fade out
}

const run = () => {
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
}

const stop = () => {
    dispose(graph)
    graph = null; // Clear the graph reference
    lastTranspiledCode = ''; // Reset the last transpiled code
}

runButton?.addEventListener("click", run);
stopButton?.addEventListener("click", stop)

// if listener presses shift and enter, run the code
codeInput?.addEventListener("keydown", (event) => {
    if (!(event.shiftKey && event.key === "Enter")) return
    event.preventDefault(); // Prevent default behavior of new line
    run();
});

// if listener presses esc, stop the code
codeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault(); // Prevent default behavior of escape
    stop();
});