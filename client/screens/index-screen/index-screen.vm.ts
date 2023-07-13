import {LoggerService} from "~/client/shared/services/logger.service";
import {injectable} from "tsyringe";
import {inject} from "~/client/shared/decorators/inject.decorator";
import {SendingService} from "~/client/shared/services/sending.service";
import {sending} from "~/client/shared/decorators/sending.decorator";
import {ISendable} from "~/client/shared/types/sendable";
import {ErrorService} from "~/client/shared/services/error.service";

type SendingKeys = 'default';

@injectable()
export class IndexScreenVm implements ISendable {
    public counter: number;

    public constructor(
        @inject(LoggerService) public readonly logger: LoggerService,
        @inject(SendingService) public readonly sending: SendingService<SendingKeys>,
        @inject(ErrorService) public readonly error: ErrorService
    ) {
        this.counter = 0;
    }

    @sending<SendingKeys>('default')
    public async submit() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('hello')
            }, 3000)
        })
    }

    public setCounter() {
        this.counter = 2;
    }

    public increment() {
        this.counter++;
    }
}
