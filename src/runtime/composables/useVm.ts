import {ViewModelFactory} from '../factories/view-model';
import {ClassInstanceType, VmFlags} from '../../runtime/types';


export const useVm = <T extends ClassInstanceType>(module: T, flags: VmFlags[] = []) =>
    new ViewModelFactory(module, flags).make();
