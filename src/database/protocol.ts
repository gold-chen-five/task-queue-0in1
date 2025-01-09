import { IProtocol, TKeyValue, TMethod, EMethod, TResponse, ProtocolCode, TKeyValueList } from "./protocol.type"

const ASCII_COMMA = 44;
const MAX_UINT32 = 0xFFFFFFFF; // 4,294,967,295 bytes;

/**
 * @description this is and protocol class to handle between in-memory client and server (using custom binary protocal)
 */
class Protocol implements IProtocol {
    /**
     * @param buffer buffer message
     * @returns 1 -> set, 2 -> get, 3 -> delete, 4 -> push back, 5 -> push front  
     */
    decodeMethod(buffer: Buffer): TMethod {
        const cmd = buffer.readUInt8(0);
        return cmd;
    }

    /**
     *  @example
     *  set:
     *  bytes(0): 1 -> set
     *  bytes(1~2): key length
     *  bytes(3~6): value length
     *  bytes(7 ~ (7 + key length)): key value
     *  bytes((7 + key length) ~ (7 + key length + values length)): value
     */
    encodeSet(key: string, value: any): Buffer {
        return this.encodeMethodKeyValue(EMethod.SET, key, value);
    }

    decodeSet(buffer: Buffer): TKeyValue {
        return this.decodeKeyValue(buffer);
    }

    /**
     *  @example
     *  get:
     *  bytes(0): 2 -> get
     *  bytes(1~2): key length
     *  bytes(3 ~ (3 + key length)): key value
     */
    encodeGet(key: string): Buffer {
       return this.encodeMethodKey(EMethod.GET, key);
    }

    decodeGet(buffer: Buffer): string {
        return this.decodeKey(buffer);
    }

    /**
     *  @example
     *  get:
     *  bytes(0): 3 -> delete 
     *  bytes(1~2): key length
     *  bytes(3 ~ (3 + key length)): key value
     */
    encodeDelete(key: string): Buffer {
        return this.encodeMethodKey(EMethod.DELETE, key);
    }

    decodeDelete(buffer: Buffer): string {
        return this.decodeKey(buffer);
    }
    
    /**
     *  @example
     *  set:
     *  bytes(0): 4 -> push back
     *  bytes(1~2): key length
     *  bytes(3~6): value length
     *  bytes(7 ~ (7 + key length)): key value
     *  bytes((7 + key length) ~ (7 + key length + values length)): value
     */
    encodeLPushBack(key: string, value: string[]): Buffer {
        return this.encodeMethodKeyValue(EMethod.LIST_PUSH_BACK, key, value.toString());
    }

    /**
     *  @example
     *  set:
     *  bytes(0): 5 -> push front
     *  bytes(1~2): key length
     *  bytes(3~6): value length
     *  bytes(7 ~ (7 + key length)): key value
     *  bytes((7 + key length) ~ (7 + key length + values length)): value
     */
    encodeLPushFront(key: string, value: string[]): Buffer {
        return this.encodeMethodKeyValue(EMethod.LIST_PUSH_FRONT, key, value.toString());
    }

    /**
     *  @example
     *  get:
     *  bytes(0): 6 -> pop back
     *  bytes(1~2): key length
     *  bytes(3 ~ (3 + key length)): key value
     */
    encodeLPopBack(key: string): Buffer {
        return this.encodeMethodKey(EMethod.LIST_POP_BACK, key);
    }

    /**
     *  @example
     *  get:
     *  bytes(0): 7 -> pop front
     *  bytes(1~2): key length
     *  bytes(3 ~ (3 + key length)): key value
     */
    encodeLPopFront(key: string): Buffer {
        return this.encodeMethodKey(EMethod.LIST_POP_FRONT, key);
    }

    decodeLPop(buffer: Buffer): string {
        return this.decodeKey(buffer);
    }

    decodeList(buffer: Buffer): TKeyValueList {
        const { key, value } = this.decodeKeyValue(buffer);
        const splitBuffers = this.decodeBufferArray(value);
        return { key, value: splitBuffers };
    }


