<template>
  <div class="container">
    <div class="header">
      <div class="title-container">
        <span>
          <img
            style="float: left;width: 40px;height:40px;"
            v-if="userChannel.avatarUrl"
            :src="userChannel.avatarUrl"
            class="avatar"
          />
          <div class="title">
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="el-dropdown-link channel-title">
                <template v-if="userChannel.channelType === 'P'">
                  <strong>{{ userChannel.channelAliasName || userChannel.toUserNickname || userChannel.channelDisplayName }}</strong>
                </template>
                <template v-if="userChannel.channelType === 'G'">
                  <strong>
                    {{ userChannel.channelName }}
                    <span style="color:red;" v-if="userChannel.allForbid">[全员禁言中]</span>
                  </strong>
                  <svg id="dropdown-icon" t="1528208466548" viewBox="0 0 1024 1024" version="1.1">
                    <path
                      d="M517.688889 796.444444c-45.511111 0-85.333333-17.066667-119.466667-51.2L73.955556 381.155556c-22.755556-22.755556-17.066667-56.888889 5.688888-79.644445 22.755556-22.755556 56.888889-17.066667 79.644445 5.688889l329.955555 364.088889c5.688889 5.688889 17.066667 11.377778 28.444445 11.377778s22.755556-5.688889 34.133333-17.066667l312.888889-364.088889c22.755556-22.755556 56.888889-28.444444 79.644445-5.688889 22.755556 22.755556 28.444444 56.888889 5.688888 79.644445L637.155556 739.555556c-28.444444 39.822222-68.266667 56.888889-119.466667 56.888888 5.688889 0 0 0 0 0z"
                      p-id="1094"
                      fill="#111111"
                    />
                  </svg>
                  <svg
                    id="dropdown-icon-selected"
                    t="1528208466548"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                  >
                    <path
                      d="M517.688889 796.444444c-45.511111 0-85.333333-17.066667-119.466667-51.2L73.955556 381.155556c-22.755556-22.755556-17.066667-56.888889 5.688888-79.644445 22.755556-22.755556 56.888889-17.066667 79.644445 5.688889l329.955555 364.088889c5.688889 5.688889 17.066667 11.377778 28.444445 11.377778s22.755556-5.688889 34.133333-17.066667l312.888889-364.088889c22.755556-22.755556 56.888889-28.444444 79.644445-5.688889 22.755556 22.755556 28.444444 56.888889 5.688888 79.644445L637.155556 739.555556c-28.444444 39.822222-68.266667 56.888889-119.466667 56.888888 5.688889 0 0 0 0 0z"
                      p-id="1094"
                      fill="#418FD6"
                    />
                  </svg>
                </template>
              </span>
              <el-dropdown-menu slot="dropdown">
                <template v-if="userChannel.channelType === 'G'">
                  <template v-if="isAdmin">
                    <el-dropdown-item command="showQRcode" v-if="myId === userChannel.creatorId">二维码</el-dropdown-item>
                    <el-dropdown-item command="addMember">添加成员</el-dropdown-item>
                    <el-dropdown-item command="manageMember">成员管理</el-dropdown-item>
                    <el-dropdown-item command="editAvatar" divided>编辑频道头像</el-dropdown-item>
                    <el-dropdown-item command="editTitle" divided>编辑群公告</el-dropdown-item>
                    <el-dropdown-item command="editName">重命名频道</el-dropdown-item>
                    <el-dropdown-item command="remove" v-if="myId === userChannel.creatorId">删除频道</el-dropdown-item>
                  </template>
                  <!--<template v-else>-->
                  <!--&lt;!&ndash; <el-dropdown-item command="editTitle">编辑群用途</el-dropdown-item> &ndash;&gt;-->
                  <!--</template>-->
                  <el-dropdown-item command="leave" v-if="myId !== userChannel.creatorId">离开频道</el-dropdown-item>
                </template>
                <!-- <template v-else>
                  <el-dropdown-item command="editTitle">编辑个人聊天标题</el-dropdown-item>
                </template>-->
              </el-dropdown-menu>
            </el-dropdown>
            <div v-if="userChannel.channelType === 'P'">
              <status-online-icon
                v-if="userChannel.toUserOnlineStatus === 'online'"
                :text="userChannel.channelName === userChannel.channelDisplayName ? '在线' : '在线'"
              ></status-online-icon>
              <status-away-icon v-else-if="userChannel.toUserOnlineStatus === 'away'" text="离开"></status-away-icon>
              <status-offline-icon v-else="userChannel.toUserOnlineStatus === 'offline'" text="离线"></status-offline-icon>
              <span style="line-height: 28px;margin-left: 5px;font-size:16px;">{{userChannel.toUserSignature}}</span>
            </div>
          </div>
        </span>
        <edit-channel-avatar
          ref="editChannelAvatarDlg"
          @onEditAvatarFinished="onEditAvatarFinished"
        ></edit-channel-avatar>
        <edit-channel-title ref="editChannelTitleDlg" @onEditTitleFinished="onEditTitleFinished"></edit-channel-title>
        <edit-channel-name ref="editChannelNameDlg" @onEditNameFinished="onEditNameFinished"></edit-channel-name>
        <add-member
          ref="addChannelMemberDlg"
          :channel-id="userChannel.channelId"
          :channel-name="userChannel.channelName"
        ></add-member>
        <qrcode ref="doShowQRcodeDlg" :channel="userChannel" ></qrcode>
        <member-list
          ref="memberListDlg"
          :channel-id="userChannel.channelId"
          :channel-name="userChannel.channelName"
        ></member-list>
        <member-management
          ref="memberManagementDlg"
          :channel-id="userChannel.channelId"
          :channel-name="userChannel.channelName"
          @onOpenAddMemberDlg="doOpenAddMemberDlg"
        ></member-management>

       

        <div
          v-if="userChannel.channelType === 'G' && isAdmin"
          class="members-container"
          @click="showMemberList"
        >
          <div class="members" style="float:right;">
            <div>{{ userChannel.memberCount }}</div>
            <svg width="14px" height="14px" viewBox="0 0 16 16">
              <g id="Symbols" stroke="none" stroke-width="1" fill="inherit" fill-rule="evenodd">
                <g
                  id="Channel-Header/Web-HD"
                  transform="translate(-725.000000, -32.000000)"
                  fill-rule="nonzero"
                  fill="inherit"
                >
                  <g id="Channel-Header">
                    <g id="user-count" transform="translate(676.000000, 22.000000)">
                      <path
                        d="M64.9481342,24 C64.6981342,20.955 63.2551342,19.076 60.6731342,18.354 C61.4831342,17.466 61.9881342,16.296 61.9881342,15 C61.9881342,12.238 59.7501342,10 56.9881342,10 C54.2261342,10 51.9881342,12.238 51.9881342,15 C51.9881342,16.297 52.4941342,17.467 53.3031342,18.354 C50.7221342,19.076 49.2771342,20.955 49.0271342,24 C49.0161342,24.146 49.0061342,24.577 49.0001342,25.001 C48.9911342,25.553 49.4361342,26 49.9881342,26 L63.9881342,26 C64.5411342,26 64.9851342,25.553 64.9761342,25.001 C64.9701342,24.577 64.9601342,24.146 64.9481342,24 Z M56.9881342,12 C58.6421342,12 59.9881342,13.346 59.9881342,15 C59.9881342,16.654 58.6421342,18 56.9881342,18 C55.3341342,18 53.9881342,16.654 53.9881342,15 C53.9881342,13.346 55.3341342,12 56.9881342,12 Z M51.0321342,24 C51.2981342,21.174 52.7911342,20 55.9881342,20 L57.9881342,20 C61.1851342,20 62.6781342,21.174 62.9441342,24 L51.0321342,24 Z"
                        id="User_4_x2C__Profile_5-Copy-9"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
        <template v-if="userChannel.channelType === 'G'">
          <el-button v-if="selectChat.length"
            style="float:right;margin-right:10px;margin-top:10px;"
            type="danger"
            size="mini"
            @click="doForward()"
          >转发</el-button>
          <el-button
            style="float:right;margin-right:10px;margin-top:10px;"
            v-if="myId === userChannel.creatorId"
            type="danger"
            size="mini"
            @click="doDeleteMsgConfirm()"
          >清除历史消息</el-button>
          <el-button
            style="float:right;margin-right:10px;margin-top:10px;"
            v-if="myId === userChannel.creatorId && !userChannel.allForbid"
            type="danger"
            size="mini"
            @click="doAllFribid(true)"
          >全员禁言</el-button>
          <el-button
            style="float:right;margin-right:10px;margin-top:10px;"
            v-if="myId === userChannel.creatorId && userChannel.allForbid"
            type="danger"
            size="mini"
            @click="doAllFribid(false)"
          >解除全员禁言</el-button>
        </template>
        <template v-if="userChannel.channelType === 'P'">
          <el-button v-if="selectChat.length"
            style="float:right;margin-right:10px;margin-top:10px;"
            type="danger"
            size="mini"
             @click="doForward()"
          >转发</el-button>
          <el-button
            style="float:right;margin-right:10px;margin-top:10px;"
            v-if="isManage(myId)"
            type="danger"
            size="mini"
            @click="doDeleteMsgConfirm()"
          >清除历史消息</el-button>
          <el-button
            style="float:right;margin-right:10px;margin-top:10px;"
            v-if="isManage(myId)"
            type="danger"
            size="mini"
            @click="addMark()"
          >备注</el-button>
          <el-button
            style="float:right;margin-top:10px;"
            v-if="isManage(myId) && !userChannel.allForbid"
            type="danger"
            size="mini"
            @click="doForbidMember(true)"
          >禁言</el-button>

          <el-button
            style="float:right;margin-top:10px;"
            v-if="isManage(myId) && userChannel.allForbid"
            type="danger"
            size="mini"
            @click="doForbidMember(false)"
          >解除禁言</el-button>

          <!-- 修改用户名手机号码 -->
          <el-dialog :visible.sync="editUserMark" :modal-append-to-body="false" width="400px">
            <div slot="title" class="dialog-header">
              <h3>{{userChannel.channelDisplayName}}&nbsp;-&nbsp;备注修改</h3>
            </div>
            <el-form ref="form" :model="form" label-width="80px">
              <el-form-item label="姓名">
                <el-input style="width:200px;" v-model="aliasName"></el-input>
              </el-form-item>
              <el-form-item label="银行卡">
                <el-input style="width:200px;" v-model="bankCard"></el-input>
              </el-form-item>
              <el-form-item label="手机号">
                <el-input style="width:200px;" v-model="phone"></el-input>
              </el-form-item>
              <el-form-item label="微信">
                <el-input style="width:200px;" v-model="weChat"></el-input>
              </el-form-item>
              <el-form-item label="QQ">
                <el-input style="width:200px;" v-model="qq"></el-input>
              </el-form-item>
              <el-form-item label="二级密码">
                <el-input type="password" style="width:200px;" v-model="secondaryPwd" placeholder="输入查看完整备注信息"></el-input>
                <el-button @click="addMark">确定</el-button>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button size="small" @click="submitInfo">修改</el-button>
              <el-button size="small" @click="editUserMark=false">关闭</el-button>
            </span>
          </el-dialog>


        </template>
      </div>
    </div>
    <el-row v-if="userChannel.purpose">
      <el-col :span="24" class="pmd">
        <div style="width: 20px;float: left;position:relative;z-index:2;background-color:#fff;"><i style="color: red;" class="el-icon-message-solid"></i></div>
        <div class="content" style="margin-left: 20px">
          <span class="con"></span>
        </div>
      </el-col>
    </el-row>

    <div class="body-container" v-if="$store.getters.imClient">
      <div class="body">
        <message-list v-if="showMessageList"
          ref="messageList"
          :channel-id="userChannel.channelId"
          :user-channel="userChannel"
        ></message-list>
      </div>
    </div>
    <div class="footer">
      <send-message
        :channel-id="userChannel.channelId"
        :user-channel="userChannel"
        :channel-type="userChannel.channelType"
        @onMessageSent="showSentMessage"
      ></send-message>
    </div>
    <!--清除历史消息二级密码确认-->
    <el-dialog :visible.sync="deleteHisConfirm" :modal-append-to-body="false" width="400px">
      <div slot="title" class="dialog-header">
        <h3>{{userChannel.channelDisplayName}}&nbsp;-&nbsp;清除历史消息</h3>
      </div>
      <el-form ref="deleteHisForm" label-width="80px">
        <el-form-item label="二级密码" >
          <el-input type="password" style="width:200px;" v-model="secondaryPwd"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
              <el-button size="small" @click="doDeleteMsg">清除历史消息</el-button>
              <el-button size="small" @click="deleteHisConfirm=false">关闭</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
