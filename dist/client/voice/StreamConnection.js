"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamConnection = void 0;
const VoiceOpCodes_1 = require("../voice/VoiceOpCodes");
const BaseMediaConnection_1 = require("./BaseMediaConnection");
class StreamConnection extends BaseMediaConnection_1.BaseMediaConnection {
    setSpeaking(speaking) {
        this.sendOpcode(VoiceOpCodes_1.VoiceOpCodes.SPEAKING, {
            delay: 0,
            speaking: speaking ? 2 : 0,
            ssrc: this.ssrc
        });
    }
    get serverId() {
        return this._serverId;
    }
    set serverId(id) {
        this._serverId = id;
    }
    get streamKey() {
        return this._streamKey;
    }
    set streamKey(value) {
        this._streamKey = value;
    }
}
exports.StreamConnection = StreamConnection;
