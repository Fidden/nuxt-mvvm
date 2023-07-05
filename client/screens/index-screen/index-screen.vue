<script setup lang="ts">
import {useVm} from "~/client/shared/addons/pinia.addon";
import {IndexScreenVm} from "~/client/screens/index-screen/index-screen.vm";

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
  {{ vm.counter }}
</template>

<style scoped>

</style>
