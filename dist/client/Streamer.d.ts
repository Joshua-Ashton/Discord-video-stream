import { VoiceConnection } from "./voice/VoiceConnection";
import { Client } from 'discord.js-selfbot-v13';
import { MediaUdp } from "./voice/MediaUdp";
export declare class Streamer {
    private _voiceConnection?;
    private _client;
    constructor(client: Client);
    get client(): Client;
    get voiceConnection(): VoiceConnection | undefined;
    sendOpcode(code: number, data: any): void;
    joinVoice(guild_id: string, channel_id: string): Promise<MediaUdp>;
    createStream(): Promise<MediaUdp>;
    stopStream(): void;
    leaveVoice(): void;
    signalVideo(guild_id: string, channel_id: string, video_enabled: boolean): void;
    signalStream(guild_id: string, channel_id: string): void;
    signalStopStream(guild_id: string, channel_id: string): void;
    signalLeaveVoice(): void;
    private handleGatewayEvent;
}
