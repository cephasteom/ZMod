import RNBODevice from "./RNBODevice"

const patcher = fetch(new URL('./looper.export.json', import.meta.url))
    .then(rawPatcher => rawPatcher.json())

class Looper extends RNBODevice {
    constructor() {
        super();
        this.patcher = patcher;
        
        this.length = this.length.bind(this)
        this.record = this.record.bind(this)
        this.clear = this.clear.bind(this)
        this.params = Object.getOwnPropertyNames(this);

        this.initDevice()
            // .then(() => this.record(1, 0) );
    }

    /**
     * Length - set the length of the loop in ms
     * @param {number} value - length of the loop in ms
     */
    length(value: number = 1000, time: number): void { this.messageDevice('length', value, time) }

    /**
     * Record - start/stop recording audio
     * @param {number} value - 1 to start recording, 0 to stop
     */
    record(value: number, time: number): void { this.messageDevice('io', value, time) }

    /**
     * Clear - clear the buffer
     */
    clear(time: number): void { this.messageDevice('clear', 1, time) }
}

export default Looper;