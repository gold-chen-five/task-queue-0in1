export enum EMethod {
    SET = "SET",
    GET = "GET",
    DELETE = "DELETE"
}

export type TMethod = EMethod | undefined;

export type TKeyValue = {
    key: string;
    value: any;
}

export type TResponse = {
    code: ProtocolCode;
    message: string;
}

export interface IProtocol {
    decodeMethod(buffer: Buffer): TMethod;
    encodeSet(key: string, value: any): Buffer;
    decodeSet(buffer: Buffer): TKeyValue;
    encodeGet(key: string): Buffer;
    decodeGet(buffer: Buffer): string;
    encodeDelete(key: string): Buffer;
    decodeDelete(buffer: Buffer): string; 
    encodeResponse(code: ProtocolCode, message: string): Buffer;
    decodeResponse(buffer: Buffer): TResponse;
}

export enum ProtocolCode {
    OK = 200,
    FAIL = 400,
}