import {injectDep, ILifeCycle, ScreenVm} from '#imports';
import {sending} from '~/client/shared/decorators/sending.decorator';
import {ErrorService} from '~/client/shared/services/error.service';
import {LoggerService} from '~/client/shared/services/logger.service';
import {SendingService} from '~/client/shared/services/sending.service';
import {BaseVm} from '~/client/shared/types/abstract/base.vm';
import {ISendable} from '~/client/shared/types/sendable';


type SendingKeys = 'default';


@ScreenVm()
export class RootScreenVm extends BaseVm implements ISendable, ILifeCycle {
    public counter: number;

    public constructor(
        @injectDep(LoggerService) public readonly logger: LoggerService,
        @injectDep(SendingService) public readonly sending: SendingService<SendingKeys>,
        @injectDep(ErrorService) public readonly error: ErrorService
    ) {
        super();
        this.counter = 0;
    }

    public onMounted() {
        console.log(`counter is ${this.counter}`);
    }

    public onSetup() {
        if (process.server)
            this.counter = 3000;
        else
            this.counter = 500;

        console.log('route:', this.route);
        console.log('router:', this.router);
    }

    @sending<SendingKeys>('default')
    public async submit() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('data is sent');
            }, 3000);
        });
    }

    public setCounter() {
        this.counter = 2;
    }

    public increment() {
        this.counter++;
    }
}
