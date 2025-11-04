<script setup>
import { ElMessage } from 'element-plus';
import { reactive, ref,inject, } from 'vue'
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

const login = () => {
  // 验证邮箱号
  if (!form.email) {
    ElMessage("email can not be empty!");
    return
  }

  // 验证密码
  if (!form.password) {
    ElMessage("password can not be empty！");
    return
  }
  service.post("/user/loginByPassword", form)
      .then(({ data }) => {
        if (data) {
          console.log(data);
          console.log("router" + router);
          // 保存用户信息到sessionStorage
          sessionStorage.setItem("token", data);
          // 跳转到首页
        }
        router.push({ path: '/1', query: {} })
      })
      .catch(err => {
        ElMessage.error('login failed!Please checkout the username and password!' )
      })
}

const goMsgLogin = ( )=>{
  router.push({
    path:'/login',query:{}
  })
}

const  disabled =ref(false);
const radio = ref(false)
const form  = reactive({
  email:null,
  password:null
})
</script>

<template>
   <div class="login-container">
    <div class="header">
      <div class="header-back-btn" @click="goBack"><i class="el-icon-arrow-left"></i></div>
      <div class="header-title">Password login&nbsp;&nbsp;&nbsp;</div>
    </div>
    <div class="content">
      <div class="login-form">
        <el-input placeholder="Please enter your email" v-model="form.email">
        </el-input>
        <div style="height: 5px"></div>
        <el-input placeholder="Please enter your password" v-model="form.password" show-password>
        </el-input>
        <div style="text-align: center; color: #8c939d;margin: 5px 0"><a href="javascript:void(0)">forget password</a></div>
        <el-button @click="login" style="width: 100%; background-color:#f63; color: #fff;">login</el-button>
        <div style="text-align: right; color:#333333; margin: 5px 0"><a @click="goMsgLogin"  href="javascript:void(0)">验证码登录</a></div>
      </div>
      <div class="login-radio">
        <div>
          <input type="radio" name="readed" v-model="radio" value="1">
          <label for="readed"></label>
        </div>
        <div>
          <a href="javascript:void(0)"></a>
          <a href="javascript:void(0)"></a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container{
    height: 100%;
}
.header{
    width: 100%;
    height: 7%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #ff6633;
}
.header-back-btn{
    width: 10%;
    color: #ff6633;
    font-size: 22px;
}
.header-title {
    width: 90%;
    text-align: center;
    font-size: 18px;
    font-family: Hiragino Sans GB,Arial,Helvetica,"\5B8B\4F53",sans-serif;
}

.content{
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
input[type="radio"] + label::before {
    content: "\a0"; /*不换行空格*/
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
input[type="radio"]:checked + label::before {
    background-color: #F63;
    background-clip: content-box;
    padding: .2em;
}
input[type="radio"] {
    opacity: 0;
}
</style>
