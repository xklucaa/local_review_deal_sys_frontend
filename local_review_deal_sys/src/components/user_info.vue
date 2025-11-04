<script setup>
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router';
import service from '../utils/request';

defineProps({
  msg: String,
})
const router = useRouter()
const goBack = () => {
  router.go(-1)
}
const toEdit = () => {
  router.push({
    path: '/user_info_edit', query: {}
  })
}
const user = reactive({})
const info = reactive({})
const activeName = ref("1");
const logout = () => {
  service.post("/user/logout")
    .then(() => {
      // Clear session
      sessionStorage.removeItem("token")
      // Redirect
      ElMessage('Logout successful!')
      router.push({
        path: '/login', query: {}
      })
    })
    .catch((err) => { ElMessage('Something went wrong' + err) })
}
onMounted(() => {
  queryUser();
})
const queryUser = () => {
  // Query user information
  service.get("/user/me")
    .then(({ data }) => {
      // Save user
      Object.assign(user, data);
      // Query user details
      queryUserInfo();
      // Query user blogs
      queryBlogs();
    })
    .catch(err => {
      ElMessage('No login information found, please login to view profile!' )
      router.push({
        path: '/login', query: {}
      })

    })
}
const blogs2 = ref([]);
const params = reactive({
  minTime: 0,
  offset: 0
});
const queryBlogsOfFollow = (clear)=>{
  //TODO Query blogs from followed users (not yet developed)
  if (clear) {
    params.offset = 0;
    params.minTime = new Date().getTime() + 1;
  }

  service.get("/blog/of/follow", {
    params: {
      offset: params.offset,
      lastId: params.minTime || new Date().getTime() + 1
    }
  })
      .then(({ data }) => {
        if (!data) {
          return;
        }

        let { list, ...newParams } = data;
        // Process image paths
        list.forEach(b => b.img = b.images.split(",")[0]);

        // Replace or append data based on clear parameter
        blogs2.value = clear ? list : blogs2.value.concat(list);
        // Update pagination parameters
        Object.assign(params, newParams);
      })
      .catch(err => {
        ElMessage('Failed to get followed users blogs：' + err);
      });
}
const handleClick = (r) => {
  console.log('r.name' + r.paneName);
  if (r.paneName === '4') {
    queryBlogsOfFollow(true);
  }
}
const toBlogDetail = (blog) => {
  router.push({
    path: '/blog_details', query: { id: blog.id }
  })
  console.log('blog' + blog.id);
}
const blogs = ref([]);
const queryBlogs = () => {
  service.get("/blog/of/me")
    .then(({ data }) => { blogs.value = data })
    .catch((err) => { ElMessage('Failed to query user blogs' + err) })
}

const queryBlogById = (b) => {
  service.get("/blog/" + b.id)
      .then(({ data }) => {
        b.liked = data.liked;
        b.isLike = data.isLike;
      })
      .catch((error) => {
        ElMessage('Failed to query blog information' + error)
        b.liked++;
      })
}

const addLike = (blog) => {
  service.put("/blog/like/" + blog.id)
      .then(({ data }) => {
        queryBlogById(blog)
      })
      .catch(err => {
        ElMessage('Like operation failed' + err)
      })
}
const queryUserInfo = () => {
  service.get("/user/info/" + user.id)
    .then(({ data }) => {
      if (!data) {
        return
      }
      // Save user details
      Object.assign(info, data);
      // Save to local storage
      sessionStorage.setItem("userInfo", JSON.stringify(data))
    })
    .catch(err => {
      ElMessage('Failed to query user details' + err)
    })
}
</script>

