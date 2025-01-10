// const buffer = Buffer.alloc(1);

// buffer.writeUInt8(10, 0);

// console.log(buffer);

// const a = {
//     abc: 1,
//     sdf: "\\"
// };

// console.log(JSON.parse(JSON.stringify(a)));

const a = ["a", "b", "c"];
const b = a.join("\\");
console.log(b);