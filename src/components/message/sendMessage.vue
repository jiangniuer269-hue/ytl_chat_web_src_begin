<template>
  <div class="container">
    <div class="toolbar">
      <emoji-panel :position="position" id="emoji_panel" v-show="emojiPanelVisible" v-on:select-emoticon="selectEmoticon"></emoji-panel>
      <a class="face" title="表情" @click="displayEmojiPanel" v-clickOutside="handleCloseEmojiPanel"></a>
      <el-upload
        class="upload"
        ref="fileUpload"
        :action="uploadFileUrl"
        accept="image/*,video/*"
        :data="postFileData"
        :auto-upload="false"
        :headers="uploadRequestHeaders"
        :show-file-list="false"
        :on-change="handleFileOnChange"
        :before-upload="beforeFileUpload"
        :on-success="fileUploadSuccess">
        <a class="folder" title="图片和文件"></a>
      </el-upload>

      <a class="fastmsg" title="快捷消息" @click="onfastmsg()">快捷消息</a>
      <div  v-if="showFastMsg" class="fastmsgcontent">
        <div class="fastmsgtit">快捷消息列表
          <span @click="showFastMsg = false">关闭</span>
        </div>
        <div  v-if="fast_msg.length" class="fastmsgcon">
          <div @click="setintomsg(item)" v-for="(item,index) in fast_msg" :key="index" class="fastmsgitem">{{item}}</div>
        </div>
        <div v-if="!fast_msg.length">
          请前往[账号设置]配置快捷消息！
        </div>
        </div>
      <span v-if="showUpload" class="showUpload" style="color: red;margin-left: 10px;">文件发送中,请勿刷新页面...</span>
    </div>
    <div class="content-container">
      <!--<textarea class="custom-textarea custom-textarea&#45;&#45;emoji-picker" id="post_textbox" ref="message_content"-->
        <!--autocomplete="off" spellcheck="true" placeholder="输入要发送的消息..." v-model="message" @keydown="onMessageContentEnterKeyDown"-->
        <!--@keyup="ctrlButtonDown=false">-->
      <!--</textarea>-->
      <Uediter id="ue1" style="width: 100%;height:100px;overflow: auto; " @sendMsg="doSendMessage" :value="ueditor.value" :config="ueditor.config" ref="ue"></Uediter>
    </div>
    <div class="send-button-container">
      <span>Ctrl+Enter换行,Enter发送消息</span>
      <el-button type="primary" size="small" >发送</el-button>
    </div>
  </div>
</template>

<script>
import { saveMessage } from '@/api/message'
import { getMyInfo, updateMyInfo } from '@/api/user'
import { outputError } from '@/utils/exception'
import Uediter from '@/components/ue.vue'
import $ from 'jquery'

