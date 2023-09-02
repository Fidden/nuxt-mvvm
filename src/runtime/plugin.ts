import 'reflect-metadata';
import {defineNuxtPlugin} from '#app';
import {container} from 'tsyringe';
import {watch} from 'vue';
import {setActivePinia, createPinia, StateTree} from 'pinia';


export default defineNuxtPlugin((nuxtApp) => {
	const pinia = createPinia();
	nuxtApp.vueApp.use(pinia);
	setActivePinia(pinia);

	/**
	 * Watch store changes and rebuild $state
	 */
	watch(() => pinia.state.value, (piniaState) => {
		const newState: typeof piniaState = {};

		for (const key of Object.keys(piniaState)) {
			if (piniaState.hasOwnProperty(key)) {
				for (const property in piniaState[key]) {
					if (piniaState[key][property]) {
						/**
						 * Exclude injected data
						 */
						if (piniaState[key][property].constructor.$injected) {
							continue;
						}

						if (!newState[key]) {
							newState[key] = {};
						}

						newState[key][property] = piniaState[key][property];
					}
				}
			}
		}


		/**
		 * Store builded state without di to nuxt.payload
		 */
		if (process.server) {
			nuxtApp.payload.pinia = newState;
		}
		/**
		 * Set builded state from nuxt.payload
		 */
		else if (nuxtApp.payload && nuxtApp.payload.pinia && !pinia.state.value) {
			pinia.state.value = nuxtApp.payload.pinia as Record<string, StateTree>;
		}
	}, {deep: true});

	return {
		provide: {
			container,
			pinia
		}
	};
});
