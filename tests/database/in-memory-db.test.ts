import net from 'net';
import InMemoryDB from "@/database/in-memory-db";

describe('InMemoryDB', () => {
  let db: InMemoryDB;

  beforeEach(() => {
    db = new InMemoryDB(); // Create a fresh instance before each test
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      const key = 'key1';
      const value = Buffer.from('testValue');

      db.set(key, value);
      const result = db.get(key);

      expect(result).toEqual(value);
    });

    it('should return undefined for non-existent key', () => {
      const result = db.get('nonExistentKey');
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a value', () => {
      const key = 'key2';
      const value = Buffer.from('valueToDelete');
      
      db.set(key, value);
      db.delete(key);

      const result = db.get(key);
      expect(result).toBeUndefined();
    });
  });

  describe('list operations', () => {
    it('should push values to the back of the list', () => {
      const key = 'listKey';
      const value1 = Buffer.from('item1');
      const value2 = Buffer.from('item2');

      db.listPushBack(key, [value1, value2]);

      const result = db.get(key) as Buffer[];
      expect(result).toEqual([value1, value2]);
    });

    it('should push values to the front of the list', () => {
      const key = 'listKey2';
      const value1 = Buffer.from('item1');
      const value2 = Buffer.from('item2');

      db.listPushFront(key, [value1, value2]);

      const result = db.get(key) as Buffer[];
      expect(result).toEqual([value2, value1]);
    });

    it('should pop values from the back of the list', () => {
      const key = 'listKey3';
      const value1 = Buffer.from('item1');
      const value2 = Buffer.from('item2');

      db.listPushBack(key, [value1, value2]);

      const poppedValue = db.listPopBack(key);
      expect(poppedValue).toEqual(value2);

      const result = db.get(key) as Buffer[];
      expect(result).toEqual([value1]);
    });

    it('should pop values from the front of the list', () => {
      const key = 'listKey4';
      const value1 = Buffer.from('item1');
      const value2 = Buffer.from('item2');

      db.listPushFront(key, [value1, value2]);

      const poppedValue = db.listPopFront(key);
      expect(poppedValue).toEqual(value2);

      const result = db.get(key) as Buffer[];
      expect(result).toEqual([value1]);
    });
  });

  describe('channel operations', () => {
    it('should push a socket to a channel', () => {
      const key = 'channelKey';
      const socket = new net.Socket();

      db.channelPush(key, socket);

      const result = db.getChannel(key);
      expect(result).toHaveLength(1);
      expect(result?.[0]).toBe(socket);
    });

    it('should pop a socket from a channel', () => {
      const key = 'channelKey2';
      const socket = new net.Socket();
      
      db.channelPush(key, socket);
      const poppedSocket = db.channelPop(key, socket);

      expect(poppedSocket).toBe(socket);
      const result = db.getChannel(key);
      expect(result).toHaveLength(0);
    });

    it('should return undefined if socket is not in the channel', () => {
      const key = 'channelKey3';
      const socket1 = new net.Socket();
      const socket2 = new net.Socket();
      
      db.channelPush(key, socket1);

      const poppedSocket = db.channelPop(key, socket2);
      expect(poppedSocket).toBeUndefined();
    });
  });
});
