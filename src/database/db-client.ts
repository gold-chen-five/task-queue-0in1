import net from "net"
import { URL } from "url";
import { IProtocol, TResponse } from "./protocol.type";

type TParseResponse = Omit<TResponse, "data"> & {
    data: string | string[];
}

class InMemoryDBClient {
    private client: net.Socket | undefined = undefined;
    private protocol: IProtocol;

    constructor(protocol: IProtocol){
        this.protocol = protocol;
    } 

    parseUrl(url: string) {
        const purl = new URL(url);
        if (purl.protocol !== "inmemory:") {
            throw new Error("Invalid protocol, Only inmemory:// is supported.");
        }
        return { host: purl.hostname, port: parseInt(purl.port) };
    }

    connect(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const { host, port } = this.parseUrl(url);
            this.client = net.createConnection(port, host, () => {
                resolve(`connected to in-memory db at inmemory://${host}:${port}`);
            });
            this.client.on('error', err => reject(err) );
            this.client.on("end", () => { console.log("disconnected from in-memory db"); });
        })
       
    }

    send(message: Buffer): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            if(!this.client) {
                return reject(new Error("Not connected to any server"));
            }

            const isSuccess = this.client.write(message);
            if (!isSuccess){
                return reject(new Error("Failed to write message to server"));
            }

            const timeout = setTimeout(() => { 
                return reject(new Error("message time out"));
            }, 15000);

            this.client.once("data", (data) => {
                clearTimeout(timeout);
                const response = this.protocol.decodeResponse(data);
                resolve(response);
            });
        });
        
    }

    close() {
        if (this.client) this.client.end();
    }

    toStringList(buffer: Buffer): string[] {
        const buffers = this.protocol.decodeBufferArray(buffer);
        return buffers.map(buffer => buffer.toString());
    }

    /**
     * will change the response data to string not buffer
     * 
     * @example
     * const response = await client.get("test");
     * const data = client.parseResponseString(response);
     */
    parseResponseString(res: TResponse): TParseResponse{
        return {...res, data: res.data.toString()};
    }

    /**
     * will change the response data to string List not buffer List
     * 
     * @example
     * const response = await client.get("test");
     * const data = client.parseResponseList(response);
     */
    parseResponseList(res: TResponse): TParseResponse{
        return {
            ...res, 
            data: this.toStringList(res.data)
        }
    }

    async get(key: string) {
        const buffer = this.protocol.encodeGet(key);
        const response = await this.send(buffer);
        return response;
    }

    async set(key: string, value: string) {
        const buffer = this.protocol.encodeSet(key, value);
        const response = await this.send(buffer);
        return response;
    }

    async lPushBack(key: string, value: string[]): Promise<TResponse> {
        const buffer = this.protocol.encodeLPushBack(key, value);
        const response = await this.send(buffer);
        return response;
    }

    async lPushFront(key: string, value: string[]): Promise<TResponse>{
        const buffer = this.protocol.encodeLPushFront(key, value);
        const response = await this.send(buffer);
        return response;
    }

    async lPopBack(key: string): Promise<TResponse>{
        const buffer = this.protocol.encodeLPopBack(key);
        const response = await this.send(buffer);
        return response;
    }

    async lPopFront(key: string): Promise<TResponse>{
        const buffer = this.protocol.encodeLPopFront(key);
        const response = await this.send(buffer);
        return response;
    }
}

export default InMemoryDBClient;