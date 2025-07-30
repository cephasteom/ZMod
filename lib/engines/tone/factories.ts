import { 
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator, FatOscillator, 
    Filter,
    type ToneOscillatorType,
    Noise
} from 'tone'

import { onDisposeFns } from './stores';

import { ControlSignal, AudioSignal } from './tone';
import { assignOrConnect, toNumber, toRolloff } from './helpers';

export function makeOsc(type: ToneOscillatorType, freq: ControlSignal = 220): AudioSignal {
    const osc = new Oscillator(220, type).start("0.05")
    assignOrConnect(osc.frequency, freq)
    osc.volume.setValueAtTime(-12, 0); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc
}

export function makeFm(
    frequency: ControlSignal, 
    harmonicity: ControlSignal = 1, modulationIndex: ControlSignal = 1,
    carrier: ToneOscillatorType = 'sine', 
    modulator: ToneOscillatorType = 'sine'
): AudioSignal {
    const osc = new FMOscillator(220, carrier, modulator).start("0.05");
    assignOrConnect(osc.frequency, frequency);
    assignOrConnect(osc.harmonicity, harmonicity);
    assignOrConnect(osc.modulationIndex, modulationIndex);
    osc.volume.setValueAtTime(-12, 0); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc;
}

export function makeAm(
    frequency: ControlSignal = 220, 
    harmonicity: ControlSignal = 1, 
    carrier: ToneOscillatorType = 'sine',
    modulator: ToneOscillatorType = 'sine'
): AudioSignal {
    const osc = new AMOscillator(220, carrier, modulator).start("0.05");
    assignOrConnect(osc.frequency, frequency);
    assignOrConnect(osc.harmonicity, harmonicity);
    osc.volume.setValueAtTime(-12, 0); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc;
}

export function makePwm(
    frequency: ControlSignal = 220, 
    modulationFrequency: ControlSignal = 0.5,
): AudioSignal {
    const osc = new PWMOscillator(220).start("0.05");
    assignOrConnect(osc.frequency, frequency);
    assignOrConnect(osc.modulationFrequency, modulationFrequency);
    osc.volume.setValueAtTime(-12, 0); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc;
}

export function makeFat(
    frequency: ControlSignal = 220, 
    spread: ControlSignal = 10, // spread in cents
    type: ToneOscillatorType = 'sine'
): AudioSignal {
    const osc = new FatOscillator(220, type, toNumber(spread)).start("0.05");
    assignOrConnect(osc.frequency, frequency);
    osc.volume.setValueAtTime(-12, 0); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
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
    onDisposeFns.update((fns) => [...fns, () => filter.dispose()]);
    return filter;
}

export function makeLfo(
    type: ToneOscillatorType = 'sine', 
    frequency: ControlSignal = 0.5, 
    min: ControlSignal = 0, 
    max: ControlSignal = 1,
    synced: boolean = true
): ControlSignal {
    const lfo = new LFO({min: toNumber(min), max: toNumber(max), type}).start("0.05")
    assignOrConnect(lfo.frequency, frequency)
    synced && lfo.sync()
    onDisposeFns.update((fns) => [...fns, () => lfo.dispose()]);
    return lfo
}

export function makeNoise(
    type: 'white' | 'pink' | 'brown' = 'white', 
    playbackRate: number = 1,
): AudioSignal {
    const noise = new Noise({type, playbackRate}).start(0);
    onDisposeFns.update((fns) => [...fns, () => noise.dispose()]);
    return noise;
}