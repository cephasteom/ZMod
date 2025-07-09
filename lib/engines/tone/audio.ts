import { 
    Merge, 
    getDestination,
    Limiter,
    Split,
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