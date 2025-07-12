import { 
    Signal, Abs, Add, Subtract, GreaterThan, GreaterThanZero, Multiply, Negate, GainToAudio, AudioToGain, Pow, Scale, ScaleExp,
    Param, 
    PulseOscillator,
    Noise,
    Gain, Envelope, Panner, Follower,
    Reverb, FeedbackDelay, Distortion, Chorus,
    Split, Merge,
    FeedbackCombFilter,
    Delay,
    type FilterRollOff,
} from 'tone'

import { outputBus, outputs } from './audio';
import { ControlSignal, AudioSignal, Patch } from './tone';
import { assignOrConnect, toControlSignal, toNumber } from './helpers';
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
export { outputBus } from './audio';

let onDisposeFns: (() => void)[] = [];

// Library
const nodes: Record<string, Record<string, (...args: any[]) => any>> = {
    core: {
        value: (val: number): number => val,
    },
    
    // Signals
    signals: {
        sig: (value: number): Signal => new Signal(value),
        ...Object.fromEntries([Abs, Add, Multiply, Subtract, GreaterThan, GreaterThanZero, Negate, GainToAudio, AudioToGain, Pow, Scale, ScaleExp].map((Class) => {
            // to lowercase and remove any _
            const name = Class.name.toLowerCase().replace(/_/g, '');
            return [name, (signal: Signal, ...args: number[]): Signal => {
                // TODO: if args are signals, how shall we handle them?
                // @ts-ignore
                const node = new Class(...args);
                signal.connect(node);
                return node;
            }]
        }))
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
            const env = new Envelope({attack, decay, sustain, release});
            console.log(env)
            return env
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

    metering: {
        follow: (node: AudioSignal, smoothing: ControlSignal = 0.01): ControlSignal => {
            const follower = new Follower(toNumber(smoothing));
            const signal = new Signal();
            node.connect(follower);
            follower.connect(signal);
            return signal;
        }
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
        pan: (node: AudioSignal, value: ControlSignal = 0.5): AudioSignal => {
            // ensure value is a Signal
            const sig = toControlSignal(value);
            // scale the value to -1 to 1 so we can use 0 - 1 for panning
            const scale = new Scale(-1, 1)
            const scaled = sig.connect(scale);
            const panner = new Panner(toNumber(scaled));
            assignOrConnect(panner.pan, scaled);
            node.connect(panner);
            return panner;
        },
    
        out: (node: AudioSignal | number, ...channels: number[]): AudioSignal => {
            // If the node is a number, we assume it's actually a channel number
            // and we use out() as an audio source
            if (typeof node === 'number') {
                channels.unshift(node); // Add the channel number to the front of the channels array
            
                const merge = new Merge({channels: channels.length});
                const delay = new Delay(0.01); // 10 ms delay - otherwise we get a feedback loop and the audio will not play
                
                channels.forEach((ch, i) => outputs.connect(merge, ch, i));

                merge.connect(delay);
                return delay;
                
            // else if the node is an AudioSignal
            // we connect it to the output bus
            } else {
                const output = new Gain(1);
                node.connect(output)
    
                // If no channels are specified, use the first two channels
                channels = channels.length > 0
                    ? channels
                    : [0,1]
                
                // split the output into mono channels
                const split = new Split(channels.length);
                output.connect(split);
                
                // connect each mono channel to the output bus
                channels.forEach((ch, i) => split.connect(outputBus, i, ch));
    
                // return the gain node so that we can control the volume
                return output
            }

        },

        stack: (...nodes: AudioSignal[]): AudioSignal => {
            if (nodes.length === 0) {
                throw new Error("No nodes provided to stack");
            }
            const output = new Gain(1);
            nodes.forEach(node => {
                node.connect(output)
                onDisposeFns.push(() => {
                    node.gain?.rampTo(0, 0.1); // Fade out volume
                    setTimeout(() => node.dispose(), 1000);
                });
            })
            return output;
        }
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
    onDisposeFns = []; // Reset dispose functions
    
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
            onDisposeFns.forEach(fn => fn());
            setTimeout(() => result.output?.dispose?.(), 1000); // Allow time for fade out
        }
    }
}