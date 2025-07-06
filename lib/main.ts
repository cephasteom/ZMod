import { transpile } from "./transpile.js";
import { compile, type Patch } from "./tone.js";

let patch: Patch | null = null;
let lastTranspiledCode: string = ''

const runButton = document.getElementById("run");
const stopButton = document.getElementById("stop");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;

const run = () => {
    try {
        const code = transpile(codeInput.value);
        if (code === lastTranspiledCode) return;
        lastTranspiledCode = code;
        patch?.dispose();
        patch = compile(code);
        // For testing
        setInterval(() => {
            if(!patch) return 
            const { inputs } = patch;
            // @ts-ignore
            if(inputs.f) inputs.f.set({value: 220}); inputs.f.rampTo(440, 1); // Ramp frequency if it exists
            // @ts-ignore
            if(inputs.e) inputs.e.triggerAttackRelease(1); // Trigger envelope if it exists
        }, 2000); // Keep the patch alive
    } catch (error) {
        console.error("Error compiling code:", error);
    }
}

const stop = () => {
    patch?.dispose(); // Dispose of the current patch if it exists
    patch = null; // Clear the graph reference
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