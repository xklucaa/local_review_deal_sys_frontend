<script setup>
import { inject, onMounted, reactive, ref } from 'vue';
import utils from '../utils/utils';
import { useRoute, useRouter } from 'vue-router';
import service from '../utils/request';
import { ElMessage } from 'element-plus';

defineProps({
  msg: String,
})

const user = reactive({})
const shop = reactive({})

const formatTime = (b) => {
  return b.getFullYear() + "-" + (b.getMonth() + 1) + "-" + b.getDate();
}

const formatMinutes = (m) => {
  if (m < 10) m = "0" + m
  return m;
}

inject('hideButtom')();
let fun = inject('showButtom');
const router = useRouter();
const goBack = () => {
  router.go(-1);
  fun();
}

const route = useRoute();
const blog = reactive({})

const toOtherInfo = () => {
  if (user.id === blog.userId) {
    router.push({ path: "/user_info" });
  } else {
    router.push({
      path: "/other_user_info",
      query: { id: blog.userId }
    });
  }
}

onMounted(() => {
  let id = route.query.id;
  queryBlogById(id)
})

const queryBlogById = (id) => {
  service.get(`/blog/${id}`)
    .then(({ data }) => {
      data.images = data.images.split(",")
      Object.assign(blog, data);
      queryShopById(data.shopId)
      queryLikeList(id);
      queryLoginUser();
    })
    .catch((err) => { ElMessage('Failed to load blog information' + err) })
}

const queryShopById = (shopId) => {
  service.get("/shop/" + shopId)
    .then(({ data }) => {
      data.image = data.images.split(",")[0]
      Object.assign(shop, data);
    })
    .catch((err) => { ElMessage('Failed to load store information' + err) })
}

const likes = ref([]);
const queryLikeList = (id) => {
  service.get("/blog/likes/" + id)
    .then(({ data }) => likes.value = data)
    .catch((err) => { ElMessage('Failed to load likes' + err) })
}

const queryLoginUser = () => {
  service.get("/user/me")
    .then(({ data }) => {
      Object.assign(user, data)
      if (user.id !== blog.userId) {
        isFollowed();
      }
    })
    .catch((err) => { ElMessage('Not logged in' + err) })
}

const follow = () => {
  service.put("/follow/" + blog.userId + "/" + !followed.value)
    .then(() => {
      ElMessage({ message: followed.value ? "Unfollowed" : "Followed", type: 'success' })
      followed.value = !followed.value
    })
    .catch((err) => {
      ElMessage('Failed to follow' + err)
    })
}

const followed = ref(false);
const isFollowed = () => {
  service.get("/follow/or/not/" + blog.userId)
    .then(({ data }) => { followed.value = data })
    .catch((err) => { ElMessage('Failed to load follow status' + err) });
}

const score = ref(4.4)

const addLike = () => {
  service.put("/blog/like/" + blog.id)
    .then(({ data }) => {
      service.get("/blog/" + blog.id)
        .then(({ data }) => {
          data.images = data.images.split(",")
          Object.assign(blog, data);
          queryLikeList(blog.id);
        })
    })
}
</script>

