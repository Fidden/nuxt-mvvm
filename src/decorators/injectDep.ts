import {defineInjectionTokenMetadata} from '../helpers/define-injection-token-metadata';
import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';


export function injectDep(
	token: InjectionToken<any>
): (
	target: any,
	propertyKey: string | symbol | undefined,
	parameterIndex: number
) => any {
	return defineInjectionTokenMetadata(token);
}
