import { transpile } from "./transpile.js";
import { compile } from "./tone.js";

const button = document.getElementById("run");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;

button?.addEventListener("click", () => {
    const code = codeInput.value;
    try {
        const transpiledCode = transpile(code);
        compile(transpiledCode);
        console.log("Code compiled successfully");
    } catch (error) {
        console.error("Error compiling code:", error);
    }
});