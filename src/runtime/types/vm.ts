import {Store} from 'pinia';
import {RouteLocationNormalizedLoaded, Router} from 'vue-router';

export type ClassInstanceType = (new (...args: any) => any);

export type PiniaStore<G extends Record<string, any>> = Store<string, States<G>, Getters<G>, Actions<G>>


// magic, see https://github.com/Microsoft/TypeScript/issues/27024
export type Magic<X> = (<T>() => T extends X ? 1 : 2)

export type Actions<T extends Record<string, any>> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: T[P];
};

export type Getters<T extends Record<string, any>> = {
    [P in keyof T as Magic<Pick<T, P>> extends Magic<Readonly<Pick<T, P>>> ? P : never]: T[P];
};

export type States<T extends Record<string, any>> = Omit<{
    [P in keyof T as Magic<Pick<T, P>> extends Magic<Readonly<Pick<T, P>>> ? never : P]: T[P];
}, keyof Actions<T>>;

export enum VmFlags {
    CHILD
}

export abstract class BaseViewModel {
    declare protected route: RouteLocationNormalizedLoaded;
    declare protected router: Router;
}
