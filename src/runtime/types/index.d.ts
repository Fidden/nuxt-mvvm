import {NavigationGuard} from '#vue-router';
import {ComponentPublicInstance, DebuggerEvent} from 'vue';

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
