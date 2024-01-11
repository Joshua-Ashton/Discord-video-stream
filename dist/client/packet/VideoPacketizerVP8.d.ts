/// <reference types="node" />
import { MediaUdp } from "../voice/MediaUdp";
import { BaseMediaPacketizer } from "./BaseMediaPacketizer";
/**
 * VP8 payload format
 *
 */
export declare class VideoPacketizerVP8 extends BaseMediaPacketizer {
    private _pictureId;
    constructor(connection: MediaUdp);
    private incrementPictureId;
    sendFrame(frame: any): void;
    createPacket(chunk: any, isLastPacket?: boolean, isFirstPacket?: boolean): Buffer;
    onFrameSent(): void;
    private makeChunk;
}
