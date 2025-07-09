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
    Follower
} from 'tone';

export type AudioSignal = Oscillator | FMOscillator | AMOscillator | PWMOscillator | PulseOscillator | FatOscillator | Noise | Gain | Filter | Panner | Reverb | Delay | Distortion | Chorus;
export type ControlSignal = number | Signal | LFO | Envelope | Follower | Param | Meter | Follower;
export interface Patch {
    inputs: Record<string, (...args: any[]) => void>
    dispose: () => void
}