import { 
    Merge, 
    getDestination,
    Limiter,
    Split,
    Oscillator,
    Gain,
    LFO,
    Delay
} from 'tone'

const limiter = new Limiter({threshold: -20})

// Output
const destination = getDestination()
destination.channelCount = destination.maxChannelCount
destination.channelCount === 2 && destination.chain(limiter)

// Create a bank of output channels and connect them to the destination
export const outputChannels = (new Merge({channels: destination.maxChannelCount})).connect(destination)

// Split the output channels so they can be rerouted back into the graph
export const feedbackChannels = new Split({channels: destination.maxChannelCount})
outputChannels.connect(feedbackChannels)

const gain = new Gain(1)
const lfo = new LFO({min: 0, max: 1, type: 'sine'}).start()
lfo.frequency.value = 0.5 // 0.5 Hz
lfo.connect(gain.gain)

new Oscillator({
    frequency: 100,
    type: 'sine',
}).connect(gain).start()

gain.connect(outputChannels,0,0)

// const fb = new Gain(1);
// feedbackChannels.connect(fb,0,0);

// const delay = new Delay(0.05); // 50 ms delay
// fb.connect(delay);
// delay.connect(outputChannels, 0, 1);