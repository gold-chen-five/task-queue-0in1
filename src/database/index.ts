import InMemoryDB from "./in-memory-db";
import InMemoryDBServer from "./db-server";
import InMemoryDBClient from "./db-client";
import Protocol from "./protocol";
import { ProtocolCode } from "./protocol.type";

function createServer(): InMemoryDBServer {
    const protocol = new Protocol();
    const inMemoryDB = new InMemoryDB();
    const inMemoryDBServer = new InMemoryDBServer(inMemoryDB, protocol);
    return inMemoryDBServer;
}

function createClient(): InMemoryDBClient {
    const protocol = new Protocol();
    return new InMemoryDBClient(protocol);
}   

export default { createServer, createClient };

export { ProtocolCode, InMemoryDBClient, InMemoryDBServer };


