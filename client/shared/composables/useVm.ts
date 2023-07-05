/**
 @author WayZer
 inspired by vuex-class-modules
 */
import {onUnmounted} from '#imports';
import {defineStore, getActivePinia, Store} from 'pinia';

interface ModuleExt {
    _storeOptions?: {
        initialState: NonNullable<any>,
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

export function useVm<T extends (new (...args: any) => any), G extends InstanceType<T> = InstanceType<T>>(Module0: T, child = false, id?: string)
    : G & Omit<PiniaStore<G>, keyof G> {
    const pinia = getActivePinia();
    const {$container, payload} = useNuxtApp();
    const Module = Module0 as T & ModuleExt;
    const instance = $container.resolve(Module);
    id = id || Module.name;

    /*
    * Build store on server side
    */
    if (!child || (child && !Module._storeOptions)) {
        const option = {
            /**
             * Set initialState from nuxt.payload
             */
            initialState: payload.pinia?.hasOwnProperty(Module.name) ? (payload.pinia as Record<string, any>)[Module.name] : {},
            getters: {} as any,
            actions: {} as any
        };

        for (const key of Object.keys(instance)) {
            if (instance.hasOwnProperty(key)) {
                /**
                 * Set new data only if it is not included from payload
                 */
                if (!option.initialState[key])
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

    /**
     * Update data with injected classes on server side
     */
    if (process.server && Module._storeOptions) {
        for (const key of Object.keys(instance)) {
            if (instance.hasOwnProperty(key)) {
                if (instance[key].constructor.$injected) {
                    Module._storeOptions.initialState[key] = instance[key];
                }
            }
        }
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

    /**
     * Store inital state of pinia store
     */
    if (!store.$initialState) {
        Object.defineProperty(store, '$initialState', {
            enumerable: false,
            writable: false,
            value: true
        });
    }

    /**
     * Automatic model dispose on view unMount
     */
    onUnmounted(() => {
        if (!pinia || !id || child) {
            return;
        }

        store.$reset();
        store.$state = store.$initialState;
        store.$dispose();
    });

    Object.setPrototypeOf(store, Module.prototype);
    return store as G;
}
