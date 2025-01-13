
export enum EMethod {
    SET = 1,
    GET = 2,
    DELETE = 3,
    LIST_PUSH_BACK = 4,
    LIST_PUSH_FRONT = 5,
    LIST_POP_BACK = 6,
    LIST_POP_FRONT = 7,
    PUBLISH = 8,
    SUBSCRIBE = 9,
    LEAVER_CHANNLE = 10
}

export type TMethod = EMethod | null;

export type TKeyValue = {
    key: string;
    value: Buffer;
}

export type TKeyValueList = {
    key: string;
    value: Buffer[];
}

export type TResponse = {
    code: ProtocolCode;
    message: string;
    data: Buffer;
}

export interface IProtocol {
    decodeMethod(buffer: Buffer): TMethod;
    encodeSet(key: string, value: string): Buffer;
    decodeSet(buffer: Buffer): TKeyValue;
    encodeGet(key: string): Buffer;
    decodeGet(buffer: Buffer): string;
    encodeDelete(key: string): Buffer;
    decodeDelete(buffer: Buffer): string;
    encodeLPushBack(key: string, value: string[]): Buffer;
    encodeLPushFront(key: string, value: string[]): Buffer;
    encodeLPopBack(key: string): Buffer;
    encodeLPopFront(key: string): Buffer;
    decodeLPop(buffer: Buffer): string;
    decodeList(buffer: Buffer): TKeyValueList; 
    encodeResponse(code: ProtocolCode, message: string, data?: Buffer | Buffer[]): Buffer;
    decodeResponse(buffer: Buffer): TResponse;
    decodeBufferArray(buffer: Buffer): Buffer[];
    encodePublish(topic: string): Buffer;
    encodeSubscribe(topic: string): Buffer;
    encodeLeaveChannel(topic: string): Buffer;
    decodeChannel(buffer: Buffer): string;
    encodeStringToBuffer(data: string): Buffer;
}

export enum ProtocolCode {
    OK = 200,
    SUBSCRIBE = 201,
    FAIL = 400,
    LIST_IS_EMPTY = 401,
    NOT_FOUND = 404,
}