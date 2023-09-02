import {defineNuxtModule, addPlugin, createResolver, addImports} from '@nuxt/kit';
import {Nuxt} from '@nuxt/schema';


// Module options TypeScript interface definition
export interface ModuleOptions {
}


export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: 'nuxt-pinia-di',
		configKey: 'piniaDI'
	},
	defaults: {},
	setup(options, nuxt: Nuxt) {
		const resolver = createResolver(import.meta.url);

		addImports([
			{
				name: 'useVm',
				from: resolver.resolve('./composables/useVm')
			},
			{
				name: 'injectDep',
				from: resolver.resolve('./decorators/injectDep')
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
			...nuxt.options.vite.esbuild,
			tsconfigRaw: {
				...nuxt.options.vite.esbuild?.tsconfigRaw,
				compilerOptions: {
					...nuxt.options.vite.esbuild?.tsconfigRaw?.compilerOptions,
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
	}
});
