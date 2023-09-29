<template>
	<h1>Nuxt + Pinia + Di = ❤️</h1>
	<div id="buttons">
		<button @click="vm.submit()">
			Is sending: {{ vm.sending.get('default') }}
		</button>
		<button @click="vm.logger.log()">
			Log message
		</button>
		<button @click="vm.increment()">
			Count is: {{ vm.counter }}
		</button>
	</div>
</template>

<script setup lang="ts">
import {useVm} from '#imports';
import {RootScreenVm} from '~/client/screens/root-screen/root-screen.vm';

const vm = useVm(RootScreenVm);
</script>


<style>
body {
	margin: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	min-width: 320px;
	min-height: 100vh;
}

button {
	border-radius: 8px;
	border: 1px solid transparent;
	padding: 0.6em 1.2em;
	font-size: 1em;
	font-weight: 500;
	font-family: inherit;
	background-color: rgb(26, 26, 26);
	cursor: pointer;
	transition: border-color 0.25s ease 0s;

	&:hover {
		border-color: rgb(100, 108, 255);
	}
}

h1 {
	text-align: center;
}

#buttons {
	display: flex;
	gap: 10px;
}
</style>
