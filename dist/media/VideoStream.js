"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoStream = void 0;
const stream_1 = require("stream");
class VideoStream extends stream_1.Writable {
    constructor(udp, fps = 30) {
        super();
        this.udp = udp;
        this.count = 0;
        this.sleepTime = 1000 / fps;
    }
    setSleepTime(time) {
        this.sleepTime = time;
    }
    _write(frame, encoding, callback) {
        this.count++;
        if (!this.startTime)
            this.startTime = Date.now();
        this.udp.sendVideoFrame(frame);
        const next = ((this.count + 1) * this.sleepTime) - (Date.now() - this.startTime);
        setTimeout(() => {
            callback();
        }, next);
    }
}
exports.VideoStream = VideoStream;
