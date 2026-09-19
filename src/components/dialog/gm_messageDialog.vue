<template>
  <div class="container">
    <div class="header">
      <div style="float:left;width: 32px;
    height: 32px;
    margin-top: 6px;
    margin-left: 6px;border-radius: 32px;overflow: hidden;" class="toidAvatar"><img style="width:32px;height:32px;" :src="toidAvatar"></div>
      <div style="float:left;margin-left:10px;">
        <span class="channelName"> 客服</span>
      </div>
      <!-- <div style="height:45px;float:left;" v-if="userChannel.toUserSignature">
        <div class="channelName1"> {{userChannel.channelAliasName || userChannel.toUserNickname || userChannel.channelDisplayName}}</div>
        <div class="channelName2"> {{userChannel.toUserSignature}}</div>
      </div> -->
      <template v-if="userChannel.channelType === 'P'">
        <el-button style="float:right;margin-right:10px;margin-top:10px;" v-if="isManage(myId)" type="danger" size="mini" @click="doDeleteMsg()">清除历史消息</el-button>
      </template>
    </div>
    <el-row v-if="userChannel.purpose">
      <el-col :span="24" class="pmd">
        <div style="width: 20px;float: left;position:relative;z-index:2;background-color:rgb(238, 238, 238)"><i style="color: red;" class="el-icon-message-solid"></i></div>
        <div class="content" style="margin-left: 20px">
          <span class="con"></span>
        </div>
      </el-col>
    </el-row>
    <div class="body-container" v-if="$store.getters.imClient">
      <div class="body">
        <message-list  ref="messageList" :channel-id="$route.params.channelId" :user-channel="userChannel"></message-list>
      </div>
    </div>
    <div class="footer" style="padding-bottom: 5px;">
      <msend-message :user-channel="userChannel" :channel-id="$route.params.channelId" :channel-type="$route.params.channelType" @onMessageSent="showSentMessage"/>
    </div>
  </div>
</template>

