# ZMod

## Basic Usage
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

## Signals

### Signal

`sig(value: number): ControlSignal`

Creates a new `ControlSignal` with the specified value.

### Signal Operators 

Each of the following methods can be applied to a `ControlSignal`, and passed one or more `number` arguments:

```ts
ControlSignal.fn(...args: number[]): ControlSignal
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

```ts
sine(lfo(0.5,100,200).multiply(2)).out()
```
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

```ts
sine(100).out()
```

### FM Oscillators

```ts
(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal
```

* `fm`
* `fmsine`
* `fmtri`
* `fmsquare`
* `fmsaw`

```ts
fmsaw(
    100,
    lfosaw(0.5,0.5,10),
    lfosine(0.25,1,10)
).out()
```

### AM Oscillators

```ts
(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal
```

* `am`
* `amsine`
* `amtri`
* `amsquare`
* `amsaw`

```ts
fmsaw(
    lfosaw(0.125,100,1000),
    lfosaw(0.5,0.5,10),
    lfosine(0.25,1,10)
).out()
```

### Pulse & PWM

* `pulse(freq: ControlSignal, width: ControlSignal): AudioSignal`
* `pwm(freq: ControlSignal, modFreq: ControlSignal): AudioSignal`

```ts
pwm(100, lfo(0.125,0.5,2)).out()
```

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
`adsr(attack?: number, decay?: number, sustain?: number, release?: number): ControlSignal`

Creates a `ControlSignal` controlled by an adsr envelope (all time values in milliseconds).

```ts
sine(100).amp(env()).out()
```
Envelopes must be triggered from outside the patch. See [Basic Usage](#basic-usage) above.
---

## Modifiers

### amp
`AudioSignal.amp(value: ControlSignal): Gain`

Applies gain (amplitude) modulation.

```ts
sine(100).amp(lfo()).out()
```

---

## Filters
```ts
saw(100).lpf(lfo(0.5,100,1000)).out()
```

### hpf
`AudioSignal.hpf(frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal`

High-pass filter.

### lpf
`AudioSignal.lpf(frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal`

Low-pass filter.

### bpf
`AudioSignal.bpf(frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal`

Band-pass filter.

### fbf
`AudioSignal.fbf(delayTime?: ControlSignal, resonance?: ControlSignal): AudioSignal`

Feedback comb filter.

---

## Effects

### reverb
`AudioSignal.reverb(wet?: ControlSignal, decay?: ControlSignal): AudioSignal`

Reverb effect.

### delay
`AudioSignal.delay(wet?: ControlSignal, delayTime?: ControlSignal, feedback?: ControlSignal): AudioSignal`

Feedback delay effect.

### dist
`AudioSignal.dist(wet?: ControlSignal, distortion?: ControlSignal): AudioSignal`

Distortion effect.

### chorus
`AudioSignal.chorus(wet?: ControlSignal, frequency?: ControlSignal, feedback?: ControlSignal, depth?: ControlSignal): AudioSignal`

Chorus effect.

---

## Routing

### pan
`AudioSignal.pan(value?: ControlSignal): AudioSignal`

Stereo panner. Values between -1 and 1.

```ts
fm(100).pan(lfo(0.5,-1,1)).out()
```

### out
`AudioSignal.out(output: number = 0): AudioSignal`

Connects the signal to the audio destination's given channel. You can route to any outputs that your sound device has. If you provide an invalid channel index, this will wrap around at the max channel count. All audio graphs are stereo so `output` will usually be an even number. 

```ts
sine(200).pan(lfosquare(0.5,-1,1)).amp(0.5).out(0) // use channels 0 and 1
sine(200).pan(lfosquare(0.5,-1,1)).amp(0.5).out(2) // use channels 2 and 3... etc.
```

---


```js
s0.set({inst: 'zmod', graph: 'sine(100).amp(env(e)).out()', voices: 4})
s0.e.every(4)
```