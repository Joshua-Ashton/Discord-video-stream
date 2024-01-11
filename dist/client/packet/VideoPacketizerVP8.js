"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPacketizerVP8 = void 0;
const StreamOpts_1 = require("../StreamOpts");
const BaseMediaPacketizer_1 = require("./BaseMediaPacketizer");
/**
 * VP8 payload format
 *
 */
class VideoPacketizerVP8 extends BaseMediaPacketizer_1.BaseMediaPacketizer {
    constructor(connection) {
        super(connection, 0x65, true);
        this._pictureId = 0;
    }
    incrementPictureId() {
        this._pictureId++;
        if (this._pictureId > BaseMediaPacketizer_1.max_int16bit)
            this._pictureId = 0;
    }
    sendFrame(frame) {
        const data = this.partitionDataMTUSizedChunks(frame);
        for (let i = 0; i < data.length; i++) {
            const packet = this.createPacket(data[i], i === (data.length - 1), i === 0);
            this.mediaUdp.sendPacket(packet);
        }
        this.onFrameSent();
    }
    createPacket(chunk, isLastPacket = true, isFirstPacket = true) {
        if (chunk.length > this.mtu)
            throw Error('error packetizing video frame: frame is larger than mtu');
        const packetHeader = this.makeRtpHeader(this.mediaUdp.mediaConnection.videoSsrc, isLastPacket);
        const packetData = this.makeChunk(chunk, isFirstPacket);
        // nonce buffer used for encryption. 4 bytes are appended to end of packet
        const nonceBuffer = this.mediaUdp.getNewNonceBuffer();
        return Buffer.concat([packetHeader, this.encryptData(packetData, nonceBuffer), nonceBuffer.subarray(0, 4)]);
    }
    onFrameSent() {
        // video RTP packet timestamp incremental value = 90,000Hz / fps
        this.incrementTimestamp(90000 / StreamOpts_1.streamOpts.fps);
        this.incrementPictureId();
    }
    makeChunk(frameData, isFirstPacket) {
        const headerExtensionBuf = this.createHeaderExtension();
        // vp8 payload descriptor
        const payloadDescriptorBuf = Buffer.alloc(2);
        payloadDescriptorBuf[0] = 0x80;
        payloadDescriptorBuf[1] = 0x80;
        if (isFirstPacket) {
            payloadDescriptorBuf[0] |= 0b00010000; // mark S bit, indicates start of frame
        }
        // vp8 pictureid payload extension
        const pictureIdBuf = Buffer.alloc(2);
        pictureIdBuf.writeUIntBE(this._pictureId, 0, 2);
        pictureIdBuf[0] |= 0b10000000;
        return Buffer.concat([headerExtensionBuf, payloadDescriptorBuf, pictureIdBuf, frameData]);
    }
}
exports.VideoPacketizerVP8 = VideoPacketizerVP8;
