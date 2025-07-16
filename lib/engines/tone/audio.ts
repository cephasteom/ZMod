import { 
    Merge, 
    getDestination,
} from 'tone'

// Output
export const destination = getDestination()
destination.channelCount = destination.maxChannelCount

// Create a multichannel output
export const outputs = new Merge({channels: 32})

// Create a bank of busses for internal routing
export const busses = (new Merge({channels: 32}))