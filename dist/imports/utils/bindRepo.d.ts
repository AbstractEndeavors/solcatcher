export type RepoFn<R> = (repo: R, ...args: any[]) => any;
export type BoundFn<R> = (this: R, ...args: any[]) => any;
export type BindableFn<R> = RepoFn<R> | BoundFn<R>;
export type BindableModule<R> = Record<string, BindableFn<R>>;
export declare function bindRepo<R extends object>(target: R, modules: Record<string, BindableModule<R>>): void;
export type ServiceBindings<S> = Record<string, BoundFn<S>>;
export declare function bindService<S extends object>(service: S, modules: Record<string, ServiceBindings<S>>): void;
export declare function repoToService<S, R>(getRepo: (s: S) => R, repoFns: Record<string, RepoFn<R>>): ServiceBindings<S>;
