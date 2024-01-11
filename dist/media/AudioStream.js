"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioStream = void 0;
const stream_1 = require("stream");
class AudioStream extends stream_1.Writable {
    constructor(udp) {
        super();
        this.udp = udp;
        this.count = 0;
        this.sleepTime = 20;
    }
    _write(chunk, _, callback) {
        this.count++;
        if (!this.startTime)
            this.startTime = Date.now();
        this.udp.sendAudioFrame(chunk);
        const next = ((this.count + 1) * this.sleepTime) - (Date.now() - this.startTime);
        setTimeout(() => {
            callback();
        }, next);
    }
}
exports.AudioStream = AudioStream;
