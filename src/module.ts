import {addImports, addImportsDir, addPlugin, createResolver, defineNuxtModule} from '@nuxt/kit';
import {Nuxt} from '@nuxt/schema';

/**
 @author Fidden
  inspired by WayZer/pinia-class-store
 */
export default defineNuxtModule({
    meta: {
        name: 'nuxt-mvvm',
        configKey: 'mvvm'
    },
    defaults: {},
    setup(options, nuxt: Nuxt) {
        const resolver = createResolver(import.meta.url);

        addImportsDir([
            resolver.resolve('./runtime/composables'),
            resolver.resolve('./runtime/decorators'),
            resolver.resolve('./runtime/types')
        ]);

        addImports([
            {
                name: 'BaseViewModel',
                from: resolver.resolve('./runtime/types')
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

        nuxt.options.build.transpile.push(resolver.resolve('./runtime'));
    }
});
