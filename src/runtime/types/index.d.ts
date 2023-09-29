export interface IMountable {
	onMount: () => Promise<void> | void;
}

export interface ISetupable {
	onSetup: () => Promise<void> | void
}

export interface IUnmountable {
	onUnmount: () => Promise<void> | void;
}
