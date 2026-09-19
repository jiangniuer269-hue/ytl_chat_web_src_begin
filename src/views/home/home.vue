<template>
  <el-container class="body-container">
    <div class="sidebar">
      <div class="header">
        <span id="status-dropdown">
          <div class="avatar status-selector">
            <img v-if="realAvatarUrl" :src="realAvatarUrl">
            <span v-else>{{ userInfo.firstLetterOfName }}</span>
            <span class="status">
              <div class="icon-container">
                <status-online-avatar v-if="onlineStatus === 'online'"></status-online-avatar>
                <status-away-avatar v-else-if="onlineStatus === 'away'"></status-away-avatar>
                <status-offline-avatar v-else-if="onlineStatus === 'offline'"></status-offline-avatar>
                <status-dnd-avatar v-else="onlineStatus === 'dnd'"></status-dnd-avatar>
              </div>
            </span>
            <div class="status-edit">
              <el-dropdown trigger="click" @command="handleOnlineStatus">
                <span>
                  <svg t="1525682970585" viewBox="0 0 1024 1024" version="1.1" p-id="1166" width="13" height="13"><path d="M180.177 258.603c-32.209 0-49.892 39.532-29.407 65.799l316.399 405.35c23.526 30.156 67.296 30.156 90.824 0l316.079-405.394c20.485-26.227 2.8-65.757-29.408-65.757l-664.487 0z" p-id="1167" fill="#111111"></path></svg>
                </span>
                <el-dropdown-menu slot="dropdown" style="margin-top: -15px;">
                  <el-dropdown-item command="online">在线</el-dropdown-item>
                  <el-dropdown-item command="away">离开</el-dropdown-item>
                  <el-dropdown-item command="dnd">
                    <div>请勿打扰</div>
                    <div class="status-tooltip">停用推送通知</div>
                  </el-dropdown-item>
                  <el-dropdown-item command="offline">离线</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </span>
        <h4 class="nickname" :title="userInfo.nickname">{{ userInfo.nickname }}</h4>
        <a class="dropdown-icon" title="主菜单">
          <el-dropdown trigger="click" @command="handleCommand">
            <span>
              <svg width="16px" height="10px" viewBox="0 0 16 10" version="1.1"><g stroke="none" stroke-width="1" fill="inherit" fill-rule="evenodd"><g transform="translate(-188.000000, -38.000000)" fill-rule="nonzero" fill="inherit"><g><g><g transform="translate(188.000000, 38.000000)"><path d="M15.5,0 C15.776,0 16,0.224 16,0.5 L16,1.5 C16,1.776 15.776,2 15.5,2 L0.5,2 C0.224,2 0,1.776 0,1.5 L0,0.5 C0,0.224 0.224,0 0.5,0 L15.5,0 Z M15.5,4 C15.776,4 16,4.224 16,4.5 L16,5.5 C16,5.776 15.776,6 15.5,6 L0.5,6 C0.224,6 0,5.776 0,5.5 L0,4.5 C0,4.224 0.224,4 0.5,4 L15.5,4 Z M15.5,8 C15.776,8 16,8.224 16,8.5 L16,9.5 C16,9.776 15.776,10 15.5,10 L0.5,10 C0.224,10 0,9.776 0,9.5 L0,8.5 C0,8.224 0.224,8 0.5,8 L15.5,8 Z"></path></g></g></g></g></g></svg>
            </span>
            <el-dropdown-menu slot="dropdown">
              <!--<el-dropdown-item command="addUser" v-if="superAdmin">添加账号</el-dropdown-item>-->
              <el-dropdown-item v-if="superAdmin"><router-link target="_blank" :to="{path:'/manageUser'}">用户管理</router-link></el-dropdown-item>
              <el-dropdown-item v-if="superAdmin"><router-link target="_blank" :to="{path:'/manageDomain'}">域名管理</router-link></el-dropdown-item>
              <el-dropdown-item  v-if="superAdmin"><router-link target="_blank" :to="{path:'/manageUserLogs'}">系统日志</router-link></el-dropdown-item>

              <el-dropdown-item command="editPersonalInfo">账号设置</el-dropdown-item>
              <el-dropdown-item command="persionQrcode">个人二维码</el-dropdown-item>
              <el-dropdown-item command="exportMemberInfo">导出好友资料</el-dropdown-item>
              <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
              <el-dropdown-item command="changeSecPassword">修改二级密码</el-dropdown-item>
              <el-dropdown-item command="logout" divided>注销登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </a>
        <persion-qrcode :user-info="userInfo"  ref="persionQrcodeDlg"></persion-qrcode>
        <edit-personal-info ref="editPersonalInfoDlg"></edit-personal-info>
        <export-member-info ref="exportMemberInfo"></export-member-info>
        <change-password ref="changePasswordDlg"></change-password>
        <change-secpassword ref="changeSecPasswordDlg"></change-secpassword>
        <register-user ref="registerUser" @onRegisterSuccessed="onRegisterSuccessed"></register-user>
      </div>
