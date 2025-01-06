const buffer = Buffer.alloc(1);

buffer.writeUInt8(10, 0);

console.log(buffer);