/// <reference types="node" />
import { MediaUdp } from "../voice/MediaUdp";
export declare const max_int16bit: number;
export declare const max_int32bit: number;
export declare class BaseMediaPacketizer {
    private _payloadType;
    private _mtu;
    private _sequence;
    private _timestamp;
    private _mediaUdp;
    private _extensionEnabled;
    constructor(connection: MediaUdp, payloadType: number, extensionEnabled?: boolean);
    sendFrame(frame: any): void;
    onFrameSent(): void;
    /**
     * Partitions a buffer into chunks of length this.mtu
     * @param data buffer to be partitioned
     * @returns array of chunks
     */
    partitionDataMTUSizedChunks(data: any): any[];
    getNewSequence(): number;
    incrementTimestamp(incrementBy: number): void;
    makeRtpHeader(ssrc: number, isLastPacket?: boolean): Buffer;
    /**
     * Creates a single extension of type playout-delay
     * Discord seems to send this extension on every video packet
     * @see https://webrtc.googlesource.com/src/+/refs/heads/main/docs/native-code/rtp-hdrext/playout-delay
     * @returns playout-delay extension @type Buffer
     */
    createHeaderExtension(): Buffer;
    encryptData(message: string | Uint8Array, nonceBuffer: Buffer): Uint8Array;
    get mediaUdp(): MediaUdp;
    get mtu(): number;
}
