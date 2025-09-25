import { Abs, Add,  Chorus,  Delay,  Distortion,  Envelope,  FeedbackCombFilter,  FeedbackDelay,  FilterRollOff,  Follower,  Gain,  getTransport,  GreaterThan, Multiply, Negate, Panner, Pow, PulseOscillator, Reverb, Scale, ScaleExp, Signal, Split, Subtract } from "tone";
import { AudioSignal, ControlSignal } from "./tone";
import { assignOrConnect, pollSignal, toControlSignal, toNumber } from "./helpers";
import { onDisposeFns } from "./stores";
import { makeAm, makeFat, makeFilter, makeFm, makeLfo, makeNoise, makeOsc, makePwm } from "./factories";
import Looper from "../rnbo/components/Looper";
import { inputs, outputs } from "./audio";

export default class Library {
    busses: Gain<"gain">[];

    constructor(busses: Gain<"gain">[] = []) {
        this.busses = busses;
        console.log(this.busses)
        
        // bind all methods to this
        this.keys
            .forEach(name => {
                const method = (this as any)[name];
                if (typeof method === 'function') {
                    (this as any)[name] = method.bind(this);
                }
            });
    }

    get keys() {
        // get all method names except constructor and private methods (starting with _)
        return Object.getOwnPropertyNames(Library.prototype)
            .filter(name => name !== 'constructor' 
                && !name.startsWith('_')
                && !['keys', 'values'].includes(name)
            );
    }

    get values() {
        return this.keys.map(key => (this as any)[key])
    }

    /** Core */
    value(val: number): number {return val}

    /** Oscillators */
    sine(freq: ControlSignal = 220): AudioSignal { return makeOsc('sine', freq) }
    tri(freq: ControlSignal = 220): AudioSignal { return makeOsc('triangle', freq) }
    square(freq: ControlSignal = 220): AudioSignal { return makeOsc('square', freq) }
    saw(freq: ControlSignal = 220): AudioSignal { return makeOsc('sawtooth', freq) }