const clickOutside = {
  // 初始化指令
  bind(el, binding, vnode) {
    function documentHandler(e) {
      // 这里判断点击的元素是否是本身，是本身，则返回。
      if (el.contains(e.target)) {
        return false
      }
      // 展开的表情pannel，也返回不执行关闭操作。
      if(e.target.getAttribute('isEmoji') != null) {
        return false
      }
      // Emoji图标，也返回不执行关闭操作。
      if(e.target.getAttribute('type') != null && e.target.getAttribute('type') === 'emoji_icon') {
        return false
      }
      // 判断指令中是否绑定了函数
      if (binding.expression) {
        // 如果绑定了函数 则调用那个函数，此处binding.value就是handleCloseEmojiPanel方法
        binding.value(e)
      }
    }
    // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
    el.__vueClickOutside__ = documentHandler
    document.addEventListener('click', documentHandler)
  },
  update() {

  },
  unbind(el, binding) {
    // 解除事件监听
    document.removeEventListener('click', el.__vueClickOutside__)
    delete el.__vueClickOutside__
  },
}
export default {
  data() {
    return {
      fast_msg:[],
      showFastMsg:false,
      showUpload:false,
      myId: JSON.parse(sessionStorage.getItem('currentUser')).id,
      message: '',
      emojiPanelVisible: false,
      loadingVisible: false,
      sendButtonDisabled: true,
      ctrlButtonDown: false,
      postFileData: {
        channelId: this.channelId,
        imageWidth: 0,
        imageHeight: 0,
        size: 0
      },
      uploadFileUrl: window.gconfig.BASE_API + '/messages/files',
      uploadRequestHeaders: {
        'X-Token': sessionStorage.getItem('token')
      },
      position:{
        top: "-270px",
        left: "10px"
      },
      canSendMsg:true,
      ueditor: {

        value: '',

        config: {}

      }
    }
  },
  name: 'send-message',
  props: ['userChannel','channelId', 'channelType'],
  directives: { clickOutside },
  mounted(){
  },
  inject: ['sortList'],
  methods: {
    setintomsg(item){
      this.showFastMsg = false;
      this.$refs.ue.insertHtml(item);
    },
    onfastmsg(){
      this.showFastMsg = !this.showFastMsg;
      if(this.showFastMsg){
          getMyInfo()
        .then(response => {
          if(response.data.fastMsg){
            this.fast_msg = response.data.fastMsg.split("+");
          }else{
            this.fast_msg = [];
          }
        })
        .catch(error => {
          outputError(this, error)
        })
      }
    },
    escape2Html(str) {
      var str = str.replace(/<(?!(img|br|p)).*?>/g, "");
      var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
      return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
    },
    doSendMessage() {
//      if(!this.canSendMsg){
//        return;
//      }
      this.canSendMsg = false;

      this.message = this.$refs.ue.getUEContent();
      this.message = this.escape2Html(this.message);
      this.message = this.message.replace(/<p><br\/>/gm,"")
      for(var i = 0; i < 10 ;i++){
        this.message = this.message.replace(/<br\/><br\/>/gm,"<br\/>")
        this.message = this.message.replace(/<br><br>/gm,"<br>")
      }
      if(this.message.trim() === '') {
        return
      }
      this.loadingVisible = true
      const newMessage = {
        channelId: this.channelId,
        channelType: this.channelType,
        content: this.message.replace(new RegExp("\n", "gm"), "<br />")
      }
      this.message = ''
      localStorage.removeItem("draft:"+this.myId + this.channelId);
      this.handleCloseEmojiPanel();
      this.sortList(this.channelId);
      this.$refs.ue.clear();
      saveMessage(newMessage)
      .then(response => {
        this.canSendMsg = true;
        this.$emit('onMessageSent', response.data)
        this.$root.Event.$emit('onMessageSent', response.data)
        this.loadingVisible = false
      })
      .catch(error => {
        this.loadingVisible = false
        outputError(this, error)
      })
    },
    displayEmojiPanel() {
      this.emojiPanelVisible = !this.emojiPanelVisible
    },
    handleCloseEmojiPanel() {
      this.emojiPanelVisible = false
    },
    selectEmoticon(emoticon) {
      this.$refs.ue.insertHtml(emoticon)
      this.message = this.$refs.ue.getUEContent()
      $("iframe[id^='ueditor']").contents().find("body.view p img").css({
        width: "24px",
        position: "relative",
        top: "6px"
      })
    },
    onMessageContentEnterKeyDown(e) {
      if(e.keyCode === 17) {
        this.ctrlButtonDown = true
        return
      }
      if(e.keyCode === 13) {
        if(this.ctrlButtonDown) {
          this.message += '\r\n'
        } else {
          this.doSendMessage()
        }
        e.preventDefault()
      }
    },
    beforeFileUpload(file) {
      if(file.name.replace(/[\u0391-\uFFE5]/g, "aa").length > 640) {
        this.$message.error('文件名长度不能超过640!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 20;
      if (!isLt2M) {
        this.$message.error('文件大小不能超过 20MB!');
        return false;
      }
      this.postFileData.channelId = this.channelId
      this.postFileData.size = file.size
      if(isLt2M) {
        this.loadingVisible = true
      }
      var that = this;
      return new Promise(function(resolve, reject){
        that.$confirm('确定发送图片/文件？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(_ => {
          that.showUpload = true;
          resolve("");
        }).catch(_ => {
          reject("");
        })
      })
      },
    fileUploadSuccess(response, file, fileList) {
      this.loadingVisible = false
      this.$emit('onMessageSent', response)
      this.showUpload = false;
    },
    handleFileOnChange(file) {
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('png') || fileName.endsWith('jpeg') || fileName.endsWith('jpg') || fileName.endsWith('gif')) {
        let img = new Image()
        img.src = file.url
        let self = this
        img.onload = function() {
          self.postFileData.imageWidth = img.width
          self.postFileData.imageHeight = img.height
          self.$refs.fileUpload.submit()
        }
      } else {
        this.$refs.fileUpload.submit()
      }
    }
  },
  updated() {
    this.$nextTick(() => {
      this.canSendMsg = true;
      this.sendButtonDisabled = (this.message.trim() === '')
    })
  },
  watch: {
    $route(to,from) {
      if(from.params.channelId){//存
        var draft = this.$refs.ue.getUEContent();
        draft = draft.replace(/<p><br\/>/gm,"")
        draft = draft.replace(/<br\/><br\/>/gm,"")
        draft = draft.replace(/<br><br>/gm,"")
        draft = draft.replace(/<\/p>/gm,"")
        draft = draft.replace(/<\/p>/gm,"")
        draft = this.escape2Html(draft);
        if(draft != ""){
          localStorage.setItem("draft:"+this.myId + from.params.channelId , draft);
        }
        this.$refs.ue.clear();
      }
    },
    "userChannel.channelId":{
      handler(){
        this.$refs.ue.clear();
        this.$refs.ue.insertHtml(localStorage.getItem("draft:"+this.myId + this.channelId) || "")
      }
    },
  },
  components: {
    EmojiPanel: resolve => require(['@/components/message/emojiPanel'], resolve),
    Uediter
  }
}
</script>

