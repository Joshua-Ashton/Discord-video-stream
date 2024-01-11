"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStreamOpts = exports.streamOpts = void 0;
exports.streamOpts = {
    width: 1080,
    height: 720,
    fps: 30,
    bitrateKbps: 1000,
    maxBitrateKbps: 2500,
    hardware_acceleration: false,
    video_codec: 'H264'
};
const setStreamOpts = (opts) => {
    var _a, _b, _c, _d, _e, _f, _g;
    exports.streamOpts.width = (_a = opts.width) !== null && _a !== void 0 ? _a : exports.streamOpts.width;
    exports.streamOpts.height = (_b = opts.height) !== null && _b !== void 0 ? _b : exports.streamOpts.height;
    exports.streamOpts.fps = (_c = opts.fps) !== null && _c !== void 0 ? _c : exports.streamOpts.fps;
    exports.streamOpts.bitrateKbps = (_d = opts.bitrateKbps) !== null && _d !== void 0 ? _d : exports.streamOpts.bitrateKbps;
    exports.streamOpts.maxBitrateKbps = (_e = opts.maxBitrateKbps) !== null && _e !== void 0 ? _e : exports.streamOpts.maxBitrateKbps;
    exports.streamOpts.hardware_acceleration = (_f = opts.hardware_acceleration) !== null && _f !== void 0 ? _f : exports.streamOpts.hardware_acceleration;
    exports.streamOpts.video_codec = (_g = opts.video_codec) !== null && _g !== void 0 ? _g : exports.streamOpts.video_codec;
};
exports.setStreamOpts = setStreamOpts;
