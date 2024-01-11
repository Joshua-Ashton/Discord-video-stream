/// <reference types="node" />
/// <reference types="node" />
import { Transform, TransformCallback } from "stream";
type NalInfo = {
    startCodeLength: number;
    nalLength: number;
};
/**
 * Outputs a buffer containing length-delimited nalu units
 * that belong to the same access unit.
 * Expects an AnnexB H264 bytestream as input.
 *
 * In a h264 stream, 1 frame is equal to 1 access unit, and an access
 * unit is composed of 1 to n Nal units
 */
export declare class H264NalSplitter extends Transform {
    private _buffer;
    private _accessUnit;
    /**
     * Removes emulation prevention bytes from a nalu frame
     * @description there are chances that 0x000001 or 0x00000001 exists in the bitstream of a NAL unit.
     * So a emulation prevention bytes, 0x03, is presented when there is 0x000000, 0x000001, 0x000002 and 0x000003
     * to make them become 0x00000300, 0x00000301, 0x00000302 and 0x00000303 respectively
     * @param data
     * @returns frame with emulation prevention bytes removed
     */
    rbsp(data: Buffer): Buffer;
    /**
     * Finds the next nal unit in a buffer
     * @param buf buffer containing nal units
     * @returns found nalu unit information
     */
    parseNal(buf: Buffer): NalInfo;
    /**
     * Returns true if nal magic string with specified length was found.
     * Nal magic string is either 001 or 0001 depending on length
     * @param buf
     * @param magicLength either 3 or 4
     * @returns true if nalu magic string was found
     */
    findNalByMagicString(buf: Buffer, magicLength: 3 | 4): boolean;
    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void;
    _appendChunkToBuf(chunk: any): void;
    _updateBufLen(size: number): void;
}
export {};
