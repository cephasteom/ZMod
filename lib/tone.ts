import { 
    Merge, 
    Signal,
    getDestination,
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator,
    Limiter
} from 'tone'

// Limiter
const limiter = new Limiter({threshold: -20})

// Output
const destination = getDestination()
destination.channelCount = destination.maxChannelCount
destination.channelCount === 2 && destination.chain(limiter)

export const allChannels = new Merge({channels: destination.maxChannelCount})
allChannels.connect(destination)

const makeOsc = (type: Oscillator['type'], freq: number | Signal | LFO) => {
    const osc = new Oscillator(440, type).start()
    freq instanceof LFO || freq instanceof Signal
        ? freq.connect(osc.frequency)
        : osc.frequency.value = freq
    return osc
}

export const library = {
    value: (val: number) => val,
    sig: (value: number) => new Signal(value),
    sine: (freq: number | Signal | LFO) => makeOsc('sine', freq),
    tri: (freq: number | Signal | LFO) => makeOsc('triangle', freq),
    square: (freq: number | Signal | LFO) => makeOsc('square', freq),
    saw: (freq: number | Signal | LFO) => makeOsc('sawtooth', freq),
    fm: (
        freq: number | Signal | LFO = 220, 
        harm: number | Signal | LFO = 1, 
        modi: number | Signal | LFO = 1
    ) => {
        const fmOsc = new FMOscillator(440, 'sine', 'sine').start()
        freq instanceof LFO || freq instanceof Signal
            ? freq.connect(fmOsc.frequency)
            : fmOsc.frequency.value = freq
        harm instanceof LFO || harm instanceof Signal
            ? harm.connect(fmOsc.harmonicity)
            : fmOsc.harmonicity.value = harm
        modi instanceof LFO || modi instanceof Signal
            ? modi.connect(fmOsc.modulationIndex)
            : fmOsc.modulationIndex.value = modi
        return fmOsc
    },
    am: (
        freq: number | Signal | LFO = 220, 
        harm: number | Signal | LFO = 1
    ) => {
        const amOsc = new AMOscillator(440, 'sine', 'sine').start()
        freq instanceof LFO || freq instanceof Signal
            ? freq.connect(amOsc.frequency)
            : amOsc.frequency.value = freq
        harm instanceof LFO || harm instanceof Signal
            ? harm.connect(amOsc.harmonicity)
            : amOsc.harmonicity.value = harm
        return amOsc
    },
    pwm: (
        freq: number | Signal | LFO = 220, 
        width: number | Signal | LFO = 0.5
    ) => {
        const pwmOsc = new PWMOscillator(220, 0.5).start()
        freq instanceof LFO || freq instanceof Signal
            ? freq.connect(pwmOsc.frequency)
            : pwmOsc.frequency.value = freq
        width instanceof LFO || width instanceof Signal
            ? width.connect(pwmOsc.modulationFrequency)
            : pwmOsc.modulationFrequency.value = width
        return pwmOsc
    },
    lfo: (freq: number | Signal, min: number = 0, max: number = 1) => {
        const lfo = new LFO(1, min, max).start()
        freq instanceof Signal
            ? freq.connect(lfo.frequency)
            : lfo.frequency.value = freq
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