class InMemoryDB {
  private db: Record<string, any> = {};

  get(key: string): any | null {
    return this.db[key] || null;
  }

  set(key: string, value: string): void {
    this.db[key] = value;
  }

  delete(key: string): void {
    delete this.db[key];
  }
}


export default InMemoryDB;