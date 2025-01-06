class InMemoryDB {
  private db: Record<string, any> = {};

  set(key: string, value: string): void {
    this.db[key] = value;
  }

  get(key: string): any | null {
    return this.db[key] || null;
  }

  delete(key: string): void {
    delete this.db[key];
  }
}


export default InMemoryDB;