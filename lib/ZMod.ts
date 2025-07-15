import { Merge, getTransport, getContext, BaseContext } from "tone";
import { library, libraryKeys, makePatch, type Patch, outputs } from "./engines/tone";
import { Node, type NodeInput, registerNode } from "./Node";
import { TransportClass } from "tone/build/esm/core/clock/Transport";

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
     * Library Keys - a list of categorised Node types available in the ZMod environment.
     * Useful for UI generation.
     */
    libraryKeys: Record<string, string[]> = libraryKeys;

    constructor(
        options?: {context?: BaseContext, transport?: TransportClass}
    ) {
        // Initialize the context and transport if provided, otherwise use defaults
        this._context = options?.context || getContext();
        this._transport = options?.transport || getTransport();
        // Load the library of Nodes 
        // loaded internally so that we might swap out tone.js for another library in future
        this.loadNodes(library)
    }

    /**
     * A library of Nodes - oscillators, filters, etc. that can be used in the ZMod environment.
     * This method registers the Nodes from the provided library
     * @param library 
     */
    private loadNodes(library: Record<string, (...args: any[]) => Node>) {
        // flatten object so we just get the inner objects containing the node functions
        
        this._nodes = Object.keys(library)
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
        // wrap any non-numeric function arguments in quotes. These will either be between ( and ) or ( and ,. Ignore any arguments that are numbers or functions.
        code = code.replace(/(\(|,)([a-zA-Z_][a-zA-Z0-9_]*)(?=\)|,)/g, (match, p1, p2) => {
            // If the argument is a string or a variable name, wrap it in quotes
            return `${p1}'${p2}'`;
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

            this._isNewPatch = (transpiled !== this._transpiledCode);
            this._transpiledCode = transpiled;
        } catch (error) {
            console.error("Error during transpilation:", error);
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
    start(): ZMod {
        // Don't create a new patch if the code hasn't changed
        try {
            if(this._isNewPatch) {
                this._patch?.dispose();
                this._patch = makePatch(this._transpiledCode);
            }
            this._patch?.output?.gain?.rampTo(1, 0.1); // Fade in volume
            this._transport?.start();
        } catch (error) {
            console.error("Error compiling code:", error);
        }

        return this
    }

    /**
     * Stop the transport, pausing the audio graph without deleting it.
     * @returns ZMod
     */
    stop(): ZMod {
        this._transport?.stop();
        this._patch?.output?.gain?.rampTo(0, 0.1); // Fade out volume
        return this
    }
        
    /**
     * Clears the current audio patch and resets the state.
     * You need to parse more code before you can run it again.
     */
    clear(): ZMod {
        this._transport?.stop();
        this._patch?.dispose(); // Dispose of the current patch if it exists
        this._patch = null; // Clear the graph reference
        this._transpiledCode = ''; // Reset the last transpiled code
        this._isNewPatch = false; // Reset the new patch flag so that we can play the same code again
        return this;
    }

    /**
     * Play: triggers any input functions with matching names.
     */
    play(args: Record<string, any> = {}, time: number): ZMod {
        Object.keys(this.inputs).forEach((key: string) => 
            args[key] && this.inputs[key](args[key], time)
        )
        return this
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
    connect(...args: [AudioNode, number?, number?]): ZMod {
        this._outputs.connect(...args);
        return this;
    }
}