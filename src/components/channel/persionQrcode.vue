<template>
  <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false" width="400px" v-loading="loadingVisible">
    <div slot="title" class="dialog-header"><h3>我的二维码</h3></div>
    <div class="list-container" style="padding: 10px;">
      <el-row>
        <el-col :span="24">
          <el-card :body-style="{ padding: '0px','text-align':'center','margin-top':'10px' }">
            <QRCanvas id="p_code" :options="p_code"/>
            <div style="padding: 14px;">
              <span style="color:red;cursor:pointer;" class="tag-read" :data-clipboard-text="p_code_url" @click="copy">点击复制</span>
              <span>我的二维码</span>
            </div>
          </el-card>
        </el-col>

        <!-- <el-col :span="12">
          <el-card :body-style="{ padding: '0px','text-align':'center','margin-top':'10px' }">
            <QRCanvas id="u_code" :options="u_code"/>
            <div style="padding: 14px;">
              <span>{{u_code_url}}</span>
              <span>我的推广码</span>
            </div>
          </el-card>
        </el-col> -->

      </el-row>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="small"  @click="doCloseDialog()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { outputError } from '@/utils/exception'
import { listNonMembers } from '@/api/user'
import { addMember } from '@/api/channel'
// import VueQr from 'vue-qr'
import { QRCanvas } from 'qrcanvas-vue';
import Clipboard from 'clipboard';  


export default {
  name: "qrcode",
  props: ['userInfo'],
  components: {
    // VueQr
    QRCanvas
  },
  data() {
    return {
      loadingVisible: false,
      dialogVisible: false,
      g_code: "",
      p_code: "",
      u_code: "",
      p_code_url:"",
      u_code_url:"",
    }
  },
  methods: {
    copy() {  
          var clipboard = new Clipboard('.tag-read')  
          clipboard.on('success', e => {  
             this.$message({
                showClose: false,
                message: "复制成功！",
                type: 'success'
              })
                  // 释放内存  
                  clipboard.destroy()  
                })  
                clipboard.on('error', e => {  
                  // 不支持复制  
                  console.log('该浏览器不支持自动复制')  
                  // 释放内存  
                  clipboard.destroy()  
                })  
        },
    doCloseDialog() {
      this.dialogVisible = false
    },
    exportCanvasAsPNG(id, fileName) {

    var canvasElement = document.getElementById(id);

    var MIME_TYPE = "image/png";

    var imgURL = canvasElement.toDataURL(MIME_TYPE);

    var dlLink = document.createElement('a');
    dlLink.download = fileName;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
},
    downloadImg(id,name){
      this.exportCanvasAsPNG(id,name);
     }
  },
  watch: {
      userInfo:{
          handler:function () {
              var that = this;
              var origin = window.HOST;

              //个人二维码
              var p_code_url = origin+"/login.php?type=P&id="+ this.userInfo.id;
              that.p_code_url = p_code_url;
              var pimage = new Image()
              // pimage.setAttribute('crossOrigin', 'anonymous');
              pimage.src = window.gconfig.BASE_API + '/users/' + that.userInfo.id + '/avatar?width=32&height=32'
              // pimage.src = "http://stxqh.cn:2006" + '/users/' + that.channel.creatorId + '/avatar?width=32&height=32' + Math.random()
              // pimage.setAttribute("crossOrigin",'Anonymous')
              pimage.onload = () => {
                  that.p_code = {
                      data: p_code_url,
                      cellSize: 4,
                      size: 600,
                      logo: {
                          image:pimage
                      }
                  }
              }
              pimage.onerror= () => {
                  that.p_code = {
                      data: p_code_url,
                      cellSize: 6,
                      size: 600,
                  }
              }

              var u_code_url = origin+"/contact.php?type=P&id="+ this.userInfo.id;
              this.u_code_url = u_code_url;
               var uimage = new Image()
               uimage.src = window.gconfig.BASE_API + '/users/' + that.userInfo.id + '/avatar?width=32&height=32'
               uimage.onload = () => {
                  that.u_code = {
                      data: u_code_url,
                      cellSize: 4,
                      size: 600,
                      logo: {
                          image:uimage
                      }
                  }
              }
              uimage.onerror= () => {
                  that.u_code = {
                      data: u_code_url,
                      cellSize: 6,
                      size: 600,
                  }
              }
          },
          immediate:true
      },
  },
  computed: {
//    g_code_logo:function(){
//        return
//    },
//    p_code:function(){
//      var origin = window.location.origin;
//      return "";
//
//    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openDialog', function(action) {
        this.userList = this.selectedUserList = []
        this.dialogVisible = true
      })
    })
  }
}
</script>

<style lang="scss" scoped>
  .time {
    font-size: 13px;
    color: #999;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
</style>
