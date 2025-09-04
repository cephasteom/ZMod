import { Gain } from "tone";
import { AudioSignal, ControlSignal } from "../tone";
import { assignOrConnect } from "../helpers";
import { onDisposeFns } from "../stores";

export const modifiers = {
    amp: (node: AudioSignal, value: ControlSignal): Gain => {
        const gainNode = new Gain(0);
        assignOrConnect(gainNode.gain, value);
        node.connect(gainNode);

        onDisposeFns.update((fns) => [...fns, () => gainNode.dispose()]);
        return gainNode;
    },
}