import { library, type Patch } from "./tone";
import { Node, type NodeInput, registerNode } from "./Node";

/**
 * ZenModular class that represents a modular audio synthesis environment.
 * It allows you to create and manipulate audio graphs using a custom scripting language.
 * 
 * @example
 * const zm = new ZenModular();
 * zm.parse("sinOsc(lfo(0.5,50,500)).out()");
 * zm.start();
 * 
 * zm.stop();
 */
export class ZenModular {
    
    /**
     * AudioContext to use. Currently not used, but there for future compatibility.
     */
    context?: AudioContext;
    
    /**
     * A collection of Nodes that can be used in the ZenModular environment.
     * These are dynamically registered from a provided library - meaning we can change synth engine in future.
     */
    nodes: Record<string, (id: string, ...args: NodeInput[]) => Node> = {};
    
    /**
     * The ZenModular scripting language transpiled to JavaScript.
     */ 
    transpiledCode: string = '';
    
    /**
     * The current audio patch created from the transpiled code.
     * Contains the inputs and output of the audio graph, and a dispose method to clean up resources.
     */
    patch?: Patch | null;
    
    /**
     * Flag to indicate if the current patch is new or has changed since the last run.
     */
    isNewPatch: boolean = false;

    constructor(context?: AudioContext) {
        // TODO: use the context in the patch
        this.context = context;
        // Load the library of Nodes 
        // loaded internally so that we might swap out tone.js for another libary in future
        this.loadNodes(library)
    }

    /**
     * A library of Nodes - oscillators, filters, etc. that can be used in the ZenModular environment.
     * This method registers the Nodes from the provided library
     * @param library 
     */
    loadNodes(library: Record<string, (...args: any[]) => Node>) {
        this.nodes = Object.keys(library)
            .reduce((acc, type) => {
                acc[type] = registerNode(type);
                return acc;
            }, {} as Record<string, (id: string, ...args: NodeInput[]) => Node>);
    }

    private parseCode(code: string): string {
        // delete any ;
        code = code.replace(/;/g, '');
        // wrap any non-numeric function arguments in quotes. These will either be between ( and ) or ( and ,. Ignore any arguments that are numbers or functions.
        code = code.replace(/(\(|,)([a-zA-Z_][a-zA-Z0-9_]*)(?=\)|,)/g, (match, p1, p2) => {
            // If the argument is a string or a variable name, wrap it in quotes
            return `${p1}'${p2}'`;
        });
        console.log(code)
        return code;
    }

    /**
     * @param code Set Zen Modular code to be transpiled into JavaScript.
     * Transpiles the code into a series of JavaScript lines that can be executed to create an audio graph.
     */
    set(code: string): ZenModular {
        try {
            const nodes = new Function(
                ...Object.keys(this.nodes), 
                `return (${this.parseCode(code)});`
            )(...Object.values(this.nodes));
            
            const script = nodes.toScript();
            const transpiled = `let inputs = {};\n${script.lines.join("\n")}\nreturn {inputs, output: ${script.last}};`;

            this.isNewPatch = (transpiled !== this.transpiledCode);
            this.transpiledCode = transpiled;
        } catch (error) {
            console.error("Error during transpilation:", error);
        }

        return this
    }

    /**
     * Build the audio graph from the transpiled code and start it.
     */
    start(): ZenModular {
        // Don't create a new patch if the code hasn't changed
        if(!this.isNewPatch || !this.transpiledCode) return this
        
        try {
            this.patch?.dispose();
            
            const result = new Function(
                ...Object.keys(library), 
                this.transpiledCode
            )(...Object.values(library))
            
            this.patch = {
                ...result,
                dispose: () => {
                    result.output?.gain?.rampTo(0, 0.1); // Fade out volume
                    setTimeout(() => result.output?.dispose?.(), 1000); // Allow time for fade out
                }
            }
        } catch (error) {
            console.error("Error compiling code:", error);
        }

        return this
    }

    /**
     * Clears the current audio patch and resets the state.
     * You need to parse more code before you can run it again.
     */
    clear() {
        this.patch?.dispose(); // Dispose of the current patch if it exists
        this.patch = null; // Clear the graph reference
        this.transpiledCode = ''; // Reset the last transpiled code
        this.isNewPatch = false; // Reset the new patch flag so that we can play the same code again
    }
}