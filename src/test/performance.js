const raw = {
    a: {
        b: 0,
        c: function (count) {
            for (let i = 0; i < count; i++)
                this.b += 1;
        },
        d: function (raw, count) {
            for (let i = 0; i < count; i++)
                raw.a.b += 1;
        }
    }
};
const loop = 1000000;
const inside = 100;
let start = Date.now();
for (let i = 0; i < loop; i++) {
    raw.a.c(inside);
}
console.log(`raw : ${raw.a.b}`);
console.log(`time： ${Date.now() - start}`);
raw.a.b = 0;
start = Date.now();
for (let i = 0; i < loop; i++) {
    raw.a.d(raw, inside);
}
console.log(`raw : ${raw.a.b}`);
console.log(`time： ${Date.now() - start}`);
require('..');
const proxy = require('./test');
let start2 = Date.now();
for (let i = 0; i < loop; i++) {
    proxy.a.c(inside);
}
console.log(`proxy : ${proxy.a.b}`);
console.log(`time： ${Date.now() - start2}`);
start2 = Date.now();
proxy.a.b = 0;
const c = proxy.a.c;
for (let i = 0; i < loop; i++) {
    c(inside);
}
console.log(`proxy : ${proxy.a.b}`);
console.log(`time： ${Date.now() - start2}`);
//# sourceMappingURL=performance.js.map