import { Block } from "./block";

/**
 * Transpiler for Zen Blocks.
 * 
 * This module handles the transpilation of Zen Blocks code into a format that can be used to generate the audio graph.
 * 
 * We undertake this additional step to ensure that the code is compatible with the audio graph generation process and to understand how the audio graph is structured.
 * 
 */
export class Transpiler {
    _graph: Block;
    
    constructor(graph: Block) {
        // Initialize the transpiler with the provided graph
        this._graph = graph;
    }

    set graph(graph: Block) {
        // Set a new graph for the transpiler
        this._graph = graph;
    }
}