class InMemoryDB {
  private db: Record<string, any> = {};

  set(key: string, value: Buffer): void {
    this.db[key] = value;
  }

  get(key: string): any | null {
    return this.db[key] || null;
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
}


export default InMemoryDB;