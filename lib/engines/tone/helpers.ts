import { ControlSignal } from './tone';
import { Signal, Param, LFO, FilterRollOff, Envelope, Follower } from 'tone';

// Helpers
export function assignOrConnect(target: Signal<any> | Param<any>, value: ControlSignal): void {
    if (value === undefined) return;
    value instanceof LFO || value instanceof Signal || value instanceof Envelope || value instanceof Follower
        ? value.connect(target)
        : (target as Signal | AudioParam).value = value;
}

export function toNumber(value: ControlSignal): number {
    return typeof value === 'number' ? value : (value instanceof Signal ? value.value : 0);
}   

export function toRolloff(value: ControlSignal): FilterRollOff {
    const rolloff = toNumber(value);
    return [-12, -24, -48, -96].includes(rolloff)
        ? rolloff as FilterRollOff
        : -12; // Default to -12 if not a valid rolloff
}