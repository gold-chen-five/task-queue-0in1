import net from 'net';

type Topic = string;

class InMemoryDB {
  private db: Record<string, any> = {};
  private channels : Record<Topic, net.Socket[]> = {};

  set(key: string, value: Buffer): void {
    this.db[key] = value;
  }

  get(key: string): any | undefined {
    return this.db[key] || undefined;
  }

  delete(key: string): void {
    delete this.db[key];
  }

  listPushBack(key: string, value: Buffer[]): void {
    if(!this.get(key)) this.db[key] = [];
    
    value.forEach(buffer => {
      (this.db[key] as Buffer[]).push(buffer);
    })
  }
  
  listPushFront(key: string, value: Buffer[]): void {
    if(!this.get(key)) this.db[key] = [];
    
    (this.db[key] as Buffer[]).unshift(...value);
  }

  listPopBack(key: string): Buffer | undefined {
    if(!this.get(key)) return undefined;

    return (this.db[key] as Buffer[]).pop();
  }

  listPopFront(key: string): Buffer | undefined {
    if(!this.get(key)) return undefined;

    return (this.db[key] as Buffer[]).shift();
  }

  getChannel(key: string): net.Socket[] | undefined {
    return this.channels[key] || undefined;
  }

  channelPush(key: string, socket: net.Socket): void {
    if(!this.getChannel(key)) this.channels[key] = [];

    this.channels[key].push(socket);
  }

  channelPop(key: string, socket: net.Socket): net.Socket | undefined {
    if(!this.getChannel(key)) return undefined;

    for(let index=0; index<this.channels[key].length; index++){
      if(this.channels[key][index] === socket) {
        return this.channels[key].splice(index, 1)[0];
      }
    }

    return undefined;
  }

}


export default InMemoryDB;