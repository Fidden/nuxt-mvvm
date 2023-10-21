<h1 align="center">nuxt-mvvm</h1>

<p align="center">⚡️ MVVM implementation for nuxt applications</p>

> Intuitive, type safe and flexible MVVM implementation for nuxt based applications

## Features

- ⛰️ Nuxt3 ready
- ⚙️ SSR support
- 💉 Dependency injection
- 📦 Extremely light

## Setup

Add as dependency

```shell
pnpm add nuxt-mvvm && pnpm add tsyringe -D
```

```ts
import {defineNuxtConfig} from 'nuxt'


export default defineNuxtConfig({
    modules: ['nuxt-mvvm']
})
```

## Usage

### 1. Simple usage

Create view-model

```ts
@ViewModel()
class MyViewModel extends BaseViewModel {
    constructor() {
        super();
        this.counter = 0;
    }

    public increment() {
        this.counter++;
    }
}
```

And just use it

```vue

<template>
	<button @click="vm.increment()">
		count: {{vm.counter}}
	</button>
</template>

<script setup lang="ts">
	import {useVm} from '#imports';


	const vm = useVm(MyViewModel);
</script>
```

### 2. Usage with services

Create service

```ts
class CounterService {
    constructor() {
        this.value = 0;
    }

    public increment() {
        this.value++;
    }
}
```

Inject service

```ts
@ViewModel()
class MyViewModel extends BaseViewModel {
    constructor(
        @injectDep(CounterService) public readonly counter: CounterService
    ) {
        super();
    }
}
```

Use it with service

```vue

<template>
	<button @click="vm.counter.increment()">
		count: {{ vm.counter.value }}
	</button>
</template>

<script setup lang="ts">
	import {useVm} from '#imports';


	const vm = useVm(MyViewModel);
</script>
```

### 3. Control lifecycle

You can specify life cycle hook via `IMountable` `ISetupable`, `IUnmountable` interfaces or just use union
interface `ILifeCycle` that contains all possible life cycle hooks.

```ts
@ViewModel()
class MyViewModel extends BaseViewModel implements IMountable, ISetupable, IUnmountable /* or implements ILifeCycle */ {
    constructor() {
        super();
    }

    public onMount() {
        // calls on view mounting
    }

    public onSetup() {
        // calls on view setup
    }

    public onUnmount() {
        // calls on view unmounting
    }
}
```

### 4. Routing
The `BaseViewModel` encompasses `router` and `route` variables, which are equivalents of `useRouter` and `useRoute`.
```ts
@ViewModel()
class MyViewModel extends BaseViewModel {
    constructor() {
        super();
    }

    public redirect() {
        this.router.push('/');
    }
    
    public get currentRouteFullPath() {
        return this.route.fullPath;
    }
}
```

Life cycle interfaces:

- `IMountable`
- `IBeforeMountable`
- `ISetupable`
- `IUnmountable`
- `IBeforeUnmountable`
- `ICaptureError`
- `IUpdatable`
- `IRenderTrackable`
- `IRenderTriggerable`
- `IDeactivatable`
- `IActivatable`
- `IServicePrefetchable`

Router interfaces:

- `IRouterable`

### Decorators

1. `ViewModel` - Labels a class as a view-model. Apply this decorator when the class represent a screen or a component.
2. `injectDep` - Injects a dependency into a view-model.
3. `ScreenVm` - Signifies that the class is a screen view-model.
4. `ComponentVm` - Identifies a class as a component view-model.

### Reusable Composition Functions

1. `useVm` - Function to generate view-model instance
2. `useChildVm` - Function to utilize an instance of previously created view-model

### Establishment of a base view-model

```ts
/**
 * Every view-model must inherit from the BaseViewModel class and be decorated with the @ViewModel, or @ScreenVm, or @ComponentVm decorator.
 */
@ViewModel()
class ViewModel extends BaseViewModel {
    constructor() {
        super();
    }
}
```

#### Creating screen view model

```ts
/**
 * The ScreenVm decorator identifies a view-model as related to a screen. This implies that
 * a single instance of `ScreenViewModel` is available throughout the entire application.
 **/

@ScreenVm()
class ScreenViewModel extends BaseViewModel {
    constructor() {
        super();
    }

    // some logic here...
}
```

#### Creating component view model

```ts
/**
 * The ComponentVm decorator signifies a view-model as related to a component,
 * allowing `ScreenViewModel` to possess several instances (each for a different component)
 **/

@ComponentVm()
class ButtonVm extends BaseViewModel {
    constructor() {
        super();
    }

    // some logic here...
}
```
