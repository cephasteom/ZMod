import { Merge, getTransport, getContext, BaseContext, Split, Gain } from "tone";
import { makePatch, type Patch, outputs, destination } from "./engines/tone";
import { Node, type NodeInput, registerNode } from "./Node";
import { TransportClass } from "tone/build/esm/core/clock/Transport";
import { busses } from "./engines/tone/audio";
import Library from "./engines/tone/Library";

const zmodChannel = new BroadcastChannel('zmod')

/**
 * ZMod class that represents a modular audio synthesis environment.
 * It allows you to create and manipulate audio graphs using a custom scripting language.
 * 
 * @example
 * const zm = new ZMod();
 * zm.parse("sinOsc(lfo(0.5,50,500)).out()");
 * zm.start();
 * 
 * zm.stop();
 */
export default class ZMod {
    
    /**
     * AudioContext to use. Currently not used, but there for future compatibility.
     */
    _context?: BaseContext = getContext();

    /**
     * Transport to use. Currently not used, but there for future compatibility.
     */
    _transport?: TransportClass;

    /**
     * A 32 channel output bus that merges all audio outputs into a single stream.
     */
    _outputs: Merge = outputs;

    /**
     * A collection of Gain nodes that can be used as busses in the ZMod environment.
     */
    _busses: Gain<"gain">[] = busses;
    
    /**
     * A collection of Nodes that can be used in the ZMod environment.
     * These are dynamically registered from a provided library - meaning we can change synth engine in future.
     */
    _nodes: Record<string, (id: string, ...args: NodeInput[]) => Node> = {};
    
    /**
     * The ZMod scripting language transpiled to JavaScript.
     */ 
    _transpiledCode: string = '';
    
    /**
     * The current audio patch created from the transpiled code.
e current audio patch created from the transpiled cod/tonee.
     * Contains the inputs and output of the audio graph, and a dispose method to clean up resources.
     */
    _patch?: Patch | null;
    
    /**
     * Flag to indicate if the current patch is new or has changed since the last run.
     */
    _isNewPatch: boolean = false;

    /**
     * The timestamp of the last patch update.
     */
    _patchTimeStamp: number = 0;

    constructor(
        options?: {context?: BaseContext, transport?: TransportClass, busses?: Gain<"gain">[]}
    ) {
        // Initialize the context and transport if provided, otherwise use defaults
        this._context = options?.context || getContext();
        this._transport = options?.transport || getTransport();
        
        // optionally replace the default busses with those external to the patch
        this._busses = options?.busses || busses;
        
        // Load the library of Nodes 
        // loaded internally so that we might swap out tone.js for another library in future
        this.loadNodes((new Library()).keys);

        this._transport.on('stop', () => this._patch?.output?.gain?.rampTo(0, 0.1)); // Fade out volume on stop
    }

    /**
     * A library of Nodes - oscillators, filters, etc. that can be used in the ZMod environment.
     * This method registers the Nodes from the provided library
     * @param library 
     */
    private loadNodes(keys: string[]) {
        // flatten object so we just get the inner objects containing the node functions
        this._nodes = keys
            .reduce((acc, type) => {
                acc[type] = registerNode(type);
                return acc;
            }, {} as Record<string, (id: string, ...args: NodeInput[]) => Node>);
    }

    /**
     * Parses the Zen Modular code and prepares it for transpilation.
     * This method modifies the code to ensure it is in a format that can be executed as JavaScript.
     * 
     * @param code The Zen Modular code to parse.
     * @returns The parsed code ready for transpilation.
     */
    private parseCode(code: string): string {
        // delete any ;
        code = code.replace(/;/g, '');

        // replace any instances of e, e1, e2, etc. prepended with a #, to e.g. adsr('e'), adsr('e1') etc.
        code = code.replace(/#(e\d*)/g, (_, name) => {
            return `adsr('${name}')`;
        });