<template>
  <div class="header">
    <div class="header-back-btn" @click="goBack"><el-icon>
        <ArrowLeftBold />
      </el-icon></div>
    <div class="header-title">Profile</div>
  </div>
  <div class="profile-container">
    <div class="basic">
      <div class="basic-icon">
        <img :src="user.icon || '/imgs/icons/default-icon.png'" alt="">
      </div>
      <div class="basic-info">
        <div class="name">{{ user.nickName }}</div>
        <span>Hangzhou</span>
        <div class="edit-btn" @click="toEdit">
          Edit Profile
        </div>
      </div>
      <div class="logout-btn" @click="logout">
        Logout
      </div>
    </div>
    <div class="introduce">
      <span v-if="info.introduce">{{ info.introduce }}</span>
      <span v-else>Add a bio to let others know you better <i class="el-icon-edit"></i></span>
    </div>
    <div class="content">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="Blogs" name="1">
          <div v-for="b in blogs" :key="b.id" class="blog-item">
            <div class="blog-img" @click="toBlogDetail(b)"><img :src="b.images.split(',')[0]" alt=""></div>
            <div class="blog-info">
              <div class="blog-title">{{ b.title }}</div>
              <div class="blog-liked" @click="addLike(b)">
                <svg t="1646634642977" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="2187" width="14" height="14">
                  <path
                      d="M160 944c0 8.8-7.2 16-16 16h-32c-26.5 0-48-21.5-48-48V528c0-26.5 21.5-48 48-48h32c8.8 0 16 7.2 16 16v448zM96 416c-53 0-96 43-96 96v416c0 53 43 96 96 96h96c17.7 0 32-14.3 32-32V448c0-17.7-14.3-32-32-32H96zM505.6 64c16.2 0 26.4 8.7 31 13.9 4.6 5.2 12.1 16.3 10.3 32.4l-23.5 203.4c-4.9 42.2 8.6 84.6 36.8 116.4 28.3 31.7 68.9 49.9 111.4 49.9h271.2c6.6 0 10.8 3.3 13.2 6.1s5 7.5 4 14l-48 303.4c-6.9 43.6-29.1 83.4-62.7 112C815.8 944.2 773 960 728.9 960h-317c-33.1 0-59.9-26.8-59.9-59.9v-455c0-6.1 1.7-12 5-17.1 69.5-109 106.4-234.2 107-364h41.6z m0-64h-44.9C427.2 0 400 27.2 400 60.7c0 127.1-39.1 251.2-112 355.3v484.1c0 68.4 55.5 123.9 123.9 123.9h317c122.7 0 227.2-89.3 246.3-210.5l47.9-303.4c7.8-49.4-30.4-94.1-80.4-94.1H671.6c-50.9 0-90.5-44.4-84.6-95l23.5-203.4C617.7 55 568.7 0 505.6 0z"
                      p-id="2188" :fill="b.isLike ? '#ff6633' : '#82848a'"></path>
                </svg>
                {{ b.liked }}
              </div>
              <div class="blog-comments"><i class="el-icon-chat-dot-round"></i> {{ b.comments }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Reviews" name="2">Reviews</el-tab-pane>
        <el-tab-pane label="Followers(0)" name="3">Followers(0)</el-tab-pane>
        <el-tab-pane label="Following(0)" name="4">
          <div class="blog-list" @scroll="onScroll">
            <div class="blog-box" v-for="b in blogs2" :key="b.id">
              <div class="blog-img2" @click="toBlogDetail(b)"><img :src="b.img" alt=""></div>
              <div class="blog-title">{{ b.title }}</div>
              <div class="blog-foot">
                <div class="blog-user-icon"><img :src="b.icon || '/imgs/icons/default-icon.png'" alt=""></div>
                <div class="blog-user-name">{{ b.name }}</div>
                <div class="blog-liked" @click="addLike(b)">
                  <svg t="1646634642977" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="2187" width="14" height="14">
                    <path
                      d="M160 944c0 8.8-7.2 16-16 16h-32c-26.5 0-48-21.5-48-48V528c0-26.5 21.5-48 48-48h32c8.8 0 16 7.2 16 16v448zM96 416c-53 0-96 43-96 96v416c0 53 43 96 96 96h96c17.7 0 32-14.3 32-32V448c0-17.7-14.3-32-32-32H96zM505.6 64c16.2 0 26.4 8.7 31 13.9 4.6 5.2 12.1 16.3 10.3 32.4l-23.5 203.4c-4.9 42.2 8.6 84.6 36.8 116.4 28.3 31.7 68.9 49.9 111.4 49.9h271.2c6.6 0 10.8 3.3 13.2 6.1s5 7.5 4 14l-48 303.4c-6.9 43.6-29.1 83.4-62.7 112C815.8 944.2 773 960 728.9 960h-317c-33.1 0-59.9-26.8-59.9-59.9v-455c0-6.1 1.7-12 5-17.1 69.5-109 106.4-234.2 107-364h41.6z m0-64h-44.9C427.2 0 400 27.2 400 60.7c0 127.1-39.1 251.2-112 355.3v484.1c0 68.4 55.5 123.9 123.9 123.9h317c122.7 0 227.2-89.3 246.3-210.5l47.9-303.4c7.8-49.4-30.4-94.1-80.4-94.1H671.6c-50.9 0-90.5-44.4-84.6-95l23.5-203.4C617.7 55 568.7 0 505.6 0z"
                      p-id="2188" :fill="b.isLike ? '#ff6633' : '#82848a'"></path>
                  </svg>
                  {{ b.liked }}
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.header {
  width: 100%;
  line-height: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #ff6633;
  background-color: #fff;
  position: fixed;
  top: 0;
  z-index: 100;
  padding: 0;
}

.header-back-btn {
  width: 10%;
  color: #ff6633;
  font-size: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-title {
  width: 90%;
  text-align: center;
  font-size: 18px;
  font-family: Hiragino Sans GB, Arial, Helvetica, "\5B8B\4F53", sans-serif;
}

.profile-container {
  margin-top: 50px;
  min-height: calc(100vh - 50px);
  background-color: #f4f4f4;
}

.basic {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  background-color: #fff;
  margin-bottom: 8px;
}

.basic-icon {
  width: 70px;
  height: 70px;
  padding: 1px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.07);
  flex-shrink: 0;
}

.basic-icon img {
  border-radius: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.basic-info {
  flex: 1;
  padding: 0 15px;
}

.basic-info .name {
  overflow: hidden;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
}

.basic-info span {
  display: inline-block;
  padding: 2px 10px;
  background-color: #eeeded;
  margin: 5px 0 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.edit-btn {
  width: 120px;
  line-height: 28px;
  border-radius: 14px;
  text-align: center;
  border: 1px solid #eeeded;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.04);
  font-size: 14px;
  cursor: pointer;
}

.logout-btn {
  width: 80px;
  height: 28px;
  line-height: 28px;
  color: white;
  padding: 0 8px;
  border-radius: 14px;
  background-color: #f63;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.04);
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 0;
}

.introduce {
  padding: 12px 15px;
  background-color: #fff;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.content {
  background-color: #fff;
  min-height: 400px;
}

.blog-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.blog-img {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.blog-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.blog-title {
  line-height: 20px;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.blog-liked {
  display: flex;
  align-items: center;
  color: #82848a;
  font-size: 12px;
  gap: 4px;
}

.blog-comments {
  display: flex;
  align-items: center;
  color: #82848a;
  font-size: 12px;
  gap: 4px;
}

/*达人探店列表*/
.blog-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 10px;
  gap: 10px;
}

.blog-box {
  width: calc(50% - 5px);
  background-color: #fff;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.blog-img2 {
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.blog-img2 img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-title {
  padding: 8px;
  line-height: 18px;
  font-size: 13px;
  color: #333;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.blog-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 5px 0;
  padding: 0 8px;
}

.blog-user-icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
  border-radius: 50%;
  overflow: hidden;
}

.blog-user-name {
  flex: 1;
  overflow: hidden;
  font-size: 11px;
  color: #666;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.blog-user-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-liked {
  width: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 2px;
}

.blog-liked img {
  width: 14px;
  height: 14px;
}
</style>