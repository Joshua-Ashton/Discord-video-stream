"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputHasVideo = exports.inputHasAudio = exports.getInputMetadata = exports.streamLivestreamVideo = exports.command = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const IvfReader_1 = require("./IvfReader");
const prism_media_1 = __importDefault(require("prism-media"));
const AudioStream_1 = require("./AudioStream");
const fluent_ffmpeg_multistream_ts_1 = require("@dank074/fluent-ffmpeg-multistream-ts");
const StreamOpts_1 = require("../client/StreamOpts");
const H264NalSplitter_1 = require("./H264NalSplitter");
const VideoStream_1 = require("./VideoStream");
function streamLivestreamVideo(input, mediaUdp, includeAudio = true) {
    return new Promise((resolve, reject) => {
        const videoStream = new VideoStream_1.VideoStream(mediaUdp, StreamOpts_1.streamOpts.fps);
        let videoOutput;
        if (StreamOpts_1.streamOpts.video_codec === 'H264') {
            videoOutput = new H264NalSplitter_1.H264NalSplitter();
        }
        else {
            videoOutput = new IvfReader_1.IvfTransformer();
        }
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.3",
            "Connection": "keep-alive"
        };
        let isHttpUrl = false;
        let isHls = false;
        if (typeof input === "string") {
            isHttpUrl = input.startsWith('http') || input.startsWith('https');
            isHls = input.includes('m3u');
        }
        try {
            exports.command = (0, fluent_ffmpeg_1.default)(input)
                .addOption('-loglevel', '0')
                .addOption('-fflags', 'nobuffer')
                .addOption('-analyzeduration', '0')
                .on('end', () => {
                exports.command = undefined;
                resolve("video ended");
            })
                .on("error", (err, stdout, stderr) => {
                exports.command = undefined;
                reject('cannot play video ' + err.message);
            })
                .on('stderr', console.error);
            if (StreamOpts_1.streamOpts.video_codec === 'VP8') {
                exports.command.output((0, fluent_ffmpeg_multistream_ts_1.StreamOutput)(videoOutput).url, { end: false })
                    .noAudio()
                    .size(`${StreamOpts_1.streamOpts.width}x${StreamOpts_1.streamOpts.height}`)
                    .fpsOutput(StreamOpts_1.streamOpts.fps)
                    .videoBitrate(`${StreamOpts_1.streamOpts.bitrateKbps}k`)
                    .format('ivf')
                    .outputOption('-deadline', 'realtime');
            }
            else {
                exports.command.output((0, fluent_ffmpeg_multistream_ts_1.StreamOutput)(videoOutput).url, { end: false })
                    .noAudio()
                    .size(`${StreamOpts_1.streamOpts.width}x${StreamOpts_1.streamOpts.height}`)
                    .fpsOutput(StreamOpts_1.streamOpts.fps)
                    .videoBitrate(`${StreamOpts_1.streamOpts.bitrateKbps}k`)
                    .format('h264')
                    .outputOptions([
                    '-pix_fmt yuv420p',
                    '-preset veryfast',
                    '-profile:v baseline',
                    `-g ${StreamOpts_1.streamOpts.fps}`,
                    `-x264-params keyint=${StreamOpts_1.streamOpts.fps}:min-keyint=${StreamOpts_1.streamOpts.fps}`,
                    '-bsf:v h264_metadata=aud=insert'
                ]);
            }
            videoOutput.pipe(videoStream, { end: false });
            if (includeAudio) {
                const audioStream = new AudioStream_1.AudioStream(mediaUdp);
                // make opus stream
                const opus = new prism_media_1.default.opus.Encoder({ channels: 2, rate: 48000, frameSize: 960 });
                exports.command
                    .output((0, fluent_ffmpeg_multistream_ts_1.StreamOutput)(opus).url, { end: false })
                    .noVideo()
                    .audioChannels(2)
                    .audioFrequency(48000)
                    //.audioBitrate('128k')
                    .format('s16le');
                opus.pipe(audioStream, { end: false });
            }
            if (StreamOpts_1.streamOpts.hardware_acceleration)
                exports.command.inputOption('-hwaccel', 'auto');
            if (isHttpUrl) {
                exports.command.inputOption('-headers', Object.keys(headers).map(key => key + ": " + headers[key]).join("\r\n"));
                if (!isHls) {
                    exports.command.inputOptions([
                        '-reconnect 1',
                        '-reconnect_at_eof 1',
                        '-reconnect_streamed 1',
                        '-reconnect_delay_max 4294'
                    ]);
                }
            }
            exports.command.run();
        }
        catch (e) {
            //audioStream.end();
            //videoStream.end();
            exports.command = undefined;
            reject("cannot play video " + e.message);
        }
    });
}
exports.streamLivestreamVideo = streamLivestreamVideo;
function getInputMetadata(input) {
    return new Promise((resolve, reject) => {
        const instance = (0, fluent_ffmpeg_1.default)(input).on('error', (err, stdout, stderr) => reject(err));
        instance.ffprobe((err, metadata) => {
            if (err)
                reject(err);
            instance.removeAllListeners();
            resolve(metadata);
            instance.kill('SIGINT');
        });
    });
}
exports.getInputMetadata = getInputMetadata;
function inputHasAudio(metadata) {
    return metadata.streams.some((value) => value.codec_type === 'audio');
}
exports.inputHasAudio = inputHasAudio;
function inputHasVideo(metadata) {
    return metadata.streams.some((value) => value.codec_type === 'video');
}
exports.inputHasVideo = inputHasVideo;