<template>
  <div class="header">
    <div class="header-back-btn" @click="goBack">
      <el-icon>
        <ArrowLeftBold />
      </el-icon>
    </div>
    <div class="header-title">Blog Details</div>
    <div class="header-share">···</div>
  </div>

  <div class="container" style="height: 85%;overflow-y: scroll; overflow-x: hidden">
    <!-- Image Carousel -->
    <el-carousel height="518px" indicator-position="none" :loop="false">
      <el-carousel-item v-for="item in blog.images" :key="item">
        <img class="carousel-image" :src="item" />
      </el-carousel-item>
    </el-carousel>

    <!-- User Info Section -->
    <div class="user-card">
      <div class="user-avatar" @click="toOtherInfo">
        <img :src="blog.icon || '/imgs/icons/default-icon.png'" alt="User Avatar">
      </div>
      <div class="user-info">
        <div class="username">{{ blog.name }}</div>
        <span class="post-time">{{ formatTime(new Date(blog.createTime)) }}</span>
      </div>
      <div class="action-section">
        <div class="follow-btn" @click="follow" v-show="!user || user.id !== blog.userId">
          {{ followed ? 'Unfollow' : 'Follow' }}
        </div>
      </div>
    </div>

    <!-- Blog Content -->
    <div class="blog-content" v-html="blog.content"></div>

    <!-- Shop Info Card -->
    <div class="shop-card">
      <div class="shop-avatar">
        <img :src="shop.image" alt="Shop Image">
      </div>
      <div class="shop-details">
        <div class="shop-name">{{ shop.name }}</div>
        <div class="rating-section">
          <el-rate v-model="shop.score"></el-rate>
        </div>
        <div class="price-info">${{ shop.avgPrice }}/person</div>
      </div>
    </div>

    <!-- Likes Section -->
    <div class="likes-section">
      <div class="like-icon">
        <svg t="1646634642977" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="2187" width="20" height="20">
          <path
            d="M160 944c0 8.8-7.2 16-16 16h-32c-26.5 0-48-21.5-48-48V528c0-26.5 21.5-48 48-48h32c8.8 0 16 7.2 16 16v448zM96 416c-53 0-96 43-96 96v416c0 53 43 96 96 96h96c17.7 0 32-14.3 32-32V448c0-17.7-14.3-32-32-32H96zM505.6 64c16.2 0 26.4 8.7 31 13.9 4.6 5.2 12.1 16.3 10.3 32.4l-23.5 203.4c-4.9 42.2 8.6 84.6 36.8 116.4 28.3 31.7 68.9 49.9 111.4 49.9h271.2c6.6 0 10.8 3.3 13.2 6.1s5 7.5 4 14l-48 303.4c-6.9 43.6-29.1 83.4-62.7 112C815.8 944.2 773 960 728.9 960h-317c-33.1 0-59.9-26.8-59.9-59.9v-455c0-6.1 1.7-12 5-17.1 69.5-109 106.4-234.2 107-364h41.6z m0-64h-44.9C427.2 0 400 27.2 400 60.7c0 127.1-39.1 251.2-112 355.3v484.1c0 68.4 55.5 123.9 123.9 123.9h317c122.7 0 227.2-89.3 246.3-210.5l47.9-303.4c7.8-49.4-30.4-94.1-80.4-94.1H671.6c-50.9 0-90.5-44.4-84.6-95l23.5-203.4C617.7 55 568.7 0 505.6 0z"
            p-id="2188" :fill="blog.isLike ? '#ff6633' : '#82848a'"></path>
        </svg>
      </div>
      <div class="likes-list">
        <div class="liker-avatar" v-for="u in likes" :key="u.id">
          <img :src="u.icon || '/imgs/icons/default-icon.png'" alt="Liker Avatar">
        </div>
        <div class="likes-count">{{ blog.liked }} people liked</div>
      </div>
    </div>

    <div class="section-divider"></div>

    <!-- Comments Section -->
    <div class="comments-section">
      <div class="comments-header">
        <div>COMMENTS <span>（119）</span></div>
        <div><i class="el-icon-arrow-right"></i></div>
      </div>
      <div class="comments-list">
        <div class="comment-card" v-for="i in 3" :key="i">
          <div class="comment-avatar">
            <img
              src="https://p0.meituan.net/userheadpicbackend/57e44d6eba01aad0d8d711788f30a126549507.jpg%4048w_48h_1e_1c_1l%7Cwatermark%3D0"
              alt="Commenter Avatar">
          </div>
          <div class="comment-content">
            <div class="commenter-info">Yexiaoyu <span>Lv5</span></div>
            <div class="comment-rating">
              Rating
              <el-rate v-model="score" disabled></el-rate>
            </div>
            <div class="comment-text">
              The coupon I bought on a certain platform is so cheap that it can be used as a working meal. Although the price is low, Meituan doesn't have it at all...
            </div>
            <div class="comment-images">
              <img
                src="https://qcloud.dpfile.com/pc/6T7MfXzx7USPIkSy7jzm40qZSmlHUF2jd-FZUL6WpjE9byagjLlrseWxnl1LcbuSGybIjx5eX6WNgCPvcASYAw.jpg"
                alt="Comment Image">
              <img
                src="https://qcloud.dpfile.com/pc/sZ5q-zgglv4VXEWU71xCFjnLM_jUHq-ylq0GKivtrz3JksWQ1f7oBWZsxm1DWgcaGybIjx5eX6WNgCPvcASYAw.jpg"
                alt="Comment Image">
              <img
                src="https://qcloud.dpfile.com/pc/xZy6W4NwuRFchlOi43DVLPFsx7KWWvPqifE1JTe_jreqdsBYA9CFkeSm2ZlF0OVmGybIjx5eX6WNgCPvcASYAw.jpg"
                alt="Comment Image">
            </div>
            <div class="comment-stats">
              Views 641 &nbsp;&nbsp;&nbsp;&nbsp; Comments 5
            </div>
          </div>
        </div>
        <div class="view-all-comments">
          <div>View all 119 comments</div>
          <div><i class="el-icon-arrow-right"></i></div>
        </div>
      </div>
    </div>

    <div class="section-divider"></div>
  </div>

  <!-- Bottom Action Bar -->
  <div class="bottom-bar">
    <div class="action-button">
      <div class="like-action" @click="addLike()">
        <svg t="1646634642977" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="2187" width="26" height="26">
          <path
            d="M160 944c0 8.8-7.2 16-16 16h-32c-26.5 0-48-21.5-48-48V528c0-26.5 21.5-48 48-48h32c8.8 0 16 7.2 16 16v448zM96 416c-53 0-96 43-96 96v416c0 53 43 96 96 96h96c17.7 0 32-14.3 32-32V448c0-17.7-14.3-32-32-32H96zM505.6 64c16.2 0 26.4 8.7 31 13.9 4.6 5.2 12.1 16.3 10.3 32.4l-23.5 203.4c-4.9 42.2 8.6 84.6 36.8 116.4 28.3 31.7 68.9 49.9 111.4 49.9h271.2c6.6 0 10.8 3.3 13.2 6.1s5 7.5 4 14l-48 303.4c-6.9 43.6-29.1 83.4-62.7 112C815.8 944.2 773 960 728.9 960h-317c-33.1 0-59.9-26.8-59.9-59.9v-455c0-6.1 1.7-12 5-17.1 69.5-109 106.4-234.2 107-364h41.6z m0-64h-44.9C427.2 0 400 27.2 400 60.7c0 127.1-39.1 251.2-112 355.3v484.1c0 68.4 55.5 123.9 123.9 123.9h317c122.7 0 227.2-89.3 246.3-210.5l47.9-303.4c7.8-49.4-30.4-94.1-80.4-94.1H671.6c-50.9 0-90.5-44.4-84.6-95l23.5-203.4C617.7 55 568.7 0 505.6 0z"
            p-id="2188" :fill="blog.isLike ? '#ff6633' : '#82848a'"></path>
        </svg>
        <span :class="{ liked: blog.isLike }">{{ blog.liked }}</span>
      </div>
    </div>
    <div style="width: 40%"></div>
    <div class="action-button">
      <div class="comment-action">
        <el-icon>
          <ChatDotSquare />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Global Styles */
