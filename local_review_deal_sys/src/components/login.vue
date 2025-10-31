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
    ElMessage("邮箱账号不能为空！");
    return
  }
  if (!form.code) {
    ElMessage("验证码不能为空！");
    return
  }
  // 添加密码验证
  if (!form.password) {
    ElMessage("密码不能为空！");
    return
  }
  if (!form.confirmPassword) {
    ElMessage("确认密码不能为空！");
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage("两次输入的密码不一致！");
    return
  }
  service.post("/user/login", form)
    .then(({ data }) => {
      if (data) {
        // 保存用户信息到session
        sessionStorage.setItem("token", data);
        //客户端的这个有效期是当前session
        //服务器的有效期是30分钟
      }
      // 跳转到首页
      router.push({ path: '/1', query: {} })
    })
    .catch(err => {
      ElMessage('登录失败,请确认信息输入正确' + err)
    })
}
const sendCode = () => {
  if (!form.email) {
    ElMessage("邮箱账号不能为空");
    return;
  }
  // 发送验证码
  service.post("/user/code?email=" + form.email)
      .then(() => { ElMessage('验证码已发送') })
      .catch(err => {
        console.log(err);
        ElMessage('验证码生成失败' + err)
      });
  // 禁用按钮
  disabled.value = true;
  // 按钮倒计时
  let count = 60;
  codeBtnMsg.value = count + '秒后可重发';

  let taskId = setInterval(() => {
    count--;
    if (count > 0) {
      codeBtnMsg.value = count + '秒后可重发';
    } else {
      clearInterval(taskId);
      disabled.value = false;
      codeBtnMsg.value = "发送验证码";
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
const codeBtnMsg = ref('点击发送验证码')
</script>

<template>
  <div class="login-container">
    <div class="header">
      <div class="header-back-btn" @click="goBack"><i class="el-icon-arrow-left"></i></div>
      <div class="header-title">邮箱快捷登录&nbsp;&nbsp;&nbsp;</div>
    </div>
    <div class="content">
      <div class="login-form">
        <div style="display: flex; justify-content: space-between">
          <el-input style="width: 60%" placeholder="请输入邮箱账号" v-model="form.email">
          </el-input>
          <el-button style="width: 38%" @click="sendCode" type="success" :disabled="disabled">{{ codeBtnMsg }}</el-button>
        </div>

        <div style="height: 5px"></div>
        <el-input placeholder="请输入验证码" v-model="form.code">
        </el-input>
        <div style="height: 5px"></div>
        <el-input placeholder="请输入密码" v-model="form.password" show-password>
        </el-input>

        <div style="height: 5px"></div>
        <el-input placeholder="请再次输入密码" v-model="form.confirmPassword" show-password>
        </el-input>
        <div style="text-align: center; color: #8c939d;margin: 5px 0">未注册的邮箱账号验证后自动创建账户</div>
        <el-button @click="login" style="width: 100%; background-color:#f63; color: #fff;">登录</el-button>
        <div style="text-align: right; color:#333333; margin: 5px 0"><a @click="goLoginByPassword"
            href="javascript:void(0)">密码登录</a></div>
      </div>
      <div class="login-radio">
        <div>
          <input type="radio" name="readed" v-model="radio" value="1">
          <label for="readed"></label>
        </div>
        <div>我已阅读并同意
          <a href="javascript:void(0)">
            《黑马点评用户服务协议》</a>、
          <a href="javascript:void(0)">《隐私政策》</a>
          等，接受免除或者限制责任、诉讼管辖约定等粗体标示条款
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
  /*不换行空格*/
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
