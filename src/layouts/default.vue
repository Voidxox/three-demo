<template>
  <div class="flex flex-col h-full">
    <!-- <LayoutPageHeader></LayoutPageHeader> -->
    <slot></slot>
    <LayoutPageFooter></LayoutPageFooter>
  </div>
</template>

<script setup>
const appConfig = useAppConfig()
console.log(appConfig,'appConfig');
</script>

<style lang="scss" scoped></style>