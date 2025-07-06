# Zen Modular

## Basic Use
```js
const zm = new ZenModular(context)

// set patch
zm.parse(`sine(sig('f',100)).mul(env('e',0.1,0.1,0.5,0.8)).out(0)`)
  .start() // clear previous patch and generate new one

// get patch - underlying audio graph
// console.log(zm.patch)

// interact with patch
zm.inputs.e() // trigger envelope
zm.inputs.f(1000, 1000) // ramp frequency to 1000Hz over 1s

// clear patch and dispose of all resources
zm.patch.clear()
```
## Syntax
For all nodes, if you pass a string as the first argument, the node can be controlled externally via the inputs object. For convenience

E.g. 
```js
sine(sig(100)) // sets sine to 100
sine(sig('f', 100)) // sets sine to 100 and exposes the signal under inputs.f

sine(100).mul(env('e')) // inputs.e
sine(100).mul(env(e)) // for convenience, you can also drop the ''
```

### Inputs
```ts
type Input = number | Signal | LFO | Envelope;
```
### Basic Oscillators
#### sinOsc
```ts
function sinOsc(freq: Input, amp: Input)
```
#### triOsc
```ts
function triOsc(freq: Input, amp: Input)
```
#### squOsc
```ts
function squOsc(freq: Input, amp: Input)
```
#### sawOsc
```ts
function sawOsc(freq: Input, amp: Input)
```

### Complex Oscillators
#### fmOsc
```ts
function fmOsc(frequency: Input, harmonicity: Input, modulationIndex: Input)
```
#### amOsc
```ts
function amOsc(frequency: Input, harmonicity: Input)
```
#### pwmOsc
```ts
function amOsc(frequency: Input, modulationIndex: Input)
```

### LFO
```ts
function lfo(freq: Input, min: number, max: number)
```

### Signal
```ts
function sig(value: number)
```

### External Control
Adding `.<any>` at the end of any node name enables it to be controlled from outside of the audio graph.
```ts
sine(sig.f(100)).mul(env.e(0.1,0.1,0.5,0.8)).out(0)
```
This will return the following:
```ts
const graph = {
    inputs: {
        f: function(value: number, lag: number): void,
        e: function(a: number, d: number, s: number, r: number): void
    },
    ...
}
```
To trigger the envelope call `graph.inputs.e()`. To change the frequency call `graph.inputs.f( 200, 1000 )`.
