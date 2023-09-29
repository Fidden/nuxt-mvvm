import {addImports, addPlugin, createResolver, defineNuxtModule} from '@nuxt/kit';
import {Nuxt} from '@nuxt/schema';


// Module options TypeScript interface definition
export interface ModuleOptions {
}


export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'nuxt-mvvm',
        configKey: 'mvvm'
    },
    defaults: {},
    setup(options, nuxt: Nuxt) {
        const resolver = createResolver(import.meta.url);

        addImports([
            {
                name: 'useVm',
                from: resolver.resolve('./runtime/composables/useVm')
            },
            {
                name: 'useChildVm',
                from: resolver.resolve('./runtime/composables/useChildVm')
            },
            {
                name: 'inject',
                as: 'injectDep',
                from: 'tsyringe'
            },
            {
                name: 'singleton',
                from: 'tsyringe'
            },
            {
                name: 'injectable',
                from: 'tsyringe'
            }
        ]);

        nuxt.options.vite.esbuild = {
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: true
                }
            }
        };

        nuxt.hook('nitro:build:before', (nitro) => {
            nitro.options.moduleSideEffects.push('reflect-metadata');
        });

        nuxt.hook('modules:done', () => {
            addPlugin(resolver.resolve('./runtime/plugin'), {append: true});
        });

        nuxt.options.build.transpile.push(resolver.resolve('./runtime'))
    }
});
