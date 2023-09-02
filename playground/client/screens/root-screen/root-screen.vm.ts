import {LoggerService} from '~/client/shared/services/logger.service';
import {SendingService} from '~/client/shared/services/sending.service';
import {sending} from '~/client/shared/decorators/sending.decorator';
import {ISendable} from '~/client/shared/types/sendable';
import {ErrorService} from '~/client/shared/services/error.service';
import {injectable, injectDep} from '#imports';


type SendingKeys = 'default';


@injectable()
export class RootScreenVm implements ISendable {
	public counter: number;

	public constructor(
		@injectDep(LoggerService) public readonly logger: LoggerService,
		@injectDep(SendingService) public readonly sending: SendingService<SendingKeys>,
		@injectDep(ErrorService) public readonly error: ErrorService
	) {
		this.counter = 0;
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
