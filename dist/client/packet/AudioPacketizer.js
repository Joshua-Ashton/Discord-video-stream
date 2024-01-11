"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPacketizer = void 0;
const BaseMediaPacketizer_1 = require("./BaseMediaPacketizer");
const time_inc = (48000 / 100) * 2;
class AudioPacketizer extends BaseMediaPacketizer_1.BaseMediaPacketizer {
    constructor(connection) {
        super(connection, 0x78);
    }
    sendFrame(frame) {
        const packet = this.createPacket(frame);
        this.mediaUdp.sendPacket(packet);
        this.onFrameSent();
    }
    createPacket(chunk) {
        const header = this.makeRtpHeader(this.mediaUdp.mediaConnection.ssrc);
        const nonceBuffer = this.mediaUdp.getNewNonceBuffer();
        return Buffer.concat([header, this.encryptData(chunk, nonceBuffer), nonceBuffer.subarray(0, 4)]);
    }
    onFrameSent() {
        this.incrementTimestamp(time_inc);
    }
}
exports.AudioPacketizer = AudioPacketizer;