import { outputError } from "@/utils/exception";
import {
  getUserChannel,
  isAdmin,
  leaveChannel,
  removeChannel,
  allForbid,
  deleteMsg,
  getMemberInfo,
  memberInfo,
  forbidMember
} from "@/api/channel";
import StatusOnlineIcon from "@/components/svg/statusOnlineIcon";
import StatusOfflineIcon from "@/components/svg/statusOfflineIcon";
import StatusAwayIcon from "@/components/svg/statusAwayIcon";
import MessageList from "../message/messageList";
import SendMessage from "../message/sendMessage";
import qrcode from "@/components/channel/qrcode";
import { setTimeout } from 'timers';

export default {
  data() {
    return {
      selectChat:[],
      loadingVisible: false,
      userChannel: {},
      sentMessage: null,
      isAdmin: false,
      editUserMark: false,
      aliasName: "",
      phone: "",
      bankCard: "",
      weChat: "",
      qq: "",
      secondaryPwd: "",
        deleteHisConfirm: false,
        oldInfo:{
            aliasName:"",
            phone:"",
            bankCard:"",
            weChat:"",
            qq:"",
        },
      showMessageList: true,
        deleteHisRules: {
            secondaryPwd: [
                { required: true, message: '请输入二级密码', trigger: 'blur' }
            ]
        },
      myId: JSON.parse(sessionStorage.getItem("currentUser")).id
    };
  },
  computed: {
    superAdmin(){
      return (JSON.parse(sessionStorage.getItem('currentUser')).origin == 'sys' || JSON.parse(sessionStorage.getItem('currentUser')).origin == 'pc') ? true:false;
    },
  },
  methods: {
    isManage(id) {
      var manage = this.userChannel.adminIds || [];
      for (var i = 0; i < manage.length; i++) {
        if (id == manage[i]) {
          return true;
        }
      }
      return false;
    },
      doDeleteMsgConfirm(){
        this.deleteHisConfirm = true;
      },
    doDeleteMsg() {
        if(!this.userChannel.toUserId){
            this.userChannel.toUserId = ""
        }
        if(this.secondaryPwd == ""){
            this.$message({
                showClose: true,
                message: "请输入二级密码",
                type: "info"
            });
            return;
        }
      deleteMsg(this.userChannel.channelId,this.userChannel.toUserId,this.secondaryPwd).then(response => {
          if(response.data > 0){
              this.secondaryPwd = "";
              this.deleteHisConfirm = false;
              this.$refs.messageList.deleteMsg();
              this.$message({
                  showClose: true,
                  message: "删除历史消息成功！",
                  type: "info"
              });
          }else{
              outputError(this, { message: '清除历史消息失败，请确认原二级密码是否正确！' })
          }
      }).catch((error)=>{
          this.secondaryPwd = "";
          this.$message({
              showClose: true,
              message: "清除历史消息失败，请确认原二级密码是否正确！",
              type: "error"
          });
      })
    },
    doAllFribid(isForbid) {
      allForbid(this.userChannel.channelId, isForbid).then(response => {
        this.userChannel.allForbid = isForbid;
      });
    },
    doForbidMember(isForbid) {
      forbidMember(this.userChannel.channelId, this.userChannel.toUserId,isForbid).then(response => {
        this.userChannel.allForbid = isForbid;
      });
    },
    showSentMessage(message) {
      this.$refs.messageList.showSentMessage(message);
    },
    initPage() {
      if (this.$route.params.channelId === undefined) {
        return;
      }

      this.loadingVisible = true;
      const channelId = this.$route.params.channelId;
      this.$store.dispatch("setCurrentChannelId", channelId);
      this.initIMClient();
      this.$forceUpdate();
      getUserChannel(this.myId, channelId)
        .then(response => {
          this.userChannel = response.data;
          this.$nextTick(() => {
            if(this.userChannel.purpose){
                this.pmd()
            }
          })
          this.$forceUpdate();
          if (
            this.userChannel.avatarUrl &&
            this.userChannel.channelType == "G"
          ) {
            this.userChannel.avatarUrl =
              window.gconfig.BASE_API +
              "/channels/" +
              this.userChannel.channelId +
              "/avatar?width=80&height=80&rdm="
          } else if (
            this.userChannel.toUserAvatarUrl &&
            this.userChannel.channelType == "P"
          ) {
            this.userChannel.avatarUrl =
              window.gconfig.BASE_API +
              "/users/" +
              this.userChannel.toUserId +
              "/avatar?width=80&height=80&rdm="
          }
          if (this.userChannel.channelType === "G") {
            isAdmin(channelId)
              .then(response => {
                this.isAdmin = response.data;
                this.loadingVisible = false;
              })
              .catch(error => {
                this.loadingVisible = false;
                outputError(this, error);
              });
          } else {
            this.loadingVisible = false;
          }
        })
        .catch(error => {
          this.loadingVisible = false;
          outputError(this, error);
        });
    },
    onMembersCountChanged(message) {
      if (this.$route.params.channelId === message.channelId) {
        this.userChannel.memberCount += message.count;
      }
    },
    initIMClient() {
      let st = setTimeout(() => {
        let imClient = this.$store.getters.imClient;
        if (imClient != null) {
          imClient.bindMembersCountChanged(this.onMembersCountChanged);
          clearTimeout(st);
        }
      }, 500);
    },
    submitInfo() {
        var info = {
            aliasName:null,
            phone:null,
            bankCard:null,
            weChat:null,
            qq:null,
        };
        if(this.aliasName != this.oldInfo.aliasName){
            info.aliasName = this.aliasName
        }
        if(this.phone != this.oldInfo.phone){
            info.phone = this.phone
        }
        if(this.bankCard != this.oldInfo.bankCard){
            info.bankCard = this.bankCard
        }
        if(this.weChat != this.oldInfo.weChat){
            info.weChat = this.weChat
        }
        if(this.qq != this.oldInfo.qq){
            info.qq = this.qq
        }
        var flag = true;
        for(var key in info){
            if(info[key] != null){
                flag = false;
            }
        }
        if(flag){
            this.editUserMark = false;
            return;
        }
        info.memberId = this.userChannel.toUserId,
      memberInfo(this.userChannel.channelId, info).then(response => {
          if(response.data > 0){
              this.editUserMark = false;
              this.userChannel.channelAliasName = this.aliasName;
              this.$message({
                  showClose: true,
                  message: "用户信息修改成功",
                  type: "success"
              });
              //更新聊天列表
              this.$refs.messageList.updateAliasName(this.aliasName)
              //更新list
              // TODO
              this.$root.Event.$emit("updateAliasName",this.userChannel.toUserId, this.aliasName);
          }else{
              this.$message({
                  showClose: true,
                  message: "用户信息修改出错",
                  type: "error"
              });
          }

      });
    },
    addMark() {
      this.editUserMark = true;
      getMemberInfo(this.userChannel.channelId, this.userChannel.toUserId,this.secondaryPwd).then(
        response => {
          if (response) {
            this.aliasName = response.data.aliasName;
            this.phone = response.data.phone;
            this.bankCard = response.data.bankCard;
            this.weChat = response.data.weChat;
            this.qq = response.data.qq;
            this.secondaryPwd = '';
            this.oldInfo.aliasName = this.aliasName;
            this.oldInfo.phone = this.phone;
            this.oldInfo.bankCard = this.bankCard;
            this.oldInfo.weChat = this.weChat;
            this.oldInfo.qq = this.qq;
          }
        }
      );
    },
    doForward(){
      this.$root.Event.$emit("openforwordDialog", this.userChannel,this.selectChat);
    },
    handleCommand(command) {
      switch (command) {
        case "addMember":
          this.$refs.addChannelMemberDlg.$emit("openDialog", this.userChannel);
          break;
        case "editAvatar":
          this.$refs.editChannelAvatarDlg.$emit("openDialog", this.userChannel);
          break;
        case "editTitle":
          this.$refs.editChannelTitleDlg.$emit("openDialog", this.userChannel);
          break;
        case "editName":
          this.$refs.editChannelNameDlg.$emit("openDialog", this.userChannel);
          break;
        case "manageMember":
          this.$refs.memberManagementDlg.$emit("openDialog", this.userChannel);
          break;
        case "leave":
          this.doLeaveChannel(this.userChannel);
          break;
        case "remove":
          this.doRemoveChannel(this.userChannel.channelId);
          break;
        case "showQRcode":
          this.doShowQRcode(this.userChannel);
          break;
      }
    },
    doOpenAddMemberDlg() {
      this.$refs.addChannelMemberDlg.$emit("openDialog", this.userChannel);
    },
    doShowQRcode() {
      this.$refs.doShowQRcodeDlg.$emit("openDialog", this.userChannel);
    },
    doLeaveChannel(userChannel) {
      this.$confirm("确定离开该频道吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(_ => {
          this.loadingVisible = true;
          let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
          leaveChannel(
            userChannel.channelId,
            currentUser.id,
            currentUser.nickname
          )
            .then(_ => {
              if (this.$route.params.leaveChannelCallback !== undefined) {
                this.$route.params.leaveChannelCallback(userChannel.channelId);
              }
              this.loadingVisible = false;
            })
            .catch(error => {
              this.loadingVisible = false;
              outputError(this, error);
            });
        })
        .catch(_ => {});
    },
    doRemoveChannel(channelId) {
      this.$confirm(
        "确定删除该频道吗？删除后将无法浏览该频道的任何消息！",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(_ => {
          this.loadingVisible = true;
          let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
          removeChannel(channelId, currentUser.id)
            .then(response => {
              if (
                response.data > 0 &&
                this.$route.params.removeChannelCallback !== undefined
              ) {
                this.$route.params.removeChannelCallback(channelId);
              }
              this.loadingVisible = false;
            })
            .catch(error => {
              this.loadingVisible = false;
              outputError(this, error);
            });
        })
        .catch(_ => {});
    },
    onEditTitleFinished(newTitle) {
      this.userChannel.purpose = newTitle;
    },
    onEditAvatarFinished(avatarUrl) {
      if (avatarUrl) {
        this.userChannel.avatarUrl =
          window.gconfig.BASE_API +
          "/channels/" +
          this.userChannel.channelId +
          "/avatar?width=80&height=80&rdm="
      }
    },
    onEditNameFinished(newName) {
      this.userChannel.channelName = newName;
    },
    showMemberList() {
      this.$refs.memberListDlg.$emit("openDialog");
    },
    pmd(){
      $(".pmd").css("width",$(".el-container").width()-250)
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
    }
  },
  created() {
    this.$root.Event.$on('selectChat',(data)=>{
      this.selectChat = data;
    });
    this.initPage();
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
    $route: "initPage",
    "userChannel.channelId": function(){
      $(".pmd .con").stop(true)
      this.$forceUpdate();
    },
  },
  components: {
    StatusOnlineIcon,
    StatusOfflineIcon,
    StatusAwayIcon,
    MessageList,
    SendMessage,
    EditChannelAvatar: resolve =>
      require(["@/components/userChannel/editChannelAvatar"], resolve),
    EditChannelTitle: resolve =>
      require(["@/components/userChannel/editChannelTitle"], resolve),
    EditChannelName: resolve =>
      require(["@/components/channel/editChannelName"], resolve),
    AddMember: resolve => require(["@/components/channel/addMember"], resolve),
    MemberList: resolve =>
      require(["@/components/channel/memberList"], resolve),
    MemberManagement: resolve =>
      require(["@/components/channel/manageMember"], resolve),
    
    qrcode: resolve => require(["@/components/channel/qrcode"], resolve)
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  background: #fff;
  height: 100%;
  // width: 100%;
  position: relative;

  .header {
    -webkit-flex: 0 0 69px;
    flex: 0 0 69px;
    border-bottom: 1px solid;
    font-size: 14px;
    position: relative;
    width: 100%;
    z-index: 9;
    border-bottom: solid 1px #dbd9d6;

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
          color: #418fd6;
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
            color: #b7b3ad;
          }
          svg {
            width: 16px;
            height: 16px;
            margin-top: 1px;
            fill: #b7b3ad;
          }
        }
        .members:hover {
          cursor: pointer;
          border: 1px solid #319edd;
          div {
            color: #319edd;
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
    height: 180px;
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

