import {ClassInstanceType, VmFlags} from '#module/runtime/types';
import {useVm} from './useVm';

export function useChildVm<T extends ClassInstanceType>(Module0: T, flags = [VmFlags.CHILD]) {
    return useVm(Module0, flags);
}
