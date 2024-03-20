<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";

// const hideTabBar = useState('hideTabBar', () => true)
const isDark = useDark();
const toggleDark = useToggle(isDark);
let handleClick: () => void;

onMounted(() => {
  handleClick = () => {
    location.reload();
  };
});
</script>

<template>
  <div id="navbar" class="blur-global dark:bg-neutral-800">
    <UContainer class="flex items-center h-full">
      <div class="transition-all rounded-full cursor-pointer w-9 h-9 hover:bg-neutral-300 dark:hover:bg-neutral-700">
        <UIcon name="i-heroicons-bars-3-20-solid" class="m-1 h-7 w-7" />
      </div>
      <h1 @click="handleClick" class="ml-2 text-lg font-bold hover:cursor-pointer">
        void
      </h1>
      <IButton class="ml-auto" :name="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
        @click.passive.stop="toggleDark()" />
    </UContainer>
  </div>
</template>


<style scoped>
#navbar {
  border-radius: 0 0 8px 8px;
  z-index: 1;
  @apply shadow h-16 shrink-0 w-full;
}
</style>