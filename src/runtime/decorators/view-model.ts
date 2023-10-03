import {injectable, singleton} from 'tsyringe';
import {constructor} from 'tsyringe/dist/typings/types';

interface IViewModelMeta {
    type?: 'singleton' | 'injectable';
}

/**
 * Creates a ViewModel based on the provided metadata.
 *
 * @remark This function enables runtime injection of the class' dependencies. The ViewModel generated can either be a singleton
 * (single instance) or injectable (multiple instances), as specified in the metadata.
 *
 * @param {IViewModelMeta} meta - The metadata for the ViewModel.
 * @return {Function} decorator - The ViewModel decorator function.
 */
export function ViewModel(meta?: IViewModelMeta) {
    const decorateFunc = meta?.type === 'singleton' ? singleton : injectable;

    return function <T>(ctor: constructor<T>) {
        return decorateFunc()(ctor);
    };
}