<script>
import { outputError } from '@/utils/exception'
import { getUserChannel, isAdmin, leaveChannel, removeChannel,allForbid,deleteMsg } from '@/api/channel'
import StatusOnlineIcon from '@/components/svg/statusOnlineIcon'
import StatusOfflineIcon from '@/components/svg/statusOfflineIcon'
import StatusAwayIcon from '@/components/svg/statusAwayIcon'
import MessageList from '../message/messageList'
import msendMessage from '../message/m_sendMessage'
import { IMClient } from '@/client/im_client'
import $ from 'jquery'
export default {
  data() {
    return {
      loadingVisible: false,
      userChannel: {},
      sentMessage: null,
      isAdmin: false,
      myId: JSON.parse(sessionStorage.getItem('currentUser')).id,
      toidAvatar:"",
    }
  },
  computed:{
    "unreadCount":function(){
      return this.$store.getters.unreadCount;
    }
  },
  methods: {
    isManage(id){
      var manage = this.userChannel.adminIds || [];
      for(var i = 0; i < manage.length;i++){
        if(id == manage[i]){
          return true;
        }
      }
      return false;
    },
    doDeleteMsg(){
      deleteMsg(this.userChannel.channelId).then(response =>{
        this.$refs.messageList.deleteMsg()
        this.$message({
          showClose: true,
          message: "删除历史消息成功！",
          type: 'info'
        })
      })
    },
    goback(){
      this.$router.replace("/m");

    },
    doAllFribid(isForbid){
        allForbid(this.userChannel.channelId,isForbid).then(response =>{
            this.userChannel.allForbid = isForbid;
        })
    },
    showSentMessage(message) {
      this.$refs.messageList.showSentMessage(message)
    },
    initPage() {
      //收起列表页
      this.$nextTick(function(){
         $(".sidebar").hide()
      })
      if(this.$route.params.channelId === undefined) {
        return
      }

      this.loadingVisible = true
      const channelId = this.$route.params.channelId
      this.$store.dispatch('setCurrentChannelId', channelId)
      this.initIMClient()
      getUserChannel(this.myId, channelId)
      .then(response => {
        this.userChannel = response.data
         this.$nextTick(() => {
            if(this.userChannel.purpose){
              this.pmd()
            }
          })
        if(this.userChannel.avatarUrl && this.userChannel.channelType == 'G'){
          this.userChannel.avatarUrl = window.gconfig.BASE_API + '/channels/' + this.userChannel.channelId + '/avatar?width=80&height=80&rdm='
        }else if(this.userChannel.avatarUrl && this.userChannel.channelType == 'P'){
          this.userChannel.avatarUrl = window.gconfig.BASE_API + '/users/' + this.userChannel.toUserId + '/avatar?width=80&height=80&rdm='
        }
        if (this.userChannel.channelType === 'G') {
          isAdmin(channelId)
          .then(response => {
            this.isAdmin = response.data
            this.loadingVisible = false
          })
          .catch(error => {
            this.loadingVisible = false
            outputError(this, error)
          })
        } else {
          this.loadingVisible = false
        }
      })
      .catch(error => {
        this.loadingVisible = false
        outputError(this, error)
      })
    },
    onMembersCountChanged(message) {
      if(this.$route.params.channelId === message.channelId) {
        this.userChannel.memberCount += message.count
      }
    },
    initIMClient() {
      let st = setTimeout(() =>  {
        let imClient = this.$store.getters.imClient
        if(imClient != null) {
          imClient.bindMembersCountChanged(this.onMembersCountChanged)
          clearTimeout(st)
        }
      }, 500)
    },
    handleCommand(command) {
      switch(command) {
        case 'addMember':
          this.$refs.addChannelMemberDlg.$emit('openDialog', this.userChannel)
          break;
        case 'editAvatar':
          this.$refs.editChannelAvatarDlg.$emit('openDialog', this.userChannel)
          break;
        case 'editTitle':
          this.$refs.editChannelTitleDlg.$emit('openDialog', this.userChannel)
          break;
        case 'editName':
          this.$refs.editChannelNameDlg.$emit('openDialog', this.userChannel)
          break;
        case 'manageMember':
          this.$refs.memberManagementDlg.$emit('openDialog', this.userChannel)
          break
        case 'leave':
          this.doLeaveChannel(this.userChannel)
          break
        case 'remove':
          this.doRemoveChannel(this.userChannel.channelId)
          break
      }
    },
    doOpenAddMemberDlg() {
      this.$refs.addChannelMemberDlg.$emit('openDialog', this.userChannel)
    },
    doLeaveChannel(userChannel) {
      this.$confirm('确定离开该频道吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
         type: 'warning'
      }).then(_ => {
        this.loadingVisible = true
        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
        leaveChannel(userChannel.channelId, currentUser.id, currentUser.nickname)
        .then(_ => {
          if(this.$route.params.leaveChannelCallback !== undefined) {
            this.$route.params.leaveChannelCallback(userChannel.channelId)
          }
          this.loadingVisible = false
        })
        .catch(error => {
          this.loadingVisible = false
          outputError(this, error)
        })
      }).catch(_ => {
      })
    },
    doRemoveChannel(channelId) {
      this.$confirm('确定删除该频道吗？删除后将无法浏览该频道的任何消息！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
         type: 'warning'
      }).then(_ => {
        this.loadingVisible = true
        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
        removeChannel(channelId, currentUser.id)
        .then(response => {
          if(response.data > 0 && this.$route.params.removeChannelCallback !== undefined) {
            this.$route.params.removeChannelCallback(channelId)
          }
          this.loadingVisible = false
        })
        .catch(error => {
          this.loadingVisible = false
          outputError(this, error)
        })
      }).catch(_ => {
      })
    },
    onEditTitleFinished(newTitle) {
      this.userChannel.purpose = newTitle
    },
    onEditAvatarFinished(avatarUrl) {
      if(avatarUrl){
        this.userChannel.avatarUrl = window.gconfig.BASE_API + '/channels/' + this.userChannel.channelId + '/avatar?width=80&height=80&rdm='
      }
    },
    onEditNameFinished(newName) {
      this.userChannel.channelName = newName
    },
    showMemberList() {
      this.$refs.memberListDlg.$emit('openDialog')
    },
     pmd(){
      $(".pmd").css("width",$(".el-container").width())
      $(".pmd .content").css({
        "width":$(".pmd").width()-20,
      })
      $(".pmd .con").html(this.userChannel.purpose)
      this.animate()
    },
    animate(){
      if($(".pmd .con").width() > $(".pmd .content").width() ){
        $(".pmd .con").css("left",$(".pmd .content").width())
        $(".pmd .con").animate({
          "left":-$(".pmd .con").width()-20
        },this.userChannel.purpose.length * 400,'linear',this.animate)
      }else{
        $(".pmd .con").css("left",0)
      }
    },
    
  },
  created() {
    if(sessionStorage.getItem('toid').indexOf("/") != -1){
      this.toidAvatar = window.gconfig.BASE_API + '/users/' + sessionStorage.getItem('toid') + 'avatar?width=36&height=36&rdm='
    }else{
      this.toidAvatar = window.gconfig.BASE_API + '/users/' + sessionStorage.getItem('toid') + '/avatar?width=36&height=36&rdm='
    }
    this.initPage()
    var that =this;
    $(".pmd .con").html("")
    $(window).resize(function(){
      setTimeout(function(){
        $(".pmd .con").stop(true)
        that.pmd();
      },200)

    })
  },
  watch: {
    '$route': 'initPage',
    "userChannel.channelId": function(){
      $(".pmd .con").stop(true)
      this.$forceUpdate();
    },
  },

  components: { StatusOnlineIcon, StatusOfflineIcon, StatusAwayIcon, MessageList, msendMessage,
    EditChannelAvatar: resolve => require(['@/components/userChannel/editChannelAvatar'], resolve),
    EditChannelTitle: resolve => require(['@/components/userChannel/editChannelTitle'], resolve),
    EditChannelName: resolve => require(['@/components/channel/editChannelName'], resolve),
    AddMember: resolve => require(['@/components/channel/addMember'], resolve),
    MemberList: resolve => require(['@/components/channel/memberList'], resolve),
    MemberManagement: resolve => require(['@/components/channel/manageMember'], resolve),
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  background: #eee;
  height: 100%;
  width: 100%;
  position: relative;

  .header {
    -webkit-flex: 0 0 45px;
    flex: 0 0 45px;
    border-bottom: 1px solid;
    font-size: 14px;
    position: relative;
    width: 100%;
    z-index: 9;
    border-bottom: solid 1px #DBD9D6;
    .goback{
      // position: absolute;
      font-size:24px;
      line-height: 45px;
      padding: 0 10px;
      left:0;
      // width: 50px;
      cursor: pointer;
      float: left;
    }
    .unread{
      position: relative;
      font-size: 16px;
      line-height: 45px;
      cursor: pointer;
      top: -4px;
    }
    .channelName{
      font-size: 16px;
      line-height: 45px;
      text-align: center;
      // position: relative;
      // left:36px;
    }
    .channelName1{
      font-size: 14px;
      line-height: 25px;
      //  position: relative;
      // left:36px;
    }
    .channelName2{
      font-size: 12px;
      line-height: 20px;
      //  position: relative;
      // left:36px;
    }
    .title-container {
      min-width: 0px;
      flex: 1 1 0%;
      margin-top: 14px;
      padding-left: 8px;
      vertical-align: middle;
      span {
        background: transparent;
        border: none;
        padding: 0;
        text-align: left;
        cursor: pointer;
      }
      .title {
        font-size: 17px;
        flex: 1;
        min-width: 0;
        padding: 0 0 0 10px;
        float: left;
        strong {
          font-size: 17px;
        }
        svg {
          margin: 0 0 0 3px;
          width: 13px;
          height: 13px;
        }
        #dropdown-icon-selected {
          display: none;
        }
        .channel-title:hover {
          color: #418FD6;
          #dropdown-icon {
            display: none;
          }
          #dropdown-icon-selected {
            display: inline;
          }
        }
      }
      .display-name {
        margin-top: 3px;
        font-size: 14px;
      }
      .members-container {
        float: right;
        margin-right: 10px;
        padding: 0 0px 0 0;
        .members {
          border-radius: 20px;
          margin-top: 5px;
          padding: 6px 23px;
          border: 1px solid #dcdfe6;
          vertical-align: middle;
          div {
            float: left;
            margin-right: 6px;
            font-weight: bold;
            color: #B7B3AD;
          }
          svg {
            width: 16px;
            height: 16px;
            margin-top: 1px;
            fill: #B7B3AD;
          }
        }
        .members:hover {
          cursor: pointer;
          border: 1px solid #319EDD;
          div {
            color: #319EDD;
          }
          svg {
            fill: rgb(35, 137, 215);
          }
        }
      }
    }
  }

  .body-container {
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    background-color: #eee;
    .body {
      -webkit-overflow-scrolling: touch;
      height: 100%;
      width: 100%;
      overflow-y: hidden;
      overflow-x: hidden;
      position: absolute;
    }
  }

  .footer {
    -webkit-flex: 0 0 auto;
    flex: 0 0 auto;
    /*height: 156px;*/
    width: 100%;
    z-index: 5;
  }
}
.pmd{
    overflow: hidden;
    height: 24px;
    line-height: 24px;
    .content{
      position: relative;
    }
    .con{
      position: relative;
      height: 24px;
      white-space : nowrap;
      color: red;
    }
  }
</style>

