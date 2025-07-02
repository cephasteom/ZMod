console.log("Zen Blocks Playground Loaded");

class Block {
    type: string;
    inputs: Block[];
    constructor(type: string, inputs: Block[] = []) {
        this.type = type;
        this.inputs = inputs;
    }
}

// 👇 Accepts both Blocks and numbers
type BlockInput = Block | number;

// 🔁 Converts number inputs into "const" Blocks
function toBlock(input: BlockInput): Block {
  return input instanceof Block ? input : new Block("const", [input as any]);
}

// 👇 Dynamically adds a method to Block.prototype
const registerBlock = (type: string): (...args: BlockInput[]) => Block => {
  (Block.prototype as any)[type] = function (this: Block, ...args: BlockInput[]): Block {
    return new Block(type, [this, ...args].map(toBlock));
  };

  return (...args: BlockInput[]) => new Block(type, args.map(toBlock));
};

const sine = registerBlock("sine");
const tri = registerBlock("tri");
const out = registerBlock("out");

// @ts-ignore
console.log(sine(440).out(0));