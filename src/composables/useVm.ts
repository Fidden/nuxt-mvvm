/**
 @author Fidden
 inspired by WayZer/pinia-class-store
 */
import {onUnmounted, useNuxtApp} from '#imports';
import {defineStore, getActivePinia, Store} from 'pinia';
import {InjectionToken} from '../types/injection-token';
import {ClassInstanceType, ModuleExt, PiniaStore, VmFlags} from '../types/vm';


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

		Module._storeOptions = option;
	}

	console.log(process.server, Module._storeOptions, isChild);

	/**
	 * Update data with injected classes on the server side
	 */
	if (process.server && Module._storeOptions && !isChild) {
		for (const key of Object.keys(instance)) {
			if (!instance.hasOwnProperty(key) || !injectedKeys?.includes(instance[key]?.constructor?.name)) {
				continue;
			}

			Module._storeOptions.initialState[key] = instance[key];
			Object.defineProperty(Module._storeOptions.initialState[key], '$injected', {
				writable: false,
				enumerable: false,
				value: true
			});
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
	})() as Store;

	/**
	 * Automatic model dispose on view unMount
	 */
	onUnmounted(() => {
		if (!pinia || !id || isChild) {
			return;
		}

		delete pinia.state.value[id];
		store.$dispose();
	});

	Object.setPrototypeOf(store, Module.prototype);
	return store as G;
}
