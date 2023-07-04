import 'reflect-metadata';
import {container} from "tsyringe";

export default defineNuxtPlugin(() => {
    return {
        provide: {
            container
        }
    }
})
