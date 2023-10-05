import {NuxtPayload, useRoute} from '#app';
import {
    ILifeCycle,
    IRouterable,
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
    useRouter
} from '#imports';
import {BaseViewModel, ClassInstanceType, VmFlags} from '../../runtime/types';
import {InjectionToken} from '../../types/injection-token';
import {ModuleExt} from '../../types/module-ext';
import {defineStore, getActivePinia, Pinia, Store} from 'pinia';


type StoreDefinition = Store & ILifeCycle & IRouterable & BaseViewModel;

export class ViewModelFactory<T extends ClassInstanceType, G extends InstanceType<T> = InstanceType<T>> {
    private Module: T & ModuleExt;
    private readonly pinia?: Pinia;
    private payload: NuxtPayload;
    private readonly isChild: boolean;
    private injectedKeys?: string[];
    private readonly injectionTokens: any;
    private readonly instance: T;
    private readonly storeId: string;
    private store?: StoreDefinition;

    constructor(Module: T, flags: VmFlags[] = []) {
        const {$container, payload} = useNuxtApp();
        this.Module = Module as T & ModuleExt;
        this.pinia = getActivePinia();
        this.payload = payload;
        this.instance = $container.resolve(Module);
        this.injectionTokens = Reflect.getOwnMetadata('injectionTokens', Module);
        this.injectedKeys = this.injectionTokens ? Object.values<InjectionToken>(this.injectionTokens).map(item => item.name) : undefined;
        this.isChild = flags.includes(VmFlags.CHILD);
        this.storeId = this.Module.name;
        this.store = undefined;
    }

    private initStore() {
        const option = {
            initialState: this.initialState,
            getters: {} as any,
            actions: {} as any
        };

        for (const key of Object.keys(this.instance)) {
            if (this.instance.hasOwnProperty(key)) {
                /**
                 * Set new data only if it is not included from payload
                 */
                if (!option.initialState[key])
                    // @ts-ignore
                    option.initialState[key] = this.instance[key];
            }
        }

        for (const key of Object.getOwnPropertyNames(this.Module.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(this.Module.prototype, key)!;
            if (descriptor.get) {
                option.getters[key] = (state: any) => descriptor.get!.call(state);
            }
            if (descriptor.value) {
                option.actions[key] = this.Module.prototype[key];
            }
        }

        this.Module._storeOptions = option;
    }


    /**
     * Marks keys in the instance object as injected if they are non-serializable.
     */
    private excludeNonSerializable() {
        if (!process.server) {
            return;
        }

        for (const key of Object.keys(this.instance)) {
            const hasKey = this.instance.hasOwnProperty(key);
            // @ts-ignore
            const isKeyInjected = this.injectedKeys?.includes(this.instance[key]?.constructor?.name);
            if (!hasKey || !isKeyInjected) {
                continue;
            }

            this.markAsInjected(key);
        }

        this.markAsInjected(['route', 'router']);
    }

    /**
     * Initializes the Pinia store.
     */
    private initPiniaStore() {
        const {initialState, getters, actions} = this.Module._storeOptions!;

        this.store = defineStore(this.storeId, {
            state: () => initialState,
            getters,
            actions
        })() as StoreDefinition;
    }

    private get isRoot() {
        return !this.isChild;
    }

    private get isValidStore() {
        return this.storeId && this.pinia;
    }

    private get isStoreExists() {
        return !!this.Module._storeOptions;
    }

    private get initialState() {
        const state = this.payload.pinia?.hasOwnProperty(this.Module.name)
            ? (this.payload.pinia as Record<string, any>)[this.Module.name]
            : {};

        state['route'] = useRoute();
        state['router'] = useRouter();

        return state;
    }

    public make() {
        if (this.isRoot || (this.isChild && !this.isStoreExists)) {
            this.initStore();
            this.excludeNonSerializable();
        }

        if (!this.isStoreExists) {
            throw new Error('[nuxt-mvvm][error]: Failed to initialize store. Maybe you forgot to call root useVm');
        }

        this.initPiniaStore();
        this.callComponentHooks();

        Object.setPrototypeOf(this.store, this.Module.prototype);
        return this.store as G;
    }

    private markAsInjected(key: string | string[]) {
        key = Array.isArray(key) ? key : [key];
        key.forEach(item => {
            Object.defineProperty(this.Module!._storeOptions!.initialState[item], '$injected', {
                writable: false,
                enumerable: false,
                value: true
            });
        });
    }

    private callComponentHooks() {
        if (!this.isRoot && this.isValidStore) {
            return;
        }

        this.safeCallStoreMethod('onSetup');

        const hooks = [
            {
                function: onMounted,
                callback: this.safeCallStoreMethod('onMounted')
            },
            {
                function: onUnmounted,
                callback: (...args: unknown[]) => {
                    this.safeCallStoreMethod('onUnmounted').apply(this.store, args);
                    delete this.pinia!.state!.value[this.storeId];
                    this.store!.$dispose();
                }
            },
            {
                function: onBeforeMount,
                callback: this.safeCallStoreMethod('onBeforeMounted')
            },
            {
                function: onBeforeUnmount,
                callback: this.safeCallStoreMethod('onBeforeUnmounted')
            },
            {
                function: onErrorCaptured,
                callback: this.safeCallStoreMethod('onErrorCaptured')
            },
            {
                function: onErrorCaptured,
                callback: this.safeCallStoreMethod('onErrorCaptured')
            },
            {
                function: onUpdated,
                callback: this.safeCallStoreMethod('onUpdated')
            },
            {
                function: onRenderTracked,
                callback: this.safeCallStoreMethod('onRenderTracked')
            },
            {
                function: onRenderTriggered,
                callback: this.safeCallStoreMethod('onRenderTriggered')
            },
            {
                function: onActivated,
                callback: this.safeCallStoreMethod('onActivated')
            },
            {
                function: onDeactivated,
                callback: this.safeCallStoreMethod('onDeactivated')
            },
            {
                function: onServerPrefetch,
                callback: this.safeCallStoreMethod('onServerPrefetch')
            },
            {
                function: onBeforeRouteLeave,
                callback: this.safeCallStoreMethod('onBeforeRouteLeave')
            },
            {
                function: onBeforeRouteUpdate,
                callback: this.safeCallStoreMethod('onBeforeRouteUpdate')
            }
        ];

        for (const hook of hooks) {
            hook.function((...args: unknown[]) => hook.callback.apply(this.store, args));
        }
    }

    private safeCallStoreMethod(methodName: keyof StoreDefinition) {
        if (typeof methodName !== 'symbol' &&
            this.store && this.store[methodName] &&
            typeof this.store[methodName] === 'function'
        ) {
            return this.store[methodName] as unknown as CallableFunction;
        }

        return new Function();
    }
}
