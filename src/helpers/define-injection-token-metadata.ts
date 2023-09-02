import InjectionToken, {TokenDescriptor} from 'tsyringe/dist/typings/providers/injection-token';
import {Transform} from '../types/transform';
import {Dictionary} from '../types/dictionary';


export const INJECTION_TOKEN_METADATA_KEY = 'injectionTokens';


export function defineInjectionTokenMetadata(
	data: any,
	transform?: { transformToken: InjectionToken<Transform<any, any>>; args: any[] }
): (
	target: any,
	propertyKey: string | symbol | undefined,
	parameterIndex: number
) => any {
	return function (
		target: any,
		_propertyKey: string | symbol | undefined,
		parameterIndex: number
	): any {
		const descriptors: Dictionary<InjectionToken<any> | TokenDescriptor> =
			Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
		descriptors[parameterIndex] = transform
			? {
				token: data,
				transform: transform.transformToken,
				transformArgs: transform.args || []
			}
			: data;
		Reflect.defineMetadata(INJECTION_TOKEN_METADATA_KEY, descriptors, target);

		/**
		 * Mark service as injected ( to exclude from nuxt.payload in future )
		 */
		Object.defineProperty(descriptors[parameterIndex], '$injected', {
			value: true,
			enumerable: false,
			writable: false
		});
	};
}
