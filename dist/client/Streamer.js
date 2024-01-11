"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Streamer = void 0;
const VoiceConnection_1 = require("./voice/VoiceConnection");
const StreamConnection_1 = require("./voice/StreamConnection");
const GatewayOpCodes_1 = require("./GatewayOpCodes");
class Streamer {
    constructor(client) {
        this._client = client;
        //listen for messages
        this.client.on('raw', (packet) => {
            this.handleGatewayEvent(packet.t, packet.d);
        });
    }
    get client() {
        return this._client;
    }
    get voiceConnection() {
        return this._voiceConnection;
    }
    sendOpcode(code, data) {
        // @ts-ignore
        this.client.ws.broadcast({
            op: code,
            d: data,
        });
    }
    joinVoice(guild_id, channel_id) {
        return new Promise((resolve, reject) => {
            this._voiceConnection = new VoiceConnection_1.VoiceConnection(guild_id, this.client.user.id, channel_id, (voiceUdp) => {
                resolve(voiceUdp);
            });
            this.signalVideo(guild_id, channel_id, false);
        });
    }
    createStream() {
        return new Promise((resolve, reject) => {
            if (!this.voiceConnection)
                reject("cannot start stream without first joining voice channel");
            this.signalStream(this.voiceConnection.guildId, this.voiceConnection.channelId);
            this.voiceConnection.streamConnection = new StreamConnection_1.StreamConnection(this.voiceConnection.guildId, this.client.user.id, this.voiceConnection.channelId, (voiceUdp) => {
                resolve(voiceUdp);
            });
        });
    }
    stopStream() {
        var _a;
        const stream = (_a = this.voiceConnection) === null || _a === void 0 ? void 0 : _a.streamConnection;
        if (!stream)
            return;
        stream.stop();
        this.signalStopStream(stream.guildId, stream.channelId);
        this.voiceConnection.streamConnection = undefined;
    }
    leaveVoice() {
        var _a;
        (_a = this.voiceConnection) === null || _a === void 0 ? void 0 : _a.stop();
        this.signalLeaveVoice();
        this._voiceConnection = undefined;
    }
    signalVideo(guild_id, channel_id, video_enabled) {
        this.sendOpcode(GatewayOpCodes_1.GatewayOpCodes.VOICE_STATE_UPDATE, {
            guild_id,
            channel_id,
            self_mute: false,
            self_deaf: true,
            self_video: video_enabled,
        });
    }
    signalStream(guild_id, channel_id) {
        this.sendOpcode(GatewayOpCodes_1.GatewayOpCodes.STREAM_CREATE, {
            type: "guild",
            guild_id,
            channel_id,
            preferred_region: null,
        });
        this.sendOpcode(GatewayOpCodes_1.GatewayOpCodes.STREAM_SET_PAUSED, {
            stream_key: `guild:${guild_id}:${channel_id}:${this.client.user.id}`,
            paused: false,
        });
    }
    signalStopStream(guild_id, channel_id) {
        this.sendOpcode(GatewayOpCodes_1.GatewayOpCodes.STREAM_DELETE, {
            stream_key: `guild:${guild_id}:${channel_id}:${this.client.user.id}`
        });
    }
    signalLeaveVoice() {
        this.sendOpcode(GatewayOpCodes_1.GatewayOpCodes.VOICE_STATE_UPDATE, {
            guild_id: null,
            channel_id: null,
            self_mute: true,
            self_deaf: false,
            self_video: false,
        });
    }
    handleGatewayEvent(event, data) {
        var _a, _b, _c, _d, _e;
        switch (event) {
            case "VOICE_STATE_UPDATE": {
                if (data.user_id === this.client.user.id) {
                    // transfer session data to voice connection
                    (_a = this.voiceConnection) === null || _a === void 0 ? void 0 : _a.setSession(data.session_id);
                }
                break;
            }
            case "VOICE_SERVER_UPDATE": {
                // transfer voice server update to voice connection
                if (data.guild_id != ((_b = this.voiceConnection) === null || _b === void 0 ? void 0 : _b.guildId))
                    return;
                (_c = this.voiceConnection) === null || _c === void 0 ? void 0 : _c.setTokens(data.endpoint, data.token);
                break;
            }
            case "STREAM_CREATE": {
                const [type, guildId, channelId, userId] = data.stream_key.split(":");
                if (((_d = this.voiceConnection) === null || _d === void 0 ? void 0 : _d.guildId) != guildId)
                    return;
                if (userId === this.client.user.id) {
                    this.voiceConnection.streamConnection.serverId = data.rtc_server_id;
                    this.voiceConnection.streamConnection.streamKey = data.stream_key;
                    this.voiceConnection.streamConnection.setSession(this.voiceConnection.session_id);
                }
                break;
            }
            case "STREAM_SERVER_UPDATE": {
                const [type, guildId, channelId, userId] = data.stream_key.split(":");
                if (((_e = this.voiceConnection) === null || _e === void 0 ? void 0 : _e.guildId) != guildId)
                    return;
                if (userId === this.client.user.id) {
                    this.voiceConnection.streamConnection.setTokens(data.endpoint, data.token);
                }
                break;
            }
        }
    }
}
exports.Streamer = Streamer;
