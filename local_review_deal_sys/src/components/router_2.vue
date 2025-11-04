<script setup>
import fullImg from '../../imgs/img.png'  // 注意路径相对 src/components
</script>

<template>
  <img :src="fullImg" class="fullscreen-img" alt="全屏图" />
</template>

<style scoped>
.fullscreen-img {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}
</style>
