export interface StreamOpts {
    width?: number;
    height?: number;
    fps?: number;
    bitrateKbps?: number;
    maxBitrateKbps?: number;
    hardware_acceleration?: boolean;
    video_codec?: 'H264' | 'VP8';
}
export declare const streamOpts: StreamOpts;
export declare const setStreamOpts: (opts: StreamOpts) => void;
