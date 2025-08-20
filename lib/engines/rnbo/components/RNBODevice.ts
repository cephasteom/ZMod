import { Oscillator, getContext, Gain } from 'tone';
import { createDevice, MessageEvent } from '@rnbo/js'
import type { Device, IPatcher } from '@rnbo/js'

export const dummy = new Oscillator({volume: -Infinity, frequency: 0, type: 'sine1'}).start();

class RNBODevice {
    defaults: Record<string, any> = {}
    /** @hidden */
    input: Gain
    /** @hidden */
    output: Gain
    /** @hidden */
    device!: Device;
    /** @hidden */
    ready = false
    /** @hidden */
    // @ts-ignore
    context: AudioContext = getContext().rawContext._nativeAudioContext || getContext().rawContext._context;
    /** @hidden */
    params!: string[];

    /** @hidden */
    patcher: Promise<IPatcher> | null = null

    /** @hidden */
    constructor() {
        this.input = new Gain(1);
        this.output = new Gain(1);
        dummy.connect(this.output);
        dummy.connect(this.input);
    }

    /** @hidden */
    async initDevice()  {
        return this.patcher?.then((patcher: IPatcher) => createDevice({ context: this.context, patcher: patcher })
            .then(device => {
                this.device = device;
                
                // @ts-ignore
                device.node.connect(this.output._gainNode._nativeAudioNode);
                // @ts-ignore
                this.input._gainNode._nativeAudioNode.connect(device.node);
                
                this.ready = true;
            }))
    }

    /** @hidden */
    dispose() {
        // TODO
    }

    /** @hidden */
    messageDevice(tag: string, payload: any, time: number) {
        const message = new MessageEvent((time * 1000) - 10, tag, [ payload ]);
        this.device.scheduleEvent(message);
    }

    /** @hidden */
    connect(node: Gain) { 
        this.output.connect(node)
    }

    /** @hidden */
    disconnect() { this.output.disconnect() }

    /** @hidden */
    setParams(params: Record<string, any>, time: number) {
        Object.entries(params)
            // sort by key to ensure consistent order - also ensures bank is called before i
            .sort(([keyA, _]: [string, any], [keyB, __]: [string, any]) => keyA.localeCompare(keyB))
            // filter out parameters that are not in the params list
            .filter(([key, _]: [string, any]) => this.params.includes(key)) 
            // call the method if it exists
            .forEach(([key, value]) => {
                // @ts-ignore
                this[key] && this[key](value, time)
            })
    }
}

export default RNBODevice