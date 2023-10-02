import {constructor} from 'tsyringe/dist/typings/types';
import {ViewModel} from './view-model';

/**
 * Factory function for creating a component view-model.
 *
 * @remark Just syntax sugar, equals to ViewModel({type: 'injectable'})
 *
 * @returns {Function} - The decorated constructor function.
 */
export function ComponentVm() {
    return function <T>(ctor: constructor<T>) {
        return ViewModel({type: 'injectable'})(ctor);
    };
}
