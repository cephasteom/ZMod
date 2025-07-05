// TODO: Thanks to froos
import { library } from "./tone";

/**
 * Block class representing a node in an audio graph.
 * Contains information about the block type and its inputs.
 * Methods to transplile the block into Javascript code which is run to create an audio graph.
 */ 
export class Block {
    type: string;
    inputs: Block[];
    id?: string; // Optional identifier for the block, useful for debugging or referencing
    
    constructor(
        type: string, 
        inputs: Block[] = [],
        id?: string // Optional identifier for the block, useful for debugging or referencing
    ) {
        this.type = type;
        this.inputs = inputs;
        this.id = id;
    }

    /**
     * Transpiles a single block into a single line of JavaScript code.
     */
    toCode(block: Block, ref: string, args: any[], id?: string): string {
        let code = `let ${ref} = ${block.type}(${args.join(",")});`;
        if (id) {
            code += ` inputs = {...inputs, ${id}: ${ref}};`; // Add to inputs object if id is provided
        }
        return code;
    }

    /**
     * Compiles the block and its dependencies into a series of JavaScript lines.
     * Returns an object containing the lines of code and the last reference.
     */
    compile() {
        let blocks = Array.from(topoSort(this));
        const getRef = (block: Block) => typeof block !== "object" 
            ? block 
            : `v${blocks.indexOf(block)}`;
        let lines = [];
        for (let i in blocks) {
            const block = blocks[i];
            const args = block.inputs.map(getRef);
            const ref = getRef(block);
            lines.push(block.toCode(block, ref, args, block.id));
        }
        const last = getRef(blocks[blocks.length - 1]);
        return { 
            lines, 
            last 
        };
    }
}

// 👇 Accepts both Blocks and numbers
type BlockInput = Block | number;

function toBlock(input: BlockInput): Block {
    return input instanceof Block ? input : new Block("value", [input as any]);
}

// 👇 Dynamically adds a method to Block.prototype
const registerBlock = (type: string): (id: string, ...args: BlockInput[]) => Block => {
    (Block.prototype as any)[type] = function (this: Block, id: string, ...args: BlockInput[]): Block {
        return new Block(type, [this, ...args].map(toBlock), id);
    };
    return (id: string, ...args: BlockInput[]) => new Block(type, args.map(toBlock), id);
};

// sort blocks by dependencies (using generator function to be able to step through)
function* topoSort(block: Block, visited = new Set()): Generator<Block> {
    if (!(block instanceof Block) || visited.has(block)) {
        return; // constant values or already visited blocks
    }
    
    visited.add(block);
    
    for (let input of block.inputs) {
        yield* topoSort(input, visited);
    }
    
    yield block;
}

type AnyFn = (...args: any[]) => any;
export function parsePropAsId<T extends object>(api: T): T {
    // ── Handles *functions* (fmOsc, etc.) ────────────────────────────
    const fnHandler: ProxyHandler<AnyFn> = {
        // being called directly as a function, e.g. fmOsc(440)
        apply(fn, thisArg, args) {
            // pass an id of null, as we don't need to expose it to external control
            return fn.apply(thisArg, [null, ...args]);
        },

        // called with a child method, e.g. fmOsc.in1(440)
        get(fn, id) {
            console.log(id)
            return (...args: any[]) => {
                // use the child method as the id, call the parent function
                return fn.apply(this, [id, ...args]);
            };
        },
    };

    // ── Handles *everything else* (objects, nested modules, etc.) ────
    const rootHandler: ProxyHandler<any> = {
        get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        // Wrap every function so its child‑method calls are intercepted
        if (typeof value === "function") return new Proxy(value, fnHandler);

        // Primitives are returned as‑is
        return value;
        },
    };

    return new Proxy(api, rootHandler);
}

// Register the library (from tone.ts currently) as blocks
const blockLibrary = parsePropAsId(Object.keys(library)
    .reduce((acc, type) => {
        acc[type] = registerBlock(type);
        return acc;
    }, {} as Record<string, (id: string, ...args: BlockInput[]) => Block>));

// Transpile the Zen Blocks code into JavaScript
export const transpile = (code: string): string => {
    try {
        const block = new Function(
            ...Object.keys(blockLibrary), 
            `return (${code});`
        )(...Object.values(blockLibrary));
        
        const compiled = block.compile();
        return `let inputs = {};\n${compiled.lines.join("\n")}\nreturn {inputs, output: ${compiled.last}};`;
    } catch (error) {
        console.error("Error during transpilation:", error);
        return "";
    }
}