.container img {
  width: 100%;
}

.container {
  margin-top: 45px;
}

/* Header Styles */
.header {
  width: 100%;
  height: 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #ff6633;
  position: fixed;
  top: 0;
  z-index: 500;
  background-color: #fff;
}

.header-back-btn {
  width: 10%;
  color: #ff6633;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  width: 80%;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-share {
  width: 10%;
  text-align: center;
  font-size: 18px;
  color: #82848a;
  font-weight: bold;
}

/* Carousel Styles */
.el-carousel__container {
  position: relative;
  height: 518px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Card Layouts */
.user-card, .shop-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.user-card:hover, .shop-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.user-avatar, .shop-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.user-avatar img, .shop-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info, .shop-details {
  flex: 1;
  margin: 0 15px;
}

.username, .shop-name {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 4px;
}

.post-time {
  font-size: 12px;
  color: #718096;
  background: #f7fafc;
  padding: 4px 8px;
  border-radius: 6px;
}

.price-info {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

.follow-btn {
  padding: 8px 16px;
  border-radius: 20px;
  text-align: center;
  border: 2px solid #ff6633;
  color: #ff6633;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.follow-btn:hover {
  background: #ff6633;
  color: white;
  transform: scale(1.05);
}

/* Blog Content */
.blog-content {
  width: 90%;
  padding: 20px;
  margin: 0 auto;
  line-height: 1.6;
  color: #4a5568;
  font-size: 15px;
}

/* Likes Section */
.likes-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  margin: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.like-icon {
  flex-shrink: 0;
}

.likes-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.liker-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.liker-avatar:hover {
  transform: scale(1.1);
}

.liker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.likes-count {
  margin-left: 10px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

/* Section Dividers */
.section-divider {
  height: 12px;
  background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
  margin: 20px 0;
}

/* Comments Section */
.comments-section {
  padding: 20px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
}

.comments-header span {
  font-size: 14px;
  font-weight: 400;
  color: #718096;
}

.comment-card {
  display: flex;
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.comment-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.comment-avatar {
  width: 60px;
  flex-shrink: 0;
}

.comment-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.commenter-info {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.commenter-info span {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f6ad55, #ed8936);
  color: white;
  margin-left: 8px;
}

.comment-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #718096;
  margin-bottom: 8px;
}

.comment-text {
  padding: 8px 0;
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
}

.comment-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin: 12px 0;
}
.comment-images img {
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.comment-images img:hover {
  transform: scale(1.05);
}

.comment-stats {
  font-size: 12px;
  color: #a0aec0;
}

.view-all-comments {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #e2e8f0;
  margin-top: 20px;
  color: #ff6633;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
}

.view-all-comments:hover {
  color: #e55a2b;
}

/* Bottom Action Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  backdrop-filter: blur(10px);
}

.action-button {
  flex: 1;
  display: flex;
  justify-content: center;
}

.like-action, .comment-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 25px;
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.like-action:hover, .comment-action:hover {
  background: #ff6633;
  color: white;
  transform: translateY(-2px);
}

.like-action.liked, .comment-action.active {
  background: #ff6633;
  color: white;
}

/* Rating Styles */
.rate-container {
  align-items: center;
}

.el-rate {
  height: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .el-carousel__container {
    height: 400px;
  }

  .user-card, .shop-card {
    margin: 15px;
    padding: 16px;
  }

  .comments-section {
    padding: 15px;
  }

  .bottom-bar {
    height: 60px;
    padding: 0 15px;
  }

  .like-action, .comment-action {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>