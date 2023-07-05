import 'reflect-metadata';
import {container} from "tsyringe";

/**
 * Provide container to nuxt.apps
 */
export default defineNuxtPlugin(() => {
    return {
        provide: {
            container
        }
    }
})
