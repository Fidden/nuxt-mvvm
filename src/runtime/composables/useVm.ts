import {
    onActivated,
    onBeforeMount,
    onBeforeRouteLeave,
    onBeforeRouteUpdate,
    onBeforeUnmount,
    onDeactivated,
    onErrorCaptured,
    onMounted,
    onRenderTracked,
    onRenderTriggered,
    onServerPrefetch,
    onUnmounted,
    onUpdated,
    useNuxtApp,
    useRoute,
    useRouter
} from '#imports';
import {InjectionToken} from '#src/types/injection-token';
import {ModuleExt} from '#src/types/module-ext';
import {defineStore, getActivePinia, Store} from 'pinia';
import {ILifeCycle, IRouterable} from '../types';
import {ClassInstanceType, PiniaStore, BaseViewModel, VmFlags} from '../types/vm';

type StoreDefinition = Store & ILifeCycle & IRouterable & BaseViewModel;

export function useVm<T extends ClassInstanceType, G extends InstanceType<T> = InstanceType<T>>(Module0: T, flags: VmFlags[] = [])
    : G & Omit<PiniaStore<G>, keyof G> {
    const pinia = getActivePinia();
    const {$container, payload} = useNuxtApp();
    const Module = Module0 as T & ModuleExt;
    const instance = $container.resolve(Module);
    const id = Module.name;
    const injectionTokens = Reflect.getOwnMetadata('injectionTokens', Module);
    const injectedKeys = injectionTokens ? Object.values<InjectionToken>(injectionTokens).map(item => item.name) : undefined;
    const isChild = flags.includes(VmFlags.CHILD);
    const isValidForLifeCycle = pinia && id && !isChild;

    const safeCallStoreMethod = (methodName: keyof StoreDefinition) => {
        if (typeof methodName !== 'symbol' &&
            store && store[methodName] &&
            typeof store[methodName] === 'function'
        ) {
            (store[methodName] as CallableFunction)();
        }
    };

    const markAsInjected = (key) => {
        Object.defineProperty(Module._storeOptions.initialState[key], '$injected', {
            writable: false,
            enumerable: false,
            value: true
        });
    };

    /*
    * Build store on server side
    */
    if (!isChild || (isChild && !Module._storeOptions)) {
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

        option.initialState['route'] = useRoute();
        option.initialState['router'] = useRouter();
        Module._storeOptions = option;
    }

    /**
     * Update data with injected classes on the server side
     */
    if (process.server && Module._storeOptions && !isChild) {
        for (const key of Object.keys(instance)) {
            if (!instance.hasOwnProperty(key) || !injectedKeys?.includes(instance[key]?.constructor?.name)) {
                continue;
            }

            Module._storeOptions.initialState[key] = instance[key];
            markAsInjected(key);
        }

        markAsInjected('route');
        markAsInjected('router');
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
    })() as StoreDefinition;

    if (isValidForLifeCycle) {
        safeCallStoreMethod('onSetup');
    }

    const hooks = [
        {
            function: onMounted,
            callback: () => {
                safeCallStoreMethod('onMounted');
                delete pinia!.state!.value[id];
                store.$dispose();
            }
        },
        {
            function: onUnmounted,
            callback: () => safeCallStoreMethod('onUnmounted')
        },
        {
            function: onBeforeMount,
            callback: () => safeCallStoreMethod('onBeforeMounted')
        },
        {
            function: onBeforeUnmount,
            callback: () => safeCallStoreMethod('onBeforeUnmounted')
        },
        {
            function: onErrorCaptured,
            callback: () => safeCallStoreMethod('onErrorCaptured')
        },
        {
            function: onErrorCaptured,
            callback: () => safeCallStoreMethod('onErrorCaptured')
        },
        {
            function: onUpdated,
            callback: () => safeCallStoreMethod('onUpdated')
        },
        {
            function: onRenderTracked,
            callback: () => safeCallStoreMethod('onRenderTracked')
        },
        {
            function: onRenderTriggered,
            callback: () => safeCallStoreMethod('onRenderTriggered')
        },
        {
            function: onActivated,
            callback: () => safeCallStoreMethod('onActivated')
        },
        {
            function: onDeactivated,
            callback: () => safeCallStoreMethod('onDeactivated')
        },
        {
            function: onServerPrefetch,
            callback: () => safeCallStoreMethod('onServerPrefetch')
        },
        {
            function: onBeforeRouteLeave,
            callback: () => safeCallStoreMethod('onBeforeRouteLeave')
        },
        {
            function: onBeforeRouteUpdate,
            callback: () => safeCallStoreMethod('onBeforeRouteUpdate')
        }
    ];

    for (const hook of hooks) {
        if (!isValidForLifeCycle) {
            continue;
        }

        hook.function(hook.callback);
    }

    Object.setPrototypeOf(store, Module.prototype);
    return store as G;
}
