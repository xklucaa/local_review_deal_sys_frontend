import { ElMessage } from "element-plus";
import service from "./request";

export default (router) => {
    // 获取token
    let token = sessionStorage.getItem("token");
    if (!token) {
        ElMessage('Please login first')
        useRouter().push({ path: '/login', query: {} });
        return
    }
    // 查询用户信息
    service.get("/user/me")
        .then(({ data }) => {
            ElMessage("welcome")
        })
        .catch(err => {

            ElMessage(' Please login first')
           
                router.push({ path: '/login', query: {} })
           
        })
}