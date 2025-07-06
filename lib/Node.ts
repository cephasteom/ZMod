// 👇 Accepts both Nodes and numbers
export type NodeInput = Node | number;

/**
 * Node class representing a node in an audio graph.
 * Contains information about the Node type and its inputs.
 * Methods to transplile the Node into Javascript code which is run to create an audio graph.
 */ 
export class Node {
    type: string;
    inputs: Node[];
    id?: string; // Optional identifier for the Node, useful for debugging or referencing
    
    constructor(
        type: string, 
        inputs: Node[] = [],
        id?: string // Optional identifier for the Node, useful for debugging or referencing
    ) {
        this.type = type;
        this.inputs = inputs;
        this.id = id;
    }

    /**
     * Transpiles a single Node into a single line of JavaScript code.
     */
    toCode(node: Node, ref: string, args: any[], id?: string): string {
        let code = `let ${ref} = ${node.type}(${args.join(",")});`;
        if (id) {
            code += ` inputs = {...inputs, ${id}: ${ref}};`; // Add to inputs object if id is provided
        }
        return code;
    }

    /**
     * Compiles the Node and its dependencies into a series of JavaScript lines.
     * Returns an object containing the lines of code and the last reference.
     */
    compile() {
        let nodes = Array.from(topoSort(this));
        const getRef = (node: Node) => typeof node !== "object" 
            ? node 
            : `v${nodes.indexOf(node)}`;
        let lines = [];
        for (let i in nodes) {
            const node = nodes[i];
            const args = node.inputs.map(getRef);
            const ref = getRef(node);
            lines.push(node.toCode(node, ref, args, node.id));
        }
        const last = getRef(nodes[nodes.length - 1]);
        return { 
            lines, 
            last 
        };
    }
}

function toNode(input: NodeInput): Node {
    return input instanceof Node ? input : new Node("value", [input as any]);
}

// sort Nodes by dependencies (using generator function to be able to step through)
function* topoSort(node: Node, visited = new Set()): Generator<Node> {
    if (!(node instanceof Node) || visited.has(node)) {
        return; // constant values or already visited Nodes
    }
    
    visited.add(Node);
    
    for (let input of node.inputs) {
        yield* topoSort(input, visited);
    }
    
    yield node;
}

// 👇 Dynamically adds a method to Node.prototype
export function registerNode(type: string): (...args: any[]) => Node {
    (Node.prototype as any)[type] = function (this: Node, ...args: any[]): Node {
        const id = typeof args[0] === 'string' ? args[0] : undefined; // Extract id if first arg is a Node
        if (id) args.shift(); // Remove id from args if it exists
        return new Node(type, [this, ...args].map(toNode), id);
    };
    return (...args: any[]) => {
        const id = typeof args[0] === 'string' ? args[0] : undefined; // Extract id if first arg is a Node
        if (id) args.shift(); // Remove id from args if it exists
        return new Node(type, args.map(toNode), id);
    }
};