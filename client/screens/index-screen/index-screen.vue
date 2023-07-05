<script setup lang="ts">
import {IndexScreenVm} from "~/client/screens/index-screen/index-screen.vm";
import {useRegularStore} from "~/client/shared/stores/regular.store";
import {useVm} from "~/client/shared/composables/useVm";

const regularStore = useRegularStore();

const vm = useVm(IndexScreenVm);
if (process.server) {
  vm.setCounter();
  vm.logger.log()
}

</script>

<template>
  <button @click="vm.submit()">
    click
  </button>
  <button @click="vm.logger.log()">
    log
  </button>
  <button @click="vm.increment()">
    increment
  </button>
  <h2>Is sending: {{ vm.sending.get('default') }}</h2>
  <h2>Counter {{ vm.counter }}</h2>
  <h2>RegularStore: hello {{ regularStore.hello }}</h2>
</template>

<style scoped>

</style>
