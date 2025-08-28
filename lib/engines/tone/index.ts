import { 
    Signal, Abs, Add, Subtract, GreaterThan, GreaterThanZero, Multiply, Negate, GainToAudio, AudioToGain, Pow, Scale, ScaleExp,
    Param, 
    PulseOscillator,
    Gain, Envelope, Panner, Follower,
    Reverb, FeedbackDelay, Distortion, Chorus,
    Split,
    FeedbackCombFilter,
    Delay,
    type FilterRollOff,
    getTransport,
} from 'tone'

import { busses as bs, inputs, outputs } from './audio';
import { ControlSignal, AudioSignal, Patch } from './tone';
import { assignOrConnect, pollSignal, toControlSignal, toNumber, SmoothedSignal } from './helpers';
import { 
    makeOsc, 
    makeFm, 
    makeAm, 
    makePwm, 
    makeFat, 
    makeLfo, 
    makeFilter,
    makeNoise
} from './factories';
import { onDisposeFns } from './stores';
import Looper from '../rnbo/components/Looper';

export type { Patch } from "./tone.d.ts";
export { outputs, destination } from './audio';

let busses: Gain<"gain">[] = bs;

// Library
const nodes: Record<string, Record<string, (...args: any[]) => any>> = {
    core: {
        value: (val: number): number => val,
    },
    
    // Signals
    signals: {
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
        ...Object.fromEntries([Abs, GreaterThan, GreaterThanZero, Negate, GainToAudio, AudioToGain, Pow, Scale, ScaleExp].map((Class) => {
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
            const pulseOsc = new PulseOscillator(220, toNumber(width)).sync().start("0.05");
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
        white: (rate: 1): AudioSignal => makeNoise('white', rate),
        pink: (rate: 1): AudioSignal => makeNoise('pink', rate),
        brown: (rate: 1): AudioSignal => makeNoise('brown', rate),
    },
    
    // ControlSignals
    lfos: {
        lfo: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sine', frequency, min, max),
        lfosine: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sine', frequency, min, max),
        lfotri: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('triangle', frequency, min, max),
        lfosquare: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('square', frequency, min, max),
        lfosaw: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sawtooth', frequency, min, max),
    },

    triggers: {
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
    },

    modifiers: {
        amp: (node: AudioSignal, value: ControlSignal): Gain => {
            const gainNode = new Gain(1);
            assignOrConnect(gainNode.gain, value);
            node.connect(gainNode);

            onDisposeFns.update((fns) => [...fns, () => gainNode.dispose()]);
            return gainNode;
        },
    },

    metering: {
        follow: (node: AudioSignal, smoothing: ControlSignal = 0.01): ControlSignal => {
            const follower = new Follower(toNumber(smoothing));
            const signal = new Signal();
            node.connect(follower);
            follower.connect(signal);

            onDisposeFns.update((fns) => [...fns, () => {
                signal.dispose();
                follower.dispose();
            }]);
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

            onDisposeFns.update((fns) => [...fns, () => filter.dispose()]);

            return filter;
        }
    },

    effects: {
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
    },

    recording: {
        loop: (node: AudioSignal, gain: ControlSignal = 0, beats: ControlSignal = 4): AudioSignal => {
            const output = new Gain(1);
            const input = new Gain(0);
            
            const looper = new Looper();
            
            node.connect(output);
            node.connect(input);
            input.connect(looper.input);
            looper.connect(output);
            // set a flag so that further downstream it knows to smooth the gain
            gain._smooth = true

            // wait for device to load
            setTimeout(() => {
                looper.length((60 / getTransport().bpm.value) * 1000 * beats, 0);
                looper.record(1,0)
                assignOrConnect(input.gain, gain);
            }, 250);

            getTransport().on('start', (time) => {
                looper.start(time);
                looper.record(1,time)
                looper.output.gain.rampTo(1, 0.1);
            });
            getTransport().on('stop', (time) => {
                looper.output.gain.rampTo(0, 0.1)
                looper.record(0, time);
            });

            onDisposeFns.update((fns) => [...fns, () => {
                output.dispose();
                looper.dispose();
                // cancelPollSignal();
                // getTransport().off('start');
                // getTransport().off('stop');
            }]);

            return output;
        }
    },

    routing: {
        pan: (node: AudioSignal, value: ControlSignal = 0.5): AudioSignal => {
            const out = new Gain(1);
            // ensure value is a Signal
            const sig = toControlSignal(value);
            // scale the value to -1 to 1 so we can use 0 - 1 for panning
            const scale = new Scale(-1, 1)
            sig.connect(scale);
            const panner = new Panner(toNumber(scale));
            assignOrConnect(panner.pan, scale);
            node.connect(panner);
            panner.connect(out);

            onDisposeFns.update((fns) => [...fns, () => {
                panner.dispose();
                scale.dispose();
                out.dispose();
            }]);

            return out;
        },

        input: (...channels: number[]): AudioSignal => {
            // If no channels are specified, use the first two channels
            channels = channels.length > 0
                ? channels
                : [0,1]
            
            // Create a Gain node to control the input volume
            const output = new Gain(2);
            
            inputs.connect(output);

            inputs.open()
                .then(() => console.log('input is open'))
                .catch(err => console.error('input access denied:', err));

            onDisposeFns.update((fns) => [...fns, () => {
                output.dispose();
                inputs.close();
            }]);

            // Return the Gain node so that we can control the volume
            return output;
        },
    
        out: (node: AudioSignal | number, ...channels: number[]): AudioSignal => {
            const output = new Gain(0);
            node.connect(output)

            // If no channels are specified, use the first two channels
            channels = channels.length > 0
                ? channels
                : [0,1]
            
            // split the output into mono channels
            const split = new Split(channels.length);
            output.connect(split);

            // connect each mono channel to the output bus
            channels.forEach((ch, i) => split.connect(outputs, i, ch));
            
            onDisposeFns.update((fns) => [...fns, () => {
                output.dispose();
                split.dispose();
            }]);

            // return the gain node so that we can control the volume
            return output
        },

        bus: (nodeOrBus: AudioSignal | number, bus?: number): AudioSignal => {
            // route from bus
            if (typeof nodeOrBus === 'number') {
                const i = nodeOrBus;
                const delay = new Delay(0.01); // prevent feedback loop
                busses[i].connect(delay);
                onDisposeFns.update((fns) => [...fns, () => delay.dispose()]);
                return delay;
            // route to bus
            } else {
                const node = nodeOrBus as AudioSignal;
                node.connect(busses[bus || 0]);
                return node
            }
        },

        stack: (...nodes: AudioSignal[]): AudioSignal => {
            if (nodes.length === 0) {
                throw new Error("No nodes provided to stack");
            }
            const output = new Gain(1);
            nodes.forEach(node => {
                node.connect(output);
                onDisposeFns.update((fns) => [
                    ...fns, () => {
                        node.gain?.rampTo(0, 0.1); // Fade out volume
                        setTimeout(() => node.dispose(), 1000);
                    }
                ]);
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
const inputFns: Record<string, (node: any) => (...args: any[]) => AudioSignal> = {
    signal: (node: any) => (value: number, time: number, lag: number = 0) => {
        lag  || node._smooth
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
        ...Object.keys(library), 
        code
    )(...Object.values(library))
    
    const { inputs, output } = result;

    return {
        inputs: formatInputs(inputs || {}),
        output,
        dispose: () => {
            const disposeFns = [...onDisposeFns.get()];
            result.output?.gain?.rampTo(0, 0.1); // Fade out volume
            setTimeout(() => {
                // @ts-ignore
                disposeFns.forEach(fn => fn());
                output?.dispose?.()
            }, 1000); // Allow time for fade out
        }
    }
}