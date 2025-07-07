import { 
    Merge, 
    getDestination,
    Limiter,
} from 'tone'

// Setup
const limiter = new Limiter({threshold: -20})

export const destination = getDestination()

destination.channelCount = destination.maxChannelCount
destination.channelCount === 2 && destination.chain(limiter)
const allChannels = new Merge({channels: destination.maxChannelCount})
allChannels.connect(destination)

