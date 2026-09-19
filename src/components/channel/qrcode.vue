<template>
  <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false" width="800px" v-loading="loadingVisible">
    <div slot="title" class="dialog-header"><h3>二维码</h3></div>
    <div class="list-container" style="padding: 10px;">
      <el-row>

        <el-col :span="10">
          <el-card :body-style="{ padding: '0px','text-align':'center','margin-top':'10px' }">
            <!-- <vue-qr :size="300" code="g_code" :logoSrc="g_code_logo" :title="channel.channelName+'群二维码'" :text="g_code" style="margin-left:20px;"></vue-qr> -->
            <QRCanvas id="g_code" :options="g_code"/>
            <!--<img :src="channel.avatarUrl" class="image">-->
            <div style="padding: 14px;">
              <span>群二维码</span>
              <!-- <el-button type="text" class="button" @click="downloadImg('g_code','群二维码')">保存</el-button> -->
            </div>
          </el-card>
        </el-col>

        <el-col :span="10" :offset="2">
          <el-card :body-style="{ padding: '0px','text-align':'center','margin-top':'10px' }">
            <!-- <vue-qr :size="300" code='p_code' :logoSrc="p_code_logo" :title="channel.channelName+'群主二维码'" :text="p_code" style="margin-left:20px;"></vue-qr> -->
            <QRCanvas id="p_code" :options="p_code"/>
            <div style="padding: 14px;">
              <span>群主二维码</span>
              <!-- <el-button type="text" class="button" @click="downloadImg('p_code','群主二维码')">保存</el-button> -->
            </div>
          </el-card>
        </el-col>

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


export default {
  name: "qrcode",
  props: ['channel'],
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
    }
  },
  methods: {
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
  channel:function(){
    var that = this;
      var origin = window.HOST;
      var g_code_url = origin+"/login.php?type=G&id="+ this.channel.channelId;
      var gimage = new Image()
      // gimage.setAttribute('crossOrigin', 'anonymous');
      gimage.src = window.gconfig.BASE_API +"/channels/" + that.channel.channelId +"/avatar?width=32&height=32"
      // gimage.src = "http://stxqh.cn:2006" +"/channels/" + that.channel.channelId +"/avatar?width=32&height=32&num"
      // gimage.setAttribute("crossOrigin",'Anonymous')
      gimage.onload = () => {
        that.g_code = {
          data: g_code_url,
          cellSize: 4,
          size: 600,
          logo: {
            image:gimage
            }
        }
      }
      gimage.onerror= () => {
        that.g_code = {
          data: g_code_url,
          cellSize: 6,
          size: 600,
        }
      }
      //个人二维码
      var p_code_url = origin+"/login.php?type=P&id="+ this.channel.creatorId;
      var pimage = new Image()
      // pimage.setAttribute('crossOrigin', 'anonymous');
      pimage.src = window.gconfig.BASE_API + '/users/' + that.channel.creatorId + '/avatar?width=32&height=32'
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
  }
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
