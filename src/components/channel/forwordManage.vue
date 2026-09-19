<template>
  <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false" width="600px" v-loading="loadingVisible">
    <div slot="title" class="dialog-header"><h3>转发消息 - {{channelName}}</h3></div>
    <div class="list-container">
      <div class="user-list-container left-list">
        <div class="title">选择成员/群</div>
        <div class="search-container">
          <input type="text" placeholder="搜索" v-model="searchParams.username" @keyup="onSearchInputKeyUp">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="doSearch"></i>
        </div>
        <div class="checkliao">
          <el-button @click="changeliao(0)" size="mini" :type="type ==0 ? 'danger' : 'info'">全部</el-button>
          <el-button @click="changeliao(1)" size="mini" :type="type ==1 ? 'danger' : 'info'">群聊</el-button>
          <el-button @click="changeliao(2)" size="mini" :type="type ==2 ? 'danger' : 'info'">私聊</el-button>
        </div>

        <ul v-if="type == 0">
          <li v-if="!item.forword" v-for="(item, index) in this.userChannelList"  @click="selectUser(item, index)">
             <i v-if="item.channelType == 'G'">(群)</i>
            <i v-if="item.channelType == 'P'">(私)</i>
            {{ item.channelAliasName || item.channelName }}</li>
        </ul>
        <ul v-if="type == 1">
          <li v-for="(item, index) in this.userChannelList" v-if="item.channelType == 'G' && !item.forword"  @click="selectUser(item, index)">
            <i v-if="item.channelType == 'G'">(群)</i>
            <i v-if="item.channelType == 'P'">(私)</i>
            {{ item.channelAliasName || item.channelName }}</li>
        </ul>
        <ul v-if="type == 2">
          <li v-for="(item, index) in this.userChannelList" v-if="item.channelType == 'P' && !item.forword"  @click="selectUser(item, index)">
             <i v-if="item.channelType == 'G'">(群)</i>
            <i v-if="item.channelType == 'P'">(私)</i>
            {{ item.channelAliasName || item.channelName }}</li>
        </ul>
        
      </div>
      <div class="user-list-container right-list">
        <div class="title">已选成员/群</div>
        <ul>
          <li v-if="item.forword" v-for="(item, index) in this.userChannelList"  @click="unselectUser(item, index)">
             <i v-if="item.channelType == 'G'">(群)</i>
            <i v-if="item.channelType == 'P'">(私)</i>
            {{ item.channelAliasName || item.channelName }}</li>
        </ul>
      </div>
    </div>
    <div class="demo-input-suffix" style="margin-top:5px;padding:0 16px;">
      留言：
      <el-input style="width:520px;"
        placeholder="请输入留言（非必填）"
        v-model="notemessage">
      </el-input>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="doCloseDialog()">取 消</el-button>
      <el-button type="primary" size="small"  @click="doForword()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { outputError } from '@/utils/exception'
import { listNonMembers } from '@/api/user'
import { addMember } from '@/api/channel'
import { messageForword } from '@/api/message'

