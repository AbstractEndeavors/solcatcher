export function bindRepo(target, modules) {
    for (const mod of Object.values(modules)) {
        for (const [name, fn] of Object.entries(mod)) {
            if (name in target)
                continue;
            Object.defineProperty(target, name, {
                enumerable: false,
                writable: false,
                configurable: false,
                value: (...args) => {
                    // ALWAYS preserve `this`
                    return fn.apply(target, args);
                },
            });
        }
    }
}
export function bindService(service, modules) {
    for (const mod of Object.values(modules)) {
        for (const [name, fn] of Object.entries(mod)) {
            if (name in service)
                continue;
            Object.defineProperty(service, name, {
                enumerable: false,
                writable: false,
                configurable: false,
                value: fn.bind(service),
            });
        }
    }
}
export function repoToService(getRepo, repoFns) {
    const out = {};
    for (const [name, fn] of Object.entries(repoFns)) {
        out[name] = function (...args) {
            return fn(getRepo(this), ...args);
        };
    }
    return out;
}
