
// repo-first style
export type RepoFn<R> = (repo: R, ...args: any[]) => any;

// this-bound style
export type BoundFn<R> = (this: R, ...args: any[]) => any;

// allowed function shape
export type BindableFn<R> = RepoFn<R> | BoundFn<R>;

export type BindableModule<R> = Record<string, BindableFn<R>>;
export function bindRepo<R extends object>(
  target: R,
  modules: Record<string, BindableModule<R>>
): void {
  for (const mod of Object.values(modules)) {
    for (const [name, fn] of Object.entries(mod)) {
      if (name in target) continue;

      Object.defineProperty(target, name, {
        enumerable: false,
        writable: false,
        configurable: false,

        value: (...args: any[]) => {
          // ALWAYS preserve `this`
          return (fn as Function).apply(target, args);
        },
      });
    }
  }
}


// adapter definition
export type ServiceBindings<S> = Record<string, BoundFn<S>>;

export function bindService<S extends object>(
  service: S,
  modules: Record<string, ServiceBindings<S>>
): void {
  for (const mod of Object.values(modules)) {
    for (const [name, fn] of Object.entries(mod)) {
      if (name in service) continue;

      Object.defineProperty(service, name, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: fn.bind(service),
      });
    }
  }
}

export function repoToService<S, R>(
  getRepo: (s: S) => R,
  repoFns: Record<string, RepoFn<R>>
): ServiceBindings<S> {
  const out: ServiceBindings<S> = {};

  for (const [name, fn] of Object.entries(repoFns)) {
    out[name] = function (this: S, ...args: any[]) {
      return fn(getRepo(this), ...args);
    };
  }

  return out;
}
