import ZMod from "./ZMod";

const runButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const codeInput = document.getElementById("code") as HTMLTextAreaElement;

const zm = new ZMod()

const start = () => {
    zm.set(codeInput.value).start()
    // setInterval(() => {
    //     zm.inputs.e()
    // }, 1000);
}
const stop = () => zm.clear()

runButton?.addEventListener("click", start);
stopButton?.addEventListener("click", stop)

codeInput?.addEventListener("keydown", (event) => {
    if (!(event.shiftKey && event.key === "Enter")) return
    event.preventDefault();
    start();
});

codeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    stop();
});