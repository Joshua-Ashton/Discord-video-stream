/// <reference types="node" />
import ffmpeg from 'fluent-ffmpeg';
import { MediaUdp } from '../client/voice/MediaUdp';
import { Readable } from 'stream';
export declare let command: ffmpeg.FfmpegCommand;
export declare function streamLivestreamVideo(input: string | Readable, mediaUdp: MediaUdp, includeAudio?: boolean): Promise<string>;
export declare function getInputMetadata(input: string | Readable): Promise<ffmpeg.FfprobeData>;
export declare function inputHasAudio(metadata: ffmpeg.FfprobeData): boolean;
export declare function inputHasVideo(metadata: ffmpeg.FfprobeData): boolean;
