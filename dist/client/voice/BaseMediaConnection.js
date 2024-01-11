"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMediaConnection = void 0;
const StreamOpts_1 = require("../StreamOpts");
const VoiceOpCodes_1 = require("./VoiceOpCodes");
const MediaUdp_1 = require("./MediaUdp");
const ws_1 = __importDefault(require("ws"));
class BaseMediaConnection {
    constructor(guildId, botId, channelId, callback) {
        this.status = {
            hasSession: false,
            hasToken: false,
            started: false,
            resuming: false
        };
        // make udp client
        this.udp = new MediaUdp_1.MediaUdp(this);
        this.guildId = guildId;
        this.channelId = channelId;
        this.botId = botId;
        this.ready = callback;
    }
    stop() {
        var _a, _b;
        clearInterval(this.interval);
        this.status.started = false;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
        (_b = this.udp) === null || _b === void 0 ? void 0 : _b.stop();
    }
    setSession(session_id) {
        this.session_id = session_id;
        this.status.hasSession = true;
        this.start();
    }
    setTokens(server, token) {
        this.token = token;
        this.server = server;
        this.status.hasToken = true;
        this.start();
    }
    start() {
        /*
        ** Connection can only start once both
        ** session description and tokens have been gathered
        */
        if (this.status.hasSession && this.status.hasToken) {
            if (this.status.started)
                return;
            this.status.started = true;
            this.ws = new ws_1.default("wss://" + this.server + "/?v=7", {
                followRedirects: true
            });
            this.ws.on("open", () => {
                if (this.status.resuming) {
                    this.status.resuming = false;
                    this.resume();
                }
                else {
                    this.identify();
                }
            });
            this.ws.on("error", (err) => {
                console.error(err);
            });
            this.ws.on("close", (code) => {
                const wasStarted = this.status.started;
                this.status.started = false;
                this.udp.ready = false;
                const canResume = code === 4015 || code < 4000;
                if (canResume && wasStarted) {
                    this.status.resuming = true;
                    this.start();
                }
            });
            this.setupEvents();
        }
    }
    handleReady(d) {
        this.ssrc = d.ssrc;
        this.address = d.ip;
        this.port = d.port;
        this.modes = d.modes;
        this.videoSsrc = this.ssrc + 1; // todo: set it from packet streams object
        this.rtxSsrc = this.ssrc + 2;
    }
    handleSession(d) {
        this.secretkey = new Uint8Array(d.secret_key);
        this.ready(this.udp);
        this.udp.ready = true;
    }
    setupEvents() {
        this.ws.on('message', (data) => {
            const { op, d } = JSON.parse(data);
            if (op == VoiceOpCodes_1.VoiceOpCodes.READY) { // ready
                this.handleReady(d);
                this.sendVoice();
                this.setVideoStatus(false);
            }
            else if (op >= 4000) {
                console.error(`Error ${this.constructor.name} connection`, d);
            }
            else if (op === VoiceOpCodes_1.VoiceOpCodes.HELLO) {
                this.setupHeartbeat(d.heartbeat_interval);
            }
            else if (op === VoiceOpCodes_1.VoiceOpCodes.SELECT_PROTOCOL_ACK) { // session description
                this.handleSession(d);
            }
            else if (op === VoiceOpCodes_1.VoiceOpCodes.SPEAKING) {
                // ignore speaking updates
            }
            else if (op === VoiceOpCodes_1.VoiceOpCodes.HEARTBEAT_ACK) {
                // ignore heartbeat acknowledgements
            }
            else if (op === VoiceOpCodes_1.VoiceOpCodes.RESUMED) {
                this.status.started = true;
                this.udp.ready = true;
            }
            else {
                //console.log("unhandled voice event", {op, d});
            }
        });
    }
    setupHeartbeat(interval) {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            this.sendOpcode(VoiceOpCodes_1.VoiceOpCodes.HEARTBEAT, 42069);
        }, interval);
    }
    sendOpcode(code, data) {
        this.ws.send(JSON.stringify({
            op: code,
            d: data
        }));
    }
    /*
    ** identifies with media server with credentials
    */
    identify() {
        this.sendOpcode(VoiceOpCodes_1.VoiceOpCodes.IDENTIFY, {
            server_id: this.serverId,
            user_id: this.botId,
            session_id: this.session_id,
            token: this.token,
            video: true,
            streams: [
                { type: "screen", rid: "100", quality: 100 }
            ]
        });
    }
    resume() {
        this.sendOpcode(VoiceOpCodes_1.VoiceOpCodes.RESUME, {
            server_id: this.serverId,
            session_id: this.session_id,
            token: this.token,
        });
    }
    /*
    ** Sets protocols and ip data used for video and audio.
    ** Uses vp8 for video
    ** Uses opus for audio
    */
    setProtocols() {
        this.sendOpcode(VoiceOpCodes_1.VoiceOpCodes.SELECT_PROTOCOL, {
            protocol: "udp",
            codecs: [
                { name: "opus", type: "audio", priority: 1000, payload_type: 120 },
                { name: StreamOpts_1.streamOpts.video_codec, type: "video", priority: 1000, payload_type: 101, rtx_payload_type: 102, encode: true, decode: true }
                //{ name: "VP8", type: "video", priority: 3000, payload_type: 103, rtx_payload_type: 104, encode: true, decode: true }
                //{ name: "VP9", type: "video", priority: 3000, payload_type: 105, rtx_payload_type: 106 },
            ],
            data: {
                address: this.self_ip,
                port: this.self_port,
                mode: "xsalsa20_poly1305_lite"
            }
        });
    }
    /*
    ** Sets video status.
    ** bool -> video on or off
    ** video and rtx sources are set to ssrc + 1 and ssrc + 2
    */
    setVideoStatus(bool) {
        this.sendOpcode(VoiceOpCodes_1.VoiceOpCodes.VIDEO, {
            audio_ssrc: this.ssrc,
            video_ssrc: bool ? this.videoSsrc : 0,
            rtx_ssrc: bool ? this.rtxSsrc : 0,
            streams: [
                {
                    type: "video",
                    rid: "100",
                    ssrc: bool ? this.videoSsrc : 0,
                    active: true,
                    quality: 100,
                    rtx_ssrc: bool ? this.rtxSsrc : 0,
                    max_bitrate: StreamOpts_1.streamOpts.maxBitrateKbps * 1000,
                    max_framerate: StreamOpts_1.streamOpts.fps,
                    max_resolution: {
                        type: "fixed",
                        width: StreamOpts_1.streamOpts.width,
                        height: StreamOpts_1.streamOpts.height
                    }
                }
            ]
        });
    }
    /*
    ** Set speaking status
    ** speaking -> speaking status on or off
    */
    setSpeaking(speaking) {
        this.sendOpcode(VoiceOpCodes_1.VoiceOpCodes.SPEAKING, {
            delay: 0,
            speaking: speaking ? 1 : 0,
            ssrc: this.ssrc
        });
    }
    /*
    ** Start media connection
    */
    sendVoice() {
        return new Promise((resolve, reject) => {
            this.udp.createUdp().then(() => {
                resolve();
            });
        });
    }
}
exports.BaseMediaConnection = BaseMediaConnection;
