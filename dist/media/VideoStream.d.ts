/// <reference types="node" />
/// <reference types="node" />
import { Writable } from "stream";
import { MediaUdp } from "../client/voice/MediaUdp";
export declare class VideoStream extends Writable {
    udp: MediaUdp;
    count: number;
    sleepTime: number;
    startTime?: number;
    constructor(udp: MediaUdp, fps?: number);
    setSleepTime(time: number): void;
    _write(frame: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
}
