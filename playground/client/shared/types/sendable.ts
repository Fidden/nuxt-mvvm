export interface ISendable {
    /**
     * Sending to server data
     * @returns something promisable
     */
    submit: () => Promise<unknown>;
}