<!--      <div class="channel-search-container">-->
<!--        <a :href="GUIDE.link" target="_blank" style="color: #fff;text-decoration: underline;">{{GUIDE.text}}</a>-->
<!--      </div>-->
      <div class="channel-search-container">
        <div class="search"><input type="text" placeholder="搜索" v-model="searchKey" @keyup="onSearchInputKeyUp"><i class="el-icon-search" @click="doSearchChannel"></i></div>
      </div>
      <div class="channel-container ppgroupp" v-bind:style="{height: channelListHeight}">
        <ul class="nav-channel first-nav-channel">
          <li class="channel-header">
            <audio id="chat-audio" src="../static/images/voice/msg.wav" display="none"></audio>
            <span>消息提示音</span>
            <input type="hidden" id="voicevalue" v-model="voicevalue">
            <el-switch
              v-model="voicevalue"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
            <el-slider style="float:right;width:80px;margin-right: 10px;" v-model="voiceLevel"></el-slider>
          </li>
          <li class="channel-header">
            <el-form>
            <el-form-item label="加载好友数量" label-width="150" style="color: #fff;">
              <el-select @change="changeMemberLimit" style="width: 120px;" size="mini" v-model="memberLimit" placeholder="请选择">
                <el-option
                  v-for="item in memberLimitOpt"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            </el-form>
          </li>
        </ul>

        <el-tabs type="border-card">
          <el-tab-pane>
            <span slot="label">群聊<el-badge class="mark" :value="userChannelList | userChannelListG" /></span>
            <ul class="nav-channel first-nav-channel">
              <li class="channel-header">
                <span>群聊</span>
                <button class="add-channel-btn" title="创建群聊" @click="openCreateGroupChannelDlg">+</button>

              </li>
              <li class="channel-item" v-for="(item, index) in this.userChannelList" v-if="item.channelType == 'G'" :key="item.channelId" :class="{'channel-item channel-item-active' : selectedChannelId === item.channelId}" @click="selectChannel(item, index)">
                <router-link :to="{ name: 'messageDialog', params: { channelId: item.channelId, channelType: item.channelType, leaveChannelCallback: leaveChannelCallback, removeChannelCallback: removeChannelCallback }}">
                  <a href="#">
                    <div class="status">
                      <!--<group-icon :selected="selectedChannelId === item.channelId"></group-icon>-->
                      <img
                        style="float: left;width: 40px;height:40px;"
                        v-if="item.avatarUrl"
                        :src="item | avatarG"
                        class="avatar"
                      />
                    </div>
                    <div :title="item.channelName" :class="{'channel-item-name channel-item-name-selected' : selectedChannelId === item.channelId, 'channel-item-name': item.avatarUrl !== item.channelId,'marginleft0': !item.avatarUrl}">{{ item.channelName }}</div>
                    <div :class="{'unread-message-count': item.unreadMessageCount > 0, 'unread-message-count-hide': item.unreadMessageCount == 0}">{{ item.unreadMessageCount > 0 ? item.unreadMessageCount : "" }}</div>
                  </a>
                </router-link>
                <p class="channel-item2" :class="{'marginleft0': !item.avatarUrl}">{{item.lastMessage | trasMsg}}</p>
              </li>
            </ul>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">私聊<el-badge class="mark" :value="userChannelList | userChannelListP" /></span>
            <ul class="nav-channel">
              <li class="channel-header">
                <span>私聊</span>({{userChannelList | privateChannelOnline}}/{{userChannelList | privateChannel}})
                <span @click="sortGroup" style="margin-left:5px;color: red;cursor: pointer;font-size:14px;">[分组]</span>
                <span @click="sendPurpose" style="margin-left:5px;color: red;cursor: pointer;font-size:14px;">[公告]</span>
                <span @click="sendMessageToAll" style="margin-left:5px;color: red;cursor: pointer;font-size:14px;">[群发]</span>

                <!-- <button class="add-channel-btn" title="创建私聊" @click="openCreatePrivateChannelDlg">+</button> -->
                <create-private-channel ref="createPrivateChanneDlg" @onChannelCreated="onPrivateChannelCreated"></create-private-channel>
              </li>

            </ul>
            <ul class="nav-channel">
              <li  class="channel-item userChannelP" v-for="(item, index) in userChannelList" v-if="item.channelType == 'P' && item.zhiding" :key="item.channelId" :class="{'channel-item channel-item-active' : selectedChannelId === item.channelId}" @click="selectChannel(item, index)">

                <div v-if="item.zhiding" style="position:absolute;right:0px;top:0px;height:32px;width:32px;z-index:3">
                  <img src="../../assets/images/zdbs.png" style="position: absolute;
    cursor: pointer;
    width: 32p;
    width: 32px;
    height: 32px;
    right: -9px;
    top: -9px;">
                </div>

                <div v-if="item.zhiding" @click="qxzhiding(item)" class="zhiding" style="position:absolute;right:0px;top:0px;bottom:0px;width:32px;display:none;z-index:3">
                  <img src="../../assets/images/qxzd.png" style="margin-top:14px;cursor:pointer;">
                </div>

                <router-link :to="{ name: 'messageDialog', params: { channelId: item.channelId, channelType: item.channelType }}">
                  <div class="has-close">
                    <div class="status status1" :class="{'status2': !item.toUserAvatarUrl}">
                      <img
                        style="float: left;width: 40px;height:40px;"
                        v-if="item.toUserAvatarUrl"
                        :src="item | avatarP"
                        class="avatar"
                      />
                    </div>
                    <div :title="item.channelAliasName || item.channelDisplayName " :class="{'channel-item-name channel-item-name-selected' : selectedChannelId === item.channelId, 'channel-item-name': selectedChannelId !== item.channelId,'marginleft1': !item.toUserAvatarUrl}">
                      <status-online-icon v-if="item.toUserOnlineStatus === 'online'"></status-online-icon>
                      <status-away-icon v-else-if="item.toUserOnlineStatus === 'away'"></status-away-icon>
                      <status-offline-icon v-else-if="item.toUserOnlineStatus === 'offline'"></status-offline-icon>
                      <status-dnd-icon v-else="item.toUserOnlineStatus === 'dnd'"></status-dnd-icon>
                      <span v-if="item.allForbid" style="color: red;">[禁言]</span>{{ item.channelAliasName || item.channelName }}</div>
                    <div :class="{'unread-message-count': item.unreadMessageCount > 0, 'unread-message-count-hide': item.unreadMessageCount == 0}">{{ item.unreadMessageCount > 0 ? item.unreadMessageCount : "" }}</div>
                    <!-- <span class="btn-close" @click="doHideChannel(item.channelId)">×</span> -->
                  </div>
                </router-link>
                <p class="channel-item2" :class="{'marginleft1': !item.toUserAvatarUrl}">{{item.lastMessage | trasMsg}}</p>
              </li>

              <li  class="channel-item userChannelP" v-for="(item, index) in userChannelList" v-if="item.channelType == 'P' && !item.zhiding" :key="item.channelId" :class="{'channel-item channel-item-active' : selectedChannelId === item.channelId}" @click="selectChannel(item, index)">
                
                 <div  v-if="!item.zhiding" @click="zhiding(item)" class="zhiding" style="position:absolute;right:0px;top:0px;bottom:0px;width:32px;display:none;z-index:3">
                  <img src="../../assets/images/zhiding.png" style="margin-top:14px;cursor:pointer;">
                </div>

                <router-link :to="{ name: 'messageDialog', params: { channelId: item.channelId, channelType: item.channelType }}">
                  <div class="has-close">
                    <div class="status status1" :class="{'status2': !item.toUserAvatarUrl}">
                      <img
                        style="float: left;width: 40px;height:40px;"
                        v-if="item.toUserAvatarUrl"
                        :src="item | avatarP"
                        class="avatar"
                      />
                    </div>
                    <div :title="item.channelAliasName || item.channelDisplayName " :class="{'channel-item-name channel-item-name-selected' : selectedChannelId === item.channelId, 'channel-item-name': selectedChannelId !== item.channelId,'marginleft1': !item.toUserAvatarUrl}">
                      <status-online-icon v-if="item.toUserOnlineStatus === 'online'"></status-online-icon>
                      <status-away-icon v-else-if="item.toUserOnlineStatus === 'away'"></status-away-icon>
                      <status-offline-icon v-else-if="item.toUserOnlineStatus === 'offline'"></status-offline-icon>
                      <status-dnd-icon v-else="item.toUserOnlineStatus === 'dnd'"></status-dnd-icon>
                      <span v-if="item.allForbid" style="color: red;">[禁言]</span>{{ item.channelAliasName || item.channelName }}</div>
                    <div :class="{'unread-message-count': item.unreadMessageCount > 0, 'unread-message-count-hide': item.unreadMessageCount == 0}">{{ item.unreadMessageCount > 0 ? item.unreadMessageCount : "" }}</div>
                    <!-- <span class="btn-close" @click="doHideChannel(item.channelId)">×</span> -->
                  </div>
                </router-link>
                <p class="channel-item2" :class="{'marginleft1': !item.toUserAvatarUrl}">{{item.lastMessage | trasMsg}}</p>
              </li>
            </ul>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">分组</span>
            <ul class="nav-channel">
              <li class="channel-header">
                <span>私聊</span>({{userChannelList | privateChannelOnline}}/{{userChannelList | privateChannel}})
                <span @click="sortGroup" style="margin-left:5px;color: red;cursor: pointer;font-size:14px;">[分组]</span>
                <span @click="sendPurpose" style="margin-left:5px;color: red;cursor: pointer;font-size:14px;">[公告]</span>
                <span @click="sendMessageToAll" style="margin-left:5px;color: red;cursor: pointer;font-size:14px;">[群发]</span>

                <!-- <button class="add-channel-btn" title="创建私聊" @click="openCreatePrivateChannelDlg">+</button> -->
                <create-private-channel ref="createPrivateChanneDlg" @onChannelCreated="onPrivateChannelCreated"></create-private-channel>
              </li>

            </ul>
                <el-collapse>
                  <el-collapse-item v-for="(pGroupItem,index) in pGroup" :key="index" :title="pGroupItem.name" :name="index">
                    <ul class="nav-channel">
                      <li class="channel-item" v-for="(item, index) in pGroupItem.channelList" v-if="item.channelType == 'P'" :key="item.channelId" :class="{'channel-item channel-item-active' : selectedChannelId === item.channelId}" @click="selectChannel(item, index)">
                        <router-link :to="{ name: 'messageDialog', params: { channelId: item.channelId, channelType: item.channelType }}">
                          <div class="has-close">
                            <div class="status status1" :class="{'status2': !item.toUserAvatarUrl}">
                              <img
                                style="float: left;width: 40px;height:40px;"
                                v-if="item.toUserAvatarUrl"
                                :src="item | avatarP"
                                class="avatar"
                              />
                            </div>
                            <div :title="item.channelAliasName || item.channelDisplayName " :class="{'channel-item-name channel-item-name-selected' : selectedChannelId === item.channelId, 'channel-item-name': selectedChannelId !== item.channelId,'marginleft1': !item.toUserAvatarUrl}">
                              <status-online-icon v-if="item.toUserOnlineStatus === 'online'"></status-online-icon>
                              <status-away-icon v-else-if="item.toUserOnlineStatus === 'away'"></status-away-icon>
                              <status-offline-icon v-else-if="item.toUserOnlineStatus === 'offline'"></status-offline-icon>
                              <status-dnd-icon v-else="item.toUserOnlineStatus === 'dnd'"></status-dnd-icon>
                              <span v-if="item.allForbid" style="color: red;">[禁言]</span>{{ item.channelAliasName || item.channelName }}</div>
