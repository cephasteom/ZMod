# Zen Modular

## Basic Use
```js
const zm = new ZenModular()

// pass a line of the Zen Modular scripting language
zm.set(`sine(sig(100)).mul(env(0.1,0.1,0.5,0.8)).out(0)`)
// start the patch
zm.start()
// clear patch and dispose of all resources
zm.clear()

// optionally, pass a string (with or without quotes) as the first argument of a node
zm.set(`sine(sig(freq)).mul(env(e)).out(0)`)
// making the node controllable from outside the patch
console.log(zm.inputs)
// returns {e: ƒ(), freq: ƒ()}

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