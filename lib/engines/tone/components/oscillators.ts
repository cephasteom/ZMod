import { PulseOscillator } from "tone";
import { makeAm, makeFat, makeFm, makeOsc, makePwm } from "../factories";
import { AudioSignal, ControlSignal } from "../tone";
import { assignOrConnect, toNumber } from "../helpers";

export const oscillators = {
    sine: (freq: ControlSignal = 220): AudioSignal => makeOsc('sine', freq),
    tri: (freq: ControlSignal = 220): AudioSignal => makeOsc('triangle', freq),
    square: (freq: ControlSignal = 220): AudioSignal => makeOsc('square', freq),
    saw: (freq: ControlSignal = 220): AudioSignal => makeOsc('sawtooth', freq),
    
    fm: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi),
    fmsine: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'sine'),
    fmtri: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'triangle'),
    fmsquare: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'square'),
    fmsaw: (freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal => makeFm(freq, harm, modi, 'sawtooth'),
    
    am: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm),
    amsine: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'sine'),
    amtri: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'triangle'),
    amsquare: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'square'),
    amsaw: (freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal => makeAm(freq, harm, 'sawtooth'),
    
    pulse: (freq: ControlSignal = 220, width: ControlSignal = 0.5): AudioSignal => {
        const osc = new PulseOscillator(220, toNumber(width)).start();
        assignOrConnect(osc.frequency, freq);
        assignOrConnect(osc.width, width);
        osc.volume.value = -Infinity
        osc.volume.rampTo(-12, 0.05); // Set initial volume to -12dB
        return osc;
    },
    pwm: (freq: ControlSignal = 220, modFreq: ControlSignal = 0.5): AudioSignal => makePwm(freq, modFreq),

    fat: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread),
    fatsine: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'sine'),
    fattri: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'triangle'),
    fatsquare: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'square'),
    fatsaw: (freq: ControlSignal = 220, spread: number = 10): AudioSignal => makeFat(freq, spread, 'sawtooth'),
}