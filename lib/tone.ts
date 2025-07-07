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

type AudioSource = Oscillator | FMOscillator | AMOscillator | PWMOscillator | Gain;
type ControlSource = number | Signal | LFO | Envelope

// HELPERS
function assignOrConnect(target: Signal<any> | Param<any>, value: ControlSource) {
    if (value === undefined) return;
    value instanceof LFO || value instanceof Signal || value instanceof Envelope
        ? value.connect(target)
        : (target as Signal | AudioParam).value = value;
}

function toNumber(value: ControlSource): number {
    return typeof value === 'number' ? value : (value as Signal).value;
}

const makeOsc = (type: ToneOscillatorType, freq: ControlSource = 220): AudioSource => {
    const osc = new Oscillator(220, type).start()
    assignOrConnect(osc.frequency, freq)
    return osc
}

const makeLfo = (type: ToneOscillatorType, frequency: ControlSource, min: number = 0, max: number = 1): LFO => {
    const lfo = new LFO({min, max, type}).start()
    assignOrConnect(lfo.frequency, frequency)
    return lfo
}

const makeFm = (
    frequency: ControlSource, 
    harmonicity: ControlSource = 1, modulationIndex: ControlSource = 1,
    carrier: ToneOscillatorType = 'sine', 
    modulator: ToneOscillatorType = 'sine'
): FMOscillator => {
    const fmOsc = new FMOscillator(220, carrier, modulator).start();
    assignOrConnect(fmOsc.frequency, frequency);
    assignOrConnect(fmOsc.harmonicity, harmonicity);
    assignOrConnect(fmOsc.modulationIndex, modulationIndex);
    return fmOsc;
}

const makeAm = (
    frequency: ControlSource = 220, 
    harmonicity: ControlSource = 1, 
    carrier: ToneOscillatorType = 'sine',
    modulator: ToneOscillatorType = 'sine'
): AMOscillator => {
    const amOsc = new AMOscillator(220, carrier, modulator).start();
    assignOrConnect(amOsc.frequency, frequency);
    assignOrConnect(amOsc.harmonicity, harmonicity);
    return amOsc;
}

const makePwm = (
    frequency: ControlSource = 220, 
    modulationFrequency: ControlSource = 0.5,
): PWMOscillator => {
    const pwmOsc = new PWMOscillator(220).start();
    assignOrConnect(pwmOsc.frequency, frequency);
    assignOrConnect(pwmOsc.modulationFrequency, modulationFrequency);
    return pwmOsc;
}

// LIBRARY
export const library: Record<string, (...args: any[]) => any> = {
    value: (val: number) => val,
    // Signals
    sig: (value: number) => new Signal(value),
    
    
    // AudioSources
    sine: (freq: ControlSource = 220): AudioSource => makeOsc('sine', freq),
    tri: (freq: ControlSource = 220): AudioSource => makeOsc('triangle', freq),
    square: (freq: ControlSource = 220): AudioSource => makeOsc('square', freq),
    saw: (freq: ControlSource = 220): AudioSource => makeOsc('sawtooth', freq),
    fm: (freq: ControlSource = 220, harm: ControlSource = 1, modi: ControlSource = 1): AudioSource => makeFm(freq, harm, modi),
    fmsine: (freq: ControlSource = 220, harm: ControlSource = 1, modi: ControlSource = 1): AudioSource => makeFm(freq, harm, modi, 'sine'),
    fmtri: (freq: ControlSource = 220, harm: ControlSource = 1, modi: ControlSource = 1): AudioSource => makeFm(freq, harm, modi, 'triangle'),
    fmsquare: (freq: ControlSource = 220, harm: ControlSource = 1, modi: ControlSource = 1): AudioSource => makeFm(freq, harm, modi, 'square'),
    fmsaw: (freq: ControlSource = 220, harm: ControlSource = 1, modi: ControlSource = 1): AudioSource => makeFm(freq, harm, modi, 'sawtooth'),
    am: (freq: ControlSource = 220, harm: ControlSource = 1): AudioSource => makeAm(freq, harm),
    amsine: (freq: ControlSource = 220, harm: ControlSource = 1): AudioSource => makeAm(freq, harm, 'sine'),
    amtri: (freq: ControlSource = 220, harm: ControlSource = 1): AudioSource => makeAm(freq, harm, 'triangle'),
    amsquare: (freq: ControlSource = 220, harm: ControlSource = 1): AudioSource => makeAm(freq, harm, 'square'),
    amsaw: (freq: ControlSource = 220, harm: ControlSource = 1): AudioSource => makeAm(freq, harm, 'sawtooth'),
    pwm: (freq: ControlSource = 220, modFreq: ControlSource = 0.5): AudioSource => makePwm(freq, modFreq),
    
    // ControlSources
    lfo: (frequency: ControlSource, min: number = 0, max: number = 1) : LFO => makeLfo('sine', frequency, min, max),
    lfosine: (frequency: ControlSource, min: number = 0, max: number = 1) : LFO => makeLfo('sine', frequency, min, max),
    lfotri: (frequency: ControlSource, min: number = 0, max: number = 1) : LFO => makeLfo('triangle', frequency, min, max),
    lfosquare: (frequency: ControlSource, min: number = 0, max: number = 1) : LFO => makeLfo('square', frequency, min, max),
    lfosaw: (frequency: ControlSource, min: number = 0, max: number = 1) : LFO => makeLfo('sawtooth', frequency, min, max),
    env: (attack: number = 100, decay: number = 100, sustain: number = 0.5, release: number = 800): Envelope => {
        attack /= 1000;
        decay /= 1000;
        release /= 1000;
        return new Envelope({attack, decay, sustain, release});
    },

    // Modifiers
    amp: (node: AudioSource, value: ControlSource): Gain => {
        const gainNode = new Gain(1);
        assignOrConnect(gainNode.gain, value);
        node.connect(gainNode);
        return gainNode;
    },

    // Routing
    out: (node: AudioSource) => {
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