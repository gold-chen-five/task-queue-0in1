import net from 'net';

type Topic = string;

class InMemoryDB {
  private db: Map<string, any> = new Map();
  private channels: Map<Topic, net.Socket[]> = new Map();

  set(key: string, value: Buffer): void {
    this.db.set(key, value);
  }

  get(key: string): any | undefined {
    return this.db.get(key);
  }

  delete(key: string): void {
    this.db.delete(key);
  }

  listPushBack(key: string, value: Buffer[]): void {
    if (!this.db.has(key)) this.db.set(key, []);

    const list = this.db.get(key) as Buffer[];
    list.push(...value);
  }

  listPushFront(key: string, value: Buffer[]): void {
    if (!this.db.has(key)) this.db.set(key, []);

    const list = this.db.get(key) as Buffer[];
    list.unshift(...value);
  }

  listPopBack(key: string): Buffer | undefined {
    const list = this.db.get(key) as Buffer[] | undefined;
    if (!list) return undefined;

    return list.pop();
  }

  listPopFront(key: string): Buffer | undefined {
    const list = this.db.get(key) as Buffer[] | undefined;
    if (!list) return undefined;

    return list.shift();
  }

  getChannel(key: string): net.Socket[] | undefined {
    return this.channels.get(key);
  }

  channelPush(key: string, socket: net.Socket): void {
    if (!this.channels.has(key)) this.channels.set(key, []);

    const channel = this.channels.get(key) as net.Socket[];
    channel.push(socket);
  }

  channelPop(key: string, socket: net.Socket): net.Socket | undefined {
    if (!this.channels.has(key)) return undefined;

    const channel = this.channels.get(key) as net.Socket[];

    for (let index = 0; index < channel.length; index++) {
      if (channel[index] === socket) {
        return channel.splice(index, 1)[0];
      }
    }

    return undefined;
  }
}

export default InMemoryDB;
