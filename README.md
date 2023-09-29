<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

<h1 align="center">nuxt-mvvm</h1>

<p align="center">⚡️ MVVM support for nuxt applications</p>

## Features

- Nuxt3 ready
- Full ssr support
- ViewModels based on pinia stores
- Dependency injection

## Setup

Add as dependeny

```shell
pnpm add nuxt-mvvm

pnpm add tsyringe -D
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
class MyViewModel {
	constructor() {
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
	<button>
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
		this.counter = 0;
	}

	public increment() {
		this.counter++;
	}
}
```

Inject service

```ts
class MyViewModel {
	constructor(
		@injectDep(CounterService) public readonly counter: CounterService
	) {
		this.value = 0;
	}

	public increment() {
		this.value++;
	}
}
```

Use it with service

```vue

<template>
	<button @click="vm.counter.increment()">
		count: {{vm.counter.value}}
	</button>
</template>

<script setup lang="ts">
	import {useVm} from '#imports';

	const vm = useVm(MyViewModel);
</script>
```

### 3. Control lifecycle

```ts
class MyViewModel implements IMountable, ISetupable, IUnmountable {
	constructor(
		@injectDep(CounterService) public readonly counter: CounterService
	) {
		this.value = 0;
	}

	public increment() {
		this.value++;
	}

	public onMount() {
		// equals onMounted()
	}

	public onSetup() {
		// calls on setup()
	}

	public onUnmount() {
		// equals onUnmounted()
	}
}
```

### Decorators

1. `injectable` - https://github.com/microsoft/tsyringe#injectable
2. `singleton` - https://github.com/microsoft/tsyringe#singleton
3. `injectDep` - https://github.com/microsoft/tsyringe#inject


### Composables

1. `useVm` - create view-model instance
2. `useChildVm` - create child of some view-model
