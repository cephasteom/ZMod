import {
    Signal, Param,
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator, FatOscillator,
    PulseOscillator, Noise,
    Gain, Envelope, Panner,
    Filter,
    type ToneOscillatorType, type FilterRollOff
} from 'tone';

export type AudioSignal = Oscillator | FMOscillator | AMOscillator | PWMOscillator | PulseOscillator | FatOscillator | Noise | Gain | Filter | Panner;
export type ControlSignal = number | Signal | LFO | Envelope
export interface Patch {
    inputs: Record<string, (...args: any[]) => void>
    dispose: () => void
}