<!--                            <div :class="{'unread-message-count': item.unreadMessageCount > 0, 'unread-message-count-hide': item.unreadMessageCount == 0}">{{ item.unreadMessageCount > 0 ? item.unreadMessageCount : "" }}</div>-->
                            <!-- <span class="btn-close" @click="doHideChannel(item.channelId)">×</span> -->
                          </div>
                        </router-link>
                        <p class="channel-item2" :class="{'marginleft1': !item.toUserAvatarUrl}">{{item.lastMessage | trasMsg}}</p>
                      </li>
                    </ul>
                  </el-collapse-item>
                </el-collapse>


          </el-tab-pane>
        </el-tabs>



      </div>
    </div>
    <create-group-channel ref="createGroupChanneDlg" @onChannelCreated="onGroupChannelCreated"></create-group-channel>
    <div class="content">
      <transition>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </transition>
    </div>
     <forword-management
        ref="forwordManagementDlg"
        :userChannelList="userChannelList"
      ></forword-management>

    <send-message-all ref="sendMessageAll" ></send-message-all>
    <sort-group :user-info="userInfo" :p-group="pGroup" ref="sortGroup" ></sort-group>
    <send-purpose :user-info="userInfo" ref="sendPurpose"></send-purpose>
  </el-container>
</template>

