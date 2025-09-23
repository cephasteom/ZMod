import { Abs, Add, AudioToGain, GainToAudio, GreaterThan, GreaterThanZero, Multiply, Negate, Pow, Scale, ScaleExp, Signal, Subtract } from "tone";
import { ControlSignal } from "../tone";
import { assignOrConnect, toControlSignal, toNumber } from "../helpers";
import { onDisposeFns } from "../stores";

export const signals = {
    sig: (value: number): Signal => new Signal(value),
    s: (value: number): Signal => new Signal(value),
    add: (signal: Signal, value: ControlSignal): Signal => {
        const node = new Add(toNumber(value));
        assignOrConnect(node.addend, value);
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    },
    mul: (signal: Signal, value: ControlSignal): Signal => {
        const node = new Multiply(toNumber(value));
        assignOrConnect(node.factor, toControlSignal(value));
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    },
    sub: (signal: Signal, value: ControlSignal): Signal => {
        const node = new Subtract(toNumber(value));
        assignOrConnect(node.subtrahend, toControlSignal(value));
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    },
    gt: (signal: Signal, value: ControlSignal): Signal => {
        const node = new GreaterThan(toNumber(value));
        assignOrConnect(node.comparator, toControlSignal(value));
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    },
    ...Object.fromEntries([Abs, GreaterThanZero, Negate, GainToAudio, AudioToGain, Pow, Scale, ScaleExp].map((Class) => {
        // to lowercase and remove any _
        const name = Class.name.toLowerCase().replace(/_/g, '');
        return [name, (signal: Signal, ...args: number[]): Signal => {
            // TODO: if args are signals, how shall we handle them?
            // @ts-ignore
            const node = new Class(...args);
            signal.connect(node);
            onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
            return node;
        }]
    })),
};