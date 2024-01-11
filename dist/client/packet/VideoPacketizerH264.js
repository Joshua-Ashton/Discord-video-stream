"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPacketizerH264 = void 0;
const StreamOpts_1 = require("../StreamOpts");
const BaseMediaPacketizer_1 = require("./BaseMediaPacketizer");
/**
 * H264 format
 *
 * Packetizer for H264 NAL. This method does NOT support
    aggregation packets where multiple NALs are sent as a single RTP payload.
    The supported H264 header type is Single-Time Aggregation Packet type A
    (STAP-A) and Fragmentation Unit A (FU-A). The headers produced correspond
    to H264 packetization-mode=1.

         RTP Payload Format for H.264 Video:
         https://tools.ietf.org/html/rfc6184
         
         FFmpeg H264 RTP packetisation code:
         https://github.com/FFmpeg/FFmpeg/blob/master/libavformat/rtpenc_h264_hevc.c
         
         When the payload size is less than or equal to max RTP payload, send as
         Single-Time Aggregation Packet (STAP):
         https://tools.ietf.org/html/rfc6184#section-5.7.1
         
              0                   1                   2                   3
         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |                          RTP Header                           |
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |STAP-A NAL HDR |         NALU 1 Size           | NALU 1 HDR    |
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |F|NRI|  Type   |                                               |
         +-+-+-+-+-+-+-+-+
         
         Type = 24 for STAP-A (NOTE: this is the type of the H264 RTP header
         and NOT the NAL type).
         
         When the payload size is greater than max RTP payload, send as
         Fragmentation Unit A (FU-A):
         https://tools.ietf.org/html/rfc6184#section-5.8
              0                   1                   2                   3
         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         | FU indicator  |   FU header   |                               |
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |   Fragmentation Unit (FU) Payload
         |
         ...
 */
class VideoPacketizerH264 extends BaseMediaPacketizer_1.BaseMediaPacketizer {
    constructor(connection) {
        super(connection, 0x65, true);
    }
    /**
     * Sends packets after partitioning the video frame into
     * MTU-sized chunks
     * @param frame h264 video frame
     */
    sendFrame(frame) {
        let accessUnit = frame;
        const nalus = [];
        let offset = 0;
        while (offset < accessUnit.length) {
            const naluSize = accessUnit.readUInt32BE(offset);
            offset += 4;
            const nalu = accessUnit.subarray(offset, offset + naluSize);
            nalus.push(nalu);
            offset += nalu.length;
        }
        let index = 0;
        for (const nalu of nalus) {
            const nal0 = nalu[0];
            const isLastNal = index === nalus.length - 1;
            if (nalu.length <= this.mtu) {
                // Send as Single-Time Aggregation Packet (STAP-A).
                const packetHeader = this.makeRtpHeader(this.mediaUdp.mediaConnection.videoSsrc, isLastNal);
                const packetData = Buffer.concat([
                    this.createHeaderExtension(),
                    nalu,
                ]);
                const nonceBuffer = this.mediaUdp.getNewNonceBuffer();
                this.mediaUdp.sendPacket(Buffer.concat([
                    packetHeader,
                    this.encryptData(packetData, nonceBuffer),
                    nonceBuffer.subarray(0, 4),
                ]));
            }
            else {
                const data = this.partitionDataMTUSizedChunks(nalu.subarray(1));
                // Send as Fragmentation Unit A (FU-A):
                for (let i = 0; i < data.length; i++) {
                    const isFirstPacket = i === 0;
                    const isFinalPacket = i === data.length - 1;
                    const markerBit = isLastNal && isFinalPacket;
                    const packetHeader = this.makeRtpHeader(this.mediaUdp.mediaConnection.videoSsrc, markerBit);
                    const packetData = this.makeChunk(data[i], isFirstPacket, isFinalPacket, nal0);
                    // nonce buffer used for encryption. 4 bytes are appended to end of packet
                    const nonceBuffer = this.mediaUdp.getNewNonceBuffer();
                    this.mediaUdp.sendPacket(Buffer.concat([
                        packetHeader,
                        this.encryptData(packetData, nonceBuffer),
                        nonceBuffer.subarray(0, 4),
                    ]));
                }
            }
            index++;
        }
        this.onFrameSent();
    }
    /**
     * The FU indicator octet has the following format:
        
            +---------------+
            |0|1|2|3|4|5|6|7|
            +-+-+-+-+-+-+-+-+
            |F|NRI|  Type   |
            +---------------+
            
            F and NRI bits come from the NAL being transmitted.
            Type = 28 for FU-A (NOTE: this is the type of the H264 RTP header
            and NOT the NAL type).
            
            The FU header has the following format:
            
            +---------------+
            |0|1|2|3|4|5|6|7|
            +-+-+-+-+-+-+-+-+
            |S|E|R|  Type   |
            +---------------+
            
            S: Set to 1 for the start of the NAL FU (i.e. first packet in frame).
            E: Set to 1 for the end of the NAL FU (i.e. the last packet in the frame).
            R: Reserved bit must be 0.
            Type: The NAL unit payload type, comes from NAL packet (NOTE: this IS the type of the NAL message).
 * @param frameData
 * @param isFirstPacket
 * @param isLastPacket
 * @returns payload for FU-A packet
 */
    makeChunk(frameData, isFirstPacket, isLastPacket, nal0) {
        const headerExtensionBuf = this.createHeaderExtension();
        const fuPayloadHeader = Buffer.alloc(2);
        const nalType = nal0 & 0x1f;
        const fnri = nal0 & 0xe0;
        // set fu indicator
        fuPayloadHeader[0] = 0x1c | fnri; // type 28 with fnri from original frame
        // set fu header
        if (isFirstPacket) {
            fuPayloadHeader[1] = 0x80 | nalType; // set start bit
        }
        else if (isLastPacket) {
            fuPayloadHeader[1] = 0x40 | nalType; // set last bit
        }
        else {
            fuPayloadHeader[1] = nalType; // no start or end bit
        }
        return Buffer.concat([headerExtensionBuf, fuPayloadHeader, frameData]);
    }
    onFrameSent() {
        // video RTP packet timestamp incremental value = 90,000Hz / fps
        this.incrementTimestamp(90000 / StreamOpts_1.streamOpts.fps);
    }
}
exports.VideoPacketizerH264 = VideoPacketizerH264;
