export interface ModuleExt {
    _storeOptions?: {
        initialState: NonNullable<any>,
        getters: NonNullable<unknown>,
        actions: NonNullable<unknown>
    };
}
