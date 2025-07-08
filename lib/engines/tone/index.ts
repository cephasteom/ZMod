// TODO: polyphony amp(env()).voices(4)?
// TODO: signals and their methods...
// TODO: AudioInput, AudioOutput - multichannel
// TODO: External signals - how can plug in other streams to this one? Follower, etc.
// TODO: ToneInstruments
// TODO: docs should show inputs
// TODO: synced signals....lfos....

import { 
    Signal, Param,
    PulseOscillator,
    Noise,
    Gain, Envelope, Panner,
    Reverb, FeedbackDelay, Distortion, Chorus,
    type FilterRollOff,
    FeedbackCombFilter
} from 'tone'

import { destination } from './audio';
import { ControlSignal, AudioSignal, Patch } from './tone';
import { assignOrConnect, toNumber } from './helpers';
import { 
    makeOsc, 
    makeFm, 
    makeAm, 
    makePwm, 
    makeFat, 
    makeLfo, 
    makeFilter
} from './factories';

export type { Patch } from "./tone.d.ts";

// Library
const nodes: Record<string, Record<string, (...args: any[]) => any>> = {
    core: {
        value: (val: number): number => val,
    },
    
    // Signals
    signals: {
        sig: (value: number): Signal => new Signal(value),
    },

    // AudioSignals
    oscillators: {
        sine: (freq: ControlSignal = 220): AudioSignal => makeOsc('sine', freq),
        tri: (freq: ControlSignal = 220): AudioSignal => makeOsc('triangle', freq),
        square: (freq: ControlSignal = 220): AudioSignal => makeOsc('square', freq),
        saw: (freq: ControlSignal = 220): AudioSignal => makeOsc('sawtooth', freq),
        
        fm: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi),
        fmsine: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'sine'),
        fmtri: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'triangle'),
        fmsquare: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'square'),
        fmsaw: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'sawtooth'),
        
        am: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm),
        amsine: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'sine'),
        amtri: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'triangle'),
        amsquare: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'square'),
        amsaw: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'sawtooth'),
        
        pulse: (freq: ControlSignal = 220, width: ControlSignal = 0.5): AudioSignal => {
            const pulseOsc = new PulseOscillator(220, toNumber(width)).start();
            assignOrConnect(pulseOsc.frequency, freq);
            assignOrConnect(pulseOsc.width, width);
            return pulseOsc;
        },
        pwm: (freq: ControlSignal = 220, modFreq: ControlSignal = 0.5): AudioSignal => makePwm(freq, modFreq),
    
        fat: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread),
        fatsine: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'sine'),
        fattri: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'triangle'),
        fatsquare: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'square'),
        fatsaw: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'sawtooth'),
    },

    noise: {
        white: (): AudioSignal => new Noise('white').start(),
        pink: (): AudioSignal => new Noise('pink').start(),
        brown: (): AudioSignal => new Noise('brown').start(),        
    },
    
    // ControlSignals
    lfos: {
        lfo: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sine', frequency, min, max),
        lfosine: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sine', frequency, min, max),
        lfotri: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('triangle', frequency, min, max),
        lfosquare: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('square', frequency, min, max),
        lfosaw: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sawtooth', frequency, min, max),
    },

    envelopes: {
        adsr: (attack: number = 100, decay: number = 100, sustain: number = 0.5, release: number = 800): Envelope => {
            attack /= 1000;
            decay /= 1000;
            release /= 1000;
            return new Envelope({attack, decay, sustain, release});
        },
    },

    modifiers: {
        amp: (node: AudioSignal, value: ControlSignal): Gain => {
            const gainNode = new Gain(1);
            assignOrConnect(gainNode.gain, value);
            node.connect(gainNode);
            return gainNode;
        },
    },

    filters: {
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
            return filter;  
        }
    },

    effects: {
        reverb: (node: AudioSignal, wet: ControlSignal = 0.5, decay: ControlSignal = 1000): AudioSignal => {
            const reverb = new Reverb(toNumber(decay)/1000);
            assignOrConnect(reverb.wet, wet);
            node.connect(reverb);
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
            return delay;
        },
        dist: (node: AudioSignal, wet: ControlSignal = 0.5, distortion: ControlSignal = 0.5): AudioSignal => {
            const dist = new Distortion(toNumber(distortion));
            assignOrConnect(dist.wet, wet);
            node.connect(dist);
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
            return chorus;
        }
    },

    routing: {
        pan: (node: AudioSignal, value: ControlSignal = 0): AudioSignal => {
            const panner = new Panner(toNumber(value));
            assignOrConnect(panner.pan, value);
            node.connect(panner);
            return panner;
        },
    
        out: (node: AudioSignal) => {
            const output = new Gain(0);
            node.connect(output)
            output.connect(destination);
            return output
        },
    }
}

export const library: Record<string, (...args: any[]) => any> = Object.values(nodes)
    .reduce((acc, val) => {      
        Object.entries(val).forEach(([key, value]) => {
            acc[key] = value;
        });
        return acc;
    })

export const libraryKeys = Object.entries(nodes)
    .reduce((obj, [key, fns]) => ({
        ...obj,
        [key]: Object.keys(fns)
    }), {} as Record<string, string[]>);

// Input functions
const inputFns: Record<string, (node: any) => (...args: any[]) => void> = {
    _signal: (node: any) => (value: number, rampTime: number = 100) => {
        node.rampTo(value, rampTime / 1000);
    },
    _param: (node: Signal) => (value: number, rampTime: number = 100) => {
        node.rampTo(value, rampTime / 1000);
    },
    _envelope: (node: Envelope) => (
        duration: number = 1000,
        attack: number = 100, 
        decay: number = 100, 
        sustain: number = 0.8, 
        release: number = 800
    ) => {
        attack /= 1000;
        decay /= 1000;
        release /= 1000;
        node.set({attack, decay, sustain, release});
        node.triggerAttackRelease(duration / 1000);
    }
}

function formatInputs(inputs: Record<string, Signal | Param | Envelope>): Record<string, (...args: any[]) => void> {
    return Object.entries(inputs).reduce((acc, [key, value]) => {
        const fn = inputFns[value.constructor.name.toLowerCase()];
        acc[key] = fn ? fn(value) : () => {}
        return acc;
    }, {} as Record<string, (...args: any[]) => void>);
}

// Patch creation
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