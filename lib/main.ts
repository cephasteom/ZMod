import { transpile } from "./transpile.js";
import { compile } from "./tone.js";
import { Gain } from "tone";

let graph: { inputs: Record<string, any>, output: Gain } | null;
let lastTranspiledCode: string = ''

const runButton = document.getElementById("run");
const stopButton = document.getElementById("stop");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;

const dispose = (output: Gain) => {
    output?.gain?.rampTo(0, 0.1); // Fade out volume
    setTimeout(() => output?.dispose?.(), 1000); // Allow time for fade out
}

const run = () => {
    try {
        const code = transpile(codeInput.value);
        if (code === lastTranspiledCode) return;
        lastTranspiledCode = code;
        graph && dispose(graph.output); // Fade out and dispose of previous graph if it exists
        graph = compile(code);
        // For testing
        // setInterval(() => {
        //     if(!graph) return 
        //     const { inputs } = graph;
        //     if(inputs.env) inputs.env.triggerAttackRelease(1); // Trigger envelope if it exists
        // }, 2000); // Keep the graph alive
    } catch (error) {
        console.error("Error compiling code:", error);
    }
}

const stop = () => {
    graph && dispose(graph.output)
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