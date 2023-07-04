<script setup lang="ts">
import {useVm} from "~/client/shared/addons/pinia.addon";
import {IndexScreenVm} from "~/client/screens/index-screen/index-screen.vm";

const vm = useVm(IndexScreenVm);
</script>

<template>
  <button @click="vm.logger.log()">
    click
  </button>
</template>

<style scoped>

</style>
