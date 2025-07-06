// 👇 Accepts both Blocks and numbers
export type BlockInput = Block | number;

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

function toBlock(input: BlockInput): Block {
    return input instanceof Block ? input : new Block("value", [input as any]);
}

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

// 👇 Dynamically adds a method to Block.prototype
export function registerBlock(type: string): (...args: any[]) => Block {
    (Block.prototype as any)[type] = function (this: Block, ...args: any[]): Block {
        const id = typeof args[0] === 'string' ? args[0] : undefined; // Extract id if first arg is a Block
        if (id) args.shift(); // Remove id from args if it exists
        return new Block(type, [this, ...args].map(toBlock), id);
    };
    return (...args: any[]) => {
        const id = typeof args[0] === 'string' ? args[0] : undefined; // Extract id if first arg is a Block
        if (id) args.shift(); // Remove id from args if it exists
        return new Block(type, args.map(toBlock), id);
    }
};