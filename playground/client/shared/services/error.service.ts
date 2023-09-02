export class ErrorService {
    private error: unknown;

    constructor() {
        this.error = undefined;
    }

    public setup(e: unknown) {
        this.error = e;
    }
}
