import {constructor} from 'tsyringe/dist/typings/types';
import {ViewModel} from './view-model';

/**
 * Factory function for creating a screen view-model.
 *
 * @remark Just syntax sugar, equals to ViewModel({type: 'singleton'})
 *
 * @returns {Function} - The decorated constructor function.
 */
export function ScreenVm() {
    return function <T>(ctor: constructor<T>) {
        return ViewModel({type: 'singleton'})(ctor);
    };
}
