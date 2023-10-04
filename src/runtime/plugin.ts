import {defineNuxtPlugin} from '#app';
import {createPinia, setActivePinia} from 'pinia';
import 'reflect-metadata';
import {container} from 'tsyringe';
import {watch} from 'vue';


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
                        if (piniaState[key][property]?.$injected) {
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
            nuxtApp.payload.state.pinia = nuxtApp.payload.pinia;
        }
    }, {deep: true, immediate: true});

    return {
        provide: {
            container,
            pinia
        }
    };
});
