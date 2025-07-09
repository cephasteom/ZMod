import { 
    Merge, 
    getDestination,
} from 'tone'

export const destination = getDestination()
export const channels = (new Merge({channels: destination.maxChannelCount})).connect(destination)

