import net from 'net';
import InMemoryDB from './in-memory-db';

class InMemoryDBServer {
    private server: net.Server;
    private db: InMemoryDB;

    constructor(db: InMemoryDB) {
        this.db = db;
        this.server = net.createServer();
        this.socketCommunication();
        this.handleErrors(); 
    }

    start(port: number) {
        this.server.listen(port, () => { console.log(`In-Memory DB running on inmemory://localhost:${port}`) });
    }

    socketCommunication() {
        this.server.on("data", (data) => {
            const message = data.toString().trim();
            console.log(message);
        });
    }

    handleErrors() {
        this.server.on("error", (err) => {
            console.error(err);
        });
    }
}

export default InMemoryDBServer;