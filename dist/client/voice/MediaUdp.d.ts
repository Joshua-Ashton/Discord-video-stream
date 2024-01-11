/// <reference types="node" />
import { BaseMediaPacketizer } from '../packet/BaseMediaPacketizer';
import { BaseMediaConnection } from './BaseMediaConnection';
export declare class MediaUdp {
    private _mediaConnection;
    private _nonce;
    private _socket;
    private _ready;
    private _audioPacketizer;
    private _videoPacketizer;
    constructor(voiceConnection: BaseMediaConnection);
    getNewNonceBuffer(): Buffer;
    get audioPacketizer(): BaseMediaPacketizer;
    get videoPacketizer(): BaseMediaPacketizer;
    get mediaConnection(): BaseMediaConnection;
    sendAudioFrame(frame: any): void;
    sendVideoFrame(frame: any): void;
    sendPacket(packet: any): Promise<void>;
    handleIncoming(buf: any): void;
    get ready(): boolean;
    set ready(val: boolean);
    stop(): void;
    createUdp(): Promise<void>;
}
