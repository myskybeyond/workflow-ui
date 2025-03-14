<template>
  <div style="background-color: #eff1f4">
<!--        <LingDao/>-->
    <GeRen v-if="ifShowGeRen&&!ifShowLingDao"/>
    <LingDao v-if="ifShowLingDao"/>
  </div>
</template>

<script setup name="Index" lang="ts">

import GeRen from "@/components/Index/GeRen.vue";
import LingDao from "@/components/Index/LingDao.vue";
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
