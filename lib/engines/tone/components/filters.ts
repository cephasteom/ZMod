import { FeedbackCombFilter, FilterRollOff } from "tone";
import { AudioSignal, ControlSignal } from "../tone";
import { makeFilter } from "../factories";
import { assignOrConnect, toNumber } from "../helpers";
import { onDisposeFns } from "../stores";

export const filters = {
    hpf: (node: AudioSignal, frequency: ControlSignal = 1000, q: ControlSignal = 1, rolloff: FilterRollOff = -12): AudioSignal => {
        return makeFilter(node, 'highpass', frequency, q, rolloff);
    },
    lpf: (node: AudioSignal, frequency: ControlSignal = 1000, q: ControlSignal = 1, rolloff: FilterRollOff = -12): AudioSignal => {
        return makeFilter(node, 'lowpass', frequency, q, rolloff);
    },
    bpf: (node: AudioSignal, frequency: ControlSignal = 1000, q: ControlSignal = 1, rolloff: FilterRollOff = -12): AudioSignal => {
        return makeFilter(node, 'bandpass', frequency, q, rolloff);
    },
    fbf: (node: AudioSignal, delayTime: ControlSignal = 0.5, resonance: ControlSignal = 0.5): AudioSignal => {
        const filter = new FeedbackCombFilter({
            delayTime: toNumber(delayTime),
            resonance: toNumber(resonance)
        });
        assignOrConnect(filter.delayTime, delayTime);
        assignOrConnect(filter.resonance, resonance);
        node.connect(filter);

        onDisposeFns.update((fns) => [...fns, () => filter.dispose()]);

        return filter;
    }
}