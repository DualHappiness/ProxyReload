const raw = { a: { b: 0, c: function () { this.b += 1; } } }
const loop = 1000000;
const start = Date.now();
for (let i = 0; i < loop; i++) {
    raw.a.c();
}
console.log(`raw : ${raw.a.b}`);
console.log(`time： ${Date.now() - start}`);

require('.');
const proxy = require('./test');
const start2 = Date.now();
for (let i = 0; i < loop; i++) {
    proxy.a.c();
}
console.log(`proxy : ${proxy.a.b}`);
console.log(`time： ${Date.now() - start2}`);
