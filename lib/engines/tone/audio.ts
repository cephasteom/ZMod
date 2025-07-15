import { 
    Merge, 
    getDestination,
} from 'tone'

// Output
const destination = getDestination()
destination.channelCount = destination.maxChannelCount

// Create a multichannel output with an manay channels as the destination supports
export const outputs = new Merge({channels: destination.channelCount})
outputs.connect(destination)

// Create a bank of busses for internal routing
export const busses = (new Merge({channels: 32}))