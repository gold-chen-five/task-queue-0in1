import net from "net"
import { URL } from "url";

class InMemoryDBClient {
    private client: net.Socket | undefined = undefined;

    parseUrl(url: string) {
        const purl = new URL(url);
        if (purl.protocol !== "inmemory:") {
            throw new Error("Invalid protocol, Only inmemory:// is supported.");
        }
        return { host: purl.hostname, port: parseInt(purl.port) };
    }

    connect(url: string) {
        const { host, port } = this.parseUrl(url);
        this.client = net.createConnection(port, host, () => {
            console.log(`connected to in-memory db at inmemory://${host}:${port}`);
        });

        this.client.on("end", () => {
            console.log("disconnected from in-memory db");
        });
    }

    send(message: string) {
        if (!this.client) {
            throw new Error("Not connected to any server");
        }
        this.client.write(message);
    }

    close() {
        if (this.client) {
            this.client.end();
        }
    }
}

export default InMemoryDBClient;