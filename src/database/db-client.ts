import net from "net"
import { URL } from "url";
import { IProtocol, TResponse } from "./protocol.type";

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
                return reject(new Error('Failed to write message to server'));
            }

            const timeout = setTimeout(() => { 
                return reject(new Error("message time out"));
            }, 5000);

            this.client.once("data", (data) => {
                clearTimeout(timeout);
                const response = this.protocol.decodeResponse(data);
                resolve(response);
            });
        });
        
    }

    close() {
        if (this.client) {
            this.client.end();
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

    async lPushBack(key: string, value: string[]){
        const buffer = this.protocol.encodeLPushBack(key, value);
        console.log(buffer);
        const response = await this.send(buffer);
        return response;
    }

    async lPopEnd(){

    }

    async lPopFront(){

    }
}

export default InMemoryDBClient;