    fm(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal { return makeFm(freq, harm, modi) }
    fmsine(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal { return makeFm(freq, harm, modi, 'sine') }
    fmtri(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal { return makeFm(freq, harm, modi, 'triangle') }
    fmsquare(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal { return makeFm(freq, harm, modi, 'square') }
    fmsaw(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal { return makeFm(freq, harm, modi, 'sawtooth') }

    am(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal { return makeAm(freq, harm) }
    amsine(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal { return makeAm(freq, harm, 'sine') }
    amtri(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal { return makeAm(freq, harm, 'triangle') }
    amsquare(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal { return makeAm(freq, harm, 'square') }
    amsaw(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal { return makeAm(freq, harm, 'sawtooth') }

    pulse(freq: ControlSignal = 220, width: ControlSignal = 0.5): AudioSignal {
        const osc = new PulseOscillator(220, toNumber(width)).start();
        assignOrConnect(osc.frequency, freq);
        assignOrConnect(osc.width, width);
        osc.volume.value = -Infinity
        osc.volume.rampTo(-12, 0.05); // Set initial volume to -12dB
        return osc;
    }
    pwm(freq: ControlSignal = 220, modFreq: ControlSignal = 0.5): AudioSignal { return makePwm(freq, modFreq) }

    fat(freq: ControlSignal = 220, spread: number = 10): AudioSignal { return makeFat(freq, spread) }
    fatsine(freq: ControlSignal = 220, spread: number = 10): AudioSignal { return makeFat(freq, spread, 'sine') }
    fattri(freq: ControlSignal = 220, spread: number = 10): AudioSignal { return makeFat(freq, spread, 'triangle') }
    fatsquare(freq: ControlSignal = 220, spread: number = 10): AudioSignal { return makeFat(freq, spread, 'square') }
    fatsaw(freq: ControlSignal = 220, spread: number = 10): AudioSignal { return makeFat(freq, spread, 'sawtooth') }

    /** Signals */
    sig(value: number): Signal { 
        const node = new Signal(toNumber(value));
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    } 
    s(value: number): Signal { return this.sig(value) }

    add(signal: Signal, value: ControlSignal): Signal {
        const node = new Add(toNumber(value));
        assignOrConnect(node.addend, value);
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    }
    mul(signal: Signal, value: ControlSignal): Signal {
        const node = new Multiply(toNumber(value));
        signal.connect(node);
        assignOrConnect(node.factor, toControlSignal(value));
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    }
    sub(signal: Signal, value: ControlSignal): Signal {
        const node = new Subtract(toNumber(value));
        assignOrConnect(node.subtrahend, toControlSignal(value));
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    }
    gt(signal: Signal, value: ControlSignal): Signal {
        const node = new GreaterThan(toNumber(value));
        assignOrConnect(node.comparator, toControlSignal(value));
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        return node;
    }
    greaterthan(...args: Parameters<Library['gt']>): Signal {
        return this.gt(...args);
    }
    scale(signal: Signal, min: number, max: number): Signal {
        const node = new Scale(min, max);
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        // @ts-ignore
        return node;
    }
    scaleexp(signal: Signal, min: number, max: number): Signal {
        const node = new ScaleExp(min, max);
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        // @ts-ignore
        return node;
    }
    abs(signal: Signal): Signal {
        const node = new Abs();
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        // @ts-ignore
        return node;
    }
    negate(signal: Signal): Signal {
        const node = new Negate();
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        // @ts-ignore
        return node;
    }
    pow(signal: Signal, exp: number): Signal {
        const node = new Pow(exp);
        signal.connect(node);
        onDisposeFns.update((fns) => [...fns, () => node.dispose()]);
        // @ts-ignore
        return node;
    }

    /** Noise */
    white(rate: 1): AudioSignal  {
        return makeNoise('white', rate);
    }
    pink(rate: 1): AudioSignal  {
        return makeNoise('pink', rate);
    }
    brown(rate: 1): AudioSignal  {
        return makeNoise('brown', rate);
    }

    /** Modifiers */
    amp(node: AudioSignal, value: ControlSignal): Gain {
        const gainNode = new Gain(0);
        assignOrConnect(gainNode.gain, value);
        node.connect(gainNode);

        onDisposeFns.update((fns) => [...fns, () => gainNode.dispose()]);
        return gainNode;
    }

    /** LFOs */
    lfo(frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal {
        return makeLfo('sine', frequency, min, max)
    }
    lfosine(frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal { 
        return makeLfo('sine', frequency, min, max) 
    }
    lfotri(frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal { 
        return makeLfo('triangle', frequency, min, max) 
    }
    lfosquare(frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal { 
        return makeLfo('square', frequency, min, max) 
    }
    lfosaw(frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal { 
        return makeLfo('sawtooth', frequency, min, max) 
    }

    /** Triggers */
    adsr(attack: number = 100, decay: number = 100, sustain: number = 0.5, release: number = 800): Envelope {
        attack /= 1000;
        decay /= 1000;
        release /= 1000;
        const envelope = new Envelope({attack, decay, sustain, release});
        onDisposeFns.update((fns) => [...fns, () => envelope.dispose()]);
        return envelope;
    }
    
    imp(frequency: ControlSignal = 1): AudioSignal {
        return this.gt(this.lfosaw(frequency, 1, 0), 0.9) as AudioSignal;
    }

    // dust

    /** Effects */
    reverb(node: AudioSignal, wet: ControlSignal = 0.5, decay: ControlSignal = 1000): AudioSignal {
        const reverb = new Reverb(toNumber(decay)/1000);
        assignOrConnect(reverb.wet, wet);
        node.connect(reverb);

        onDisposeFns.update((fns) => [...fns, () => reverb.dispose()]);

        return reverb;
    }
    
    delay(node: AudioSignal, wet: ControlSignal = 0.5, delayTime: ControlSignal = 0.5, feedback: ControlSignal = 0.5): AudioSignal {
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
    }
    dist(node: AudioSignal, wet: ControlSignal = 0.5, distortion: ControlSignal = 0.5): AudioSignal {
        const dist = new Distortion(toNumber(distortion));
        assignOrConnect(dist.wet, wet);
        node.connect(dist);

        onDisposeFns.update((fns) => [...fns, () => dist.dispose()]);

        return dist;
    }
    chorus(node: AudioSignal, wet: ControlSignal = 0.5, frequency: ControlSignal = 1, feedback: ControlSignal = 0.005, depth: ControlSignal = 0.7): AudioSignal {
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

    /** Filters */
    hpf(node: AudioSignal, frequency: ControlSignal = 1000, q: ControlSignal = 1, rolloff: FilterRollOff = -12): AudioSignal {
        return makeFilter(node, 'highpass', frequency, q, rolloff);
    }
    lpf(node: AudioSignal, frequency: ControlSignal = 1000, q: ControlSignal = 1, rolloff: FilterRollOff = -12): AudioSignal {
        return makeFilter(node, 'lowpass', frequency, q, rolloff);
    }
    bpf(node: AudioSignal, frequency: ControlSignal = 1000, q: ControlSignal = 1, rolloff: FilterRollOff = -12): AudioSignal {
        return makeFilter(node, 'bandpass', frequency, q, rolloff);
    }
    fbf(node: AudioSignal, delayTime: ControlSignal = 0.5, resonance: ControlSignal = 0.5): AudioSignal {
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

    /** Metering */
    follow(node: AudioSignal, smoothing: ControlSignal = 0.01): ControlSignal {
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
    smooth(...args: Parameters<Library['follow']>): ControlSignal {
        return this.follow(...args);
    }

    /** Recording */
    loop(
        node: AudioSignal, 
        gain: ControlSignal = 0, // record volume
        length: ControlSignal = 4, // length of loop
        rate: ControlSignal = 1, // playback rate
        clear: ControlSignal = 0 // clear loop if value === 1
    ): AudioSignal {
        const output = new Gain(1);
        const input = new Gain(0);
        const looper = new Looper();
        
        node.connect(output);
        node.connect(input);
        input.connect(looper.input);
        looper.connect(output);
        
        // set a flag so that further downstream it knows to smooth the gain
        gain = toControlSignal(gain);
        gain._smooth = true

        // connect gain controls
        assignOrConnect(input.gain, gain);

        // prepare length control
        const lengthSignal = toControlSignal(length);
        let cancelLength: () => void;

        const clearSignal = toControlSignal(clear);
        let cancelClear: () => void;

        const rateSignal = toControlSignal(rate);
        let cancelRate: () => void;

        // wait for device to load
        setTimeout(() => {
            // start recording
            looper.record(1,0)
            
            // listen to length signal
            cancelLength = pollSignal(lengthSignal, (value, time) => {
                looper.length((60 / getTransport().bpm.value) * 1000 * value, time);
            });

            // listen to rate signal
            cancelRate = pollSignal(rateSignal, (value, time) => {
                looper.rate(value, time);
            });
            
            // listen to clear signal
            cancelClear = pollSignal(
                clearSignal, 
                (value, time) => value === 1 && looper.clear(time)
            );
        }, 1000);

        getTransport().on('start', (time) => {
            looper.start(time);
            looper.output.gain.rampTo(1, 0.1, time);
        });
        getTransport().on('stop', (time) => {
            looper.output.gain.rampTo(0, 0.1);
            looper.clear(time + 0.2);
        });

        onDisposeFns.update((fns) => [...fns, () => {
            output.dispose();
            looper.dispose();
            
            // dispose of polled signals and loops
            cancelLength();
            lengthSignal.dispose?.();
            cancelClear();
            clearSignal.dispose?.();
            cancelRate();
            rateSignal.dispose?.();
            gain.dispose?.();
        }]);

        return output;
    }

    /** Routing */
    pan(node: AudioSignal, value: ControlSignal = 0.5): AudioSignal {
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
    }

    input(...channels: number[]): AudioSignal {
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
    }

    out(node: AudioSignal | number, ...channels: number[]): AudioSignal {
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
    }

    bus(nodeOrBus: AudioSignal | number, bus?: number): AudioSignal {
        // route from bus
        if (typeof nodeOrBus === 'number') {
            const i = nodeOrBus;
            const delay = new Delay(0.01); // prevent feedback loop
            this.busses[i].connect(delay);
            onDisposeFns.update((fns) => [...fns, () => delay.dispose()]);
            return delay;
        // route to bus
        } else {
            const node = nodeOrBus as AudioSignal;
            node.connect(this.busses[bus || 0]);
            return node
        }
    }

    stack(...nodes: AudioSignal[]): AudioSignal {
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