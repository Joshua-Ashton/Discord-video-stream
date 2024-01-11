/// <reference types="node" />
/// <reference types="node" />
import { Transform, TransformCallback } from "stream";
type IvfHeader = {
    signature: string;
    version: number;
    headerLength: number;
    codec: string;
    width: number;
    height: number;
    timeDenominator: number;
    timeNumerator: number;
    frameCount: number;
};
declare class IvfTransformer extends Transform {
    headerSize: number;
    frameHeaderSize: number;
    header: IvfHeader;
    buf: Buffer;
    retFullFrame: boolean;
    constructor(options?: any);
    _parseHeader(header: Buffer): void;
    _getFrameSize(buf: Buffer): number;
    _parseFrame(frame: Buffer): boolean;
    _appendChunkToBuf(chunk: any): void;
    _updateBufLen(size: number): void;
    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void;
}
declare function readIvfFile(filepath: string): Promise<any>;
declare function getFrameFromIvf(file: any, framenum?: number): false | {
    size: any;
    timestamp: any;
    data: any;
};
declare function getFrameDelayInMilliseconds(file: IvfHeader): number;
export { getFrameFromIvf, readIvfFile, getFrameDelayInMilliseconds, IvfTransformer };
