import {
    Signal, Param,
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator, FatOscillator,
    PulseOscillator, Noise,
    Gain, Envelope, Panner,
    Filter,
    type ToneOscillatorType, type FilterRollOff,
    Reverb,
    Distortion,
    Follower,
    Scale
} from 'tone';

export type AudioSignal = Oscillator | FMOscillator | AMOscillator | PWMOscillator | PulseOscillator | FatOscillator | Noise | Gain | Filter | Panner | Reverb | Delay | Distortion | Chorus;
export type ControlSignal = number | Signal | LFO | Envelope | Follower | Param | Meter | Follower | Scale;
export interface Patch {
    inputs: Record<string, (...args: any[]) => AudioSignal>
    output?: AudioSignal | Gain;
    dispose: (time: number) => void
}