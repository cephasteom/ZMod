import { Envelope } from "tone";
import { onDisposeFns } from "../stores";

export const triggers = {
    adsr: (attack: number = 100, decay: number = 100, sustain: number = 0.5, release: number = 800): Envelope => {
        attack /= 1000;
        decay /= 1000;
        release /= 1000;
        const envelope = new Envelope({attack, decay, sustain, release});
        onDisposeFns.update((fns) => [...fns, () => envelope.dispose()]);
        return envelope;
    },

    // impulse

    // dust
}