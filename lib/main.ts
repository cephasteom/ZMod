import { ZenModular } from "./ZenModular";

const runButton = document.getElementById("run");
const stopButton = document.getElementById("stop");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;

const zm = new ZenModular()

const run = () => zm.parse(codeInput.value).start()
const stop = () => zm.clear()

runButton?.addEventListener("click", run);
stopButton?.addEventListener("click", stop)

codeInput?.addEventListener("keydown", (event) => {
    if (!(event.shiftKey && event.key === "Enter")) return
    event.preventDefault(); // Prevent default behavior of new line
    run();
});

codeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault(); // Prevent default behavior of escape
    stop();
});