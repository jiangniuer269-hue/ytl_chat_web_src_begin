<template>
  <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false" width="800px" v-loading="loadingVisible">
    <div slot="title" class="dialog-header"><h3>群发消息</h3></div>
    <div class="list-container"  style="padding: 10px;">
      <div class="container" v-loading="loading"
           element-loading-text="拼命发送中"
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(0, 0, 0, 0.8)" style="border:1px solid #ccc; ">
        <div class="toolbar">
          <emoji-panel :position="position" id="emoji_panel" v-show="emojiPanelVisible" v-on:select-emoticon="selectEmoticon"></emoji-panel>
          <a class="face" title="表情" @click="displayEmojiPanel" v-clickOutside="handleCloseEmojiPanel"></a>
        </div>
          <Uediter id="ue2" style="width: 100%;height:100px;overflow: auto;border-top:1px solid #ccc;border-bottom:1px solid #ccc; " @sendMsg="doSendMessage" :value="ueditor.value" :config="ueditor.config" ref="ue"></Uediter>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="small"  @click="doSendMessage()">发 送</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { saveMessageAll } from '@/api/message'
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
    components: {
    },
    data() {
      return {
        loading:false,
        dialogVisible:false,
        message: '',
        emojiPanelVisible: false,
        ctrlButtonDown: false,
        postFileData: {
          channelId: this.channelId,
          imageWidth: 0,
          imageHeight: 0,
          size: 0
        },
        position:{
          top: "110px",
          left: "10px"
        },
        ueditor: {

          value: '',

          config: {}

        }
      }
    },
    directives: { clickOutside },
    methods: {
      doCloseDialog() {
          this.loading  = false;
        this.dialogVisible = false
      },
      escape2Html(str) {
        var str = str.replace(/<(?!(img|br|p)).*?>/g, "");
        var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
        return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
      },
      doSendMessage() {
        this.message = this.$refs.ue.getUEContent();
        this.message = this.escape2Html(this.message);
        this.message = this.message.replace(/<p><br\/>/gm,"")
        this.message = this.message.replace(/<br\/>/gm,"")
        this.message = this.message.replace(/<br>/gm,"")
        if(this.message.trim() === '') {this.$message({
          message: '群发消息不能为空',
          type: 'info'
        });
          return
        }
        this.handleCloseEmojiPanel();
        this.loading  = true;

        saveMessageAll(this.message.replace(new RegExp("\n", "gm"), "<br />"))
          .then(response => {
            this.loading  = false;
            this.dialogVisible = false
            this.$refs.ue.clear();
            this.$message({
              message: '群发消息成功,发送会员过多可能略有延迟~',
              type: 'success'
            });
          })
          .catch(error => {
            this.loading  = false;
//            this.dialogVisible = false
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
        if(file.name.replace(/[\u0391-\uFFE5]/g, "aa").length > 64) {
          this.$message.error('文件名长度不能超过64!')
          return false
        }
        const isLt2M = file.size / 1024 / 1024 < 5;
        if (!isLt2M) {
          this.$message.error('文件大小不能超过 5MB!')
        }
        this.postFileData.channelId = this.channelId
        this.postFileData.size = file.size
        if(isLt2M) {
          this.loadingVisible = true
        }
        return isLt2M
      },
      fileUploadSuccess(response, file, fileList) {
        this.loadingVisible = false
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
    computed: {

    },
    mounted: function() {
      this.$nextTick(() => {
        this.$on('openDialog', function(action) {
          this.dialogVisible = true
        })
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

