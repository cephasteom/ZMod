// TODO: add more nodes
// TODO: replace the nodes exposed as inputs with functions that control them. This will depend on what type of node they are.
// E.g. for an _Envelope type, e() should trigger it, and e(0.1, 0.2, 0.5, 0.8) should set the attack, decay, sustain, and release times.

import { format } from 'path'
import { 
    Merge, 
    Signal, Param,
    getDestination,
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator,
    Limiter, Gain, Envelope,
    Multiply,
    type ToneOscillatorType
} from 'tone'

// ROUTING
const limiter = new Limiter({threshold: -20})
const destination = getDestination()
destination.channelCount = destination.maxChannelCount
destination.channelCount === 2 && destination.chain(limiter)
const allChannels = new Merge({channels: destination.maxChannelCount})
allChannels.connect(destination)

// HELPERS
type Input = number | Signal | LFO | Envelope | undefined;

const makeOutput = (node: Oscillator | FMOscillator | AMOscillator | PWMOscillator): Gain => {
    const gain = new Gain(1)
    node.connect(gain)
    return gain
}

const makeOsc = (type: ToneOscillatorType, freq: Input = 220): Gain => {
    const osc = new Oscillator(220, type).start()
    assignOrConnect(osc.frequency, freq)
    return makeOutput(osc)
}

function assignOrConnect(target: Signal<any> | Param<any>, value: Input) {
    if (value === undefined) return;
    value instanceof LFO || value instanceof Signal || value instanceof Envelope
        ? value.connect(target)
        : (target as Signal | AudioParam).value = value;
}

// LIBRARY
export const library: Record<string, (...args: any[]) => any> = {
    value: (val: number) => val,
    sig: (value: number) => new Signal(value),
    
    // Base Oscillators
    ...Object.fromEntries(['sine', 'triangle', 'square', 'sawtooth']
        .map(type => [
            ['triangle', 'sawtooth'].includes(type) ? `${type.slice(0,3)}` : type,
            (freq: Input) => makeOsc(type as ToneOscillatorType, freq)
        ])),
    
    // Complex Oscillators
    fm: (...args: Input[]): Gain => {
        const fmOsc = new FMOscillator(220, 'sine', 'sine').start();
        ['frequency', 'harmonicity', 'modulationIndex'].forEach((param, index) => {
            assignOrConnect((fmOsc as any)[param], args[index])
        })
        return makeOutput(fmOsc)
    },
    am: (...args: Input[]): Gain => {
        const amOsc = new AMOscillator(220, 'sine', 'sine').start();
        ['frequency', 'harmonicity'].forEach((param, index) => {
            assignOrConnect((amOsc as any)[param], args[index])
        })
        return makeOutput(amOsc)
    },
    pwm: (...args: Input[]): Gain => {
        const pwmOsc = new PWMOscillator(220, 0.5).start();
        ['frequency', 'modulationFrequency'].forEach((param, index) => {
            assignOrConnect((pwmOsc as any)[param], args[index])
        })
        return makeOutput(pwmOsc)
    },
    
    // LFO
    lfo: (frequency: number | Signal, min: number = 0, max: number = 1) : LFO => {
        const lfo = new LFO(1, min, max).start()
        assignOrConnect(lfo.frequency, frequency)
        return lfo
    },

    env: (attack: number = 100, decay: number = 100, sustain: number = 0.5, release: number = 800): Envelope => {
        attack /= 1000;
        decay /= 1000;
        release /= 1000;
        return new Envelope({attack, decay, sustain, release});
    },

    mul: (
        node: Gain | Signal,
        value: number | Signal | Envelope
    ): Gain | Signal => {
        if (node instanceof Gain) assignOrConnect(node.gain, value)
        if (node instanceof Signal) {
            if(typeof value === 'number') return node.rampTo(value, 0.1)
            if (value instanceof Signal || value instanceof Envelope) {
                const mult = new Multiply();
                node.connect(mult);
                value.connect(mult.factor);
                return mult;
            }
        }

        return node
    },

    out: (node: any) => {
        const output = new Gain(0);
        node.connect(output)
        output.toDestination()
        return output
    },
}

export interface Patch {
    inputs: Record<string, (...args: any[]) => void>
    dispose: () => void
}

const inputFns: Record<string, (node: any) => (...args: any[]) => void> = {
    _signal: (node: any) => (value: number, rampTime: number = 100) => {
        node.rampTo(value, rampTime / 1000);
    },
    _param: (node: Signal) => (value: number, rampTime: number = 100) => {
        node.rampTo(value, rampTime / 1000);
    },
    _envelope: (node: Envelope) => (
        attack: number = 100, 
        decay: number = 100, 
        sustain: number = 0.8, 
        release: number = 800
    ) => {
        attack /= 1000;
        decay /= 1000;
        release /= 1000;
        node.set({attack, decay, sustain, release});
        node.triggerAttackRelease(release);
    }
}

function formatInputs(inputs: Record<string, Signal | Param | Envelope>): Record<string, (...args: any[]) => void> {
    return Object.entries(inputs).reduce((acc, [key, value]) => {
        const fn = inputFns[value.constructor.name.toLowerCase()];
        acc[key] = fn ? fn(value) : () => {}
        return acc;
    }, {} as Record<string, (...args: any[]) => void>);
}

export const makePatch = (code: string): Patch => {
    const result = new Function(
        ...Object.keys(library), 
        code
    )(...Object.values(library))
    
    const { inputs, output } = result;
    
    output?.gain?.rampTo(1, 0.1);

    return {
        inputs: formatInputs(inputs || {}),
        dispose: () => {
            result.output?.gain?.rampTo(0, 0.1); // Fade out volume
            setTimeout(() => result.output?.dispose?.(), 1000); // Allow time for fade out
        }
    }
}