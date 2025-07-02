// Thanks to froos

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

    toCode(block: Block, ref: string, args: any[]) {
        return `let ${ref} = lib.${block.type}(${args.join(",")})`;
    }

    compile() {
        let blocks = Array.from(topoSort(this));
        const getRef = (block: Block) =>
          typeof block !== "object" ? block : `v${blocks.indexOf(block)}`;
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

// Converts number inputs into "const" Blocks
function toBlock(input: BlockInput): Block {
    return input instanceof Block ? input : new Block("sig", [input as any]);
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

export const sine = registerBlock("sine");
export const out = registerBlock("out");