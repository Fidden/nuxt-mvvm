import {ViewModelFactory} from '#module/runtime/factories/view-model';
import {ClassInstanceType, VmFlags} from '#module/runtime/types';


export const useVm = <T extends ClassInstanceType>(module: T, flags: VmFlags[] = []) =>
    new ViewModelFactory(module, flags).make();
