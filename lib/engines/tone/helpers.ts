import { ControlSignal } from './tone';
import { Signal, Param, LFO, FilterRollOff, Envelope, Follower, Gain, Scale, getTransport, Time, Loop } from 'tone';

// Helpers
export function assignOrConnect(target: Signal<any> | Param<any>, value: ControlSignal): void {
    if (value === undefined) return;
    value instanceof LFO || value instanceof Signal || value instanceof Envelope || value instanceof Follower || value instanceof Gain || value instanceof Scale
        ? value.connect(target)
        : (target as Signal).value = value;
}

export function pollSignal(signal: Signal<any>, callback: (value: number, time: number) => void): () => void {
    const loop = new Loop((time) => callback(signal.value, time), '16n').start(0);
    return () => {
        loop.stop();
        loop.dispose();
    };
}

export function toNumber(value: ControlSignal): number {
    return typeof value === 'number' 
        ? value 
        : (value instanceof Signal ? value.value : 0);
}

export function toControlSignal(value: ControlSignal): Signal {
    return typeof value === 'number' 
        ? new Signal(value)
        : value 
}

export function toRolloff(value: ControlSignal): FilterRollOff {
    const rolloff = toNumber(value);
    return [-12, -24, -48, -96].includes(rolloff)
        ? rolloff as FilterRollOff
        : -12; // Default to -12 if not a valid rolloff
}

export function nearestTimeStringFromHz(freqHz: number, bpm: number = getTransport().bpm.value) {
    if (freqHz <= 0) return null;

    const timeValues = [
        "1n", "2n", "4n", "8n", "16n", "32n", "64n",
        "1m", "2m", "4m", "8m", "16m", "32m", "64m", "128m"
    ];

    // Convert each time value to its equivalent frequency
    const freqFromTime = (timeStr: string) => 1 / Time(timeStr).toSeconds();

    let closest = timeValues[0];
    let smallestDiff = Infinity;

    for (let t of timeValues) {
        const f = freqFromTime(t);
        const diff = Math.abs(f - freqHz);  
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = t;
        }
    }

    return closest;
}