<script setup>
import { inject, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import service from '../utils/request'
import { ElMessage } from 'element-plus'

// props
defineProps({
  msg: String,
})

// 注入底部导航控制（如果有的话）
inject('showButtom')()

const router = useRouter()

const toPage = (index) => {
  router.push({ path: `/${index}`, params: {} })
}

const toBlogDetail = (blog) => {
  router.push({
    path: '/blog_details',
    query: { id: blog.id },
  })
}

const toShopList = (id, name) => {
  router.push({ path: '/shopList', query: { id, name } })
}

const info = reactive({
  types: [],
  blogs: [],
  current: 1,
})

// 页面加载时获取数据
onMounted(() => {
  service
      .get('/shop-type/list')
      .then((res) => {
        info.types = res.data
      })
      .catch(() => {
        ElMessage('获取店铺类型出错了')
      })

  service
      .get('/blog/hot?current=' + info.current)
      .then(({ data }) => {
        data.forEach((b) => (b.img = b.images.split(',')[0]))
        info.blogs = info.blogs.concat(data)
      })
      .catch((err) => {
        ElMessage('获取热点博客出错了哦' + err)
      })
})
</script>

<template>
  <!-- 统一的根容器 --><div class="page-container">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <div class="city-btn">杭州<i class="el-icon-arrow-down"></i></div>
      <div class="search-input">
        <el-input placeholder="请输入商户名、地点"></el-input>
      </div>
      <div class="header-icon" @click="toPage('user_info')">
        <el-icon size="40"><User /></el-icon>
      </div>
    </div>

    <!-- 店铺类型列表 -->
    <div class="type-list">
      <div
          class="type-box"
          v-for="t in info.types"
          :key="t.id"
          @click="toShopList(t.id, t.name)"
      >
        <div class="type-view">
          <img :src="'/src/components/imgs' + t.icon" alt="" />
        </div>
        <div class="type-text">{{ t.name }}</div>
      </div>
    </div>

    <!-- 博客列表 -->
    <div class="blog-list">
      <div class="blog-box" v-for="b in info.blogs" :key="b.id">
        <div class="blog-img" @click="toBlogDetail(b)">
          <img :src="b.images.split(',')[0]" alt="" />
        </div>
        <div class="blog-title">{{ b.title }}</div>
        <div class="blog-foot">
          <div class="blog-user-icon">
            <img
                :src="'/src/components' + b.icon || '/src/components/imgs/icons/default-icon.png'"
                alt=""
            />
          </div>
          <div class="blog-user-name">{{ b.name }}</div>
          <div class="blog-liked">
            ❤️ {{ b.liked }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ 页面容器占满屏幕，不留白 */
.page-container {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;  /* 确保所有元素宽度计算包括边距 */
  background-color: #f9f9f9;
  display: block; /* 或使用 flexbox，根据需要调整 */
  overflow-x: hidden;
}


/* 顶部搜索栏 */
.search-bar {
  background-color: #ff6633;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 8px;
  width: 100%;
  box-sizing: border-box; /* 确保宽度计算包括边距 */
  margin: 0; /* 去掉外边距，防止溢出 */
}
/* 类型列表 */
.type-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden; /* 去除溢出的部分 */
}

.type-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: white;
}
.type-view img {
  width: 60px; /* 图片宽度 */
  height: 60px; /* 图片高度 */
  object-fit: cover; /* 保证图片填满而不变形 */
}
.type-text {
  margin-top: 8px;
  text-align: center;
}

  /* 博客列表 */
.blog-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每行显示 4 个 */
  gap: 20px;
  width: 100%;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
}
.search-input {
  flex-grow: 1; /* 让搜索框占满剩余空间 */
  margin: 0 10px;
}
.blog-box {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid #ccc;
  padding: 15px;
  background-color: white;
  width: 100%; /* 确保 blog-box 占满父容器的宽度 */
  box-sizing: border-box;
}

.blog-img img {
  width: 100%; /* 确保图片自适应宽度 */
  height:auto;
}

.blog-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.blog-foot {
  display: flex;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
  color: #777;
}

.blog-user-icon img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

</style>
