import { 
    Oscillator, LFO,
    FMOscillator, AMOscillator, PWMOscillator, FatOscillator, 
    Filter,
    type ToneOscillatorType,
    Noise,
    getTransport,
    immediate
} from 'tone'

import { onDisposeFns } from './stores';

import { ControlSignal, AudioSignal } from './tone';
import { assignOrConnect, toNumber, toRolloff } from './helpers';

export function makeOsc(type: ToneOscillatorType, freq: ControlSignal = 220): AudioSignal {
    const osc = new Oscillator(220, type).start();
    assignOrConnect(osc.frequency, freq)
    osc.volume.value = -Infinity
    osc.volume.rampTo(-12, 0.05); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc
}

export function makeFm(
    frequency: ControlSignal, 
    harmonicity: ControlSignal = 1, modulationIndex: ControlSignal = 1,
    carrier: ToneOscillatorType = 'sine', 
    modulator: ToneOscillatorType = 'sine'
): AudioSignal {
    const osc = new FMOscillator(220, carrier, modulator).start();
    assignOrConnect(osc.frequency, frequency);
    assignOrConnect(osc.harmonicity, harmonicity);
    assignOrConnect(osc.modulationIndex, modulationIndex);
    osc.volume.value = -Infinity
    osc.volume.rampTo(-12, 0.05); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc;
}

export function makeAm(
    frequency: ControlSignal = 220, 
    harmonicity: ControlSignal = 1, 
    carrier: ToneOscillatorType = 'sine',
    modulator: ToneOscillatorType = 'sine'
): AudioSignal {
    const osc = new AMOscillator(220, carrier, modulator).start();
    assignOrConnect(osc.frequency, frequency);
    assignOrConnect(osc.harmonicity, harmonicity);
    osc.volume.value = -Infinity
    osc.volume.rampTo(-12, 0.05); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc;
}

export function makePwm(
    frequency: ControlSignal = 220, 
    modulationFrequency: ControlSignal = 0.5,
): AudioSignal {
    const osc = new PWMOscillator(220).start();
    assignOrConnect(osc.frequency, frequency);
    assignOrConnect(osc.modulationFrequency, modulationFrequency);
    osc.volume.value = -Infinity
    osc.volume.rampTo(-12, 0.05); // Set initial volume to -12dB
    onDisposeFns.update((fns) => [...fns, () => osc.dispose()]);
    return osc;
}

export function makeFat(
    frequency: ControlSignal = 220, 
    spread: ControlSignal = 10, // spread in cents
    type: ToneOscillatorType = 'sine'
): AudioSignal {
    const osc = new FatOscillator(220, type, toNumber(spread)).start();
    assignOrConnect(osc.frequency, frequency);
    osc.volume.value = -Infinity
    osc.volume.rampTo(-12, 0.05); // Set initial volume to -12dB
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
): ControlSignal {
    const lfo = new LFO({min: toNumber(min), max: toNumber(max), type}).sync()
    toNumber(frequency) < 1  
        ? lfo.unsync().start("0.05")
        : lfo.sync().start("0.05")
    assignOrConnect(lfo.frequency, frequency)
    onDisposeFns.update((fns) => [...fns, () => lfo.dispose()]);
    return lfo
}

export function makeNoise(
    type: 'white' | 'pink' | 'brown' = 'white', 
    rate: ControlSignal = 1,
): AudioSignal {
    const transport = getTransport();
    const noise = new Noise({type, playbackRate: toNumber(rate)}).start("0.05");
    
    const stopNoise = () => noise.volume.rampTo(-Infinity, 0.1);
    const startNoise = () => noise.volume.rampTo(0, 0.1);
    transport.on('stop', stopNoise);
    transport.on('start', startNoise);
    
    // @ts-ignore
    assignOrConnect(noise._source.playbackRate, rate);
    
    onDisposeFns.update((fns) => [
        ...fns, 
        () => noise.dispose(),
        () => transport.off('stop', stopNoise),
        () => transport.off('start', startNoise)
    ]);
    return noise;
}