import axios from "axios";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
const service  = axios.create({
    baseURL:'http://localhost:8081',
    timeout:60000,
    headers:{"Content-Type":'application/json;charset=UTF-8'},
    withCredentials: true
})
/** */
service.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem("token");  // 每次请求时实时获取
        if (token) config.headers['authorization'] = token
        return config
    },
    error => {
        ElMessage('这个前置拦截应该不会有啥问题吧一般'+error)
        console.log(error)
        return Promise.reject(error)
    }
)

service.interceptors.response.use(function (response) {
    // 判断执行结果
    if (!response.data.success) {
      return Promise.reject(response.data.errorMsg)
    }
    return response.data;
  }, function (error) {
    // 一般是服务端异常或者网络异常
    console.log(error)
    if (error.response.status == 401) {
      
       useRouter().push({path:'/login',query:{}})
      
      return Promise.reject("请先登录");
    }
    return Promise.reject();
  });
export default service;