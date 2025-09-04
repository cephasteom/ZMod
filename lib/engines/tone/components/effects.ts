import { Chorus, Distortion, FeedbackDelay, Reverb } from "tone";
import { AudioSignal, ControlSignal } from "../tone";
import { assignOrConnect, toNumber } from "../helpers";
import { onDisposeFns } from "../stores";

export const effects = {
    reverb: (node: AudioSignal, wet: ControlSignal = 0.5, decay: ControlSignal = 1000): AudioSignal => {
        const reverb = new Reverb(toNumber(decay)/1000);
        assignOrConnect(reverb.wet, wet);
        node.connect(reverb);

        onDisposeFns.update((fns) => [...fns, () => reverb.dispose()]);

        return reverb;
    },
    delay: (node: AudioSignal, wet: ControlSignal = 0.5, delayTime: ControlSignal = 0.5, feedback: ControlSignal = 0.5): AudioSignal => {
        const delay = new FeedbackDelay({
            delayTime: toNumber(delayTime), 
            feedback: toNumber(feedback),
            wet: toNumber(wet)
        });
        assignOrConnect(delay.wet, wet);
        assignOrConnect(delay.delayTime, delayTime);
        assignOrConnect(delay.feedback, feedback);
        node.connect(delay);

        onDisposeFns.update((fns) => [...fns, () => delay.dispose()]);

        return delay;
    },
    dist: (node: AudioSignal, wet: ControlSignal = 0.5, distortion: ControlSignal = 0.5): AudioSignal => {
        const dist = new Distortion(toNumber(distortion));
        assignOrConnect(dist.wet, wet);
        node.connect(dist);

        onDisposeFns.update((fns) => [...fns, () => dist.dispose()]);

        return dist;
    },
    chorus: (node: AudioSignal, wet: ControlSignal = 0.5, frequency: ControlSignal = 1, feedback: ControlSignal = 0.005, depth: ControlSignal = 0.7): AudioSignal => {
        const chorus = new Chorus({
            wet: toNumber(wet),
            frequency: toNumber(frequency),
            feedback: toNumber(feedback),
            depth: toNumber(depth)
        });
        assignOrConnect(chorus.wet, wet);
        assignOrConnect(chorus.frequency, frequency);
        assignOrConnect(chorus.feedback, feedback);
        node.connect(chorus);

        onDisposeFns.update((fns) => [...fns, () => chorus.dispose()]);

        return chorus;
    }
}