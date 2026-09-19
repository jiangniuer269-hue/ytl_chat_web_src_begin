<template>
  <div>
    <div style="position: absolute;top:0px;left:0px;right:0px;bottom:0px;text-align: center;line-height: 100%;"
         v-if="orgin == 1"
         v-loading="orgin == 1"
         :element-loading-text="loginText"
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.1)"
    ></div>
    <div class="login-page-container" v-loading="loading">
      <div class="login-container" v-show="orgin == 2">
        <el-form :model="loginForm" :rules="rules" ref="loginForm" autoComplete="on" label-position="left">
          <div class="login-header">
           <!-- <div class="login-title-container">
              <strong class="login-title">客服系统</strong>
          </div>-->
            <div class="profile-image"></div>
          </div>
          <div class="login-content">
            <el-form-item prop="username">
              <el-input placeholder="用户名" prefix-icon="el-icon-third-my_light" v-model="loginForm.username" autoComplete="on" autofocus="autofocus" @focus="clearValidate"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input type="password" placeholder="密码" prefix-icon="el-icon-third-lock" v-model="loginForm.password" @keyup.enter.native="doLogin"></el-input>
            </el-form-item>

            <el-form-item  v-if="p_code_url">
              请使用微信扫码验证：
                <QRCanvas id="p_code" :options="p_code"/>
            </el-form-item>

            <el-button class="login-button" type="primary" :loading="loadingVisible" @click.native.prevent="doLogin">登 录</el-button>
          </div>
          <div class="login-footer">

          </div>
        </el-form>
      </div>
      <!--<register-user ref="registerUser" @onRegisterSuccessed="onRegisterSuccessed"></register-user>-->
    </div>
  </div>
</template>

<script>
import { outputError } from '@/utils/exception'
import { login,isLogin } from '@/api/auth'
import { loginwx,tokenLogin } from '@/api/openid'
import { updateOnlineStatus } from '@/api/user'
import { QRCanvas } from 'qrcanvas-vue'
import   encrypt  from '@/utils/encrypto'


