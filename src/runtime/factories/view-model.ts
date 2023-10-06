import {NuxtPayload, useRoute} from '#app';
import {
    ILifeCycle,
    IRouterable,
    onActivated,
    onBeforeMount, onBeforeRouteLeave, onBeforeRouteUpdate,
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
import {defineStore, getActivePinia, Pinia, Store} from 'pinia';
import {BaseViewModel, ClassInstanceType, VmFlags} from '../../runtime/types';
import {InjectionToken} from '../../types/injection-token';
import {ModuleExt} from '../../types/module-ext';

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
        if (!this.isRoot || !this.isValidStore || !this.store) {
            return;
        }


        const hooks: (keyof StoreDefinition)[] = [
            'onMounted',
            'onUnmounted',
            'onBeforeMounted',
            'onBeforeUnmounted',
            'onActivated',
            'onDeactivated',
            'onErrorCaptured',
            'onRenderTracked',
            'onRenderTriggered',
            'onServerPrefetch',
            'onUpdated'
        ];

        if (this.store['onSetup'])
            this.store['onSetup']();

        for (const hookName of hooks) {
            // @ts-expect-error
            if (!this.store[hookName] || !('apply' in this.store[hookName])) {
                continue;
            }

            const vueHook = ViewModelFactory.findVueHook(hookName);
            if (!vueHook) {
                continue;
            }

            // @ts-expect-error
            // eslint-disable-next-line prefer-spread
            vueHook((...args: unknown[]) => this.store[hookName].apply(this.store, args));
        }
    }

    private static findVueHook(name: string) {
        switch (name) {
        case 'onMounted':
            return onMounted;
        case 'onUnmounted':
            return onUnmounted;
        case 'onBeforeMounted':
            return onBeforeMount;
        case 'onBeforeUnmounted':
            return onBeforeUnmount;
        case 'onActivated':
            return onActivated;
        case 'onDeactivated':
            return onDeactivated;
        case 'onErrorCaptured':
            return onErrorCaptured;
        case 'onRenderTracked':
            return onRenderTracked;
        case 'onRenderTriggered':
            return onRenderTriggered;
        case 'onServerPrefetch':
            return onServerPrefetch;
        case 'onUpdated':
            return onUpdated;
        case 'onBeforeRouteUpdate':
            return onBeforeRouteUpdate;
        case 'onBeforeRouteLeave':
            return onBeforeRouteLeave;
        default:
            return;
        }
    }
}
