import { 
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator, FatOscillator, 
    Filter,
    type ToneOscillatorType
} from 'tone'

import { ControlSignal, AudioSignal } from './tone';
import { assignOrConnect, toNumber, toRolloff } from './helpers';

export function makeOsc(type: ToneOscillatorType, freq: ControlSignal = 220): AudioSignal {
    const osc = new Oscillator(220, type).sync().start("0.1")
    assignOrConnect(osc.frequency, freq)
    return osc
}

export function makeFm(
    frequency: ControlSignal, 
    harmonicity: ControlSignal = 1, modulationIndex: ControlSignal = 1,
    carrier: ToneOscillatorType = 'sine', 
    modulator: ToneOscillatorType = 'sine'
): AudioSignal {
    const fmOsc = new FMOscillator(220, carrier, modulator).sync().start("0.1");
    assignOrConnect(fmOsc.frequency, frequency);
    assignOrConnect(fmOsc.harmonicity, harmonicity);
    assignOrConnect(fmOsc.modulationIndex, modulationIndex);
    return fmOsc;
}

export function makeAm(
    frequency: ControlSignal = 220, 
    harmonicity: ControlSignal = 1, 
    carrier: ToneOscillatorType = 'sine',
    modulator: ToneOscillatorType = 'sine'
): AudioSignal {
    const amOsc = new AMOscillator(220, carrier, modulator).sync().start("0.1");
    assignOrConnect(amOsc.frequency, frequency);
    assignOrConnect(amOsc.harmonicity, harmonicity);
    return amOsc;
}

export function makePwm(
    frequency: ControlSignal = 220, 
    modulationFrequency: ControlSignal = 0.5,
): AudioSignal {
    const pwmOsc = new PWMOscillator(220).sync().start("0.1");
    assignOrConnect(pwmOsc.frequency, frequency);
    assignOrConnect(pwmOsc.modulationFrequency, modulationFrequency);
    return pwmOsc;
}

export function makeFat(
    frequency: ControlSignal = 220, 
    spread: ControlSignal = 10, // spread in cents
    type: ToneOscillatorType = 'sine'
): AudioSignal {
    const osc = new FatOscillator(220, type, toNumber(spread)).sync().start("0.1");
    assignOrConnect(osc.frequency, frequency);
    return osc;
}

export function makeFilter(
    node: AudioSignal, 
    type: 'lowpass' | 'highpass' | 'bandpass' = 'lowpass',
    frequency: ControlSignal = 1000, 
    q: ControlSignal = 1,
    rolloff: ControlSignal = -12
): AudioSignal {
    const filter = new Filter(1000, type);
    filter.set({rolloff: toRolloff(rolloff), Q: toNumber(q)});
    assignOrConnect(filter.frequency, frequency);
    assignOrConnect(filter.Q, q);
    node.connect(filter);
    return filter;
}

export function makeLfo(
    type: ToneOscillatorType, 
    frequency: ControlSignal = 0.5, 
    min: ControlSignal = 0, 
    max: ControlSignal = 1
): ControlSignal {
    const lfo = new LFO({min: toNumber(min), max: toNumber(max), type}).sync().start("0.1")
    assignOrConnect(lfo.frequency, frequency)
    return lfo
}