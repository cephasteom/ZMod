import { 
    Merge, 
    Signal,
    getDestination,
    Oscillator, LFO,
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

const makeOsc = (type: Oscillator['type'], freq: number | LFO) => {
    const osc = new Oscillator(440, type).start()
    freq instanceof LFO
        ? freq.connect(osc.frequency)
        : osc.frequency.value = freq
    return osc
}

const sig = (value: number) => value
const sine = (freq: number | LFO) => makeOsc('sine', freq)
const tri = (freq: number | LFO) => makeOsc('triangle', freq)
const square = (freq: number | LFO) => makeOsc('square', freq)
const saw = (freq: number | LFO) => makeOsc('sawtooth', freq)
const lfo = (freq: number, min: number, max: number) => new LFO(freq, min, max).start()
const out = (block: any) => block.toDestination();

export const library = {
    sig,
    sine,
    square,
    saw,
    tri,
    lfo,
    out
}

export const compile = (code: string): void => {
    new Function(
        ...Object.keys(library), 
        code
    )(...Object.values(library))
}