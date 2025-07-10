import { 
    Merge, 
    getDestination,
    Split,
} from 'tone'

// Output
const destination = getDestination()
destination.channelCount = destination.maxChannelCount

// Split the output channels
export const outputs = new Split({channels: 32})

// Create a bank of output channels and connect them to the destination
export const outputBus = (new Merge({channels: 32}))
outputBus.connect(destination) // TODO: move this to the class
outputBus.connect(outputs) // connect to outputs split so that we can route them back into the graph