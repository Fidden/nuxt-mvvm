import {LoggerService} from "~/client/shared/services/logger.service";
import {injectable} from "tsyringe";
import {inject} from "~/client/shared/decorators/inject";

@injectable()
export class IndexScreenVm {
    public constructor(
        @inject(LoggerService) public readonly logger: LoggerService
    ) {}

    public log() {
        console.log(this.logger)
    }
}
