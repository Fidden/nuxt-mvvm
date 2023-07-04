import {defineInjectionTokenMetadata} from "~/client/shared/helpers/define-injection-token-metadata";
import InjectionToken from "tsyringe/dist/typings/providers/injection-token";

export function inject(
    token: InjectionToken<any>
): (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
) => any {
    return defineInjectionTokenMetadata(token);
}
