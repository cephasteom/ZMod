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
type MaybeSignal = number | Signal | LFO | Envelope | undefined;

const makeOutput = (node: Oscillator | FMOscillator | AMOscillator | PWMOscillator): Gain => {
    const gain = new Gain(1)
    node.connect(gain)
    return gain
}

const makeOsc = (type: ToneOscillatorType, freq: MaybeSignal = 220): Gain => {
    const osc = new Oscillator(220, type).start()
    assignOrConnect(osc.frequency, freq)
    return makeOutput(osc)
}

function assignOrConnect(target: Signal<any> | Param<any>, value: MaybeSignal) {
    if (value === undefined) return;
    value instanceof LFO || value instanceof Signal || value instanceof Envelope
        ? value.connect(target)
        : (target as Signal | AudioParam).value = value;
}

/**
 * TODO: maybe this should be a class?
 * This is a collection of inputs that are exposed by the compiled code.
 * It allows you to interact with the audio graph from outside the code.
 */
let inputs: Record<string, Signal | Envelope> = {}

// LIBRARY
export const library = {
    value: (val: number) => val,
    sig: (value: number) => new Signal(value),
    
    // Base Oscillators
    ...Object.fromEntries(['sine', 'triangle', 'square', 'sawtooth']
        .map(type => [
            type,
            (freq: MaybeSignal) => makeOsc(type as ToneOscillatorType, freq)
        ])),
    
    // Complex Oscillators
    fm: (...args: MaybeSignal[]): Gain => {
        const fmOsc = new FMOscillator(220, 'sine', 'sine').start();
        ['frequency', 'harmonicity', 'modulationIndex'].forEach((param, index) => {
            assignOrConnect((fmOsc as any)[param], args[index])
        })
        return makeOutput(fmOsc)
    },
    am: (...args: MaybeSignal[]): Gain => {
        const amOsc = new AMOscillator(220, 'sine', 'sine').start();
        ['frequency', 'harmonicity'].forEach((param, index) => {
            assignOrConnect((amOsc as any)[param], args[index])
        })
        return makeOutput(amOsc)
    },
    pwm: (...args: MaybeSignal[]): Gain => {
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

    env: (attack: number = 0.1, decay: number = 0.2, sustain: number = 0.5, release: number = 0.8): Envelope => {
        const env = new Envelope({attack, decay, sustain, release});
        // add to the inputs so it can be accessed later
        inputs['env'] = env;
        return env
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

    out: (node: any) => node?.toDestination(),
}

export const compile = (code: string): { inputs: Record<string, any>, output: Gain } => {
    inputs = {}
    const output = new Function(
        ...Object.keys(library), 
        code
    )(...Object.values(library))
    
    return { inputs, output };
}