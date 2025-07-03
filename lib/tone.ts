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
type MaybeSignal = number | Signal | LFO;

const makeOsc = (type: ToneOscillatorType, freq: MaybeSignal) => {
    const osc = new Oscillator(440, type).start()
    freq instanceof LFO || freq instanceof Signal
        ? freq.connect(osc.frequency)
        : osc.frequency.value = freq
    return osc
}

const assignOrConnect = (target: Signal<any> | AudioParam, value: MaybeSignal) => {
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
    fm: (
        frequency: MaybeSignal = 220, 
        harmonicity: MaybeSignal = 1, 
        modulationIndex: MaybeSignal = 1
    ) => {
        const fmOsc = new FMOscillator(440, 'sine', 'sine').start()
        assignOrConnect(fmOsc.frequency, frequency)
        assignOrConnect(fmOsc.harmonicity, harmonicity)
        assignOrConnect(fmOsc.modulationIndex, modulationIndex)
        return fmOsc
    },
    am: (
        frequency: MaybeSignal = 220, 
        harmonicity: MaybeSignal = 1
    ) => {
        const amOsc = new AMOscillator(440, 'sine', 'sine').start()
        assignOrConnect(amOsc.frequency, frequency)
        assignOrConnect(amOsc.harmonicity, harmonicity)
        return amOsc
    },
    pwm: (
        frequency: MaybeSignal = 220, 
        modulationFrequency: MaybeSignal = 0.5
    ) => {
        const pwmOsc = new PWMOscillator(220, 0.5).start()
        assignOrConnect(pwmOsc.frequency, frequency)
        assignOrConnect(pwmOsc.modulationFrequency, modulationFrequency)
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