<template>
  <div class="container">
    <div class="toolbar">
    <!--  <emoji-panel :position="position" id="emoji_panel" unselectable="on" onmousedown="return false;" v-show="emojiPanelVisible" v-on:select-emoticon="selectEmoticon"></emoji-panel>
      <a class="face" unselectable="on" onmousedown="return false;" title="表情" @click="displayEmojiPanel" v-clickOutside="handleCloseEmojiPanel"></a>-->

      <el-upload
        class="upload"
        ref="fileUpload"
        :action="uploadFileUrl"
        accept="image/*"
        :data="postFileData"
        :auto-upload="false"
        :headers="uploadRequestHeaders"
        :show-file-list="false"
        :on-change="handleFileOnChange"
        :before-upload="beforeFileUpload"
        :on-success="fileUploadSuccess">
        <a class="folder" title="图片"></a>
      </el-upload>
      <span v-if="showUpload" class="showUpload" style="color: red;margin-left: 10px;">图片发送中,请勿刷新页面...</span>
    </div>
    <div class="content-container">
        <div class="ipt-wrap" style="padding-right:75px;padding-left:10px;">
          <p contenteditable="true" placeholder="输入要发送的消息..."  ref="message_content" size="small " class="inpt-area" id="inpt-area"></p>
        </div>
        <div class="doSendMessage" style="position:absolute;bottom:32px;right:10px;width:65px;">
          <el-button class="doSendMessage" style="position:absolute;right:0;top:0px;" type="primary" size="small" @click="doSendMessage()">发送</el-button>
        </div>
    </div>
  </div>
</template>

<script>
import { saveMessage } from '@/api/message'
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
  update() {},
  unbind(el, binding) {
    // 解除事件监听
    document.removeEventListener('click', el.__vueClickOutside__)
    delete el.__vueClickOutside__
  },
}
export default {
  data() {
    return {
      showUpload:false,
      myId: JSON.parse(sessionStorage.getItem('currentUser')).id,
      message: '',
      emojiPanelVisible: false,
      loadingVisible: false,
      sendButtonDisabled: true,
      ctrlButtonDown: false,
      position:{
        top: "-270px",
        left: "10px"
      },
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
      canSendMsg:true,
      ueditor: {

        value: '',

        config: {}

      }
    }
  },
  name: 'm_send-message',
  props: ['userChannel','channelId', 'channelType'],
  directives: { clickOutside },
  inject: ['sortList'],
  mounted(){
    setTimeout(()=>{
      $(".ipt-wrap").css({"width":$(".ipt-wrap").width()})
    },1000)
    $(window).resize(function () {
      $(".ipt-wrap").css({"width":$("body").width()-80})
    })
    window.addEventListener('focusout', function (e) {
      if($(e.target).hasClass("doSendMessage")){

      }else{
          setTimeout(function() {
            var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
            window.scrollTo(0, Math.max(scrollHeight - 1, 0));
            window.parent.postMessage("scrollTo",'*');
          }, 300);
      }
    })
  },
  methods: {
    //在光标位置插入内容
insertAtCursor(dom, html) {
    if (dom != document.activeElement) { // 如果dom没有获取到焦点，追加
        dom.innerHTML = dom.innerHTML + html;
        return;
    }
    var sel, range;
    if (window.getSelection) {
        // IE9 或 非IE浏览器
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(),
                node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
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
      this.message = this.escape2Html($("#inpt-area").html());
      // setTimeout(function() {
      //   var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
      //   window.scrollTo(0, Math.max(scrollHeight - 1, 0));
      // }, 300);
      this.message = this.message.replace(/<p><br\/>/gm,"")
      this.message = this.message.replace(/<br\/>/gm,"")
      this.message = this.message.replace(/<br>/gm,"")
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
      $("#inpt-area").html("");
      this.sortList(this.channelId);
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
      // let textarea = this.$refs.message_content
      // let pos = textarea.selectionStart
      // let leftStr = this.message.substring(0, pos);
      // let rightStr = this.message.substring(pos, this.message.length)
      // this.message = leftStr + emoticon + rightStr
      // document.getElementById('inpt-area').focus();
      this.insertAtCursor(document.getElementById('inpt-area'),emoticon)
      // this.insertContent(emoticon);
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
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isLt2M) {
        this.$message.error('文件大小不能超过 10MB!')
      }
      this.postFileData.channelId = this.channelId
      this.postFileData.size = file.size
      if(isLt2M) {
        this.loadingVisible = true
      }
      var that = this;
      console.log(file);
      return new Promise(function(resolve, reject){
        that.$confirm('确定发送图片？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(_ => {
          resolve("");
          that.showUpload = true;
          // that.$root.Event.$emit('loadingImg',{fileName:file.name});
        }).catch(_ => {
          reject("");
        })
      })
    },
    fileUploadSuccess(response, file, fileList) {
      this.loadingVisible = false
      this.showUpload = false;
      this.$emit('onMessageSent', response)
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
  watch: {
    '$route'(to,from) {
      this.message = '';
      if(from.params.channelId){//存
        var draft = $("#inpt-area").html()
        draft = draft.replace(/<p><br\/>/gm,"")
        draft = draft.replace(/<br\/><br\/>/gm,"")
        draft = draft.replace(/<br><br>/gm,"")
        draft = draft.replace(/<\/p>/gm,"")
        draft = draft.replace(/<\/p>/gm,"")
        draft = this.escape2Html(draft);
        if(draft != ""){
          localStorage.setItem("draft:"+this.myId + from.params.channelId , draft);
        }
        $("#inpt-area").html("")
      }
    },
    "userChannel.channelId":{
      handler(){
        $("#inpt-area").html("")
        $("#inpt-area").html(localStorage.getItem("draft:"+this.myId + this.channelId) || "")
      }
    },
  },
  updated() {
    this.$nextTick(() => {
      this.canSendMsg = true;
      this.sendButtonDisabled = (this.message.trim() === '')
    })
  },
  components: {
    EmojiPanel: resolve => require(['@/components/message/emojiPanel'], resolve),
    Uediter
  }
}
</script>
<style lang="scss" scoped>

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
      background: url(../../assets/images/image.png) no-repeat;
      display: inline-block;
      vertical-align: middle;
      cursor: pointer;
    }
  }
  .content-container {
    overflow: auto;
    /*height: 45px;*/
    position: relative;
    display: inline-block;
    *zoom:1;
    *display: inline;
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


