import net from 'net';
import InMemoryDB from './in-memory-db';
import { IProtocol, EMethod, ProtocolCode } from './protocol.type';

class InMemoryDBServer {
    private server: net.Server;
    private db: InMemoryDB;
    private protocol: IProtocol;

    constructor(
        db: InMemoryDB, 
        protocol: IProtocol
    ) {
        this.db = db;
        this.protocol = protocol;    
        this.server = net.createServer((socket: net.Socket) => {
            this.socketCommunication(socket);
            this.handleErrors(socket);
        });
    }

    start(port: number) {
        this.server.listen(port, () => { console.log(`In-Memory DB running on inmemory://localhost:${port}`) });
    }

    socketCommunication(socket: net.Socket) {
        socket.on("data", (message: Buffer) => {
            try {
                const method = this.protocol.decodeMethod(message);
                if(!method)  return;
    
                switch(method) {
                    case EMethod.SET:
                        this.handleSet(socket, message);
                        break;
                    case EMethod.GET:
                        this.handleGet(socket, message);
                        break;
                    case EMethod.DELETE:
                        this.handleDelete(socket, message);
                        break;
                    case EMethod.LIST_PUSH_BACK:
                        this.handleListPushBack(socket, message);
                        break;
                    case EMethod.LIST_PUSH_FRONT:
                        this.handleListPushFront(socket, message);
                        break;
                }
            } catch(err: any) {
                const response = this.protocol.encodeResponse(ProtocolCode.FAIL, err.message);
                socket.write(response);
            }
        });
    }

    handleSet(socket: net.Socket, buffer: Buffer) {
        const { key, value } = this.protocol.decodeSet(buffer);
        this.db.set(key, value);
        const response = this.protocol.encodeResponse(ProtocolCode.OK, "Set success");
        socket.write(response);
    }

    handleGet(socket: net.Socket, buffer: Buffer) {
        const key = this.protocol.decodeGet(buffer);
        const value = this.db.get(key);
        const response = this.protocol.encodeResponse(ProtocolCode.OK, "Get success", value);
        socket.write(response);
    }

    handleDelete(socket: net.Socket, buffer: Buffer){
        const key = this.protocol.decodeDelete(buffer);
        this.db.delete(key);
        const response = this.protocol.encodeResponse(ProtocolCode.OK, "Delete success");
        socket.write(response);
    }

    handleListPushBack(socket: net.Socket, buffer: Buffer){
        const { key, value } = this.protocol.decodeList(buffer);
        this.db.listPushBack(key, value);
        const response = this.protocol.encodeResponse(ProtocolCode.OK, "List push back success");
        socket.write(response);
    }

    handleListPushFront(socket: net.Socket, buffer: Buffer){
        const { key, value } = this.protocol.decodeList(buffer);
        this.db.listPushFront(key, value);
        const response = this.protocol.encodeResponse(ProtocolCode.OK, "List push front success");
        socket.write(response);
    }

    handleErrors(socket: net.Socket) {
        socket.on("error", () => {});
    }
}

export default InMemoryDBServer;