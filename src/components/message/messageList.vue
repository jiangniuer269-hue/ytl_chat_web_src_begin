<template>
  <div style="height: 100%;position: relative;">
    <el-button @click="scrollBottom(1)" v-if="moreMsg" class="newmsg" type="primary" icon="el-icon-message" circle></el-button>
  <div class="container" id="messageList">
    <img style="display:none;" src="/static/images/loading.gif">
    <image-viewer ref="imageViewer" :image-url="image.url" :image-width="image.width" :image-height="image.height"></image-viewer>
    <div v-if="hasMoreMessage" class="load-more-message"><span @click="getMessageList(true)">加载更多消息</span></div>
    <div :class="{'selectchat':item.select == true}" :_select="item.select"
     @click="checkChat(item)"
      :id="'message_' + item.id" v-for="(item, index) in this.messageList" :key="item.id">
      <div class="message-container">
        <div class="message message_right" v-if="myId == item.senderId" >
          <div class="status-wrapper" :class="{'sysuser-status-wrapper': item.senderId === '00000000000000000000000000000000'}">
            <div @click="createPrivateChannel(item)" v-if="item.senderRealAvatarUrl" style="width: 32px; height:32px;"><img class="status-wrapper-image" :src="getAvatarUrl(item)" /></div>
            <template v-else>{{ item.senderFirstLetterOfName.toUpperCase() }}</template>
            <div v-if="item.senderId != '00000000000000000000000000000000'" class="online-status-container">
              <status-online-avatar v-if="item.senderOnlineStatus === 'online'"></status-online-avatar>
              <status-away-avatar v-else-if="item.senderOnlineStatus === 'away'"></status-away-avatar>
              <status-offline-avatar v-else-if="item.senderOnlineStatus === 'offline'"></status-offline-avatar>
              <status-dnd-avatar v-else="item.senderOnlineStatus === 'dnd'"></status-dnd-avatar>
            </div>
          </div>
          <div class="message-content" :class="{ 'message-content-myself': myId == item.senderId }">
            <span v-if="item.read && userChannel.channelType == 'P'" class="isread isreadd">已读</span>
            <span v-if="!item.read && userChannel.channelType == 'P'" class="isread">未读</span>
            <div style="text-align: right">
              <span v-if="myId == item.senderId && isManage(myId)" class="delete-message" @click="removeMessageConfirm(item.id, index,item.createAt)">删除</span>
              <span class="createAt">{{ getCreateDateTime(item) }}</span>


              <span @click="createPrivateChannel(item)" v-if="userChannel.channelType == 'G' && (item.senderNickname && isManage(myId))" class="sender">{{ item.senderNickname |substr10}}<a class="msgtag me" v-if="myId == item.senderId">我</a><a class="msgtag manage" v-if="(userChannel.creatorId != item.senderId) && isManage(item.senderId)">管理员</a><a class="msgtag master" v-if="userChannel.creatorId == item.senderId">群主</a> </span>
              <span @click="createPrivateChannel(item)" v-if="userChannel.channelType == 'G' && (item.senderNickname && !isManage(myId))" class="sender">{{ item.senderNickname ? item.senderNickname : item.senderName |substr10 }}<a class="msgtag me" v-if="myId == item.senderId">我</a><a class="msgtag manage" v-if="(userChannel.creatorId != item.senderId) && isManage(item.senderId)">管理员</a><a class="msgtag master" v-if="userChannel.creatorId == item.senderId">群主</a> </span>
              <span @click="createPrivateChannel(item)" v-if="userChannel.channelType == 'G' && !item.senderNickname" class="sender">{{ item.senderNickname ? item.senderNickname : item.senderName |substr10 }}<a class="msgtag me" v-if="myId == item.senderId">我</a><a class="msgtag manage" v-if="(userChannel.creatorId != item.senderId) && isManage(item.senderId)">管理员</a><a class="msgtag master" v-if="userChannel.creatorId == item.senderId">群主</a> </span>
              <span v-if="userChannel.channelType == 'P'  && (item.senderNickname && isManage(myId))">{{ item.senderNickname }}</span>
              <span v-if="userChannel.channelType == 'P'  && (item.senderNickname && !isManage(myId))">{{ item.senderNickname ? item.senderNickname : item.senderName }}</span>
              <span v-if="userChannel.channelType == 'P'  && !item.senderNickname">{{ item.senderNickname ? item.senderNickname : item.senderName }}</span>
            </div>
            <div v-if="item.fileSize === 0" :class="[{'content-select': myId == item.senderId, 'content': myId !== item.senderId}, {'system-content': item.type}]" v-html="item.content"></div>
            
            <template v-else>
              <div style="margin-top: 3px;border-radius: 4px;text-align: right" v-if="item.isloading && isImage(item.fileExtension)"><img style="max-height: 400px;" class="image-file" :src="item.filePath"></div>
              <div style="margin-top: 3px;border-radius: 4px;text-align: right" v-if="!item.isloading && isImage(item.fileExtension)"><img style="max-height: 400px;" class="image-file" @click="viewImage(getFileUrl(item.filePath , item.fileName, item.fileMimeType,item), item.imageWidth, item.imageHeight)"  :src="getFileUrl(item.filePath , item.fileName, item.fileMimeType,item)"></div>
              <div style="margin-top: 3px;border-radius: 4px;text-align: right" v-else-if="!item.isloading && isGif(item.fileExtension)"><img  style="max-height: 400px;" class="image-file" @click="viewImage(getFileUrl(item.filePath , item.fileName, item.fileMimeType,item), item.imageWidth, item.imageHeight)"  :src="getFileUrl(item.filePath, item.fileName, item.fileMimeType,item)"></div>
               <div style="margin-top: 3px;border-radius: 4px;float:right;min-width:300px;min-height:150px;" v-else-if="isVideo(item.fileExtension)">

                  <video-player
                    class="video-player vjs-custom-skin"
                    ref="videoPlayer"
                    :playsinline="true"
                    :options="item.playerOptions"
                  ></video-player>

                <!-- <video  style="max-height: 400px;" class="image-file" controls>
                    <source :src="getFileUrl(item.filePath+ '/thumb', item.fileName, item.fileMimeType)">
                </video> -->
                </div>
              <div style="text-align: right" v-else-if="!item.isloading" class="attach-file">
                <a :href="getFileUrl(item.filePath, item.fileName, item.fileMimeType,item)" target="_blank">
                  <svg t="1528947448190" viewBox="0 0 1024 1024" version="1.1" width="64" height="64"><path d="M842.72 259.904a159.04 159.04 0 0 0-113.056-46.912h-0.16a158.592 158.592 0 0 0-112.768 46.656l-0.096 0.064-294.528 294.528a95.968 95.968 0 0 0 68.128 163.712c24.512 0 49.024-9.28 67.648-27.968l294.496-294.496a31.968 31.968 0 1 0-45.248-45.248l-294.496 294.496a31.872 31.872 0 0 1-45.088-0.16 31.552 31.552 0 0 1-0.192-45.088l294.496-294.496a95.04 95.04 0 0 1 67.648-28h0.096a95.52 95.52 0 0 1 67.872 28.16c18.112 18.112 28.096 42.24 28.128 67.84a95.136 95.136 0 0 1-27.968 67.776l-79.52 79.52-0.512 0.48-220.416 220.48a160.32 160.32 0 0 1-226.432 0.096A158.912 158.912 0 0 1 224 628.224c0-42.816 16.672-83.04 46.912-113.28l300.288-300.32a31.968 31.968 0 1 0-45.248-45.248l-300.288 300.288A222.848 222.848 0 0 0 160 628.224c0 59.872 23.264 116.16 65.504 158.4a223.168 223.168 0 0 0 158.336 65.44 223.68 223.68 0 0 0 158.592-65.6l311.456-311.424a31.68 31.68 0 0 0 7.104-11.072c18.496-26.56 28.64-57.92 28.608-91.04a159.104 159.104 0 0 0-46.88-113.024" p-id="2313" fill="#616C6A"></path></svg>
                  <div class="attach-desc">
                    <div>{{ item.fileName.length > 26 ? item.fileName.substr(0, 26) + '...' : item.fileName }}</div>
                    <div><i class="el-icon-download"></i>&nbsp;&nbsp;<span>{{ item.fileExtension ? item.fileExtension.toUpperCase() : '' }}</span>&nbsp;&nbsp;<span>{{ item.fileSize }}KB</span></div>
                  </div>
                </a>
              </div>
            </template>
            <div class="clear-float"></div>
            <div v-if="item.note" :class="[{'content-select': myId == item.senderId, 'content': myId !== item.senderId}, {'system-content': item.type}]" class="forwordnote" >留言:{{item.note}}</div>
          </div>
          <div class="clear-float"></div>
        </div>
        <div class="message" v-if="myId != item.senderId">
          <div class="status-wrapper" :class="{'sysuser-status-wrapper': item.senderId === '00000000000000000000000000000000'}">
            <div @click="createPrivateChannel(item)" v-if="item.senderRealAvatarUrl" style="width: 32px; height:32px;"><img class="status-wrapper-image" :src="getAvatarUrl(item)" /></div>
            <template v-else>{{ item.senderFirstLetterOfName.toUpperCase() }}</template>
            <div v-if="item.senderId != '00000000000000000000000000000000'" class="online-status-container">
              <status-online-avatar v-if="item.senderOnlineStatus === 'online'"></status-online-avatar>
              <status-away-avatar v-else-if="item.senderOnlineStatus === 'away'"></status-away-avatar>
              <status-offline-avatar v-else-if="item.senderOnlineStatus === 'offline'"></status-offline-avatar>
              <status-dnd-avatar v-else="item.senderOnlineStatus === 'dnd'"></status-dnd-avatar>
            </div>
          </div>
          <div class="message-content" :class="{ 'message-content-myself': myId == item.senderId }">
            <div>
              <span @click="createPrivateChannel(item)" v-if="userChannel.channelType == 'G' && (item.senderAliasName && isManage(myId))" class="sender">{{ item.senderAliasName |substr10}}<a class="msgtag me" v-if="myId == item.senderId">我</a><a class="msgtag manage" v-if="(userChannel.creatorId != item.senderId) && isManage(item.senderId)">管理员</a><a class="msgtag master" v-if="userChannel.creatorId == item.senderId">群主</a> </span>
              <span @click="createPrivateChannel(item)" v-if="userChannel.channelType == 'G' && (item.senderAliasName && !isManage(myId))" class="sender">{{ item.senderNickname ? item.senderNickname : item.senderName |substr10 }}<a class="msgtag me" v-if="myId == item.senderId">我</a><a class="msgtag manage" v-if="(userChannel.creatorId != item.senderId) && isManage(item.senderId)">管理员</a><a class="msgtag master" v-if="userChannel.creatorId == item.senderId">群主</a> </span>
              <span @click="createPrivateChannel(item)" v-if="userChannel.channelType == 'G' && !item.senderAliasName" class="sender">{{ item.senderNickname ? item.senderNickname : item.senderName |substr10 }}<a class="msgtag me" v-if="myId == item.senderId">我</a><a class="msgtag manage" v-if="(userChannel.creatorId != item.senderId) && isManage(item.senderId)">管理员</a><a class="msgtag master" v-if="userChannel.creatorId == item.senderId">群主</a> </span>
              <span v-if="userChannel.channelType == 'P'  && (item.senderAliasName && isManage(myId))">{{ item.senderAliasName }} </span>
              <span v-if="userChannel.channelType == 'P'  && (item.senderAliasName && !isManage(myId))">{{ item.senderNickname ? item.senderNickname : item.senderName }} </span>
              <span v-if="userChannel.channelType == 'P'  && !item.senderAliasName">{{ item.senderNickname ? item.senderNickname : item.senderName }} </span>
              <span class="createAt">{{ getCreateDateTime(item) }}</span>
              <span v-if="myId == item.senderId && isManage(myId)" class="delete-message" @click="removeMessageConfirm(item.id,index,item.createAt)">删除</span>
            </div>
            <div v-if="item.fileSize === 0" :class="[{'content-select': myId == item.senderId, 'content': myId !== item.senderId}, {'system-content': item.type}]" v-html="item.content"></div>
           <template v-else>
              <div style="margin-top: 3px;border-radius: 4px;" v-if="isImage(item.fileExtension)"><img style="max-height: 400px;" class="image-file" @click="viewImage(getFileUrl(item.filePath , item.fileName, item.fileMimeType,item), item.imageWidth, item.imageHeight)"  :src="getFileUrl(item.filePath, item.fileName, item.fileMimeType,item)"></div>
              <div style="margin-top: 3px;border-radius: 4px;" v-else-if="isGif(item.fileExtension)"><img  style="max-height: 400px;" class="image-file" @click="viewImage(getFileUrl(item.filePath , item.fileName, item.fileMimeType,item), item.imageWidth, item.imageHeight)"  :src="getFileUrl(item.filePath, item.fileName, item.fileMimeType,item)"></div>
              <div style="margin-top: 3px;border-radius: 4px;float:left;min-width:300px;min-height:150px;" v-else-if="isVideo(item.fileExtension)">

                   <video-player
                    class="video-player vjs-custom-skin"
                    ref="videoPlayer"
                    :playsinline="true"
                    :options="item.playerOptions"
                  ></video-player>

                </div>
              <div v-else class="attach-file">
                <a :href="getFileUrl(item.filePath, item.fileName, item.fileMimeType,item)" target="_blank">
                  <svg t="1528947448190" viewBox="0 0 1024 1024" version="1.1" width="64" height="64"><path d="M842.72 259.904a159.04 159.04 0 0 0-113.056-46.912h-0.16a158.592 158.592 0 0 0-112.768 46.656l-0.096 0.064-294.528 294.528a95.968 95.968 0 0 0 68.128 163.712c24.512 0 49.024-9.28 67.648-27.968l294.496-294.496a31.968 31.968 0 1 0-45.248-45.248l-294.496 294.496a31.872 31.872 0 0 1-45.088-0.16 31.552 31.552 0 0 1-0.192-45.088l294.496-294.496a95.04 95.04 0 0 1 67.648-28h0.096a95.52 95.52 0 0 1 67.872 28.16c18.112 18.112 28.096 42.24 28.128 67.84a95.136 95.136 0 0 1-27.968 67.776l-79.52 79.52-0.512 0.48-220.416 220.48a160.32 160.32 0 0 1-226.432 0.096A158.912 158.912 0 0 1 224 628.224c0-42.816 16.672-83.04 46.912-113.28l300.288-300.32a31.968 31.968 0 1 0-45.248-45.248l-300.288 300.288A222.848 222.848 0 0 0 160 628.224c0 59.872 23.264 116.16 65.504 158.4a223.168 223.168 0 0 0 158.336 65.44 223.68 223.68 0 0 0 158.592-65.6l311.456-311.424a31.68 31.68 0 0 0 7.104-11.072c18.496-26.56 28.64-57.92 28.608-91.04a159.104 159.104 0 0 0-46.88-113.024" p-id="2313" fill="#616C6A"></path></svg>
                  <div class="attach-desc">
                    <div>{{ item.fileName.length > 26 ? item.fileName.substr(0, 26) + '...' : item.fileName }}</div>
                    <div><i class="el-icon-download"></i>&nbsp;&nbsp;<span>{{ item.fileExtension ? item.fileExtension.toUpperCase() : '' }}</span>&nbsp;&nbsp;<span>{{ item.fileSize }}KB</span></div>
                  </div>
                </a>
              </div>
            </template>
             <div class="clear-float"></div>
            <div v-if="item.note" :class="[{'content-select': myId == item.senderId, 'content': myId !== item.senderId}, {'system-content': item.type}]" class="forwordnote">留言:{{item.note}}</div>
            
          </div>
          <div class="clear-float"></div>
        </div>
      </div>
    </div>
  </div>
    <!--清除历史消息二级密码确认-->
    <el-dialog :visible.sync="deleteHisConfirm" :modal-append-to-body="false" width="400px">
      <div slot="title" class="dialog-header">
        <h3>删除消息</h3>
      </div>
      <el-form ref="deleteHisForm" label-width="80px">
        <el-form-item label="二级密码" >
          <el-input style="width:200px;" v-model="secondaryPwd"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
              <el-button size="small" @click="removeMessage">删除</el-button>
              <el-button size="small" @click="deleteHisConfirm=false">关闭</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
    import { outputError } from '@/utils/exception'
    import { listMessage, readMessage, removeMessage } from '@/api/message'
    import StatusOnlineAvatar from '@/components/svg/statusOnlineAvatar'
    import StatusOfflineAvatar from '@/components/svg/statusOfflineAvatar'
    import StatusDndAvatar from '@/components/svg/statusDndAvatar'
    import StatusAwayAvatar from '@/components/svg/statusAwayAvatar'
    import { createChannel,isAdmin,judgeIsAdmin } from '@/api/channel'
    import moment from 'moment'
    import $ from 'jquery'
    import { setTimeout } from 'timers';
    window.$ = window.jQuery = $

    import { videoPlayer } from "vue-video-player";
    require("video.js/dist/video-js.css");
    require("vue-video-player/src/custom-theme.css");

    export default {
        name: "message-list",
        props: ['channelId', 'userChannel'],
        data() {
            return {
                selectChat:[],
                origin: JSON.parse(sessionStorage.getItem('currentUser')).origin,
                myId: JSON.parse(sessionStorage.getItem('currentUser')).id,
                deleteItem:{
                    id:"",
                    index:"",
                    createAt:"",
                },
                maxCreateAt: 0,
                deleteHisConfirm: false,
                secondaryPwd: "",
                moreMsg: false,
                loadingVisible: false,
                messageList: [],
                hasMoreMessage: true,
                isLoadMore: false,
                messageRemoved: false,
                scrollFlag: true,
                unConnected: 0,
                image: {
                    url: '',
                    width: 0,
                    height: 0
                }
            }
        },
        inject: ['onPrivateChannelCreated'],
        filters:{
            substr10(str){
                if(str.length > 10){
                    return str.substring(0, 10)+ "..."
                }else{
                    return str;
                }
            }
        },
        methods: {
          // onPlayerPlay(player, index) {
 
          //   },
          //   onPlayerPause(player) {

              
          //   },
            checkChat(item){
              //判断是否为移动端
              if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent) &&this.origin == 'wx') { //移动端
                    //TODO
                  return;
                }
              if(item.select){
                item.select = false;
                var index = this.selectChat.findIndex(s => s.id == item.id);
                if(index != -1){
                  this.selectChat.splice(index,1);
                }
              }else{
                item.select = true;
                this.selectChat.push(item);
                console.log(this.selectChat)
              }
              this.$forceUpdate()
            },
            isManage(id){
                var manage = this.userChannel.adminIds || [];
                for(var i = 0; i < manage.length;i++){
                    if(id == manage[i]){
                        return true;
                    }
                }
                return false;
            },
            deleteMsg(){
                this.messageList = [];
                localStorage.removeItem(this.myId + this.channelId)
            },
            createPrivateChannel(user){
                console.log(user)
                if(this.userChannel.channelType == 'P'){
                    return;
                }
                //点的自己
                if(JSON.parse(sessionStorage.getItem("currentUser")).id == user.senderId){
                    return
                }else{
                    var meIsAdmin = judgeIsAdmin(this.channelId,JSON.parse(sessionStorage.getItem("currentUser")).id);
                    var ToIsAdmin = judgeIsAdmin(this.channelId,user.senderId);
                    Promise.all([meIsAdmin,ToIsAdmin]).then(value => {
                        if(value[0]['data'] || value[1]['data']){
                            console.log(user,this.$data, this.$options.data())
                            let currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
                            let channel = {
                                type: 'P',
                                fromUsername: currentUser.name,
                                channelId: this.channelId,
                                fromUserNickname: currentUser.nickname,
                                toUserId: user.senderId,
                                toUsername: user.senderName,
                                toUserNickname: user.senderNickname
                            }
                            createChannel(channel)
                                .then(response => {
                                    this.onPrivateChannelCreated(response.data)
                                })
                                .catch(error => {
                                    outputError(this, error)
                                })
                        }else{
                            return;
                        }
                    })
                }
            },
            updateAliasName(aliasName){
                for(var i =0; i < this.messageList.length;i++){
                    if(this.userChannel.toUserId == this.messageList[i].senderId){
                        this.messageList[i].senderAliasName = aliasName;
                    }
                }
            },
            getMessageList(isLoadMore) {
                this.isLoadMore = isLoadMore
                const limit = 20
                if(!this.channelId){
                    return;
                }
                listMessage(this.channelId, this.maxCreateAt, limit)
                    .then(response => {
console.log('listMessagelistMessage',response.data);
                        this.hasMoreMessage = response.data.length === 20
                        if(response.data.length > 0) {
                            var msglist = [];
                           /* if(localStorage.getItem(this.myId + this.channelId) != null){
                                msglist = JSON.parse(localStorage.getItem(this.myId + this.channelId));
                                // msglist.sort((a, b) => a.createAt - b.createAt);
                            }*/
                            console.log('msglistmsglist01',msglist);
                            for(var i = 0; i < response.data.length; i++){     
                              if(response.data[i].fileSize && this.isVideo(response.data[i].fileExtension)){
                                var src = window.gconfig.BASE_API + '/image/' + response.data[i].filePath+'/'+response.data[i].fileName;
                                if(response.data[i].createAt > window.gconfig.oss_time){
                                  src = response.data[i].oss;
                                }

                                response.data[i].playerOptions = {
                                      playbackRates: [1.0, 2.0, 3.0], //播放速度
                                      autoplay: false, //如果true,浏览器准备好时开始回放。
                                      muted: false, // 默认情况下将会消除任何音频。
                                      loop: false, // 导致视频一结束就重新开始。
                                      preload: "auto", // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                                      language: "zh-CN",
                                      // aspectRatio: "16:9", // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                                      fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                                      sources: [
                                        {
                                          type: response.data[i].fileMimeType,
                                          // type: "video/ogg",
                                          // type: "video/avi",
                                          // type: "video/wmv",
                                          // src: this.getFileUrl(response.data[i].filePath+ '/thumb', response.data[i].fileName, response.data[i].fileMimeType)
                                          // src: window.gconfig.BASE_API + '/image/' + response.data[i].filePath+'/'+response.data[i].fileName
                                          src: src
                                        }
                                      ],
                                      poster: "", //封面地址
                                      notSupportedMessage: "此视频暂无法播放，请稍后再试", //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                                      controlBar: {
                                        timeDivider: true,
                                        durationDisplay: false,
                                        remainingTimeDisplay: false,
                                        fullscreenToggle: true //全屏按钮
                                      }
                                    };
                              }
                                var index = msglist.findIndex(item => item.id == response.data[i].id)
                                response.data[i].select = false;
                                var indexMsg = this.messageList.findIndex(item => item.id == response.data[i].id)
                                if(index == -1){
                                    msglist.push(response.data[i]);
                                    if(msglist.length > 20){
                                        msglist.splice(msglist.length-1,1)
                                    }
                                }else{
                                    msglist[index].read = response.data[i].read
                                    msglist[index].senderOnlineStatus = response.data[i].senderOnlineStatus
                                    msglist[index].senderNickname = response.data[i].senderNickname
                                    msglist[index].playerOptions = response.data[i].playerOptions
                                }
                                if(indexMsg == -1){
                                    this.messageList.push(response.data[i]);
                                }else{
                                    this.messageList[indexMsg].read = response.data[i].read
                                    this.messageList[indexMsg].senderOnlineStatus = response.data[i].senderOnlineStatus
                                    this.messageList[indexMsg].senderNickname = response.data[i].senderNickname
                                    this.messageList[indexMsg].playerOptions = response.data[i].playerOptions
                                }
                            }
                            msglist.sort((a, b) => a.createAt - b.createAt);
                            localStorage.setItem(this.myId + this.channelId,JSON.stringify(msglist));
                            this.messageList.sort((a, b) => a.createAt - b.createAt);
                            this.$nextTick(()=>{
                                this.messageList.sort((a, b) => a.createAt - b.createAt);
                            })
                            console.log('msglistmsglist02',msglist);
                            console.log('messageListmessageList02',this.messageList);
                            this.maxCreateAt = this.messageList[0].createAt
                            //组装已读ids
                            var ids = [];
                            for(var m = 0; m < response.data.length;m++){
                                if(this.myId != response.data[m].senderId && !response.data[m].read){
                                    ids.push(response.data[m].id)
                                }
                            }
                            readMessage(this.channelId,ids, response.data.length)
                                .then(response => {
                                })
                                .catch(error => {
                                    outputError(this, error)
                                })

                        }
                        this.scrollBottom()
                    })
                    .catch(error => {
                        this.loadingVisible = false
                        outputError(this, error)
                    })
            },
            getAvatarUrl(message) {
                if('http://'.startsWith(message.senderRealAvatarUrl.toLowerCase()) || 'https://'.startsWith(message.senderRealAvatarUrl.toLowerCase())) {
                    return message.senderRealAvatarUrl
                }
                return window.gconfig.BASE_API + '/users/' + message.senderId + '/avatar?width=32&height=32'
            },
            getCreateDateTime(message) {
                if(message.createAt == 9999999999999){
                   return ""
                }else{
                  return moment(message.createAt).format("YYYY/MM/DD HH:mm:ss")
                }
            },
            showSentMessage(message) {
                this.isLoadMore = false
                let index = this.messageList.findIndex(item => item.id == message.id)
                if(index == -1){
                    this.messageList.push(message)
                }
            },
            removeMessageConfirm(id,index,createAt){
                this.deleteItem.id = id;
                this.deleteItem.index = index;
                this.deleteItem.createAt = createAt;
                this.deleteHisConfirm = true;
            },
            removeMessage() {
                if(this.secondaryPwd == ""){
                    this.$message({
                        showClose: true,
                        message: "请输入二级密码",
                        type: "info"
                    });
                    return;
                }
                var messageId = this.deleteItem.id;
                var index = this.deleteItem.index;
                var createAt = this.deleteItem.createAt;
                console.log('createAtcreateAt',createAt);
                removeMessage(messageId, this.channelId, this.getToUserId(),this.secondaryPwd,createAt)
                    .then(response => {
                        if(response.data !== 0) {
                            this.secondaryPwd = "";
                            this.deleteHisConfirm = false;
                            this.messageRemoved = true;
                            this.messageList.splice(index, 1)
                            //在缓存中也删除
                            var msglist = JSON.parse(localStorage.getItem(this.myId + this.channelId));
                            var indexStore = msglist.findIndex(item => item.id == messageId)
                            msglist.splice(indexStore, 1)
                            msglist.sort((a, b) => a.createAt - b.createAt);
                            localStorage.setItem(this.myId + this.channelId,JSON.stringify(msglist));

                            var indexs = this.selectChat.findIndex(s => s.id == messageId);
                            if(indexs != -1){
                              this.selectChat.splice(indexs,1);
                            }

                        }
                        this.loadingVisible = false
                    })
                    .catch((error)=>{
                        this.secondaryPwd = "";
                        this.$message({
                            showClose: true,
                            message: "清除消息失败，请确认原二级密码是否正确！",
                            type: "error"
                        });
                    })

                // this.$confirm('确定删除消息吗？删除后不可恢复！', '提示', {
                //     confirmButtonText: '确定',
                //     cancelButtonText: '取消',
                //     type: 'warning'
                // }).then(_ => {
                //     this.loadingVisible = true
                //
                // }).catch(_ => {
                // })
            },
            getToUserId() {
                if(this.userChannel.channelType === 'G') {
                    return null
                }
                return this.userChannel.toUserId
            },
            onNewMessage(message) {
                //
                if(localStorage.getItem(this.myId + message.channelId) != null){
                    var msglist = JSON.parse(localStorage.getItem(this.myId + message.channelId));
                    let index = msglist.findIndex(item => item.id == message.id)
                    if(index == -1){
                        msglist.unshift(message);
                        if(msglist.length > 20){
                            msglist.splice(20,msglist.length-20)
                        }
                        msglist.sort((a, b) => a.createAt - b.createAt);
                        localStorage.setItem(this.myId + message.channelId,JSON.stringify(msglist));
                    }
                }else{
                    var msglist = [];
                    msglist.unshift(message);
                    if(msglist.length > 20){
                        msglist.splice(20,msglist.length-20)
                    }
                    msglist.sort((a, b) => a.createAt - b.createAt);
                    localStorage.setItem(this.myId + message.channelId,JSON.stringify(msglist));
                }
                if(message.fileSize && this.isVideo(message.fileExtension)){
                  var src = window.gconfig.BASE_API + '/image/' + message.filePath+'/'+message.fileName;
                  if(message.createAt > window.gconfig.oss_time){
                    src = message.oss;
                  }
                                message.playerOptions = {
                                      playbackRates: [1.0, 2.0, 3.0], //播放速度
                                      autoplay: false, //如果true,浏览器准备好时开始回放。
                                      muted: false, // 默认情况下将会消除任何音频。
                                      loop: false, // 导致视频一结束就重新开始。
                                      preload: "auto", // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                                      language: "zh-CN",
                                      // aspectRatio: "16:9", // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                                      fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                                      sources: [
                                        {
                                          type: message.fileMimeType,
                                          // type: "video/ogg",
                                          // type: "video/avi",
                                          // type: "video/wmv",
                                          // src: this.getFileUrl(message.filePath+ '/thumb', message.fileName, message.fileMimeType)
                                          // src: "https://www.runoob.com/try/demo_source/movie.mp4"
                                          // src: window.gconfig.BASE_API + '/image/' + message.filePath+'/'+message.fileName
                                          src: src
                                        }
                                      ],
                                      poster: "", //封面地址
                                      notSupportedMessage: "此视频暂无法播放，请稍后再试", //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                                      controlBar: {
                                        timeDivider: true,
                                        durationDisplay: false,
                                        remainingTimeDisplay: false,
                                        fullscreenToggle: true //全屏按钮
                                      }
                                    };
                              }

                this.isLoadMore = false
                if(this.channelId === message.channelId) {
                    let index = this.messageList.findIndex(item => item.id == message.id)

                    for(var i = this.messageList.length-1;i>=0;i--){
                      if(message.fileName && this.messageList[i].fileName == message.fileName){
                        this.messageList.splice(i,1);
                        break;
                      }
                    }
                    
                    if(index == -1){
                        this.messageList.push(message)
                        if(this.myId != message.senderId){
                            readMessage(this.channelId,[message.id],1)
                                .then(response => {
                                })
                                .catch(error => {
                                    this.loadingVisible = false
                                    outputError(this, error)
                                })
                        }
                    }
                }
                this.scrollBottom();
            },
            onReconnected() {
                console.log('重连成功！！！')
                this.maxCreateAt = 0 ;
                this.messageList = [];
                this.getMessageList();
                setTimeout(function(){
                    window.location.reload()
                },1000)
            },
            onConnectionClosed() {
                console.log('连接被断开')
                if(this.unConnected == 0){
                    this.unConnected++
                    this.$message({
                        message: '网络连接似乎出现了问题~',
                        type: 'warning',
                        duration: 0,
                    });
                }
            },
            onUserOnlineStatusChanged(receiveMessage) {
                for(let message of this.messageList) {
                    if(message.senderId === receiveMessage.userId) {
                        message.senderOnlineStatus = receiveMessage.onlineStatus
                    }
                }
            },
            onMessageRemoved(receiveMessage) {
                if(this.messageList != null && this.messageList.length > 0) {
                    //在当前对话中 在缓存中也删除
                    //不在当前对话中存键
                    var msglist = JSON.parse(localStorage.getItem(this.myId + this.channelId));
                    msglist.sort((a, b) => a.createAt - b.createAt);
                    var indexStore = msglist.findIndex(item => item.id == receiveMessage.messageId)
                    if(indexStore != -1){
                        msglist.splice(indexStore, 1)
                        localStorage.setItem(this.myId + this.channelId,JSON.stringify(msglist));
                    }else{
                        //存起来切换时候删除
                        var removeIds = [];
                        if(localStorage.getItem("removeIds")){
                            removeIds = JSON.parse(localStorage.getItem("removeIds"));
                        }
                        removeIds.push(receiveMessage.messageId)
                        localStorage.setItem("removeIds",JSON.stringify(removeIds))
                    }

                    let messageId = receiveMessage.messageId
                    let senderId = receiveMessage.senderId
                    if(senderId === this.myId) {
                        return
                    }
                    let index = 0
                    for(let message of this.messageList) {
                        if(message.id === messageId) {
                            this.messageList.splice(index, 1)
                            return
                        }
                        index++
                    }
                }
            },
            onReadMessageToOther(data){
                for(var i = 0; i < data.messageIds.length;i++){
                    for(var j =0;j < this.messageList.length;j++){
                        if(data.messageIds[i] == this.messageList[j].id){
                            this.messageList[j].read = true
                        }
                    }
                }
            },
            onMessageRemovedAll(data){
                localStorage.removeItem(this.myId + data.channelId)
                if(data.channelId == this.channelId){
                    this.messageList = []
                }
            },
            initPage(newVal, oldVal) {
                if(newVal == null || newVal === '') {
                    return
                }
                this.maxCreateAt = 0
                this.scrollBottom();
                // this.messageList = []
                this.getMessageList(false)
            },
            isImage(fileExtension) {
                let extension = fileExtension.toLowerCase()
                return extension === 'png' || extension === 'jpeg' || extension === 'jpg'
            },
            isVideo(fileExtension) {
                let extension = fileExtension.toLowerCase()
                return extension === 'mp4' || extension === 'avi' || extension === 'ogg'|| extension === 'wmv'
            },
            isGif(fileExtension) {
                let extension = fileExtension.toLowerCase()
                return extension === 'gif'
            },
            getFileUrl(filePath, fileName, mimetype,item) {
                if(item.createAt < 1600663235000){
                  const fullPath = filePath + '/thumb/' + fileName
                return window.gconfig.BASE_API + '/messages/files?fileName=' + fileName + '&fullPath=' +
                    fullPath + '&mimetype=' + mimetype
                }else if(item.createAt < window.gconfig.oss_time){
                  return window.gconfig.BASE_API + '/image/' + filePath+'/' + fileName
                }
                    return item.oss
            },
            viewImage(url, width, height) {
                this.image.url = url
                this.image.width = width
                this.image.height = height
                this.$refs.imageViewer.$emit('openDialog')
            },
            scrollBottom(type){
                if(!this.scrollFlag && !type){
                    this.moreMsg = true;
                    return
                }else{
                    this.moreMsg = false;
                }
                this.$nextTick(()=>{
                    this.messageList.sort((a, b) => a.createAt - b.createAt);
                    const msgList = document.getElementById('messageList')
                    msgList.scrollTop = msgList.scrollHeight
                    setTimeout(()=>{
                        msgList.scrollTop = msgList.scrollHeight
                          setTimeout(()=>{
                            msgList.scrollTop = msgList.scrollHeight
                              setTimeout(()=>{
                                msgList.scrollTop = msgList.scrollHeight
                              },100)
                        },500)
                    },500)
                })
            }
        },
        mounted(){
            var that = this;
            this.$root.Event.$on('loadingImg',(data)=>{
              this.messageList.unshift({
                id:'loading',
                createAt:9999999999999,
                fileSize:"1",
                snderNickname: JSON.parse(sessionStorage.getItem('currentUser')).nickname,
                fileName: data.fileName,
                read: false,
                isloading:true,
                filePath: "/static/images/loading.gif",
                fileExtension:"png",
                senderOnlineStatus: "online",
                senderId: JSON.parse(sessionStorage.getItem('currentUser')).id,
                senderName: JSON.parse(sessionStorage.getItem('currentUser')).name,
                fileSize: "",
                senderFirstLetterOfName: JSON.parse(sessionStorage.getItem('currentUser')).firstLetterOfName,
                channelId: this.channelId
              })
              console.log(this.messageList)
              this.scrollBottom();
              this.scrollBottom();
            });
            this.$root.Event.$on("createPrivateChannel",(item)=>{
                item.senderId = item.id;
                item.senderName = item.name;
                item.senderNickname = item.nickname;
                this.createPrivateChannel(item)
            })
            this.$root.Event.$emit("currentChannelId",this.channelId)
            var that = this;
            $(document).on("click",".message-content img",function(e){
                console.log(e)
                that.viewImage(e.target.src, "", "")
            })
            $(document).on("click",".content-select img",function(e){
                that.viewImage(e.target.src, "", "")
            })
            this.scrollBottom();
            $("#messageList").scroll(function () {
                if ($("#messageList")[0].scrollHeight - $("#messageList").scrollTop() - $("#messageList").height() < 200) {
                    that.scrollFlag = true;
                } else {
                    that.scrollFlag = false;
                }

                if($("#messageList")[0].scrollHeight == $("#messageList").scrollTop() + $("#messageList").height()){
                    that.moreMsg = false;
                }
            })
        },
        created() {
            this.getMessageList(false)
            let imClient = this.$store.getters.imClient
            imClient.bindNewMessage(this.onNewMessage)
            imClient.bindReconnectSuccessed(this.onReconnected)
            imClient.bindConnectionClosed(this.onConnectionClosed)
            imClient.unbindUserOnlineStatusChanged()
            imClient.bindUserOnlineStatusChanged(this.onUserOnlineStatusChanged)
            imClient.bindMessageRemoved(this.onMessageRemoved)
            imClient.bindReadMessageToOther(this.onReadMessageToOther)
            imClient.bindMessageRemovedAll(this.onMessageRemovedAll)
        },
        watch: {
          selectChat(){
            this.$root.Event.$emit('selectChat',this.selectChat);
          },
            $route: function () {
                this.scrollFlag = true;
                this.selectChat = [];
                this.messageList.sort((a, b) => a.createAt - b.createAt);
                this.$nextTick(()=>{
                    this.messageList.sort((a, b) => a.createAt - b.createAt);
                    this.scrollBottom();
                })
            },
            "userChannel.channelId": function(){
                //给该频道标记为已读
                var channelId = this.channelId;
                var myId = this.myId;
                this.$root.Event.$emit("setUnreadCount0",channelId);
                this.messageList = []
                //本地缓存读取消息
               /* var remainingStore = 1024 * 1024 * 5 - unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
                if(remainingStore < 1024){//容量满后清除本地缓存
                    localStorage.clear();
                }
                if(localStorage.getItem(myId + channelId) != null){
                    var msglist = JSON.parse(localStorage.getItem(myId + channelId))
                    var removeIds = []
                    if(localStorage.getItem("removeIds")){
                        var removeIds = JSON.parse(localStorage.getItem("removeIds"))
                        for(var i = 0;i < removeIds.length; i++){
                            var indexStore = msglist.findIndex(item => item.id == removeIds[i])
                            if(indexStore != -1){
                                msglist.splice(indexStore, 1)
                            }
                        }
                    }
                    msglist.sort((a, b) => a.createAt - b.createAt);
                    localStorage.setItem(myId + channelId,JSON.stringify(msglist));
                    this.messageList = [...msglist]
                }else{
                    this.messageList = []
                }*/
                
            },
            channelId: 'initPage',
            messageList: function(newVal, oldVal) {
                this.$nextTick(() => {
                    $(".content-select p").css({
                        margin:"0px",
                        padding:"0px",
                    })
                    $(".content p").css({
                        margin:"0px",
                        padding:"0px",
                    })
                    const msgList = document.getElementById('messageList')
                    if(!msgList) {
                        return
                    }
                    if(this.messageRemoved) {
                        this.messageRemoved = false
                        return
                    }
                    // if(this.isLoadMore) {
                    //     const msgContainer = document.getElementById('message_' + oldVal[0].id)
                    //     msgList.scrollTop = msgContainer.offsetTop
                    //     this.isLoadMore = false
                    // } else {
                    //     msgList.scrollTop = msgList.scrollHeight
                    //     setTimeout(()=>{
                    //         msgList.scrollTop = msgList.scrollHeight
                    //     },1000)
                    // }
                })
            }
        },
        components: { StatusOnlineAvatar, StatusOfflineAvatar, StatusAwayAvatar, StatusDndAvatar,
            ImageViewer: resolve => require(['@/components/message/imageViewer'], resolve),
            videoPlayer
        }
    }
