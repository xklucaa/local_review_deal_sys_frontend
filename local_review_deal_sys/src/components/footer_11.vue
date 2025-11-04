<script setup>
import { provide, ref } from 'vue'
import { useRouter } from 'vue-router';
defineProps({
  msg: String,
});
const isShow = ref(true)
provide('hideButtom',()=>{
 isShow.value= false;
})
provide('showButtom',()=>{
 isShow.value= true;
})
const router = useRouter();
const toPage = (index) => {
  router.push({ path: `/${index}` });
}
const count = ref(0)
</script>
<template>
  <router-view></router-view>
  <div v-show="isShow" class="foot">
    <div class="foot-box" :class="{ active: activeBtn === 1 }" @click="toPage(1)">
      <div class="foot-view"><el-icon>
          <House />
        </el-icon></div>
      <div class="foot-text">Home Page</div>
    </div>
    <div class="foot-box" :class="{ active: activeBtn === 2 }" @click="toPage(2)">
      <div class="foot-view"><el-icon>
          <Location />
        </el-icon></div>
      <div class="foot-text">Map</div>
    </div>
    <div class="foot-box" @click="toPage('blog_edit')">
      <img class="add-btn" src="./imgs/add.png" alt="">
    </div>
    <div class="foot-box" :class="{ active: activeBtn === 3 }" @click="toPage(3)">
      <div class="foot-view"><el-icon>
          <ChatLineRound />
        </el-icon></div>
      <div class="foot-text">Message</div>
    </div>
    <div class="foot-box" :class="{ active: activeBtn === 4 }" @click="toPage('user_info')">
      <div class="foot-view"><el-icon>
          <User />
        </el-icon></div>
      <div class="foot-text">Me</div>
    </div>
  </div>
</template>

<style scoped>
.foot {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0; /* 原来是 1rem 改为 0.5rem */
  z-index: 2000;
  background-color: white;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}



.read-the-docs {
  color: #888;
}

.add-btn {
  width: 3rem;
  height: 3rem; /* 保持宽高一致，不会撑高 footer */
}
.foot {
  min-height: 3.5rem; /* 控制最小高度 */
}

</style>
