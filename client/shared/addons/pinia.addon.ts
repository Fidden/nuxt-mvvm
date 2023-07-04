/**
 @author WayZer
 inspired by vuex-class-modules
 */
import {onUnmounted} from '#imports';
import {defineStore, getActivePinia, Store} from 'pinia';

interface ModuleExt {
    _storeOptions?: {
        initialState: NonNullable<unknown>,
        getters: NonNullable<unknown>,
        actions: NonNullable<unknown>
    };
}

// magic, see https://github.com/Microsoft/TypeScript/issues/27024
type Magic<X> = (<T>() => T extends X ? 1 : 2)
type Magic2<X> = (<T>() => T extends X ? 1 : 2)

type Actions<T extends Record<string, any>> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: T[P];
};
type Getters<T extends Record<string, any>> = {
    [P in keyof T as Magic<Pick<T, P>> extends Magic2<Readonly<Pick<T, P>>> ? P : never]: T[P];
};
type States<T extends Record<string, any>> = Omit<{
    [P in keyof T as Magic<Pick<T, P>> extends Magic2<Readonly<Pick<T, P>>> ? never : P]: T[P];
}, keyof Actions<T>>;

type PiniaStore<G extends Record<string, any>> = Store<string, States<G>, Getters<G>, Actions<G>>

export function useVm<T extends (new (args?: any) => any), G extends InstanceType<T> = InstanceType<T>>(Module0: T, child: boolean = false, id?: string)
    : G & Omit<PiniaStore<G>, keyof G> {
    const pinia = getActivePinia();
    const {$container} = useNuxtApp();
    const Module = Module0 as T & ModuleExt;
    id = id || Module.name;


    if (!child || (child && !Module._storeOptions)) {
        const option = {
            initialState: {} as any,
            getters: {} as any,
            actions: {} as any
        };

        const instance = $container.resolve(Module);

        for (const key of Object.keys(instance)) {
            if (instance.hasOwnProperty(key)) {
                if (instance[key].constructor.$injected) {
                    option.getters[key] = () => instance[key];
                    continue;
                }

                // @ts-ignore
                if (instance[key]?.toPOJO && typeof window === 'undefined') {
                    option.initialState[key] = instance[key].toPOJO();
                    continue;
                }

                option.initialState[key] = instance[key];
            }
        }

        for (const key of Object.getOwnPropertyNames(Module.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(Module.prototype, key)!;
            if (descriptor.get) {
                option.getters[key] = (state: G) => descriptor.get!.call(state);
            }
            if (descriptor.value) {
                option.actions[key] = Module.prototype[key];
            }
        }

        Module._storeOptions = option;
    }

    if (!Module._storeOptions) {
        throw new Error('Module can not be found. It seems like you forgot to call general modal with "child: false"');
    }

    const {
        initialState,
        getters,
        actions
    } = Module._storeOptions;

    const store = defineStore(id, {
        state: () => initialState,
        getters,
        actions
    })() as Store & { $initialState: any };

    if (!store.$initialState) {
        Object.defineProperty(store, '$initialState', {
            enumerable: false,
            writable: false,
            value: true
        });
    }

    onUnmounted(() => {
        if (!pinia || !id || child) {
            return;
        }

        store.$reset();
        store.$state = store.$initialState;
    });

    Object.setPrototypeOf(store, Module.prototype);
    return store as G;
}
