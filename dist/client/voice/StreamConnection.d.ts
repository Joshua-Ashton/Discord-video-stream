import { BaseMediaConnection } from "./BaseMediaConnection";
export declare class StreamConnection extends BaseMediaConnection {
    private _streamKey;
    private _serverId;
    setSpeaking(speaking: boolean): void;
    get serverId(): string;
    set serverId(id: string);
    get streamKey(): string;
    set streamKey(value: string);
}
