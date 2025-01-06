import { IProtocol, TKeyValue, TMethod, EMethod, TResponse, ProtocolCode, TKeyValueList } from "./protocol.type"

const ASCII_COMMA = 44;
/**
 * @description this is and protocol class to handle between in-memory client and server (using custom binary protocal)
 * @example
 *  set:
 *  bytes(0): 1 -> set, 2 -> get, 3 -> delete, 4 -> push back, 5 -> push front  
 *  bytes(1~2): key length
 *  bytes(3~6): value length
 *  bytes(7 ~ (7 + key length)): key value
 *  bytes((7 + key length) ~ (7 + key length + values length)): value
 * 
 *  get:
 *  bytes(0): 1 -> set, 2 -> get, 3 -> delete 
 *  bytes(1~2): key length
 *  bytes(7 ~ (7 + key length)): key value
 * 
 *  response:
 *  bytes(0~1): code ex: 200 400
 *  bytes(2~3): message length
 *  bytes(4~7): data length
 *  bytes(8~ (8+message length)): message value
 *  bytes((8+message length) ~ (8+message length+data length)): data value
 */
class Protocol implements IProtocol {
    decodeMethod(buffer: Buffer): TMethod {
        const cmd = buffer.readUInt8(0);
        return cmd;
    }

    encodeSet(key: string, value: any): Buffer {
        return this.encodeMethodKeyValue(EMethod.SET, key, value);
    }

    decodeSet(buffer: Buffer): TKeyValue {
        return this.decodeKeyValue(buffer);
    }

    encodeGet(key: string): Buffer {
       return this.encodeMethodKey(EMethod.GET, key);
    }

    decodeGet(buffer: Buffer): string {
        return this.decodeKey(buffer);
    }

    encodeDelete(key: string): Buffer {
        return this.encodeMethodKey(EMethod.DELETE, key);
    }

    decodeDelete(buffer: Buffer): string {
        return this.decodeKey(buffer);
    }
    
    encodeLPushBack(key: string, value: string[]): Buffer {
        return this.encodeMethodKeyValue(EMethod.LIST_PUSH_BACK, key, value.toString());
    }

    decodeLPushBack(buffer: Buffer): TKeyValueList {
        const { key, value } = this.decodeKeyValue(buffer);
        const splitBuffers: Buffer[] = [];
        let start = 0;

        for (let i = 0; i < value.length; i++) {
            if (value[i] === ASCII_COMMA) { // ASCII value of comma (',') is 44
                splitBuffers.push(value.subarray(start, i));
                start = i + 1;
            }
            if ((i === (value.length-1)) && splitBuffers.length === 0) {
                splitBuffers.push(value.subarray(start, i+1));
            }
        }

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
    encodeResponse(code: ProtocolCode, message: string, data?: Buffer | Buffer[]): Buffer {
        const messageBuffer = Buffer.from(message, 'utf-8');
        const dataLength = Array.isArray(data)
            ? data.reduce((total, buf) => total + buf.length, 0)
            : data?.length || 0;

        const buffer = Buffer.alloc(2 + 2 + 4 + messageBuffer.length + dataLength);
        buffer.writeUInt16BE(code);
        buffer.writeUInt16BE(messageBuffer.length, 2);
        buffer.writeUInt16BE(dataLength, 4);
        messageBuffer.copy(buffer, 8);

        if(!data) return buffer;

        if(Array.isArray(data)){
            const dataBuffer = Buffer.concat(data, dataLength);
            dataBuffer.copy(buffer, (8 + messageBuffer.length));
            return buffer;
        } else {
            data.copy(buffer, (8 + messageBuffer.length));
            return buffer;
        }
    }

    decodeResponse(buffer: Buffer): TResponse {
        const code = buffer.readUInt16BE(0);
        const messageLength = buffer.readUInt16BE(2);
        const dataLength = buffer.readUInt32BE(4);
        const message = buffer.subarray(8, 8 + messageLength).toString();
        const data = buffer.subarray(8 + messageLength, 8 + messageLength + dataLength);
        return { code, message, data };
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


}

export default Protocol;