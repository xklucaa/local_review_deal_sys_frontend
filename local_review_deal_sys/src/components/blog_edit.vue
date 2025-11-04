<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router';
import '../css/blog-edit.css'
import service from '../utils/request';
import { ElMessage } from 'element-plus';
import checkLogin from '../utils/checkLogin';
defineProps({
  msg: String,
})
const router = useRouter();
const goBack = () => {
  router.go(-1)
}
checkLogin(router);
const shopName = ref('')
const params = reactive({})
const selectedShop = reactive({})
const showDialog = ref(false);
const inputRef = ref();
const shops = ref([]);
const fileList = ref([]);
// Check login status when component setup since blog editing is user-related
const fileSelected = () => {
  let file = inputRef.value.files[0];
  let formData = new FormData();
  formData.append("file", file);
  const config = {
    headers: { "Content-Type": "multipart/form-data;boundary=" + new Date().getTime() }
  };
  service
    .post("/upload/blog", formData, config)
    .then(({ data }) => fileList.value.push('/imgs' + data))
    .catch((err) => { ElMessage('File upload failed' + err) });
}

const queryShops = () => {
  service.get("/shop/of/name", {
    params: {
      name: shopName.value,
      current: 1 // Default page number
    }
  })
    .then(({ data }) => shops.value = data)
    .catch((err) => {
      ElMessage("Error querying shops" + err)
    })
}
onMounted(() => {
  queryShops()
})
const submitBlog = () => {
  let { ...data } = params;
  data.images = fileList.value.join(",");
  data.shopId = selectedShop.id;
  service.post("/blog", data)
    .then(resp => router.push({
      path: '/user_info', query: {}
    }))
    .catch((err) => {
      ElMessage('Blog publish failed' + err)
    })
}
const openFileDialog = () => {
  inputRef.value.click();
}
const selectShop = (s) => {
  Object.assign(selectedShop, s);
  showDialog.value = false;
}
const deletePic = (index) => {
  fileList.value.splice(index, 1);
}
</script>

<template>
  <div class="header">
    <div class="header-cancel-btn" @click="goBack">Cancel</div>
    <div class="header-title">Create Blog<el-icon>
        <InfoFilled />
      </el-icon></div>
    <div class="header-commit">
      <div class="header-commit-btn" @click="submitBlog">Publish</div>
    </div>
  </div>
  <div class="edit-container">
    <div class="upload-section">
      <input type="file" @change="fileSelected" name="file" ref="inputRef" style="display: none">
      <div class="upload-btn" @click="openFileDialog">
        <el-icon>
          <Picture />
        </el-icon>
        <div class="upload-text">Upload Photos</div>
      </div>
      <div class="pic-list">
        <div class="pic-box" v-for="(f, i) in fileList" :key="i">
          <img :src="f" alt="">
          <i class="el-icon-close" @click="deletePic(i)"></i>
        </div>
      </div>
    </div>

    <div class="blog-title">
      <input v-model="params.title" type="text" placeholder="Add a title to get featured on homepage~">
    </div>

    <div class="blog-content">
      <textarea v-model="params.content" placeholder="Where have you been recently? Share your experience..."></textarea>
    </div>

    <div class="divider"></div>

    <div class="blog-shop" @click="showDialog = true">
      <div class="shop-left">Link Business</div>
      <div v-if="selectedShop.name" class="shop-name">{{ selectedShop.name }}</div>
      <div v-else class="shop-select">Select <i class="el-icon-arrow-right"></i></div>
    </div>

    <div class="mask" v-show="showDialog" @click="showDialog = false"></div>

    <transition name="el-zoom-in-bottom">
      <div class="shop-dialog" v-show="showDialog">
        <div class="dialog-header">
          <div class="shop-left">Link Business</div>
          <i class="el-icon-close close-btn" @click="showDialog = false"></i>
        </div>
        <div class="search-bar">
          <div class="city-select">Hangzhou <i class="el-icon-arrow-down"></i></div>
          <div class="search-input">
            <i class="el-icon-search" @click="queryShops"></i>
            <input v-model="shopName" type="text" placeholder="Search business name" @keyup.enter="queryShops">
          </div>
        </div>
        <div class="shop-list">
          <div v-for="s in shops" class="shop-item" @click="selectShop(s)">
            <div class="shop-name">{{ s.name }}</div>
            <div class="shop-area">{{ s.area }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.header {
  padding: 12px 16px;
  line-height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-cancel-btn {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.header-commit-btn {
  color: white;
  background-color: #F63;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.header-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  font-family: Hiragino Sans GB, Arial, Helvetica, "\5B8B\4F53", sans-serif;
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-title i {
  font-size: 16px;
  color: #999;
}

.edit-container {
  background-color: #fff;
  min-height: 100vh;
}

.upload-section {
  padding: 16px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.upload-btn {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  font-size: 24px;
  color: #c0c4cc;
  flex-shrink: 0;
  transition: all 0.3s;
}

.upload-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.upload-text {
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
  color: #909399;
}

.pic-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.pic-box {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  position: relative;
  flex-shrink: 0;
}

.pic-box img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.pic-box i {
  position: absolute;
  top: -6px;
  right: -6px;
  color: #fff;
  background: #f56c6c;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.blog-title,
.blog-content {
  padding: 0 16px;
}

.blog-title input {
  width: 100%;
  line-height: 24px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  padding: 12px 0;
  color: #303133;
}

input::placeholder {
  color: #c0c4cc;
  font-weight: 500;
}

textarea::placeholder {
  color: #c0c4cc;
}

.blog-content textarea {
  width: 100%;
  height: 200px;
  border: none;
  resize: none;
  font-size: 16px;
  line-height: 1.5;
  color: #606266;
  padding: 8px 0;
}

.blog-shop {
  color: #606266;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.shop-left {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.shop-name {
  color: #303133;
  font-size: 14px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-select {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.divider {
  background-color: #f5f7fa;
  height: 8px;
}

.mask {
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 299;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
}

.shop-dialog {
  position: fixed;
  z-index: 999;
  bottom: 0;
  height: 70vh;
  width: 100%;
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.close-btn {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
}

.search-bar {
  display: flex;
  padding: 16px;
  gap: 12px;
  align-items: center;
}

.city-select {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.search-input {
  flex: 1;
  background-color: #f5f7fa;
  line-height: 36px;
  align-items: center;
  border-radius: 18px;
  display: flex;
  padding: 0 16px;
  gap: 8px;
}

.search-input input {
  border: 0;
  width: 100%;
  background-color: transparent;
  font-size: 14px;
}

.shop-list {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
}

.shop-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.shop-item:hover {
  background-color: #fafafa;
}

.shop-item:last-child {
  border-bottom: none;
}

.shop-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.shop-area {
  font-size: 14px;
  color: #909399;
}

input:focus,
textarea:focus {
  outline: none;
}

/* Custom scrollbar */
.shop-list::-webkit-scrollbar {
  width: 4px;
}

.shop-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.shop-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.shop-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>