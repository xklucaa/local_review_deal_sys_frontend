<script setup>
import { inject, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import service from '../utils/request'
import { ElMessage } from 'element-plus'

// props
defineProps({
  msg: String,
})

// Inject bottom navigation control (if available)
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

// Fetch data when page loads
onMounted(() => {
  service
      .get('/shop-type/list')
      .then((res) => {
        info.types = res.data
      })
      .catch(() => {
        ElMessage('Error fetching shop types')
      })

  service
      .get('/blog/hot?current=' + info.current)
      .then(({ data }) => {
        data.forEach((b) => (b.img = b.images.split(',')[0]))
        info.blogs = info.blogs.concat(data)
      })
      .catch((err) => {
        ElMessage('Error fetching hot blogs' + err)
      })
})
</script>

<template>
  <!-- Unified root container -->
  <div class="page-container">
    <!-- Top search bar -->
    <div class="search-bar">
      <div class="city-btn">Shanghai<i class="el-icon-arrow-down"></i></div>
      <div class="search-input">
        <el-input placeholder="Please enter merchant name, location"></el-input>
      </div>
      <div class="header-icon" @click="toPage('user_info')">
        <el-icon size="40"><User /></el-icon>
      </div>
    </div>

    <!-- Shop type list -->
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

    <!-- Blog list -->
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
/* ✅ Page container fills the screen, no white space */
.page-container {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;  /* Ensure all element width calculations include margins */
  background-color: #f9f9f9;
  display: block; /* Or use flexbox, adjust as needed */
  overflow-x: hidden;
}

/* Top search bar */
.search-bar {
  background-color: #ff6633;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 8px;
  width: 100%;
  box-sizing: border-box; /* Ensure width calculation includes margins */
  margin: 0; /* Remove outer margins to prevent overflow */
}

/* Type list */
.type-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden; /* Remove overflow parts */
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
  width: 60px; /* Image width */
  height: 60px; /* Image height */
  object-fit: cover; /* Ensure images fill without distortion */
}

.type-text {
  margin-top: 8px;
  text-align: center;
}

/* Blog list */
.blog-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  grid-auto-rows: masonry; /* Waterfall flow effect */
  align-items: start; /* Top alignment */
  width: 100%;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
}

.search-input {
  flex-grow: 1; /* Let the search box fill remaining space */
  margin: 0 10px;
}

.blog-box {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid #ccc;
  padding: 15px;
  background-color: white;
  width: 100%; /* Ensure blog-box fills parent container width */
  box-sizing: border-box;
}

.blog-img img {
  width: 100%; /* Ensure images adapt to width */
  height: auto;
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