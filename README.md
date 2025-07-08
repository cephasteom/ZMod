# ZMod

## Basic Use
```js
const ZM = new ZMod()

// pass a line of the Zen Modular scripting language
ZM.set(`sine(100).amp(env(0.1,0.1,0.5,0.8)).out(0)`)
// start the patch
ZM.start()
// clear patch and dispose of all resources
ZM.clear()

// optionally, pass a string (with or without quotes) as the first argument of a node
ZM.set(`sine(sig(freq)).amp(env(e)).out(0)`)
// making the node controllable from outside the patch
console.log(ZM.inputs)
// returns {e: ƒ(), freq: ƒ()}

// interact with patch whilst it is running
ZM.inputs.e() // trigger envelope
ZM.inputs.f(1000, 1000) // ramp frequency to 1000Hz over 1s

// clear patch and dispose of all resources
ZM.clear()
```

## Core

### `value(val: number): number`

Returns the number provided.

---

## Signals

### Signal

`sig(value: number): Signal`

Creates a new signal with the specified value.

### Signal Operators 

Each of the following methods can be applied to a `Signal`, and passed one or more `number` arguments:

```ts
(operator: Signal, ...args: number[]): Signal
```

Available functions:

* `abs`
* `add`
* `multiply`
* `subtract`
* `greaterthan`
* `greaterthanzero`
* `negate`
* `gaintoaudio`
* `audiotogain`
* `pow`
* `scale`
* `scaleexp`

---

## Oscillators

### Basic Waveforms

```ts
(freq: ControlSignal = 220): AudioSignal
```

* `sine`
* `tri`
* `square`
* `saw`

### FM Oscillators

```ts
(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal
```

* `fm`
* `fmsine`
* `fmtri`
* `fmsquare`
* `fmsaw`

### AM Oscillators

```ts
(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal
```

* `am`
* `amsine`
* `amtri`
* `amsquare`
* `amsaw`

### Pulse & PWM

* `pulse(freq: ControlSignal, width: ControlSignal): AudioSignal`
* `pwm(freq: ControlSignal, modFreq: ControlSignal): AudioSignal`

### Fat Oscillators

```ts
(freq: ControlSignal = 220, spread: number = 10): AudioSignal
```

* `fat`
* `fatsine`
* `fattri`
* `fatsquare`
* `fatsaw`

---

## Noise

```ts
(): AudioSignal
```

* `white`
* `pink`
* `brown`

---

## LFOs

```ts
(frequency: ControlSignal, min: number = 0, max: number = 1): ControlSignal
```

* `lfo`
* `lfosine`
* `lfotri`
* `lfosquare`
* `lfosaw`

---

## Envelopes

### adsr
`adsr(attack?: number, decay?: number, sustain?: number, release?: number): Envelope`

Creates an ADSR envelope (all time values in milliseconds).

---

## Modifiers

### amp
`amp(node: AudioSignal, value: ControlSignal): Gain`

Applies gain (amplitude) modulation.

---

## Filters

### hpf
`hpf(node: AudioSignal, frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal`

High-pass filter.

### lpf
`lpf(node: AudioSignal, frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal`

Low-pass filter.

### bpf
`bpf(node: AudioSignal, frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal`

Band-pass filter.

### fbf
`fbf(node: AudioSignal, delayTime?: ControlSignal, resonance?: ControlSignal): AudioSignal`

Feedback comb filter.

---

## Effects

### reverb
`reverb(node: AudioSignal, wet?: ControlSignal, decay?: ControlSignal): AudioSignal`

Reverb effect.

### delat
`delay(node: AudioSignal, wet?: ControlSignal, delayTime?: ControlSignal, feedback?: ControlSignal): AudioSignal`

Feedback delay effect.

### dist
`dist(node: AudioSignal, wet?: ControlSignal, distortion?: ControlSignal): AudioSignal`

Distortion effect.

### chorus
`chorus(node: AudioSignal, wet?: ControlSignal, frequency?: ControlSignal, feedback?: ControlSignal, depth?: ControlSignal): AudioSignal`

Chorus effect.

---

## Routing

### pan
`pan(node: AudioSignal, value?: ControlSignal): AudioSignal`

Stereo panner.

### out
`out(node: AudioSignal): AudioSignal`

Connects the signal to the audio destination.

---
