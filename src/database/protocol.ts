import { IProtocol, TKeyValue, TMethod, EMethod, TResponse, ProtocolCode } from "./protocol.type"


/**
 * @description this is and protocol class to handle between in-memory client and server (using custom binary protocal)
 * @example
 *  set:
 *  bytes(0): 1 -> set, 2 -> get, 3 -> delete 
 *  bytes(1~2): key length
 *  bytes(3~6): value length
 *  bytes(7 ~ (7 + key length)): key value
 *  bytes((7 + key length) ~ (7 + key length + values lngth)): value
 * 
 *  get:
 *  bytes(0): 1 -> set, 2 -> get, 3 -> delete 
 *  bytes(1~2): key length
 *  bytes(7 ~ (7 + key length)): key value
 * 
 *  response:
 *  bytes(0~1): code ex: 200 400
 *  bytes(2~3): message length
 *  bytes(4~ (4+message length)): message value
 */
class Protocol implements IProtocol {
    decodeMethod(buffer: Buffer): TMethod {
        const cmd = buffer.readUInt8(0);
            switch(cmd) {
            case 1:
                return EMethod.SET;
            case 2:
                return EMethod.GET;
            case 3:
                return EMethod.DELETE;
        }
        return undefined;
    }

    encodeSet(key: string, value: any): Buffer {
        const keyBuffer = Buffer.from(key, 'utf-8');
        const valueBuffer = Buffer.from(value, 'utf-8');
      
        const buffer = Buffer.alloc(1 + 2 + 4 + keyBuffer.length + valueBuffer.length);
      
        buffer.writeUInt8(1, 0);
        buffer.writeUInt16BE(keyBuffer.length, 1);
        buffer.writeUInt32BE(valueBuffer.length, 3);
        keyBuffer.copy(buffer, 7);
        valueBuffer.copy(buffer, 7 + keyBuffer.length);
      
        return buffer;
    }

    decodeSet(buffer: Buffer): TKeyValue {
        const keyLength = buffer.readUInt16BE(1); // Next 2 bytes
        const valueLength = buffer.readUInt32BE(3); // Next 4 bytes
        const key = buffer.subarray(7, 7 + keyLength).toString();
        const value = buffer.subarray(7 + keyLength, 7 + keyLength + valueLength).toString();
        return { key, value };
    }

    encodeGet(key: string): Buffer {
       return this.encodeKeyMethod(key, 2);
    }

    decodeGet(buffer: Buffer): string {
        return this.decodeKeyMethod(buffer);
    }

    encodeDelete(key: string): Buffer {
        return this.encodeKeyMethod(key, 3);
    }

    decodeDelete(buffer: Buffer): string {
        return this.decodeKeyMethod(buffer);
    }

    encodeResponse(code: ProtocolCode, message: string): Buffer {
        const messageBuffer = Buffer.from(message, 'utf-8');

        const buffer = Buffer.alloc(2 + 2 + messageBuffer.length);
        buffer.writeUInt16BE(code);
        buffer.writeUInt16BE(messageBuffer.length, 2);
        messageBuffer.copy(buffer, 4);

        return buffer;
    }

    decodeResponse(buffer: Buffer): TResponse {
        const code = buffer.readUInt16BE(0);
        const messageLength = buffer.readUInt16BE(2);
        const message = buffer.subarray(4, 4 + messageLength).toString();
        return { code, message };
    }
    
    encodeKeyMethod(key: string, method: number): Buffer {
        const keyBuffer = Buffer.from(key, 'utf-8');

        const buffer = Buffer.alloc(1 + 2 + keyBuffer.length);

        buffer.writeUInt8(method, 0);
        buffer.writeUInt16BE(keyBuffer.length, 1);
        keyBuffer.copy(buffer, 3);

        return buffer;
    }

    decodeKeyMethod(buffer: Buffer): string {
        const keyLength = buffer.readUInt16BE(1); // Next 2 bytes
        const key = buffer.subarray(3, 3 + keyLength).toString();
        return key;
    }
}

export default Protocol;