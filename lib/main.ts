import ZMod from "./ZMod";

const runButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;
const nodesDisplay = document.getElementById("nodes") as HTMLParagraphElement;
// if code in localStorage, set it to codeInput
if (localStorage.getItem("zmod-code")) {
    codeInput.value = localStorage.getItem("zmod-code") || "";
}

const zm = new ZMod().toDestination();

nodesDisplay.innerHTML = Object.entries(zm.libraryKeys)
    .filter(([category, _]) => category !== "core")
    .map(([category, nodes]) => `<p><strong>${category}</strong>: ${nodes.join(", ")}</p>`)
    .join("")

const start = () => zm.set(codeInput.value).start()
const stop = () => zm.stop()

runButton?.addEventListener("click", start);
stopButton?.addEventListener("click", stop)

codeInput?.addEventListener("keydown", (event) => {
    if (!(event.shiftKey && event.key === "Enter")) return
    event.preventDefault();
    // Save code to localStorage
    localStorage.setItem("zmod-code", codeInput.value);
    start();
});

codeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    stop();
});