import axios from 'axios'

 window.gconfig.BASE_API = 'http://'+window.location.host+'/api';
 window.BASE_API =  'http://'+window.location.host+'/api';
 window.gconfig.WEBSOCKET_URL = 'ws://'+window.location.hostname+':3007';
///window.gconfig.BASE_API = 'http://27.124.46.84:8618/api';
 ///window.BASE_API =  'http://27.124.46.84:8618/api';
 //window.gconfig.WEBSOCKET_URL = 'ws://47.108.135.36:19007'
 ///window.gconfig.WEBSOCKET_URL = 'ws://47.109.64.196:19007'
 if(window.location.port == 8618){
   window.gconfig.WEBSOCKET_URL = 'ws://'+window.location.hostname+':3008';
   window.BASE_API =  'http://'+window.location.hostname+":"+window.location.port+'/api';
 }
  if(window.location.port == 8788){
   window.gconfig.WEBSOCKET_URL = 'ws://'+window.location.hostname+':9007';
   window.BASE_API =  'http://'+window.location.hostname+":"+window.location.port+'/api';
 }
if(window.location.port == 3009){
   window.gconfig.WEBSOCKET_URL = 'ws://47.101.143.146:3007';
   window.BASE_API =  'http://47.101.143.146:8588/api';
 }
 if(window.location.port == 8585){
   window.gconfig.WEBSOCKET_URL = 'ws://'+window.location.hostname+':3037';
 }
console.log('window.location',window.location);

// 创建axios实例
const service = axios.create({
    // api的base_url
    baseURL: window.BASE_API,
   // baseURL: 'http://'+window.location.hostname+':'+window.location.port+'/api',
    // 请求超时时间
    timeout: 200000,
    // 允许携带cookie
    withCredentials: true
})

let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken;
let removePending = (config) => {
  for(let p in pending){
    if(pending[p].u === config.url + '&' + config.method) { //当当前请求在数组中存在时执行函数体
      pending[p].f(); //执行取消操作
      pending.splice(p, 1); //把这条记录从数组中移除
    }
  }
}
function setApiConfig(){

}
function encrypt(data) {
  var ik = sessionStorage.getItem('key') || localStorage.getItem('key')
  var key  = CryptoJS.enc.Utf8.parse(ik);
  var iv   = CryptoJS.enc.Utf8.parse(ik);
  return CryptoJS.AES.encrypt(data, key, {iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding}).toString();
}
function decrypt(data) {
  var ik = sessionStorage.getItem('key') || localStorage.getItem('key')
  var key  = CryptoJS.enc.Utf8.parse(ik);
  var iv   = CryptoJS.enc.Utf8.parse(ik);
  return CryptoJS.AES.decrypt(data, key, {iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding}).toString(CryptoJS.enc.Utf8);
}

// request拦截器
service.interceptors.request.use(config => {
    if(config.url == "/messages" && config.method.toLowerCase() == 'post'){

    }else{
      removePending(config); //在一个ajax发送前执行一下取消操作
    }

    config.cancelToken = new cancelToken((c)=>{
      // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
      pending.push({ u: config.url + '&' + config.method, f: c });
    });
    // Do something before request is sent
    if (sessionStorage.getItem('token')) {
        // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
        config.headers['X-Token'] = sessionStorage.getItem('token') || localStorage.getItem('token')
    }
    if(config.aes && config.method.toUpperCase() == "POST"){
      config.data.content = encrypt(config.data.content);
    }
    // config.headers['HTTP_X_REAL_IP'] = '127.0.8.7'
    return config
}, error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
    response => {
        if (response.data.errCode == 2) {
            router.push({
                path: "/login",
                // 从哪个页面跳转
                querry: { redirect: router.currentRoute.fullPath }
            })
        }
        if(response.config.aes){
          if(response.data.content){
            response.data.content = decrypt(response.data.content);
          }
          if(response.data.length){
            for(var i = 0 ; i<response.data.length;i++){
              if(response.data[i].content){
                response.data[i].content = decrypt(response.data[i].content);
              }else if(response.data[i].lastMessage && response.data[i].lastMessage.content){
                response.data[i].lastMessage.content = decrypt(response.data[i].lastMessage.content);
              }
             // console.log(response.data[i].content)
            }
          }
        }
        return response;
    },
    error => {
        return Promise.reject(error)
    })

export default service
