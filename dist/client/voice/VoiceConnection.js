"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceConnection = void 0;
const BaseMediaConnection_1 = require("./BaseMediaConnection");
class VoiceConnection extends BaseMediaConnection_1.BaseMediaConnection {
    get serverId() {
        return this.guildId;
    }
    stop() {
        var _a;
        super.stop();
        (_a = this.streamConnection) === null || _a === void 0 ? void 0 : _a.stop();
    }
}
exports.VoiceConnection = VoiceConnection;