<script>
import { outputError } from '@/utils/exception'
import { IMClient } from '@/client/im_client'
import { listUserChannels,listGroup, getUserChannel, hideChannel, searchUserChannel } from '@/api/channel'
import { updateOnlineStatus } from '@/api/user'
import GroupIcon from '@/components/svg/groupIcon'
import StatusOnlineIcon from '@/components/svg/statusOnlineIcon'
import StatusOfflineIcon from '@/components/svg/statusOfflineIcon'
import StatusAwayIcon from '@/components/svg/statusAwayIcon'
import StatusDndIcon from '@/components/svg/statusDndIcon'
import StatusOnlineAvatar from '@/components/svg/statusOnlineAvatar'
import StatusOfflineAvatar from '@/components/svg/statusOfflineAvatar'
import StatusDndAvatar from '@/components/svg/statusDndAvatar'
import StatusAwayAvatar from '@/components/svg/statusAwayAvatar'
import $ from 'jquery'
window.$ = window.jQuery = $

const USER_CHANNEL_LIST_SIZE = 200

export default {
  data() {
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
    return {
      userInfo: {
        id: currentUser.id,
        firstLetterOfName: currentUser.firstLetterOfName.toUpperCase(),
        nickname: currentUser.nickname,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl
      },
      onlineStatus: 'online',
      userChannelList: [],
      userChannelListZD: [],
      selectedChannelId: '',
      searchKey: '',
      unreadMessageChannelList: [],
      channelListHeight: '',
      voicevalue: true,
        skip:0,
      pGroup: [],
        memberLimitOpt: [{
            value: '100',
            label: '100人'
        }, {
            value: '200',
            label: '200人'
        }, {
            value: '500',
            label: '500人'
        }, {
            value: '0',
            label: '全部'
        }],
        voiceLevel:50,
        memberLimit: USER_CHANNEL_LIST_SIZE.toString(),
        GUIDE:window.gconfig.GUIDE,
    }
  },
  filters:{
    userChannelListG(userChannelList){
      var count = 0;
      for(var i = 0 ;i < userChannelList.length;i++){
        if(userChannelList[i].channelType == 'G' && userChannelList[i].unreadMessageCount){
          count += userChannelList[i].unreadMessageCount
        }
      }
      return count
    },
    userChannelListP(userChannelList){
      var count = 0;
      for(var i = 0 ;i < userChannelList.length;i++){
        if(userChannelList[i].channelType == 'P' && userChannelList[i].unreadMessageCount){
          count += userChannelList[i].unreadMessageCount
        }
      }
      return count
    },
    avatarG(item){
      if(item.avatarUrl){
        return window.BASE_API + '/channels/' + item.channelId + '/avatar?width=80&height=80&rdm='
      }else {
        return "";
      }
    },
    avatarP(item){
      if(item.toUserAvatarUrl){
        return window.BASE_API + '/users/' + item.toUserId + '/avatar?width=80&height=80&rdm='
      }else {
        return "";
      }
    },
    privateChannelOnline(userChannelList){
      var count = 0;
      for(var i = 0; i< userChannelList.length;i++){
        if(userChannelList[i].channelType == 'P' && userChannelList[i].toUserOnlineStatus === 'online'){
          count++
        }
      }
      return count
    },
    privateChannel(userChannelList){
      var count = 0;
      for(var i = 0; i< userChannelList.length;i++){
        if(userChannelList[i].channelType == 'P'){
          count++
        }
      }
      return count
    },
    trasMsg(message){
      if(!message || !message.content){
        return "";
      }
      if(message.fileMimeType){
        message.content =  "[图/文件]";
      }
      var str = message.content;
      str = str.replace(/<(?!img).*?>/g, "");
      var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
      str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
      str = str.replace(/<img.*(images\/qq|images\/tieba).*>/ig,"[表情]");
      str = str.replace(/<img.*\/>/ig,"[图]");
      return str
    }
  },
  provide(){
    return {
      onPrivateChannelCreated:this.onPrivateChannelCreated,
      sortList:this.sortList
    }
  },
  methods: {
    sendPurpose(){
      this.$refs.sendPurpose.$emit('openDialog')
    },
    playAudio() {
      if($("#voicevalue").val() == "true"){
          var voice = document.getElementById('chat-audio');
          voice.volume=this.voiceLevel/100;
          voice.play();
      }
    },
    sendMessageToAll(){
      this.$refs.sendMessageAll.$emit('openDialog')
    },
    sortGroup(){
      this.$refs.sortGroup.$emit('openDialog')
    },
    onRegisterSuccessed(username, password) {
      this.$message("注册用户成功");
    },
    sortList(channelId){
      let index = this.userChannelList.findIndex(item => item.channelId === channelId)
      if(index){
        this.userChannelList.unshift(this.userChannelList[index])
        this.userChannelList.splice(index+1,1)
      }
    },
    handleCommand(command) {
      switch(command) {
        case 'logout':
          this.logout()
          break
        case 'editPersonalInfo':
          this.$refs.editPersonalInfoDlg.$emit('openDialog')
          break
        case 'exportMemberInfo':
          this.$refs.exportMemberInfo.$emit('openDialog')
          break
        case 'changePassword':
          this.$refs.changePasswordDlg.$emit('openDialog')
          break
        case 'changeSecPassword':
            this.$refs.changeSecPasswordDlg.$emit('openDialog')
            break
        case 'addUser':
          this.$refs.registerUser.$emit('openDialog')
          break
        case 'persionQrcode':
          this.$refs.persionQrcodeDlg.$emit('openDialog')
          break
      }
    },
    handleOnlineStatus(command) {
      if(this.onlineStatus !== command) {
        this.onlineStatus = command
        updateOnlineStatus(JSON.parse(sessionStorage.getItem('currentUser')).id, this.onlineStatus)
        .catch(error => {
          outputError(this, error)
        })
      }
    },
    logout() {
      this.$confirm('确定注销当前用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
         type: 'warning'
      }).then(_ => {
        sessionStorage.clear()
        localStorage.clear()
        window.location.href = "/";
        //this.$router.push('/login')
        // 模拟f5刷新
        //this.$router.go(0)
      }).catch(_ => {
      })
    },
    openCreatePrivateChannelDlg() {
      this.$refs.createPrivateChanneDlg.$emit('openDialog', 'add')
    },
    openCreateGroupChannelDlg() {
      this.$refs.createGroupChanneDlg.$emit('openDialog', 'add')
    },
    selectChannel(channel, index) {
      this.selectedChannelId = channel.channelId
    },
      onForceLF(message){
          if(message.userId === JSON.parse(sessionStorage.getItem('currentUser')).id) {
              if(message.onlineStatus == "offline"){
                  this.$message({
                      showClose: true,
                      message: '您已被管理员强制下线！',
                      type: 'info'
                  })
                  setTimeout(()=>{
                      sessionStorage.clear()
                      localStorage.clear()
                      window.location.href = "/";
                  },2000)
              }
          }
          this.onOnlineStatusChanged(message);
      },
    onOnlineStatusChanged(message) {
      for(let userChannel of this.userChannelList) {
        if(userChannel.toUserId == null) {
          continue
        }
        if(userChannel.toUserId === message.userId) {
          userChannel.toUserOnlineStatus = message.onlineStatus
          break
        }
      }
    },
    onNicknameChanged(message) {
      if(message.userId === this.userInfo.id) {
        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
        currentUser.nickname = this.userInfo.nickname = message.nickname
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser))
        return
      }
      for(let userChannel of this.userChannelList) {
        if(userChannel.toUserId === message.userId) {
          if(userChannel.channelDisplayName == null || userChannel.channelDisplayName === '') {
            userChannel.channelDisplayName = message.nickname
          }
          return
        }
      }
    },
    onAvatarChanged(message) {
      if(message.userId === this.userInfo.id) {
        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
        currentUser.avatarUrl = this.userInfo.avatarUrl = ''
        currentUser.avatarUrl = this.userInfo.avatarUrl = message.avatar
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser))
      }
    },
    onUnreadMessage(message) {
      if(message.senderId != this.userInfo.id){
        this.playAudio()
      }
      if(message.channelId !== this.selectedChannelId) {
        let index = this.userChannelList.findIndex(item => item.channelId === message.channelId)
        if(index === -1) {
          let unreadMsgChannelIndex = this.unreadMessageChannelList.findIndex(item => item === message.channelId)
          if(unreadMsgChannelIndex == -1) {
            this.unreadMessageChannelList.push(message.channelId)
            getUserChannel(this.userInfo.id, message.channelId)
            .then(response => {
              let exists = this.userChannelList.findIndex(item => item.channelId === message.channelId)
              if(exists === -1) {
                this.userChannelList.unshift(response.data)
              }
              let existingUnreadMsgChannelIndex = this.unreadMessageChannelList.findIndex(item => item === message.channelId)
              if(existingUnreadMsgChannelIndex > -1) {
                this.unreadMessageChannelList.splice(existingUnreadMsgChannelIndex, 1)
              }
            })
            .catch(error => {
              outputError(this, error)
            })
          }
        } else{
          this.userChannelList[index].lastMessage = message
          this.userChannelList[index].unreadMessageCount += 1
          this.userChannelList.unshift(this.userChannelList[index])
          this.userChannelList.splice(index+1,1)
        }
      }else{
        let index = this.userChannelList.findIndex(item => item.channelId === message.channelId)
        this.userChannelList[index].lastMessage = message
      }
      this.$forceUpdate();
    },
    onReadMessage(message) {
      for(let userChannel of this.userChannelList) {
        if(userChannel.channelId === message.channelId) {
          if(message.readAll) {
            userChannel.unreadMessageCount = 0
          } else {
            userChannel.unreadMessageCount -= message.total
          }
          return
        }
      }
    },
    onJoinChannel(message) {
      let index = this.userChannelList.findIndex(item => item.channelId === message.channelId)
      if(index > -1) {
        return
      }
      getUserChannel(this.userInfo.id, message.channelId)
      .then(response => {
        let channelJoined = response.data
        let index = this.userChannelList.findIndex(item => item.channelId === channelJoined.channelId)
        if(index > -1) {
          return
        }
        this.userChannelList.unshift(channelJoined)
        if(this.userChannelList.length > this.memberLimit) {
          this.userChannelList.pop()
        }

        let imClient = this.$store.getters.imClient
        if(imClient != null) {
          let sendMessage = {
            action: 'BIND_GROUP_CHANNEL',
            groupIds: message.channelId
          }
          imClient.send(JSON.stringify(sendMessage))
        }
      })
      .catch(error => {
        outputError(this, error)
      })
    },
    onChannelNameChanged(message) {
      for(let channel of this.userChannelList) {
        if(channel.channelId === message.channelId) {
          channel.channelName = message.channelName
          return
        }
      }
    },
    onRemoveFromChannel(message) {
      let index = this.userChannelList.findIndex(item => item.channelId === message.channelId)
      if(index === -1) {
        return
      }
      let imClient = this.$store.getters.imClient
      if(imClient != null) {
        let sendMessage = {
          action: 'REMOVE_CHANNEL_FROM_GROUP',
          channelId: message.channelId
        }
        imClient.send(JSON.stringify(sendMessage))
      }
      this.userChannelList.splice(index, 1)
      if(this.selectedChannelId === message.channelId) {
        this.selectedChannelId = ''
        this.$router.push({ name: 'welcome' })
      }
    },
    leaveChannelCallback(channelId) {
      let index = this.userChannelList.findIndex(item => item.channelId === channelId)
      if(index === -1) {
        return
      }
      let imClient = this.$store.getters.imClient
      if(imClient != null) {
        let sendMessage = {
          action: 'REMOVE_CHANNEL_FROM_GROUP',
          channelId: channelId
        }
        imClient.send(JSON.stringify(sendMessage))
      }
      this.userChannelList.splice(index, 1)
      if(this.selectedChannelId === channelId) {
        this.selectedChannelId = ''
        this.$router.push({ name: 'welcome' })
      }
    },
    removeChannelCallback(channelId) {
      this.leaveChannelCallback(channelId)
    },
    onChannelRemoved(message) {
      this.leaveChannelCallback(message.channelId)
    },
    onUserOnline() {
      this.onlineStatus = 'online'
      updateOnlineStatus(JSON.parse(sessionStorage.getItem('currentUser')).id, this.onlineStatus)
      .catch(error => {
        outputError(this, error)
      })
    },
    onUserOffline() {
      this.onlineStatus = 'offline'
      updateOnlineStatus(JSON.parse(sessionStorage.getItem('currentUser')).id, this.onlineStatus)
      .catch(error => {
        outputError(this, error)
      })
    },
    initIMClient() {
      console.log("connecting...");
      let wsUrl = window.gconfig.WEBSOCKET_URL + '?token=' + sessionStorage.getItem('token')
      const imClient = new IMClient(wsUrl, 5 * 1000)
      this.$store.dispatch('setIMClient', imClient)
      imClient.bindOnlineStatusChanged(this.onOnlineStatusChanged)
      imClient.bindNicknameChanged(this.onNicknameChanged)
      imClient.bindAvatarChanged(this.onAvatarChanged)
      imClient.bindUnreadMessage(this.onUnreadMessage)
      imClient.bindReadMessage(this.onReadMessage)
      imClient.bindJoinChannel(this.onJoinChannel)
      imClient.bindChannelNameChanged(this.onChannelNameChanged)
      imClient.bindRemoveFromChannel(this.onRemoveFromChannel)
      imClient.bindChannelRemoved(this.onChannelRemoved)
      imClient.bindUserOnline(this.onUserOnline)
      imClient.bindUserOffline(this.onUserOffline)
      imClient.bindChannelAdd(this.onChannelAdd)
      imClient.connect(this.bindToGroupChannel)
      imClient.bindReconnectSuccessed(this.onReconnected)
      imClient.bindleForceLF(this.onForceLF)
    },
     onReconnected() {
      console.log('重连成功！！！')
      setTimeout(function(){
        window.location.reload()
      },1000)
    },
    onChannelAdd(message){
      this.userChannelList.unshift(message.data)
    },
    bindToGroupChannel(imClient) {
      let groupIds = ''
      for(let channel of this.userChannelList) {
        if(channel.channelType === 'G') {
          groupIds += channel.channelId + ','
        }
      }
      if(groupIds !== '') {
        groupIds = groupIds.substr(0, groupIds.length - 1)
        let message = {
          action: 'BIND_GROUP_CHANNEL',
          groupIds: groupIds
        }
        imClient.send(JSON.stringify(message))
      }
    },
    onPrivateChannelCreated(channel) {
      this.selectedChannelId = channel.channelId
      this.$router.push({ name: 'messageDialog', params: { channelId: channel.channelId, channelType: 'P' }})
      for(let userChannel of this.userChannelList) {
        if(userChannel.channelId === channel.channelId) {
          return
        }
      }
      this.userChannelList.unshift(channel)
      if(this.userChannelList.length > this.memberLimit) {
        this.userChannelList.pop()
      }
    },
    onGroupChannelCreated(channel) {
      this.selectedChannelId = channel.channelId
      this.$router.push({ name: 'messageDialog', params: { channelId: channel.channelId, channelType: 'G' }})
        for(let userChannel of this.userChannelList) {
            if(userChannel.channelId === channel.channelId) {
                return
            }
        }
        this.userChannelList.unshift(channel)
    },
    doHideChannel(channelId) {
      hideChannel(this.userInfo.id, channelId)
      .then(response => {
        if(response.data > 0) {
          let index = this.userChannelList.findIndex(item => item.channelId === channelId)
          if(index === -1) {
            return
          }
          this.userChannelList.splice(index, 1)
          if(this.selectedChannelId === channelId) {
            this.selectedChannelId = ''
            this.$router.push({ name: 'welcome' })
          }
        }
      })
      .catch(error => {
        outputError(this, error)
      })
    },
    doSearchChannel() {
      if(!this.searchKey.trim()) {
        return
      }
      this.userChannelList = []
      searchUserChannel(this.userInfo.id, this.searchKey)
      .then(response => {
        this.userChannelList = response.data;
        this.readerzd();
      })
      .catch(error => {
        outputError(this, error)
      })
    },
    onSearchInputKeyUp(event) {
      if(!this.searchKey.trim()) {
        listUserChannels(this.userInfo.id,0, this.memberLimit)
        .then(response => {
          this.userChannelList = response.data;
          this.readerzd();
        })
        .catch(error => {
          outputError(this, error)
        })
        return
      }
      if(event.keyCode === 13) {
        this.doSearchChannel()
      }
    },
      changeMemberLimit(value){
          listUserChannels(this.userInfo.id,0, value)
          .then(response => {
              this.userChannelList = response.data;
              this.readerzd();
          })
      },
      readerzd(){
        if(localStorage.getItem("zhiding")){
           var zhidingArr = localStorage.getItem("zhiding").split(',');
           for(var i =0; i < this.userChannelList.length;i++){
            if(zhidingArr.indexOf(this.userChannelList[i].channelId) != -1){
              this.userChannelList[i].zhiding = true;
            }else{
              this.userChannelList[i].zhiding = false;
            }
          }
         }
      },
      zhiding(item){
         item.zhiding = true;
         var zhidingStr = "";
         if(localStorage.getItem("zhiding")){
           zhidingStr = localStorage.getItem("zhiding");
         }
         if(zhidingStr == ""){
           var zhidingArr = [];
         }else{
           var zhidingArr = zhidingStr.split(',');
         }
         zhidingArr.push(item.channelId);
         localStorage.setItem("zhiding",zhidingArr.join(","));
         this.$forceUpdate()
      },
      qxzhiding(item){
        item.zhiding = false;
        var zhidingStr = "";
         if(localStorage.getItem("zhiding")){
           zhidingStr = localStorage.getItem("zhiding");
         }
          var zhidingArr = zhidingStr.split(',');
          var index = zhidingArr.indexOf(item.channelId);
          zhidingArr.splice(index,1);
          localStorage.setItem("zhiding",zhidingArr.join(","));
          this.$forceUpdate();

        // var index = this.userChannelListZD.findIndex(channel => channel.channelId == item.channelId)
        //  if(index != -1){
        //    this.userChannelListZD.splice(index, 1);
        //    this.userChannelList.unshift(item);
        //    this.$forceUpdate()
        //  }
      }
  },
  computed: {
    superAdmin(){
      return JSON.parse(sessionStorage.getItem('currentUser')).origin == 'sys' ? true:false;
    },
    realAvatarUrl() {
      if(this.userInfo.avatarUrl == null || this.userInfo.avatarUrl.trim() === '') {
        return null
      }
      if(!this.userInfo.avatarUrl.startsWith('http:') && !this.userInfo.avatarUrl.startsWith('https:')) {
        return window.gconfig.BASE_API + '/users/' + this.userInfo.id + '/avatar?width=36&height=36&rdm='
      }
      return this.userInfo.avatarUrl + (this.userInfo.avatarUrl.indexOf('?') > -1 ? '&' : '?') + 'rdm='
    }
  },
  beforeCreate() {
    if(JSON.parse(sessionStorage.getItem("currentUser")).origin == "wx"){
      return this.$router.push("/m")
    }
    let userId = JSON.parse(sessionStorage.getItem('currentUser')).id
    var listGroupPromise = listGroup(userId)
    var listUserChannelsPromise = listUserChannels(userId,0, USER_CHANNEL_LIST_SIZE)
    Promise.all([listGroupPromise,listUserChannelsPromise]).then((values)=>{
      var pGroup = values[0].data;
      this.userChannelList = values[1].data;
      this.readerzd();
      var userChannelList = JSON.parse(JSON.stringify(this.userChannelList))
      for(var i = 0; i < pGroup.length; i++){
        if(pGroup[i].id == ""){
            continue
        }
        var node = {
          id:pGroup[i].id,
          edit:false,
          name:pGroup[i].name,
          channelList:[]
        }
        for(var j =0; j < pGroup[i].channelIds.length;j++){
          for(var m =0;m<userChannelList.length;m++){
            if(pGroup[i].channelIds[j] == userChannelList[m].channelId && userChannelList[m].channelType == "P"){
              node.channelList.push(userChannelList[m])
              userChannelList.splice(m,1)
              break
            }
          }
        }
        this.pGroup.push(node)
      }
      //剩下的都是未分组
      var node = {
        id:"-1",
        name:"未分组",
        edit:false,
        channelList:[]
      }
      for(var m =0;m<userChannelList.length;m++){
        if(userChannelList[m].channelType == "P"){
          node.channelList.push(userChannelList[m])
        }
      }
      this.pGroup.unshift(node)

      this.initIMClient()

    }).catch(error => {
      outputError(this, error)
    })

  },
  created() {
    if(this.$route.params.channelId) {
      this.selectedChannelId = this.$route.params.channelId
    } else {
      this.$router.push({ name: 'welcome' })
    }
    var that = this;
    this.$root.Event.$on("updateAliasName", function(toUserId,aliasName) {
          for(var i = 0 ; i < that.userChannelList.length; i++){
            if(that.userChannelList[i].toUserId == toUserId){
                that.userChannelList[i].channelAliasName = aliasName;
                break;
            }
          }
      this.$forceUpdate();
      });
  },
  mounted() {
    var that = this;
    this.$root.Event.$on("setUnreadCount0",function (channelId) {
        let index = that.userChannelList.findIndex(item => item.channelId === channelId)
        that.userChannelList[index].unreadMessageCount = 0;
    });
    this.$root.Event.$on('onMessageSent', function (message) {
      let index = that.userChannelList.findIndex(item => item.channelId === message.channelId)
      that.userChannelList[index].lastMessage = message
      that.$forceUpdate();
    })
    this.channelListHeight = (document.body.clientHeight - 101) + 'px'
    window.onresize = () => {
      return (() => {
        this.channelListHeight = (document.body.clientHeight - 101) + 'px'
      })()
    }
    $("body").on('mouseover','.userChannelP',function(){
      $(this).find(".zhiding").show();
    })
     $("body").on('mouseout','.userChannelP',function(){
      $(this).find(".zhiding").hide();
    })
  },
  components: { GroupIcon, StatusOnlineIcon, StatusOfflineIcon, StatusAwayIcon,
    StatusDndIcon, StatusOnlineAvatar, StatusOfflineAvatar, StatusAwayAvatar, StatusDndAvatar,
    ExportMemberInfo: resolve => require(['@/components/user/exportMemberInfo'], resolve),
    EditPersonalInfo: resolve => require(['@/components/user/editPersonalInfo'], resolve),
    CreatePrivateChannel: resolve => require(['@/components/channel/createPrivateChannel'], resolve),
    CreateGroupChannel: resolve => require(['@/components/channel/createGroupChannel'], resolve),
    ChangePassword: resolve => require(['@/components/user/changePassword'], resolve),
    ChangeSecpassword: resolve => require(['@/components/user/changeSecPassword'], resolve),
    RegisterUser: resolve => require(['@/components/user/register'], resolve),
    SendMessageAll: resolve => require(['@/components/message/SendMessageAll'], resolve),
    sortGroup: resolve => require(['@/components/message/sortGroup'], resolve),
    sendPurpose: resolve => require(['@/components/userChannel/editPPurpose'], resolve),
    persionQrcode: resolve => require(['@/components/channel/persionQrcode'], resolve),
    ForwordManagement: resolve =>
      require(["@/components/channel/forwordManage"], resolve),
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: #F0F0F0;
}
::-webkit-scrollbar-thumb {
  -webkit-border-radius: 2px;
  -moz-border-radius: 2px;
  -ms-border-radius: 2px;
  -o-border-radius: 2px;
  border-radius: 2px;
  background: rgba(0,0,0,.2);
}
::-webkit-scrollbar-track {
  background: rgba(0,0,0,.1);
}
.body-container {
    height: 100%;
    background-color: #fff;
    overflow: hidden;
}
.sidebar {
  width: 250px;
  float: left;
  background-color: #1C5CB9;
  .header {
    background-color: #0A53A4;
    height: 70px;
    width: 100%;
    position: relative;
    .avatar {
      width: 36px;
      height: 36px;
      margin: 19px 0px auto 5px;
      background-color: #DF016E;
      border-radius: 36px;
      text-align: center;
      line-height: 36px;
      color: #fff;
      font-weight: bold;
      float: left;
      img {
        width: 36px;
        height: 36px;
        display: block;
        border-radius: 36px;
      }
    }
    #status-dropdown {
      cursor: pointer;
    }
    .status {
      border-radius: 15px;
      bottom: -4px;
      height: 15px;
      line-height: 0;
      margin: 0;
      position: absolute;
      left: 32px;
      top: 41px;
      width: 15px;
      svg {
        max-height: 11px;
        position: relative;
        top: 2px;
      }
      .icon-container {
        :after {
          border-radius: 20px;
          height: 10px;
          left: 4px;
          position: absolute;
          top: 4px;
          width: 10px;
        }
      }
    }

    .status-edit {
      border-radius: 15px;
      background-color: #fff;
      width: 15px;
      height: 15px;
      left: 32px;
      top: 41px;
      position: absolute;
      text-align: center;
      svg {
        position: relative;
        top: -8px;
        padding: 0;
        margin: 0;
      }
    }
    .status-selector:hover > .status {
      display: none;
    }
    .status-selector > .status {
      display: inherit;
    }
    .status-selector > .status-edit {
      display: none;
    }
    .status-selector:hover > .status-edit {
      display: inherit;
    }
    .nickname {
      color: #fff;
      padding-top: 4px;
      margin-left: 6px;
      width: 150px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      float: left;
    }
    .dropdown-icon {
      border-radius: 36px;
      fill: #D0DDEC;
      float: right;
      height: 36px;
      line-height: 36px;
      position: relative;
      text-align: center;
      width: 36px;
      margin-top: 18px;
      cursor: pointer;
      &:hover {
        fill: #fff;
      }
    }
  }

  .channel-search-container {
    height: 28px;
    padding: 3px 5px 0 5px;
    .search {
      padding: 0 0 0 5px;
      background-color: #046BBB;
      height: 28px;
      line-height: 28px;
      vertical-align: middle;
      border-radius: 3px;
      i {
        color: #DDDBD7;
        cursor: pointer;
      }
      input {
        margin: 0 0 0 4px;
        width: 177px;
        outline: 0;
        border: none;
        background-color: transparent;
        -webkit-appearance: textfield;
        -webkit-rtl-ordering: logical;
        cursor: text;
        color: #fff;
      }
      input::-webkit-input-placeholder {
        color: #DDDBD7;
      }
      input::-moz-placeholder {   /* Mozilla Firefox 19+ */
        color: #DDDBD7;
      }
      input:-moz-placeholder {    /* Mozilla Firefox 4 to 18 */
        color: #DDDBD7;
      }
      input:-ms-input-placeholder {  /* Internet Explorer 10-11 */
        color: #DDDBD7;
      }
    }
  }
  .channel-container {
    /*width: 219px;*/
    padding-left: 2px;
    overflow: auto;
  }

  .nav-channel {
    margin: 0;
    padding: 0;
    color: #97B8DD;
    list-style: none;
    .channel-header {
      padding: 0 2px 0 10px;
      line-height: 36px;
      span {
        font-weight: bold;
      }
      .add-channel-btn {
        float: right;
        font-size: 24px;
        margin-top: -4px;
        color: #D0DDEC;
        cursor: pointer;
        background: transparent;
        border: none;
        font-family: inherit;
        &:hover {
          color: #fff;
        }
      }
    }
    .channel-item2{
      padding: 0px;
      margin: 0;
      line-height: 30px;
      height: 30px;
      text-indent: 2px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      position: absolute;
      top:30px;
      width:190px;
      margin-left: 50px;
    }
    .channel-item2.marginleft0{
      margin-left: 0px;
      width: 100%;
    }
    .channel-item2.marginleft1{
      margin-left: 0px;
      width: 100%;
    }
    .channel-item {
      /*padding-left: 3px;*/
      height: 60px;
      position: relative;
      border-bottom: 1px solid #046BBB;
      background-color: #1C5CB9;
      &:hover {
        background-color: #1F77BA;
      }
      a {
        display: block;
        -webkit-transition: none 1s;
        transition-delay: 0s;
        -moz-transition: none 1s;
        -o-transition: none 1s;
        transition: none false false 1s;
        text-align: left;
        width: 100%;
        border-radius: 0;
        line-height: 30px;
        height: 60px;
        outline: none;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        color: #fff;
        white-space: nowrap;
        z-index: 2;
        position: relative;
        svg {
          height: 14px;
          width: 14px;
          left: 10px;
          top: 0px;
          max-height: initial;
          position: relative;
          z-index: 1;
        }
        .channel-item-name.marginleft0{
          margin-left: 5px;
          width: 100%;
        }
        .channel-item-name.marginleft1{
          margin-left: 0px;
          width: 100%;
        }
      }
      .status {
        display: inline-block;
        display: inline-block;
        position: absolute;
        padding: 0 0 0 2px;
        margin-top: 11px;
      }
      .channel-item-name {
        display: inline-block;
        width: 190px;
        max-width: 190px;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: top;
        margin-left: 50px;
      }
      .channel-item-name-selected {
        font-weight: bold;
        color: #F6F7C0;
      }
      .unread-message-count {
        /* display: inline-block; */
        width: 20px;
        height: 20px;
        /* margin-top: -7px; */
        background-color: red;
        border-radius: 20px;
        text-align: center;
        line-height: 20px;
        color: #fff;
        vertical-align: middle;
        font-size: 12px;
        position: absolute;
        top: 20px;
        right: 5px;
      }
      .unread-message-count-hide {
        display: inline-block;
        width: 20px;
      }
      .has-close {
        &:hover{
          .btn-close {
            opacity: 0.8;
            display: inline-block;
            text-decoration: none;
          }
          .channel-item-name {
            max-width: 131px;
            min-width: 131px;
          }
        }
      }
      .btn-close {
        opacity: 0;
        display: none;
        font-size: 20px;
        font-weight: 600;
        right: 29px;
        height: 16px;
        line-height: 16px;
        margin: -7px 0 0 0;
        padding-bottom: 2px;
        vertical-align: middle;
        &:hover {
          opacity: 1;
          background-color: #F23724;
        }
      }
    }
    .channel-item-active {
      padding-left: 0px;
      background-color: #186CC1;
      border-left: solid 3px #279EFF;
    }
  }
  .first-nav-channel {
    padding-top: 2px;
  }
}
.content {
  flex: 1;
}
.status-tooltip {
  font-size: 8px;
  color: #7C7A74;
  margin-top: -15px;
}
.sidebar .nav-channel .channel-item .status1{
  margin-top: 10px;
}
.sidebar .nav-channel .channel-item .status2{
  margin-top: 0px;
}
</style>
