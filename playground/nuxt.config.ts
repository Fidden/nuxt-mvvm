import {fileURLToPath} from 'node:url';

export default defineNuxtConfig({
    modules: ['../src/module'],
    devtools: {
        enabled: true
    },
    alias: {
        '#module': fileURLToPath(new URL('../src', import.meta.url))
    }
});
