# Zen Modular

## Basic Use
```js
const zm = new ZenModular()

// pass a line of the Zen Modular scripting language
zm.set(`sine(sig('f',100)).mul(env('e',0.1,0.1,0.5,0.8)).out(0)`)
  .start()

// interact with patch whilst it is running
zm.inputs.e() // trigger envelope
zm.inputs.f(1000, 1000) // ramp frequency to 1000Hz over 1s

// clear patch and dispose of all resources
zm.clear()
```
## Syntax
### Basic Oscillators
#### sine
```ts
function sine(freq: Input, amp: Input)
```
#### tri
```ts
function tri(freq: Input, amp: Input)
```
#### square
```ts
function square(freq: Input, amp: Input)
```
#### saw
```ts
function saw(freq: Input, amp: Input)
```

### Complex Oscillators
#### fm
```ts
function fm(frequency: Input, harmonicity: Input, modulationIndex: Input)
```
#### am
```ts
function am(frequency: Input, harmonicity: Input)
```
#### pwm
```ts
function pwm(frequency: Input, modulationIndex: Input)
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
If you pass a string as the first argument, the node can be controlled externally via the inputs object. E.g
```ts
sine(sig(100)) // sets sine to 100, but you can't control it later.
sine(sig('f', 100)) // sets sine to 100 and exposes the signal under zm.inputs.f
sine(sig(f, 100)) // you can also drop the quotes for brevity

sine(100).mul(env('e')) // creates an envelope and exposes it under zm.inputs.e
sine(100).mul(env(e)) // for convenience, you can also drop the ''
```