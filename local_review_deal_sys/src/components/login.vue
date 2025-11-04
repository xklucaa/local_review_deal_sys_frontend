<script setup>
import { ElMessage } from 'element-plus';
import { reactive, ref, inject, } from 'vue'
import { useRouter } from 'vue-router';
import service from '../utils/request';

defineProps({
  msg: String,
})
inject('hideButtom')();
let fun = inject('showButtom');
const router = useRouter();
const goBack = () => {
  router.go(-1);
  fun();
}
const goLoginByPassword = () => {
  router.push({
    path: '/login_password', query: {}
  })
}
const login = () => {

  if (!form.email) {
    ElMessage("Email cannot be empty!");
    return
  }
  if (!form.code) {
    ElMessage("Verification code cannot be empty!");
    return
  }
  // Add password validation
  if (!form.password) {
    ElMessage("Password cannot be empty!");
    return
  }
  if (!form.confirmPassword) {
    ElMessage("Confirm password cannot be empty!");
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage("Passwords do not match!");
    return
  }
  service.post("/user/login", form)
    .then(({ data }) => {
      if (data) {
        // Save user information to session
        sessionStorage.setItem("token", data);
        // Client-side validity is current session
        // Server-side validity is 30 minutes
      }
      // Redirect to home page
      router.push({ path: '/1', query: {} })
    })
    .catch(err => {
      ElMessage('Login failed, please check your information' + err)
    })
}
const sendCode = () => {
  if (!form.email) {
    ElMessage("Email cannot be empty");
    return;
  }
  // Send verification code
  service.post("/user/code?email=" + form.email)
      .then(() => { ElMessage('Verification code sent') })
      .catch(err => {
        console.log(err);
        ElMessage('Failed to generate verification code' + err)
      });
  // Disable button
  disabled.value = true;
  // Button countdown
  let count = 60;
  codeBtnMsg.value = count + ' seconds to resend';

  let taskId = setInterval(() => {
    count--;
    if (count > 0) {
      codeBtnMsg.value = count + ' seconds to resend';
    } else {
      clearInterval(taskId);
      disabled.value = false;
      codeBtnMsg.value = "Send verification code";
    }
  }, 1000);
}
const disabled = ref(false);
const radio = ref(false)
const form = reactive({
  email: null,
  code: null,
  password: null,
  confirmPassword: null
})
const codeBtnMsg = ref('Click to send verification code')
</script>

<template>
  <div class="login-container">
    <div class="header">
      <div class="header-back-btn" @click="goBack"><i class="el-icon-arrow-left"></i></div>
      <div class="header-title">Email Quick Login&nbsp;&nbsp;&nbsp;</div>
    </div>
    <div class="content">
      <div class="login-form">
        <div style="display: flex; justify-content: space-between">
          <el-input style="width: 60%" placeholder="Please enter email" v-model="form.email">
          </el-input>
          <el-button style="width: 38%" @click="sendCode" type="success" :disabled="disabled">{{ codeBtnMsg }}</el-button>
        </div>

        <div style="height: 5px"></div>
        <el-input placeholder="Please enter verification code" v-model="form.code">
        </el-input>
        <div style="height: 5px"></div>
        <el-input placeholder="Please enter password" v-model="form.password" show-password>
        </el-input>

        <div style="height: 5px"></div>
        <el-input placeholder="Please enter password again" v-model="form.confirmPassword" show-password>
        </el-input>
        <div style="text-align: center; color: #8c939d;margin: 5px 0">Unregistered email will automatically create account after verification</div>
        <el-button @click="login" style="width: 100%; background-color:#f63; color: #fff;">Login</el-button>
        <div style="text-align: right; color:#333333; margin: 5px 0"><a @click="goLoginByPassword"
            href="javascript:void(0)">Password Login</a></div>
      </div>
      <div class="login-radio">
        <div>
          <input type="radio" name="readed" v-model="radio" value="1">
          <label for="readed"></label>
        </div>
        <div>I have read and agree to
          <a href="javascript:void(0)">
            《Heima Review User Agreement》</a>、
          <a href="javascript:void(0)">《Privacy Policy》</a>
          and accept the exemption or limitation of liability, jurisdiction agreement and other bold terms
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100%;
}

.header {
  width: 100%;
  height: 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #ff6633;
}

.header-back-btn {
  width: 10%;
  color: #ff6633;
  font-size: 22px;
}

.header-title {
  width: 90%;
  text-align: center;
  font-size: 18px;
  font-family: Hiragino Sans GB, Arial, Helvetica, "\5B8B\4F53", sans-serif;
}

.content {
  height: 93%;
  background-color: #f7f5f5;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.login-form {
  height: 85%;
}

.login-radio {
  height: 15%;
  width: 100%;
  display: flex;
  align-items: start;
}

input[type="radio"]+label::before {
  content: "\a0";
  /*Non-breaking space*/
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
  width: 0.7em;
  height: 0.7em;
  margin-right: .4em;
  border-radius: 50%;
  border: 2px solid #F63;
  text-indent: .15em;
  line-height: 1;
  padding: .2em;
}

input[type="radio"]:checked+label::before {
  background-color: #F63;
  background-clip: content-box;
  padding: .2em;
}

input[type="radio"] {
  opacity: 0;
}
</style>