<style lang="scss" scoped>
.fastmsg{
    margin-left: 10px;
    /* border: 1px solid #0070d2; */
    background: #0070d2;
    color: #fff;
    padding: 2px 5px;
    border-radius: 4px;
    cursor: pointer;
}
.fastmsgitem{
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}
.fastmsgcontent{
  position: absolute;
    width: 300px;
    bottom: 180px;
    height: 270px;
    left: 0;
    background-color: #fff;
    padding:5px;
}
.fastmsgtit{
  border-bottom:1px solid #ccc;
  background: #f5f5f5;
}
.fastmsgtit span{
  float: right;
  cursor: pointer;
}
.fastmsgcon{
  position: absolute;
    top: 30px;
    left: 5px;
    right: 5px;
    bottom: 0;
    overflow: auto;
}

.container {
  -webkit-flex: 0 0 auto;
  flex: 0 0 auto;
  width: 100%;
  z-index: 7;
  .toolbar {
    height: 25px;
    padding: 5px 20px;
    display: inline-block;
    border-top: solid 1px #DFDAD3;
    .face {
      width: 25px;
      height: 25px;
      background: url(../../assets/images/emoji.png) no-repeat;
      vertical-align: middle;
      float: left;
      cursor: pointer;
    }
    .upload {
      float: left;
    }
    .file-invisible {
      position: absolute;
      clip: rect(1px,1px,1px,1px);
    }
    .folder {
      margin-left: 8px;
      width: 25px;
      height: 25px;
      background: url(../../assets/images/folder.png) no-repeat;
      display: inline-block;
      vertical-align: middle;
      cursor: pointer;
    }
  }
  .content-container {
    overflow: auto;
    height: 100px;
    display: inline-block;
    *zoom:1;
    *display: inline;
    padding: 0 35px 0 20px;
  }
  .send-button-container {
    height: 40px;
    line-height: 40px;
    text-align: right;
    padding: 0 18px 0 0;
    span {
      color: #888;
      font-size: 12px;
      margin-left: 10px;
      margin-right: 7px;
    }
  }
}
.custom-textarea {
  bottom: 0;
  width: 100%;
  max-height: 162px;
  overflow: hidden;
  padding: 8px 0 13px 15px;
  resize: none;
  font-size: 14px;
}
</style>


