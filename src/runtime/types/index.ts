import {NavigationGuard} from '#vue-router';
import {Store} from 'pinia';
import {ComponentPublicInstance, DebuggerEvent} from 'vue';
import {RouteLocationNormalizedLoaded, Router} from 'vue-router';

export interface IMountable {
    onMounted: () => Promise<void> | void;
}

export interface IBeforeMountable {
    onBeforeMounted: () => Promise<void> | void;
}

export interface ISetupable {
    onSetup: () => Promise<void> | void;
}

export interface IUnmountable {
    onUnmounted: () => Promise<void> | void;
}

export interface IRenderTrackable {
    onRenderTracked: (e: DebuggerEvent) => void;
}

export interface IRenderTriggerable {
    onRenderTriggered: (e: DebuggerEvent) => void;
}

export interface IBeforeUnmountable {
    onBeforeUnmounted: () => Promise<void> | void;
}

export interface ICaptureError {
    onErrorCaptured: (
        err: unknown,
        instance: ComponentPublicInstance | null,
        info: string
    ) => void;
}

export interface IUpdatable {
    onUpdated: () => void;
}

export interface IActivatable {
    onActivated: () => void;
}

export interface IDeactivatable {
    onDeactivated: () => void;
}

export interface IServicePrefetchable {
    onServerPrefetch: () => Promise<any>;
}

export interface IRouterable {
    onBeforeRouteLeave?: (guard: NavigationGuard) => void;
    onBeforeRouteUpdate?: (guard: NavigationGuard) => void;
}

export type ILifeCycle = Partial<
    IMountable &
    IBeforeMountable &
    ISetupable &
    IUnmountable &
    IBeforeUnmountable &
    ICaptureError &
    IUpdatable &
    IRenderTrackable &
    IRenderTriggerable &
    IDeactivatable &
    IActivatable &
    IServicePrefetchable
>;

export enum VmFlags {
    CHILD
}

export abstract class BaseViewModel {
    declare protected route: RouteLocationNormalizedLoaded;
    declare protected router: Router;
}

export type ClassInstanceType = (new (...args: any) => any);

export type PiniaStore<G extends Record<string, any>> = Store<string, States<G>, Getters<G>, Actions<G>>

export type Magic<X> = (<T>() => T extends X ? 1 : 2)

export type Actions<T extends Record<string, any>> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: T[P];
};

export type Getters<T extends Record<string, any>> = {
    [P in keyof T as Magic<Pick<T, P>> extends Magic<Readonly<Pick<T, P>>> ? P : never]: T[P];
};

export type States<T extends Record<string, any>> = Omit<{
    [P in keyof T as Magic<Pick<T, P>> extends Magic<Readonly<Pick<T, P>>> ? never : P]: T[P];
}, keyof Actions<T>>;
