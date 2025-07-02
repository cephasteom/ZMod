// TODO: Thanks to froos
import { library } from "./tone";

/**
 * Block class representing a node in an audio graph.
 * This class allows for the creation of audio processing blocks with a type and inputs.
 * It provides methods to compile the block into a code representation that can be used in an audio processing context.
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

    toCode(block: Block, ref: string, args: any[], isLast: boolean = false): string {
        return `${isLast ? 'return ' : `let ${ref} = `}${block.type}(${args.join(",")})`;
    }

    compile() {
        let blocks = Array.from(topoSort(this));
        const getRef = (block: Block) => typeof block !== "object" 
            ? block 
            : `v${blocks.indexOf(block)}`;
        let lines = [];
        for (let id in blocks) {
            const isLast = id === String(blocks.length - 1);
            const block = blocks[id];
            const args = block.inputs.map(getRef);
            const ref = getRef(block);
            lines.push(block.toCode(block, ref, args, isLast));
        }
        // TODO: why do we need to return the last block?
        const last = getRef(blocks[blocks.length - 1]);
        return { lines, last };
    }
}

// 👇 Accepts both Blocks and numbers
type BlockInput = Block | number;

// Converts number inputs into "signal" Blocks
// TODO: is this necessary?
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

const blocks = Object.keys(library)
    .reduce((acc, type) => {
        acc[type] = registerBlock(type);
        return acc;
    }, {} as Record<string, (...args: BlockInput[]) => Block>);

export const transpile = (code: string): string => {
    try {
        const block = new Function(
            ...Object.keys(blocks), 
            `return (${code});`
        )(...Object.values(blocks));
        
        const compiled = block.compile();
        
        return compiled.lines.join("\n");
    } catch (error) {
        console.error("Error during transpilation:", error);
        return "";
    }
}