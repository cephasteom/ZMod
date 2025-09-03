import { makeNoise } from "../factories";
import { AudioSignal } from "../tone";

export const noise = {
    white: (rate: 1): AudioSignal => makeNoise('white', rate),
    pink: (rate: 1): AudioSignal => makeNoise('pink', rate),
    brown: (rate: 1): AudioSignal => makeNoise('brown', rate),
}