    /**
     *  @example
     *  response:
     *  bytes(0~1): code ex: 200 400
     *  bytes(2~3): message length
     *  bytes(4~7): data length
     *  bytes(8~ (8+message length)): message value
     *  bytes((8+message length) ~ (8+message length+data length)): data value
    */
    encodeResponse(code: ProtocolCode, message: string, data?: Buffer | Buffer[] ): Buffer {
        const bdata = this.multiTypeToBuffer(data);
        const messageBuffer = Buffer.from(message, 'utf-8');
        const dataLength = bdata?.length || 0;

        if (dataLength > MAX_UINT32) {
            throw new Error(`Value size exceeds the maximum allowed size of 4GB.`);
        }

        const buffer = Buffer.alloc(2 + 2 + 4 + messageBuffer.length + dataLength);
        buffer.writeUInt16BE(code);
        buffer.writeUInt16BE(messageBuffer.length, 2);
        buffer.writeUInt32BE(dataLength, 4);
        messageBuffer.copy(buffer, 8);

        if(!bdata) return buffer;

        bdata.copy(buffer, (8 + messageBuffer.length));

        return buffer;
    }

    decodeResponse(buffer: Buffer): TResponse {
        const code = buffer.readUInt16BE(0);
        const messageLength = buffer.readUInt16BE(2);
        const dataLength = buffer.readUInt32BE(4);
        const message = buffer.subarray(8, 8 + messageLength).toString();
        const data = buffer.subarray(8 + messageLength, 8 + messageLength + dataLength);
        return { code, message, data };
    }

    encodeBufferArrayToBuffer(buffers: Buffer[]): Buffer {
        const combined: Buffer[] = [];
        buffers.forEach((buffer, index) => {
            combined.push(buffer);
            if(index < (buffers.length - 1)) {
                const comma = Buffer.from([ASCII_COMMA]);
                combined.push(comma);
            }
        })
        const combinedLength = combined.reduce((total, buf) => total + buf.length, 0)
        return Buffer.concat(combined, combinedLength);
    }

    decodeBufferArray(buffer: Buffer): Buffer[] {
        const splitBuffers: Buffer[] = [];
        let start = 0;

        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === ASCII_COMMA) { // ASCII value of comma (',') is 44
                splitBuffers.push(buffer.subarray(start, i));
                start = i + 1;
            }
            if (i === (buffer.length-1)) {
                splitBuffers.push(buffer.subarray(start, i+1));
            }
        }

        return splitBuffers
    }

    multiTypeToBuffer(buffer: Buffer | Buffer[] | undefined): Buffer | undefined {
        if(Array.isArray(buffer)){
            return this.encodeBufferArrayToBuffer(buffer);
        } else {
            return buffer;
        }
    }
    
    encodeMethodKey(method: EMethod, key: string): Buffer {
        const keyBuffer = Buffer.from(key, 'utf-8');

        const buffer = Buffer.alloc(1 + 2 + keyBuffer.length);
        
        buffer.writeUInt8(method, 0);
        buffer.writeUInt16BE(keyBuffer.length, 1);
        keyBuffer.copy(buffer, 3);

        return buffer;
    }

    decodeKey(buffer: Buffer): string {
        const keyLength = buffer.readUInt16BE(1); // Next 2 bytes
        const key = buffer.subarray(3, 3 + keyLength).toString();
        return key;
    }

    encodeMethodKeyValue(method: number, key: string, value: string): Buffer {
        const keyBuffer = Buffer.from(key, 'utf-8');
        const valueBuffer = Buffer.from(value, 'utf-8');
      
        const buffer = Buffer.alloc(1 + 2 + 4 + keyBuffer.length + valueBuffer.length);
        
         // Check if the value is too big
        if (valueBuffer.length > MAX_UINT32) {
            throw new Error(`Value size exceeds the maximum allowed size of 4GB.`);
        }

        buffer.writeUInt8(method, 0);
        buffer.writeUInt16BE(keyBuffer.length, 1);
        buffer.writeUInt32BE(valueBuffer.length, 3);
        keyBuffer.copy(buffer, 7);
        valueBuffer.copy(buffer, 7 + keyBuffer.length);
      
        return buffer;
    }

    decodeKeyValue(buffer: Buffer): TKeyValue {
        const keyLength = buffer.readUInt16BE(1); // Next 2 bytes
        const valueLength = buffer.readUInt32BE(3); // Next 4 bytes
        const key = buffer.subarray(7, 7 + keyLength).toString();
        const value = buffer.subarray(7 + keyLength, 7 + keyLength + valueLength);
        return { key, value };
    }

    encodePublish(topic: string): Buffer {
        return this.encodeMethodKey(EMethod.PUBLISH, topic);
    }

    encodeSubscribe(topic: string): Buffer {
        return this.encodeMethodKey(EMethod.SUBSCRIBE, topic);
    }

    encodeLeaveChannel(topic: string): Buffer {
        return this.encodeMethodKey(EMethod.LEAVER_CHANNLE, topic)    
    }

    decodeChannel(buffer: Buffer): string {
        return this.decodeKey(buffer);
    }
}

export default Protocol;