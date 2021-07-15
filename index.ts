const handler_map: { [id: string]: { [path: string]: ReloadHandler } } = {};
const place_holder = () => { };

const warp_target = function (child, parent) {
    switch (typeof child) {
        case 'function': child = child.bind(parent); break;
        case 'number': child = new Number(child); break;
        case 'string': child = new String(child); break;
        case 'boolean': child = new Boolean(child); break;
    }
    return child;
}

class ReloadHandler {
    id: string;
    path: string;
    cur: object;
    constructor(id: string, path: string, cur: object) {
        this.id = id;
        this.path = path;
        this.cur = cur;
    }
    // set update exist proxy
    set(_target, prop, value) {
        const ret = Reflect.set(this.cur, prop, value);
        const child_path = `${this.path}/${prop}`
        value = warp_target(value, this.cur);
        if (child_path in handler_map[this.id]) {
            handler_map[this.id][child_path].cur = value;
        }
        return ret;
    }
    apply(_target, _thisArg, argumentsList) {
        return (this.cur as Function)(...argumentsList);
    }
    get(_target, prop, _receiver): any {
        const { id, path, cur } = this;
        if (cur === undefined || cur === null) { return undefined; }

        if (prop in cur) {
            const child_path = `${path}/${prop}`;
            if (!(child_path in handler_map[id])) {
                const child = warp_target(cur[prop], cur);
                const handler = new ReloadHandler(id, child_path, child);
                handler_map[id][child_path] = handler;
            }
            return new Proxy(place_holder, handler_map[id][child_path]);
        }
        return undefined;
    };
}
const node_require = require;
const reload_require = function (id: string): any {
    if (!(id in handler_map)) {
        const raw = node_require(id);
        const handler = new ReloadHandler(id, '', raw);
        handler_map[id] = { '': handler };
    }
    return new Proxy(place_holder, handler_map[id]['']);
}
for (const key in require) {
    reload_require[key] = require[key];
}
global.require = reload_require as NodeRequire;

export function reload(id: string): any {
    const _old = require.cache[require.resolve(id)];
    delete require.cache[require.resolve(id)];
    const ret = node_require(id);
    // TODO migrate

    for (const path in handler_map[id]) {
        let temp = ret, parent;
        path.split('/').slice(1).forEach(p => {
            parent = temp;
            temp = temp ? temp[p] : undefined;
        });
        temp = warp_target(temp, parent);
        handler_map[id][path].cur = temp;
    }
}