        // replace any remaining string prepended with a # e.g. #amp wth e.g. s('amp')
        code = code.replace(/#([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
            return `s('${name}')`;
        });

        return code;
    }

    /**
     * @param code Set Zen Modular code to be transpiled into JavaScript.
     * Transpiles the code into a series of JavaScript lines that can be executed to create an audio graph.
     */
    set(code: string): ZMod {
        try {
            const nodes = new Function(
                ...Object.keys(this._nodes), 
                `return (${this.parseCode(code)});`
            )(...Object.values(this._nodes));

            const script = nodes.toScript();
            const transpiled = `let inputs = {};\n${script.lines.join("\n")}\nreturn {inputs, output: ${script.last}};`;

            this._isNewPatch = transpiled !== this._transpiledCode
            this._transpiledCode = transpiled;
        } catch (error) {
            zmodChannel.postMessage({ type: 'error', message: 'Zmod error: ' + error})
        }

        return this
    }

    /**
     * Get the inputs of the current patch.
     * These are the controllable parameters of the audio graph.
     */
    get inputs() {
        return this._patch?.inputs || {};
    }

    /**
     * Build the audio graph from the transpiled code and start it.
     */
    start(time: number = 0): ZMod {
        // Don't create a new patch if the code hasn't changed
        try {
            if(this._isNewPatch) {
                // this._busses.forEach(bus => bus.disconnect()); // Disconnect all busses
                this._patch?.dispose(time);
                this._patch = makePatch(this._transpiledCode, this._busses);
                this._patchTimeStamp = Date.now();
            }
            this._patch?.output?.gain?.rampTo(1, 0.01, time); // Fade in volume
            this._transport?.start(time);
        } catch (error) {
            zmodChannel.postMessage({ type: 'error', message: 'Zmod compile error: ' + error})
        }

        return this
    }

    /**
     * Stop the transport, pausing the audio graph without deleting it.
     * @returns ZMod
     */
    stop(time: number = 0): ZMod {
        this._transport?.stop(time);
        this._patch?.output?.gain?.rampTo(0, 0.1, time); // Fade out volume
        return this
    }
        
    /**
     * Clears the current audio patch and resets the state.
     * You need to parse more code before you can run it again.
     */
    clear(time: number = 0): ZMod {
        this._transport?.stop(time);
        this._patch?.dispose(time); // Dispose of the current patch if it exists
        this._patch = null; // Clear the graph reference
        this._transpiledCode = ''; // Reset the last transpiled code
        this._isNewPatch = false; // Reset the new patch flag so that we can play the same code again
        return this;
    }

    /**
     * Play: triggers any input functions with matching names.
     */
    play(args: Record<string, any> = {}, time: number): ZMod {
        // this gives the patch time to build
        if (Date.now() - this._patchTimeStamp < 100) return this;

        Object.keys(this.inputs).forEach((key: string) => 
            args[key] !== undefined && this.inputs[key].forEach(fn => fn(args[key], time))
        )

        const { dur = 1000 } = args

        // handle envelopes e, e1, e2, etc.
        const envelopes: Record<string, Record<string, number>> = Object.entries(args)
            .filter(([key]) => /^([adsr])\d*$/.test(key))
            .reduce((acc: Record<string, Record<string, number>>, [key, value]: [string, number]) => {
                // @ts-ignore
                const [, param, index = ''] = key.match(/^([adsr])(\d*)$/); // '' means no index → 'e'
                const env = `e${index}`
                return {
                    ...acc,
                    [env]: {
                        ...(acc[env] || {}),
                        [param]: value
                    }
                };
            }, {"e" : {}});

        // call any function that starts with e, e1, e2, etc. in the inputs
        Object.keys(this.inputs)
            .filter((key) => /^e\d*$/.test(key))
            .forEach((key) => {
                const envArgs = envelopes[key] || {};
                this.inputs[key].forEach(fn => fn(envArgs).triggerAttackRelease(dur / 1000, time));
            });
        return this
    }

    /**
     * Mutate: triggers any input functions with matching names passing a lag time.
     */
    mutate(args: Record<string, any> = {}, time: number, lag: number): ZMod {
        Object.keys(this.inputs).forEach((key: string) => {
            const rawKey = key.replace(/^_/, ''); // remove leading underscore
            args[rawKey] !== undefined
                && this.inputs[key].forEach(fn => fn(args[rawKey], time, lag))
        });

        return this;
    }

    /**
     * Cut any envelopes are currently playing.
     */
    cut(time: number, release: number = 10): ZMod {
        // Call each envelope input if it exists
        Object.keys(this.inputs)
            .filter((key) => /^e\d*$/.test(key))
            .forEach((key) => {
                this.inputs[key].forEach(fn => fn({}).triggerRelease(time, release / 1000));
            });
        return this;
    }

    /**
     * Disconnects ZMod's output bus.
     */
    disconnect(): ZMod {
        this._outputs.disconnect();
        return this;
    }

    /**
     * Connect Zmod's output bus to an AudioNode.
     * This allows you to route the audio output to any AudioNode in the Web Audio API
     * @param args The AudioNode to connect to, and optional output and input indices.
     * @returns The ZMod instance for method chaining.
     */
    connect(node: AudioNode, channels?: number | number[]): ZMod {
        if(channels !== undefined) {
            const chs = [channels].flat();
            const splitter = new Split(32); // 32-channel splitter
            const merger = new Merge(chs.length); // 32-channel merger
            this._outputs.connect(splitter);
            [channels].flat().forEach((channel: number, i: number) => {
                splitter.connect(merger, channel, i);
            })
            merger.connect(node);
        } else {
            this._outputs.connect(node);
        }

        return this;
    }

    toDestination(): ZMod {
        this._outputs.connect(destination);
        return this;
    }
}