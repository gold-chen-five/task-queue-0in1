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
                    case EMethod.LIST_POP_BACK:
                        this.handleListPopBack(socket, message);
                        break;
                    case EMethod.LIST_POP_FRONT:
                        this.handleListPopFront(socket, message);
                        break;
                    case EMethod.PUBLISH:
                        this.handlePublish(socket, message);
                        break;
                    case EMethod.SUBSCRIBE:
                        this.handleSubscribe(socket, message);
                        break;
                    case EMethod.LEAVER_CHANNLE:
                        this.handleSubscriberLeave(socket, message);
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

    handleListPopBack(socket: net.Socket, buffer: Buffer){
        const key = this.protocol.decodeLPop(buffer);
        const popData = this.db.listPopBack(key);

        let response;
        if(popData){
            response  = this.protocol.encodeResponse(ProtocolCode.OK, "List pop back success", popData);
        } else {
            response  = this.protocol.encodeResponse(ProtocolCode.LIST_IS_EMPTY, "List is empty", popData);
        }
        
        socket.write(response);
    }

    handleListPopFront(socket: net.Socket, buffer: Buffer){
        const key = this.protocol.decodeLPop(buffer);
        const popData = this.db.listPopFront(key);
        let response;
        if(popData){
            response  = this.protocol.encodeResponse(ProtocolCode.OK, "List pop back success", popData);
        } else {
            response  = this.protocol.encodeResponse(ProtocolCode.LIST_IS_EMPTY, "List is empty", popData);
        }
        socket.write(response);
    }

    handlePublish(socket: net.Socket, buffer: Buffer){
        const topic = this.protocol.decodeChannel(buffer);
        const channel = this.db.getChannel(topic);
        if(!channel){
            const response  = this.protocol.encodeResponse(ProtocolCode.NOT_FOUND, "Channel not found");
            socket.write(response);
            return;
        }

        channel.forEach(s => {
            const data = this.protocol.encodeStringToBuffer(topic);
            const response  = this.protocol.encodeResponse(ProtocolCode.SUBSCRIBE, "Publisher send message", data);
            s.write(response);
        });

        const response  = this.protocol.encodeResponse(ProtocolCode.OK, "Publish to subscriber");
        socket.write(response);
    }

    handleSubscribe(socket: net.Socket, buffer: Buffer){
        const topic = this.protocol.decodeChannel(buffer);
        this.db.channelPush(topic, socket);
        const response = this.protocol.encodeResponse(ProtocolCode.OK, "Subscribe success");
        socket.write(response);
    }

    handleSubscriberLeave(socket: net.Socket, buffer: Buffer){
        const topic = this.protocol.decodeChannel(buffer);
        const subscirber = this.db.channelPop(topic, socket);
        if(!subscirber) {
            const response = this.protocol.encodeResponse(ProtocolCode.NOT_FOUND, "Subscirber not found");
            socket.write(response);
            return;
        }

        const response = this.protocol.encodeResponse(ProtocolCode.OK, "Leave success");
        socket.write(response);
        return;
    }

    handleErrors(socket: net.Socket) {
        socket.on("error", () => {});
    }
}

export default InMemoryDBServer;