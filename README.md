# Zen Blocks

## Syntax
### Inputs
```ts
type Input = number | Signal | LFO | Envelope;
```
### Basic Oscillators
#### sineOsc
```ts
function sineOsc(freq: Input, amp: Input)
```
#### triOsc
```ts
function triOsc(freq: Input, amp: Input)
```
#### squareOsc
```ts
function squareOsc(freq: Input, amp: Input)
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
sine(sig.f(100)).mul(env.e(0.1,0.1,0.5,0.8))out(0)
```
This will return the following:
```ts
{
    inputs: {
        f: function(value: number, lag: number),
        e: function(a: number, d: number, s: number, r: number): void
    },
    ...
}
```
