import net from 'net';
import InMemoryDB from './in-memory-db';

class InMemoryDBServer {
    private server: net.Server;
    private db: InMemoryDB;

    constructor() {
        this.db = new InMemoryDB();
        this.server = net.createServer(this.socketCommunication);        
    }

    start(port: number) {
        this.server.listen(port, () => { console.log(`In-Memory DB start at port ${port}`) });
    }

    socketCommunication(socket: net.Socket) {
        socket.on("data", (data) => {
            const message = data.toString().trim();
            console.log(message);
        });
    }
}

export default InMemoryDBServer;