<template>
  <div>
<el-dialog :visible.sync="dialogVisible" @close="closedialog" :modal-append-to-body="false" width="400px">
    <div slot="title" class="dialog-header"><h3>{{channelName}}&nbsp;-&nbsp;成员</h3></div>
    <div class="list-container" v-loading="loadingVisible">
      <ul>
        <li @click="changeMemberInfo(item,index)" v-for="(item, index) in this.memberList" :class="{ 'is-admin': item.admin }" :title="item.admin ? '群管理员': ''">
          <p>{{item.nickname}}</p>
          <p>姓名：{{item.aliasName}}</p>
          <p>手机号：{{item.phone}}</p>
          <p>银行卡：{{item.bankCard}}</p>
          <p>微信：{{item.weChat}}</p>
          <p>QQ：{{item.qq}}</p>
          </li>
        <li class="load-more" v-show="searchParams.offset + searchParams.limit < memberTotal" @click="loadMoreUser();">加载更多...</li>
      </ul>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="closedialog">关闭</el-button>
    </span>
  </el-dialog>
  <!-- 修改用户名手机号码 -->
  <el-dialog :visible.sync="edit" :modal-append-to-body="false" width="400px">
    <div slot="title" class="dialog-header"><h3>{{currentMember.name}}&nbsp;-&nbsp;备注修改</h3></div>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="姓名">
        <el-input style="width:200px;" v-model="currentMember.aliasName"></el-input>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input style="width:200px;" v-model="currentMember.phone"></el-input>
      </el-form-item>
      <el-form-item label="银行卡">
        <el-input style="width:200px;" v-model="currentMember.bankCard"></el-input>
      </el-form-item>
      <el-form-item label="微信">
        <el-input style="width:200px;" v-model="currentMember.weChat"></el-input>
      </el-form-item>
      <el-form-item label="QQ">
        <el-input style="width:200px;" v-model="currentMember.qq"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="submitInfo">提交</el-button>
      <el-button size="small" @click="edit=false">关闭</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
import { outputError } from '@/utils/exception'
import { listMember,memberInfo } from '@/api/channel'

export default {
  name: 'member-list',
  props: ['channelId', 'channelName'],
  data() {
    return {
      dialogVisible: false,
      loadingVisible: true,
      memberList: [],
      searchParams: {
        username: '',
        limit: 20,
        offset: 0
      },
      memberTotal: 0,
      edit: false,
      currentMember:{
        index:"",
        aliasName:"",
        bankCard:"",
        weChat:"",
        qq:"",
      },
    }
  },
  methods: {
    closedialog(){
      this.dialogVisible = false;
      this.memberList = [];
    },
    submitInfo(){
      memberInfo(this.channelId,{
        memberId:this.currentMember.id,
        aliasName:this.currentMember.aliasName,
        phone:this.currentMember.phone,
        bankCard:this.currentMember.bankCard,
        weChat:this.currentMember.weChat,
        qq:this.currentMember.qq,
      }).then(response =>{
        this.edit=false
        this.memberList[this.currentMember.index].aliasName = this.currentMember.aliasName
        this.memberList[this.currentMember.index].phone = this.currentMember.phone
        this.memberList[this.currentMember.index].bankCard = this.currentMember.phone
        this.memberList[this.currentMember.index].weChat = this.currentMember.weChat
        this.memberList[this.currentMember.index].qq = this.currentMember.qq
        this.currentMember = {
          name:"",
          index:"",
          aliasName:"",
          phone:"",
          bankCard:"",
          weChat:"",
          qq:"",
        };
      })
    },
    changeMemberInfo(item,index){
      this.currentMember.id = item.id;
      this.currentMember.name = item.name;
      this.currentMember.aliasName = item.aliasName;
      this.currentMember.phone = item.phone;
      this.currentMember.bankCard = item.bankCard;
      this.currentMember.weChat = item.weChat;
      this.currentMember.qq = item.qq;
      this.currentMember.index = index;
      this.edit= true;
    },
    getMemberList() {
      listMember(this.channelId, this.searchParams.username,
        this.searchParams.limit, this.searchParams.offset)
      .then(response => {
        this.memberList = [...this.memberList,...response.data.rows]
        this.memberTotal = response.data.total
        this.loadingVisible = false
      })
      .catch(error => {
        this.loadingVisible = false
        outputError(this, error)
      })
    },
    loadMoreUser() {
      this.searchParams.offset += this.searchParams.limit
      this.getMemberList()
    },
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openDialog', function(action) {
        this.dialogVisible = true
        this.getMemberList()
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.list-container {
  padding: 6px 16px;
  ul {
    height: 360px;
    border: solid 1px #D4D1CC;
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
      padding: 2px 5px;
      margin: 0;
      border-bottom: 1px solid #ccc;
      p{
        padding:0;
        margin:0px;
      }
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
    .is-admin {
      color: #0A53A4;
      font-weight: bold;
    }
  }
}
</style>


