import { reload } from '..'; // * 最先加载用来替换require实现热更
import { writeFileSync, mkdirSync, rmSync } from 'fs';

const dir_path = `${__dirname}/temp`;
mkdirSync(dir_path, { recursive: true });
const filename = 'example1_test.js';
const path = `${dir_path}/${filename}`;
writeFileSync(
    path,
    " \
    exports.obj = { \
        a: 1, \
        b: \'1\', \
        c: function(i) { return i + 1; }, \
        d: [1, 2, 3] \
    };\
    exports.A = class { \
        print() { \
            console.log(1); \
        } \
    };\
    "
);
const root = require(path);
const obj = root.obj;
const b = obj.b;
const d2 = obj.d[2];
// const a = new root.A();
const print_result = () => {
    console.log(`${Object.keys(obj)}`);
    console.log(`${Object.values(obj)}`);
    console.log(`${obj.c(2)}`);
    console.log(`b + '1111': ${b + '1111'}`);
    console.log(`d2: ${d2}`);
    // console.log(`a: print ${a.print()}`);
}
print_result();
writeFileSync(
    path,
    " \
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
    "
)
reload(path);
print_result();
rmSync(dir_path, { recursive: true, force: true });