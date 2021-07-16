"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require(".."); // * 最先加载用来替换require实现热更
// const reload = undefined;
const fs_1 = require("fs");
require("../test/test"); // test reletive
const dir_path = `${__dirname}/temp`;
fs_1.mkdirSync(dir_path, { recursive: true });
const filename = 'example1_test.js';
const path = `${dir_path}/${filename}`;
fs_1.writeFileSync(path, " \
    exports.obj = { \
        a: 1, \
        b: \'1\', \
        c: function(i) { return i + 1; }, \
        d: [1, 2, 3] \
    };\
    exports.A = class { \
        i = 1; \
        print() { \
            this.i += 1; \
            console.log(this.i); \
        } \
    };\
    ");
const root = require(path);
const obj = root.obj;
const b = obj.b;
const d2 = obj.d[2];
const a = new root.A();
const print_result = () => {
    console.log(`${Object.keys(obj)}`);
    console.log(`${Object.values(obj)}`);
    console.log(`${obj.c(2)}`);
    console.log(`b + '1111': ${b + '1111'}`);
    console.log(`d2: ${d2}`);
    console.log(`a: print ${a.print()}`);
};
print_result();
fs_1.writeFileSync(path, " \
    exports.obj = { \
        a: 2222, \
        b: \'33123\', \
        c: function(i) { return i - 1; }, \
        d: [1, 2, 7, 4] \
    };\
    exports.A = class { \
        print() { \
            console.log(2); \
        } \
    };\
    ");
if (__1.reload)
    __1.reload(path);
print_result();
fs_1.rmSync(dir_path, { recursive: true, force: true });
//# sourceMappingURL=example1.js.map