import { StreamConnection } from './StreamConnection';
import { BaseMediaConnection } from './BaseMediaConnection';
export declare class VoiceConnection extends BaseMediaConnection {
    streamConnection?: StreamConnection;
    get serverId(): string;
    stop(): void;
}
