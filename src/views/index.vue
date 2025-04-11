<template>
  <div style="background-color: #eff1f4;margin: 10px;">
    首页
  </div>
</template>

<script setup name="Index" lang="ts">

import {checkPermi} from "@/utils/permission";

const ifShowLingDao = computed(() => {
  return checkPermi(['system:user:leader'])
})
const ifShowGeRen = computed(() => {
  return checkPermi(['system:user:everyman'])
})
</script>

<style scoped lang="scss">

</style>
