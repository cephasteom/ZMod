import { 
    Signal, Scale,
    Param, 
    Gain, Envelope, Panner, Follower,
    Split,
    Delay,
    getTransport,
} from 'tone'

import { signals } from './components/signals';
import { oscillators } from './components/oscillators';
import { noise } from './components/noise';
import { lfos } from './components/lfos';
import { triggers } from './components/triggers';
import { modifiers } from './components/modifiers';
import { filters } from './components/filters';
import { effects } from './components/effects';

import { busses as bs, inputs, outputs } from './audio';
import { ControlSignal, AudioSignal, Patch } from './tone';
import { assignOrConnect, pollSignal, toControlSignal, toNumber } from './helpers';
import { onDisposeFns } from './stores';
import Looper from '../rnbo/components/Looper';
import Library from './Library';

export type { Patch } from "./tone.d.ts";
export { outputs, destination } from './audio';

let busses: Gain<"gain">[] = bs;

export const library = new Library();

// Input functions
const inputFns: Record<string, (node: any) => (...args: any[]) => AudioSignal> = {
    signal: (node: any) => (value: number, time: number, lag: number = 0) => {
        lag || node._smooth
            ? node.rampTo(value, (lag / 1000) || 0.01, time)
            : node.setValueAtTime(value, time);
        return node
    },
    envelope: (node: Envelope) => (options: { a?: number, d?: number, s?: number, r?: number }) => {
        const { a = 10, d = 10, s = 0.5, r = 800 } = options;
        node.set({attack: a / 1000, decay: d / 1000, sustain: s, release: r / 1000});
        return node
    }
}

function formatInputs(inputs: Record<string, Signal | Param | Envelope>): Record<string, (...args: any[]) => void> {
    return Object.entries(inputs).reduce((acc, [key, value]) => {
        const name = value.constructor.name.toLowerCase().replace(/_/g, '').toLowerCase()
        const fn = inputFns[name];
        acc[key] = fn ? fn(value) : () => {}
        return acc;
    }, {} as Record<string, (...args: any[]) => void>);
}

// Patch creation
export const makePatch = (
    code: string, 
    bs?: Gain<"gain">[]
): Patch => {
    onDisposeFns.set([]); // Reset dispose functions
    busses = bs || busses; // Use provided busses or default
    
    const result = new Function(
        ...library.keys, 
        code
    )(...library.values)
    
    const { inputs, output } = result;

    return {
        inputs: formatInputs(inputs || {}),
        output,
        dispose: (time: number) => {
            const disposeFns = [...onDisposeFns.get()];
            result.output?.gain?.rampTo(0, 1, time + 1); // Fade out volume
            setTimeout(() => {
                // @ts-ignore
                disposeFns.forEach(fn => fn());
                output?.dispose?.()
            }, 2000); // Allow time for fade out
        }
    }
}