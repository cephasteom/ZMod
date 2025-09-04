import { makeLfo } from "../factories";
import { ControlSignal } from "../tone";

export const lfos = {
    lfo: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sine', frequency, min, max),
    lfosine: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sine', frequency, min, max),
    lfotri: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('triangle', frequency, min, max),
    lfosquare: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('square', frequency, min, max),
    lfosaw: (frequency: ControlSignal, min: number = 0, max: number = 1) : ControlSignal => makeLfo('sawtooth', frequency, min, max),
}