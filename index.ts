import { Module } from "module";
import { isProxy } from "util/types";
// TODO 区分 lambda 和 function

const handler_map: { [id: string]: { [path: string]: ReloadHandler } } = {};
const place_holder = function () { };

const warp_target = function (child, parent) {
    if (isProxy(parent)) { parent = parent.__handler_cur; }
    switch (typeof child) {
        case 'function': {
            // differ class and normal function
            // not only constructor
            if (!child.prototype || Object.getOwnPropertyNames(child.prototype).length === 1) {
                child = child.bind(parent);
            }
            break;
        }
        case 'number': child = new Number(child); break;
        case 'string': child = new String(child); break;
        case 'boolean': child = new Boolean(child); break;
    }
    return child;
}
const specail_prop = ['constructor'];

class ReloadHandler {
    uid: string;
    path: string;
    cur: any;
    constructor(uid: string, path: string, cur: object) {
        this.uid = uid;
        this.path = path;
        this.cur = cur;
    }
    has(_target, key) {
        return key in this.cur;
    }
    // set update exist proxy
    set(_target, prop, value) {
        const ret = Reflect.set(this.cur, prop, value);
        const child_path = `${this.path}/${prop}`
        value = warp_target(value, this.cur);
        if (child_path in handler_map[this.uid]) {
            handler_map[this.uid][child_path].cur = value;
        }
        return ret;
    }
    construct(_target, argumentsList) {
        const { uid, path, cur } = this;
        const ret = new (cur as { new(...args): any })(...argumentsList);
        const child_path = `${path}/prototype`;
        if (!(child_path in handler_map)) {
            const handler = new ReloadHandler(uid, child_path, cur.prototype);
            handler_map[uid][child_path] = handler;
        }
        ret.__proto__ = new Proxy(place_holder, handler_map[uid][child_path]);
        return ret;
    }

    apply(_target, _thisArg, argumentsList) {
        return (this.cur as Function)(...argumentsList);
    }
    get(_target, prop, receiver): any {
        const { uid, path, cur } = this;
        if (cur && Reflect.has(cur, prop)) {
            const child_path = `${path}/${prop}`;
            if (!(child_path in handler_map[uid])) {
                const child = warp_target(Reflect.get(cur, prop), receiver);
                const handler = new ReloadHandler(uid, child_path, child);
                handler_map[uid][child_path] = handler;
            }
            return new Proxy(place_holder, handler_map[uid][child_path]);
        }
        // hook
        if (prop === '__handler_cur') { return cur; }
        return undefined;
    };
}

const node_require = Module.prototype.require;
const resolve = (module.constructor as any)._resolveFilename;
const reload_require = function (id: string): any {
    // this is the Module object
    // get unique id for a file as uid
    const uid = resolve(id, this, false)
    if (!(uid in handler_map)) {
        const raw = node_require.apply(this, [uid]);
        const handler = new ReloadHandler(uid, '', raw);
        handler_map[uid] = { '': handler };
    }
    return new Proxy(place_holder, handler_map[uid]['']);
}
for (const key in require) {
    reload_require[key] = require[key];
}
Module.prototype.require = reload_require as NodeRequire;
global.require = reload_require as NodeRequire;

// ! 现在智能通过全路劲更新 或者 是相对于本文件的路径  但还不如全路劲呢
export function reload(id: string): any {
    const uid = require.resolve(id);
    const _old = require.cache[uid];
    delete require.cache[uid];
    const ret = node_require(uid);
    // TODO migrate

    for (const path in handler_map[uid]) {
        let temp = ret, parent;
        path.split('/').slice(1)
            .filter(prop => !specail_prop.includes(prop))
            .forEach(p => {
                parent = temp;
                temp = temp ? temp[p] : undefined;
            });
        temp = warp_target(temp, parent);
        handler_map[uid][path].cur = temp;
    }
}