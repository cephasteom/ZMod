import { 
    Merge, 
    Signal,
    getDestination,
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator,
    Limiter,
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
type MaybeSignal = number | Signal | LFO | undefined;

const makeOsc = (type: ToneOscillatorType, freq: MaybeSignal) => {
    if (freq === undefined) freq = 440; // Default frequency
    const osc = new Oscillator(440, type).start()
    freq instanceof LFO || freq instanceof Signal
        ? freq.connect(osc.frequency)
        : osc.frequency.value = freq
    return osc
}

const assignOrConnect = (target: Signal<any> | AudioParam, value: MaybeSignal) => {
    if (value === undefined) return;
    value instanceof LFO || value instanceof Signal
        ? value.connect(target)
        : (target as Signal | AudioParam).value = value;
}

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
    fm: (...args: MaybeSignal[]) => {
        const fmOsc = new FMOscillator(220, 'sine', 'sine').start();
        ['frequency', 'harmonicity', 'modulationIndex'].forEach((param, index) => {
            assignOrConnect((fmOsc as any)[param], args[index])
        })
        return fmOsc
    },
    am: (...args: MaybeSignal[]) => {
        const amOsc = new AMOscillator(220, 'sine', 'sine').start();
        ['frequency', 'harmonicity'].forEach((param, index) => {
            assignOrConnect((amOsc as any)[param], args[index])
        })
        return amOsc
    },
    pwm: (...args: MaybeSignal[]) => {
        const pwmOsc = new PWMOscillator(220, 0.5).start();
        ['frequency', 'modulationFrequency'].forEach((param, index) => {
            assignOrConnect((pwmOsc as any)[param], args[index])
        })
        return pwmOsc
    },
    
    // LFO
    lfo: (frequency: number | Signal, min: number = 0, max: number = 1) => {
        const lfo = new LFO(1, min, max).start()
        assignOrConnect(lfo.frequency, frequency)
        return lfo
    },
    out: (node: any) => node.toDestination(),
}

export const compile = (code: string): void => {
    return new Function(
        ...Object.keys(library), 
        code
    )(...Object.values(library))
}