</script>
<style lang="scss" scoped>
  #messageList{
    position: relative;
    height: 100%;
  }
  .newmsg{
    position: absolute;
    bottom:5px;
    right:5px;
    z-index: 2;
  }
  .msgtag{
    background-color: #5AAADB;
    margin-left: 5px;
    color: #fff;
    border-radius: 4px;
    padding:1px 2px;
    font-size: 12px;
  }
  .msgtag.manage{
    background-color: #2F5BB3;
  }
  .msgtag.master{
    background-color: red;
  }
   .msgtag.forword{
    background-color: #90d4eb;
  }
 
  .container {
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #eee;
    div {
      font-size: 15px;
    }
    .load-more-message {
      text-align: center;
      font-size: 14px;
      margin: 6px 0 3px 0;
      span {
        color: #1A6CDE;
        cursor: pointer;
      }
    }
    .message-container {
      max-width: 100%;
      width: 100%;
      word-wrap: break-word;
      .message {
        margin: 0 auto;
        padding: 10px 0px 20px 0px;
        width: 100%;
      }
    }
    .message-container:hover {
      background-color: #F6F5F4;
    }
    .status-wrapper {
      width: 32px;
      height: 32px;
      line-height: 32px;
      background-color: #DF016E;
      border-radius: 32px;
      text-align: center;
      color: #fff;
      font-weight: bold;
      float: left;
      margin-right: 6px;
      margin-left: 10px;
      cursor: pointer;
      .status-wrapper-image {
        border-radius: 100%;
        width: 100%;
        height: 100%;
        background-color: #BCB2A6;
      }
      .online-status-container {
        width: 12px;
        height: 12px;
        line-height: 12px;
        margin: -10px 0 0 21px;
      }
    }
    .sysuser-status-wrapper {
      background-color: #04549C;
    }
    .message-content {
      padding: 0 0 0 0px;
      max-width: 80%;
      float:left;
      position: relative;
      .isread{
        position: absolute;
        right: 0;
        bottom:-20px;
        font-size: 12px;
        color: #00a0e9;
      }
      .isreadd{
        color: #ccc;
      }
      .sender {
        text-overflow: ellipsis;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        display: inline-block;
      }
      .createAt {
        font-size: 12px;
        color: #8F8B86;
        padding: 0 0 0 10px;
        margin-top: -2px;
      }
      .content {
        padding: 6px 10px 6px 10px;
        line-height: 25px;
        background-color: #fff;
        /*border:1px solid #ccc;*/
        border-radius: 4px;
        margin-top: 2px;
        float: left;
      }
      .system-content {
        font-size: 14px;
        /*color: #908C87;*/
      }
      .content-select {
        padding: 6px 10px 6px 10px;
        line-height: 25px;
        background-color: #29CF29;
        /*border:1px solid #ccc;*/
        border-radius: 4px;
        margin-top: 2px;
        float: left;
      }
      .image-file {
        margin-top: 3px;
        cursor: pointer;
      }
      .attach-file {
        margin-top: 3px;
        margin-left: 2px;
        width: 280px;
        height: 64px;
        line-height: 64px;
        vertical-align: middle;
        border: solid 1px #DCDAD6;
        float:right;
        svg {
          float: left;
          border-right: solid 1px #DCDAD6;
        }
        .attach-desc {
          padding-left: 5px;
          width: 205px;
          line-height: 32px;
          color: #464548;
          font-size: 23px;
          float:left;
          div {
            font-size: 13px;
          }
          span {
            font-size: 13px;
            color: #8F8B86;
          }
        }
      }
    }
    .message-content-myself {
      .delete-message {
        color: #1A6CDE;
        cursor: pointer;
        /*margin-left: 10px;*/
        font-size: 13px;
        display: none;
      }
    }
    .message-content-myself:hover .delete-message {
      display: inline;
    }
    .clear-float {
      clear: both;
    }
    .message_right{
      .status-wrapper{
        float: right;
        margin-right: 10px;
      }
      .message-content{
        float: right;
        /*margin-right: 10px;*/
      }
      .content-select{
        float: right;
        max-width: 80%;
        text-align: left;
        padding: 6px 10px 6px 10px;
      }
    }
  }
  .notemessagge{
  background-color: #90d4eb;
  &:hover{
    background-color: #90d4eb;
  }
}
.notemessagge .message-container:hover {
      background-color: #90d4eb;
    }


.selectchat{
  background-color: #95B5C0;
  &:hover{
    background-color: #95B5C0;
  }
}
.selectchat .message-container:hover {
      background-color: #95B5C0;
    }
.container .message-content .forwordnote{
    background: #21A0FF;
    color: #fff;
  }
</style>