export default {
  name: "forword-management",
  props: ['userChannelList'],
  data() {
    return {
      notemessage:"",
      selectChat:[],
      userChannelListOld:[],
      type:0,
      loadingVisible: false,
      dialogVisible: false,
      searchParams: {
        username: '',
        limit: 20,
        offset: 0
      },
      userList: [],
      selectedUserList: [],
      userTotal: 0
    }
  },
  methods: {
    doForword(){
        var mids = [];
        for(var i = 0; i < this.selectChat.length;i++){
          mids.push(this.selectChat[i].id);
        }
        var pids=[];
        var gids=[];
        for(var i = 0; i < this.userChannelList.length;i++){
          if(this.userChannelList[i].forword && this.userChannelList[i].channelType == 'G'){
            gids.push(this.userChannelList[i].channelId);
          }
          if(this.userChannelList[i].forword && this.userChannelList[i].channelType == 'P'){
            pids.push(this.userChannelList[i].channelId);
          }
        }
        console.log('s',mids,pids,gids);
        messageForword(mids,pids,gids,this.notemessage).then(response => {
            this.loading  = false;
            this.dialogVisible = false
            this.$message({
              message: '消息转发成功~',
              type: 'success'
            });
          })
          .catch(error => {
            outputError(this, error)
          })
    },
    changeliao(type){
      this.type = type;
    },
    readerName(item){
      if(item.aliasName){
        return item.aliasName +"(" + item.name +")";
      }else{
        return item.nickname +"(" + item.name +")";
      }

    },
    doCloseDialog() {

      this.dialogVisible = false;
      this.userChannelList = this.userChannelListOld;
      this.notemessage = "";
      for(var i = 0; i < this.userChannelList.length;i++){
        this.userChannelList[i].forword = false;
      }

    },
    
    selectUser(user, index) {
      user.forword = true;
      // this.userChannelListOld = this.userChannelList;
      this.$forceUpdate();
    },
    unselectUser(user, index) {
      user.forword = false;
      // this.userChannelListOld = this.userChannelList;
      this.$forceUpdate();
    },
    doSearch() {
      // this.userChannelListOld = this.userChannelList;
      var list = [];
      for(var i = 0; i < this.userChannelList.length;i++){
        if(this.userChannelList[i].channelName && this.userChannelList[i].channelName.indexOf(this.searchParams.username) != -1 || this.userChannelList[i].forword){
          list.push(this.userChannelList[i]);
        }
      }
      this.userChannelList = list;
    },
    onSearchInputKeyUp(event) {
      if(event.keyCode === 13) {
        this.doSearch();
      }
    }
  },
  watch: {
    'searchParams.username': function(newVal, oldVal) {
      if(newVal.trim() === '') {
        this.userChannelList = this.userChannelListOld;
      }
    }
  },
  computed: {
    // saveButtonEnable() {
    //   for(var i = 0; i < this.userChannelList.length;i++){
    //     if(this.userChannelList[i].forword){
    //       return true;
    //     }
    //   }
    //   return false;
    // }
  },
  mounted: function() {
    this.$root.Event.$on('openforwordDialog',(userChannel,selectChat)=>{
      for(var i = 0; i < this.userChannelList.length;i++){
        this.userChannelList[i].forword = false;
      }
      this.channelId = userChannel.channelId;
      this.channelName = userChannel.channelName;
      this.dialogVisible = true;
      this.userChannelListOld = this.userChannelList;
      this.selectChat = selectChat;
      this.notemessage = "";
    })
    // this.$nextTick(() => {
    //   this.$on('openDialog', function(action) {
    //     this.userList = this.selectedUserList = []
    //     this.searchParams.username = ""
    //     this.searchParams.limit = 20
    //     this.searchParams.offset = 0
    //     this.dialogVisible = true
    //     this.getUserList()
    //   })
    // })
  }
}
</script>

<style lang="scss" scoped>
.checkliao{
  border-bottom: 1px solid;
  padding: 5px;
}
.list-container {
  padding-left: 16px;
  padding-right: 16px;
  height: 360px;
  .user-list-container {
    border: solid 1px #D4D1CC;
    width: 48%;
    height: 360px;
    .title {
      height: 30px;
      line-height: 30px;
      text-align: center;
      font-weight: bold;
      background-color: #F0F0F0;
      border-bottom: solid 1px #F0F0F0;
    }
    ul {
      padding: 0;
      margin: 0;
      overflow-y: auto;
      margin: 0;
      list-style-type: none;
      .load-more {
        text-align: center;
        font-size: 11px;
      }
      li {
        display: list-item;
        padding-top: 2px;
        padding-bottom: 4px;
        padding-left: 5px;
        padding-right: 5px;
        margin: 0;
        span {
          font-weight: bold;
          float: right;
          display: none;
        }
      }
      li:hover {
        background-color: #F1EFEE;
        cursor: pointer;
      }
      li:hover span {
        display: block;
      }
    }
  }

  .left-list {
    float: left;
    .search-container {
      text-align: center;
      padding: 2px 1px;
      border-bottom: solid 1px #F0F0F0;
      input {
        margin: 0 0 0 4px;
        height: 23px;
        line-height: 23px;
        width: 220px;
        outline: 0;
        border: none;
        background-color: transparent;
        -webkit-appearance: textfield;
        -webkit-rtl-ordering: logical;
        cursor: text;
      }
      i {
        cursor: pointer;
        height: 23px;
        line-height: 23px;
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
    ul {
      height: 260px;
    }
  }
  .right-list {
    float: right;
    ul {
      height: 327px;
    }
  }
}
</style>
