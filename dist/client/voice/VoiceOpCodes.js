"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceOpCodes = void 0;
var VoiceOpCodes;
(function (VoiceOpCodes) {
    VoiceOpCodes[VoiceOpCodes["IDENTIFY"] = 0] = "IDENTIFY";
    VoiceOpCodes[VoiceOpCodes["SELECT_PROTOCOL"] = 1] = "SELECT_PROTOCOL";
    VoiceOpCodes[VoiceOpCodes["READY"] = 2] = "READY";
    VoiceOpCodes[VoiceOpCodes["HEARTBEAT"] = 3] = "HEARTBEAT";
    VoiceOpCodes[VoiceOpCodes["SELECT_PROTOCOL_ACK"] = 4] = "SELECT_PROTOCOL_ACK";
    VoiceOpCodes[VoiceOpCodes["SPEAKING"] = 5] = "SPEAKING";
    VoiceOpCodes[VoiceOpCodes["HEARTBEAT_ACK"] = 6] = "HEARTBEAT_ACK";
    VoiceOpCodes[VoiceOpCodes["RESUME"] = 7] = "RESUME";
    VoiceOpCodes[VoiceOpCodes["HELLO"] = 8] = "HELLO";
    VoiceOpCodes[VoiceOpCodes["RESUMED"] = 9] = "RESUMED";
    VoiceOpCodes[VoiceOpCodes["VIDEO"] = 12] = "VIDEO";
    VoiceOpCodes[VoiceOpCodes["CLIENT_DISCONNECT"] = 13] = "CLIENT_DISCONNECT";
    VoiceOpCodes[VoiceOpCodes["SESSION_UPDATE"] = 14] = "SESSION_UPDATE";
    VoiceOpCodes[VoiceOpCodes["MEDIA_SINK_WANTS"] = 15] = "MEDIA_SINK_WANTS";
    VoiceOpCodes[VoiceOpCodes["VOICE_BACKEND_VERSION"] = 16] = "VOICE_BACKEND_VERSION";
    VoiceOpCodes[VoiceOpCodes["CHANNEL_OPTIONS_UPDATE"] = 17] = "CHANNEL_OPTIONS_UPDATE";
    VoiceOpCodes[VoiceOpCodes["FLAGS"] = 18] = "FLAGS";
    VoiceOpCodes[VoiceOpCodes["SPEED_TEST"] = 19] = "SPEED_TEST";
    VoiceOpCodes[VoiceOpCodes["PLATFORM"] = 20] = "PLATFORM";
})(VoiceOpCodes = exports.VoiceOpCodes || (exports.VoiceOpCodes = {}));
