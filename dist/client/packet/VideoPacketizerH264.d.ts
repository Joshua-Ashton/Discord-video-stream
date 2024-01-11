/// <reference types="node" />
import { MediaUdp } from "../voice/MediaUdp";
import { BaseMediaPacketizer } from "./BaseMediaPacketizer";
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
export declare class VideoPacketizerH264 extends BaseMediaPacketizer {
    constructor(connection: MediaUdp);
    /**
     * Sends packets after partitioning the video frame into
     * MTU-sized chunks
     * @param frame h264 video frame
     */
    sendFrame(frame: Buffer): void;
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
    private makeChunk;
    onFrameSent(): void;
}