export default {
  data() {
    return {
      aeskey: "1359909874511865",
      aesiv : "1989909874742380",
      qcode:"",
      p_code: "",
      p_code_url:"",
      loadingVisible: false,
      loading: false,
      orgin: 0,
        loginText:"微信登录中...",
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入口令', trigger: 'blur' }]
      }
    }
  },
  created(){
    var code = this.getQueryVariableEco("code");
    var playid = this.getQueryVariableEco("playid");
    var type = this.getQueryVariableEco("type");
    var id = this.getQueryVariableEco("id");
    var token = this.getQueryVariableEco("token");
    // sessionStorage.removeItem("currentUser")
    // sessionStorage.removeItem("token")
    // localStorage.removeItem("currentUser")
    // localStorage.removeItem("token")
    // localStorage.removeItem("draft")
    // // 清除缓存
    // localStorage.clear()
    //token登录
    if(token){
        localStorage.clear()
      tokenLogin(token).then(response => {
        this.loading = false;
          sessionStorage.setItem('currentUser', JSON.stringify({
            id: response.data.userId,
            name: response.data.username,
            nickname: response.data.nickname,
            firstLetterOfName: response.data.firstLetterOfName,
            avatarUrl: response.data.avatarUrl,
            origin: response.data.origin
          }))
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('key', response.data.key)

        updateOnlineStatus(response.data.userId, 'online')
          .then(_ => {
            this.loadingVisible = false;
              this.$router.push("welcome")
          })
          .catch(error => {
            this.loadingVisible = false;
            outputError(this, error)
          })
      }).catch(error => {
        this.loadingVisible = false;
        if(error.response && error.response.status === 401) {
          this.$message({
            showClose: true,
            message: '登录失败，请检查用户名或口令是否正确！',
            type: 'error'
          })
          return
        }
        outputError(this, error)
      })
    }else if(code){//微信登陆返回code
      this.orgin = 1
      localStorage.clear()
      //获取用户openID
      loginwx(playid,code,type,id).then(response => {
          this.loginText = "登录成功，跳转中...";
          this.loading = false;
          sessionStorage.setItem('currentUser', JSON.stringify({
            id: response.data.userId,
            name: response.data.username,
            nickname: response.data.nickname,
            firstLetterOfName: response.data.firstLetterOfName,
            avatarUrl: response.data.avatarUrl,
            origin: response.data.origin
          }))
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('key', response.data.key)
          setTimeout(()=>{
              this.$router.push("m")
              this.loadingVisible = false;
          },200)
      }).catch(error => {
        this.loadingVisible = false
        if(error.response && error.response.status === 401) {
          this.$message({
            showClose: true,
            message: '登录失败，请检查用户名或口令是否正确！',
            type: 'error'
          })
          return
        }
          setTimeout(()=>{
              this.$router.push("m")
              this.loadingVisible = false;
          },200)
      })
    }else{
      this.orgin = 2;
    }
  },
  methods: {
    getQueryVariableEco(variable){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return decodeURI(pair[1]);}
       }
       return null;
},
    clearValidate() {
      this.$refs['loginForm'].clearValidate()
    },
    openRegisterDialog() {
      this.$refs.registerUser.$emit('openDialog')
    },
    onRegisterSuccessed(username, password) {
      this.loginForm.username = username;
      this.loginForm.password = password;
      this.doLogin()
    },
    isPC() {
      var userAgentInfo = navigator.userAgent;
      var Agents = ["Android", "iPhone",
          "SymbianOS", "Windows Phone",
          "iPad", "iPod"];
      var flag = true;
      for (var v = 0; v < Agents.length; v++) {
          if (userAgentInfo.indexOf(Agents[v]) > 0) {
              flag = false;
              break;
          }
      }
      return flag;
    },
    doLogin() {
        console.log(window.window.gconfig)
        localStorage.clear()
      this.loadingVisible = true;
      this.$refs['loginForm'].validate(valid => {
        if (valid) {
          //先判断需不需要扫码
          if(!this.p_code_url){
            isLogin(encrypt.encryptnew(this.loginForm.username, this.aeskey,this.aesiv), encrypt.encryptnew(this.loginForm.password, this.aeskey,this.aesiv)).then(response =>{
            if(response.data.sms){
              console.log(response);
              this.qcode = response.data.qcode;
              this.p_code_url = response.data.authUrl;
              this.p_code = {
                      data: this.p_code_url,
                      cellSize: 4,
                      size: 200
                  }
              return;
            }else{
              this.onlogin();
            }
          }).catch(error => {
            this.loadingVisible = false;
            outputError(this, error)
          })
          }else{
            this.onlogin();
          }

        }
      })
      this.loadingVisible = false
    },
    onlogin(){
     /* var response ={
        data :{}
      };
      response.data =  {
    "origin": "sys",
    "nickname": "尚水客服专用号",
    "fastMsg": "",
    "locked": "false",
    "userId": "0000000000000000000000000000000",
    "key": "1234567890000000",
    "username": "leoim168",
    "firstLetterOfName": "s",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJqd3QiLCJpYXQiOjE3NjgwMTkyMDAsInN1YiI6IntcInVzZXJJZFwiOlwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwifSIsImV4cCI6MTc2ODQ1MTIwMH0.6P2Dh21LnAmBrlRuOIxWnPXvQTDOXAqyQ0jcZG-n6Qs"
};
     sessionStorage.setItem('currentUser', JSON.stringify({
              id: response.data.userId,
              name: response.data.username,
              nickname: response.data.nickname,
              firstLetterOfName: response.data.firstLetterOfName,
              avatarUrl: response.data.avatarUrl,
              origin: response.data.origin
            }))
            sessionStorage.setItem('token', response.data.token)
            sessionStorage.setItem('key', response.data.key)

            updateOnlineStatus(response.data.userId, 'online')
                   this.loadingVisible = false
              let redirect = decodeURIComponent(
                this.$route.query.redirect || "/welcome"
              )
              if(JSON.parse(sessionStorage.getItem("currentUser")).origin == "wx" || !this.isPC()){
                // return this.$router.push("/m")
                  console.log(this.isPC())
                  this.$router.push("m")
              }else{
                  this.$router.push(redirect)
              }
return;*/
          login(encrypt.encryptnew(this.loginForm.username, this.aeskey,this.aesiv), encrypt.encryptnew(this.loginForm.password, this.aeskey,this.aesiv),this.qcode)
          .then(response => {
            sessionStorage.setItem('currentUser', JSON.stringify({
              id: response.data.userId,
              name: response.data.username,
              nickname: response.data.nickname,
              firstLetterOfName: response.data.firstLetterOfName,
              avatarUrl: response.data.avatarUrl,
              origin: response.data.origin
            }))
            sessionStorage.setItem('token', response.data.token)
            sessionStorage.setItem('key', response.data.key)

            updateOnlineStatus(response.data.userId, 'online')
            .then(_ => {
              this.loadingVisible = false
              let redirect = decodeURIComponent(
                this.$route.query.redirect || "/welcome"
              )
              if(JSON.parse(sessionStorage.getItem("currentUser")).origin == "wx" || !this.isPC()){
                // return this.$router.push("/m")
                  console.log(this.isPC())
                  this.$router.push("m")
              }else{
                  this.$router.push(redirect)
              }

            })
            .catch(error => {
              this.loadingVisible = false
              outputError(this, error)
            })
          })
          .catch(error => {
            this.loadingVisible = false
            // if(error.response && error.response.status === 401) {
            //   this.$message({
            //     showClose: true,
            //     message: '登录失败，请检查用户名或口令是否正确！',
            //     type: 'error'
            //   })
            //   return
            // }
            outputError(this, error)
          })
    },
  },
  watch:{
    "loginForm.username":{
      handler(){
        this.p_code_url = "";
      }
    }  
  },
  components: {
    RegisterUser: resolve => require(['@/components/user/register'], resolve),
    QRCanvas
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.login-page-container {
  padding: 80px 0px 0px 0px;
}

.login-container {
  width: 390px;
  margin: 0px auto;
  padding: 0px;
  background-color: #4d8af0;
}

.login-header {
  padding: 0px 0px 75px 0px;
  margin: 0px 0px 15px 0px;
  position: relative;
  border-bottom: 1px solid #ddd;
  z-index: 10;
  -webkit-transition: padding-bottom 0.4s;
  transition: padding-bottom 0.4s;
  text-align: center;
  .login-title-container {
    padding-top: 30px;
    .login-title {
      color: #1685C1;
      font-size: 25px;
    }
  }
  .profile-image {
    position: absolute;
    width: 85px;
    height: 85px;
    margin: 30px 0px 0px 152px;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    background-clip: content-box;
    color: #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 15px;
    background-image: url(../../assets/images/kefulog1.png);
  }
}

.login-content {
  padding: 50px 40px 20px;
  -webkit-transition: padding-top 0.4s;
  transition: padding-top 0.4s;
  .login-username {
    width: 20px;
    height: 20px;
    margin: 0px -10px;
    background-image: url(../../assets/images/user.png);
  }
  .login-password {
    width: 20px;
    height: 20px;
    margin: 0px -10px;
    background-image: url(../../assets/images/lock.png);
  }
  .login-button {
    width: 100%;
    font-size: 18px;
    font-weight: 700; 
  }
}

.login-footer {
  font-size: 13px;
  padding: 0px 40px 40px;
  text-align: left;
}
</style>


