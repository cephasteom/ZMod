// TODO: Thanks to froos
import { library, type Patch } from "./tone";
import { Block, type BlockInput, registerBlock } from "./Block";

export class ZenModular {
    context?: AudioContext;
    blocks: Record<string, (id: string, ...args: BlockInput[]) => Block> = {};
    transpiledCode: string = '';
    patch?: Patch | null;
    isNewPatch: boolean = false;

    constructor(context?: AudioContext) {
        // TODO: use the context in the patch
        this.context = context;
        // Load the library of blocks 
        // loaded internally so that we might swap out tone.js for another libary in future
        this.loadBlocks(library)
    }

    loadBlocks(library: Record<string, (...args: any[]) => Block>) {
        this.blocks = Object.keys(library)
        .reduce((acc, type) => {
            acc[type] = registerBlock(type);
            return acc;
        }, {} as Record<string, (id: string, ...args: BlockInput[]) => Block>);
    }

    /**
     * @param code Zen Modular code to transpile into JavaScript.
     * Transpiles the code into a series of JavaScript lines that can be executed to create an audio graph.
     */
    parse(code: string) {
        try {
            const block = new Function(
                ...Object.keys(this.blocks), 
                `return (${code});`
            )(...Object.values(this.blocks));
            
            const compiled = block.compile();
            const transpiled = `let inputs = {};\n${compiled.lines.join("\n")}\nreturn {inputs, output: ${compiled.last}};`;

            this.isNewPatch = (transpiled !== this.transpiledCode);
            this.transpiledCode = transpiled;
        } catch (error) {
            console.error("Error during transpilation:", error);
        }
    }

    start() {
        // Don't create a new patch if the code hasn't changed
        if(!this.isNewPatch || !this.transpiledCode) return;
        
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
    }

    stop() {
        this.patch?.dispose(); // Dispose of the current patch if it exists
        this.patch = null; // Clear the graph reference
        this.isNewPatch = true; // Reset the new patch flag so that we can play the same code again
    }

    clear() {
        this.patch?.dispose(); // Dispose of the current patch if it exists
        this.patch = null; // Clear the graph reference
        this.transpiledCode = ''; // Reset the last transpiled code
        this.isNewPatch = false; // Reset the new patch flag so that we can play the same code again
    }
}