"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMediaPacketizer = exports.max_int32bit = exports.max_int16bit = void 0;
const libsodium_wrappers_1 = require("libsodium-wrappers");
exports.max_int16bit = (Math.pow(2, 16)) - 1;
exports.max_int32bit = (Math.pow(2, 32)) - 1;
class BaseMediaPacketizer {
    constructor(connection, payloadType, extensionEnabled = false) {
        this._mediaUdp = connection;
        this._payloadType = payloadType;
        this._sequence = 0;
        this._timestamp = 0;
        this._mtu = 1200;
        this._extensionEnabled = extensionEnabled;
        ;
    }
    sendFrame(frame) {
        // override this
    }
    onFrameSent() {
        // override this
    }
    /**
     * Partitions a buffer into chunks of length this.mtu
     * @param data buffer to be partitioned
     * @returns array of chunks
     */
    partitionDataMTUSizedChunks(data) {
        let i = 0;
        let len = data.length;
        const out = [];
        while (len > 0) {
            const size = Math.min(len, this._mtu);
            out.push(data.slice(i, i + size));
            len -= size;
            i += size;
        }
        return out;
    }
    getNewSequence() {
        this._sequence++;
        if (this._sequence > exports.max_int16bit)
            this._sequence = 0;
        return this._sequence;
    }
    incrementTimestamp(incrementBy) {
        this._timestamp += incrementBy;
        if (this._timestamp > exports.max_int32bit)
            this._timestamp = 0;
    }
    makeRtpHeader(ssrc, isLastPacket = true) {
        const packetHeader = Buffer.alloc(12);
        packetHeader[0] = 2 << 6 | ((this._extensionEnabled ? 1 : 0) << 4); // set version and flags
        packetHeader[1] = this._payloadType; // set packet payload
        if (isLastPacket)
            packetHeader[1] |= 0b10000000; // mark M bit if last frame
        packetHeader.writeUIntBE(this.getNewSequence(), 2, 2);
        packetHeader.writeUIntBE(this._timestamp, 4, 4);
        packetHeader.writeUIntBE(ssrc, 8, 4);
        return packetHeader;
    }
    /**
     * Creates a single extension of type playout-delay
     * Discord seems to send this extension on every video packet
     * @see https://webrtc.googlesource.com/src/+/refs/heads/main/docs/native-code/rtp-hdrext/playout-delay
     * @returns playout-delay extension @type Buffer
     */
    createHeaderExtension() {
        const extensions = [{ id: 5, len: 2, val: 0 }];
        /**
         *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
            |      defined by profile       |           length              |
            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        */
        const profile = Buffer.alloc(4);
        profile[0] = 0xBE;
        profile[1] = 0xDE;
        profile.writeInt16BE(extensions.length, 2); // extension count
        const extensionsData = [];
        for (let ext of extensions) {
            /**
             * EXTENSION DATA - each extension payload is 32 bits
             */
            const data = Buffer.alloc(4);
            /**
             *  0 1 2 3 4 5 6 7
                +-+-+-+-+-+-+-+-+
                |  ID   |  len  |
                +-+-+-+-+-+-+-+-+

            where len = actual length - 1
            */
            data[0] = (ext.id & 0b00001111) << 4;
            data[0] |= ((ext.len - 1) & 0b00001111);
            /**  Specific to type playout-delay
             *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4
                +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                |       MIN delay       |       MAX delay       |
                +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
            */
            data.writeUIntBE(ext.val, 1, 2); // not quite but its 0 anyway
            extensionsData.push(data);
        }
        return Buffer.concat([profile, ...extensionsData]);
    }
    // encrypts all data that is not in rtp header.
    // rtp header extensions and payload headers are also encrypted
    encryptData(message, nonceBuffer) {
        return (0, libsodium_wrappers_1.crypto_secretbox_easy)(message, nonceBuffer, this._mediaUdp.mediaConnection.secretkey);
    }
    get mediaUdp() {
        return this._mediaUdp;
    }
    get mtu() {
        return this._mtu;
    }
}
exports.BaseMediaPacketizer = BaseMediaPacketizer;
