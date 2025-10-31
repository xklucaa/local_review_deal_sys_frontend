<script setup>
import footer_11 from './components/footer_11.vue';
</script>

<template>
  <div class="app-layout">
    <!-- 内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部导航 -->
    <footer_11 />
  </div>
</template>

<style>
/* 保证 html、body、#app 没有留白 */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 禁止横向滚动 */
}

.app-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* 内容区：撑满中间部分，不留白 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0; /* 取消默认内边距 */
  box-sizing: border-box;
}
</style>
