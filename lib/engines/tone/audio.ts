import { 
    Merge, 
    getDestination,
    Limiter
} from 'tone'

const limiter = new Limiter({threshold: -20})

// Output
const destination = getDestination()
destination.channelCount = destination.maxChannelCount
destination.channelCount === 2 && destination.chain(limiter)

export const outputDevice = (new Merge({channels: destination.maxChannelCount})).connect(destination)

