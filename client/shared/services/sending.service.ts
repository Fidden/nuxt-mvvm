export class SendingService<TKeys extends string> {
    public keys?: Record<TKeys, number>;

    constructor() {
        this.keys = {} as Record<TKeys, number>;
    }

    public get(key: TKeys) {
        if (!this.keys || this.keys[key] === undefined)
            return false;

        return this.keys[key] !== 0;
    }
}
