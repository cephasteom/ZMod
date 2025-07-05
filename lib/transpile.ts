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
    
    constructor(
        type: string, 
        inputs: Block[] = []
    ) {
        this.type = type;
        this.inputs = inputs;
    }

    /**
     * Transpiles a single block into a single line of JavaScript code.
     */
    toCode(block: Block, ref: string, args: any[]): string {
        return `let ${ref} = ${block.type}(${args.join(",")})`;
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
        for (let id in blocks) {
            const block = blocks[id];
            const args = block.inputs.map(getRef);
            const ref = getRef(block);
            lines.push(block.toCode(block, ref, args));
        }
        const last = getRef(blocks[blocks.length - 1]);
        return { lines, last };
    }
}

// 👇 Accepts both Blocks and numbers
type BlockInput = Block | number;

function toBlock(input: BlockInput): Block {
    return input instanceof Block ? input : new Block("value", [input as any]);
}

// 👇 Dynamically adds a method to Block.prototype
const registerBlock = (type: string): (...args: BlockInput[]) => Block => {
    (Block.prototype as any)[type] = function (this: Block, ...args: BlockInput[]): Block {
        return new Block(type, [this, ...args].map(toBlock));
    };
    return (...args: BlockInput[]) => new Block(type, args.map(toBlock));
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

// /** 
// |*  passChildMethodNames                                         
// |*  Wrap an API so that                                          
// |*    logged.fmOsc.in1(440)                                      
// |*  passes calls fmOsc, passing "in1" as the first argument
// */

// type AnyFn = (...args: any[]) => any;

// export function passChildMethodNames<T extends object>(api: T): T {
//   // ── Handles *functions* (fmOsc, etc.) ────────────────────────────
//   const fnHandler: ProxyHandler<AnyFn> = {
//     // accessing   fmOsc.in1
//     get(fn, prop) {
//       // return a wrapper such that  fmOsc.in1(args…)  calls fmOsc(args…)
//       return (...args: any[]) => {
//         console.log(this, prop, args, fn);            // ← log "in1", "foo", …
//         // Preserve `this` binding just in case
//         return fn.apply(this, [...args, prop]);
//       };
//     },
//   };

//   // ── Handles *everything else* (objects, nested modules, etc.) ────
//   const rootHandler: ProxyHandler<any> = {
//     get(target, prop, receiver) {
//       const value = Reflect.get(target, prop, receiver);

//       // Wrap every function so its child‑method calls are intercepted
//       if (typeof value === "function") return new Proxy(value, fnHandler);

//       // Primitives are returned as‑is
//       return value;
//     },
//   };

//   return new Proxy(api, rootHandler);
// }

// Register the library (from tone.ts currently) as blocks
// TODO: change name of passChildMethodNames
const blockLibrary = Object.keys(library)
    .reduce((acc, type) => {
        acc[type] = registerBlock(type);
        return acc;
    }, {} as Record<string, (...args: BlockInput[]) => Block>);

// Transpile the Zen Blocks code into JavaScript
export const transpile = (code: string): string => {
    try {
        const block = new Function(
            ...Object.keys(blockLibrary), 
            `return (${code});`
        )(...Object.values(blockLibrary));
        
        const compiled = block.compile();
        return compiled.lines.join("\n") + `\nreturn ${compiled.last};`;
    } catch (error) {
        console.error("Error during transpilation:", error);
        return "";
    }
}