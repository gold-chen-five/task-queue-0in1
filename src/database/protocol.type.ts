export enum EMethod {
    SET = 1,
    GET = 2,
    DELETE = 3,
    LIST_PUSH_BACK = 4,
    LIST_PUSH_FRONT = 5
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
    decodeLPushBack(buffer: Buffer): TKeyValueList; 
    encodeResponse(code: ProtocolCode, message: string, data?: Buffer): Buffer;
    decodeResponse(buffer: Buffer): TResponse;
}

export enum ProtocolCode {
    OK = 200,
    FAIL = 400,
}