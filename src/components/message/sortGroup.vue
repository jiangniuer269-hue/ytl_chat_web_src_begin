<template>
  <el-dialog class="ppgroupp" :visible.sync="dialogVisible" :modal-append-to-body="false" width="800px" v-loading="loadingVisible">
    <div slot="title" class="dialog-header"><h3>私聊分组 <span @click="addGroup" style="cursor: pointer;color:red;" >[新建分组]</span></h3></div>
    <div class="list-container" v-loading="loadingVisible">
      <el-card class="box-card" v-for="(group,index) in pGroup" :key="index">
        <div slot="header" class="clearfix">
          <span @click="groupEdit($event,group)" style="cursor: pointer"  v-show="!group.edit">{{group.name}}<i v-if="group.id != -1" class="el-icon-edit"></i></span>
          <input @blur="saveGroupName($event,group)" v-show="group.edit" :value="group.name" :pid="group.id">
          <i v-if="group.id != -1" class="el-icon-delete" style="float: right;margin-top: 12px;margin-right: 5px;cursor: pointer" @click="deleteGroup(group.id,index)"></i>
        </div>
        <ul class="listGroup" :id="group.id">
          <li v-if="!group.channelList.length">无成员</li>
          <li :id="item.channelId" v-for="(item,indexItem) in group.channelList" :key="indexItem">
            <el-popover
              placement="right-start"
              width="100"
              trigger="hover">
              <ul>
                <li style="color:#2472C8">更换分组</li>
                <li v-for="(ngroup,index) in pGroup" v-if="(ngroup.id != group.id) && (ngroup.id != -1)" @click="changeGroup(item,indexItem,group,ngroup)" :key="index" style="cursor: pointer;">{{ngroup.name}}</li>
              </ul>
              <span slot="reference">{{ item.channelAliasName || item.channelName }}</span>
            </el-popover>

          </li>
        </ul>
      </el-card>
    </div>
    <div style="clear: both;"></div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="closedialog">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { outputError } from '@/utils/exception'
  import { saveGroup,deleteGroup,moveGroup }  from '@/api/channel'
  import $ from 'jquery'
  export default {
    components: {
    },
    props: ['pGroup','userInfo'],
    data() {
      return {
        loading:false,
        dialogVisible:false,
      }
    },
    methods: {
      deleteGroup(id,index){
        deleteGroup(id)
          .then(response=>{
            this.$message("删除分组成功");
            let _index = this.pGroup.findIndex(item => item.id == -1)
            for(var i =0; i < this.pGroup[index].channelList.length;i++){
                this.pGroup[_index].channelList.push(this.pGroup[index].channelList[i])
            }
            this.pGroup.splice(index,1)
          }).catch(error => {
          outputError(this, error)
        })
      },
      addGroup(){
        var name = "新建分组"+this.randomString(3);
        saveGroup(this.userInfo.id,{
          name:name,
          channelIds:[],
        }).then(response=>{
          this.pGroup.push({
            id:response.data,
            name:name,
            edit:false,
            channelList:[]
          })
        }).catch(error => {
          outputError(this, error)
        })
      },
      saveGroupName(e,group){
        var name = $(e.target).val();
        if(name == group.name){
          group.edit = false;
          return
        }else{
          group.name = name
        }
        var channelIds = [];
        for(var i = 0 ; i <group.channelList.length;i++ ){
          channelIds.push(group.channelList[i].channelId)
        }
        saveGroup(this.userInfo.id,{
          name:group.name,
          id:group.id,
          channelIds:channelIds,
        }).then(response=>{
          group.edit = false
        }).catch(error => {
          outputError(this, error)
        })
      },
      groupEdit(e,group){
        if(group.id != -1){
          
          group.edit = true
          this.$nextTick(()=>{
            $("input[pid="+group.id+"]").focus()
          })
        }   
      },
      closedialog() {
        this.dialogVisible = false
      },
      changeGroup(item,index,group,ngroup){
        group.channelList.splice(index,1);
        ngroup.channelList.unshift(item);
        moveGroup(item.channelId,ngroup.id)
        .then(

        ).catch(error => {
          outputError(this, error)
        })
      },
      dragCallBack($e){
          console.log($e)
          var dragId = $e.attr("id");
          var parentId = $e.parents(".listGroup").attr("id");
          console.log(this.pGroup)
          console.log(dragId,parentId)

        //先删除他在原来分组的
//        var channel = "";
//        for(var i = 0 ; i < this.pGroup.length;i++){
//            for(var j = 0; j < this.pGroup[i].channelList.length;j++){
//              if(this.pGroup[i].channelList[j].channelId == dragId){
//                console.log(this.pGroup[i].channelList[j].channelId)
//                channel = this.pGroup[i].channelList[j];
////                this.pGroup[i].channelList.splice(j,1)
//                break
//              }
//            }
//        }
//        //加入拖拽后的分组
//        for(var i = 0 ; i < this.pGroup.length;i++){
//          if(parentId == this.pGroup[i].id) {
//            this.pGroup[i].channelList.unshift(channel)
//            break
//          }
//        }
//        this.$forceUpdate()
      },
      randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = $chars.length;
        var pwd = '';
        for (var i = 0; i < len; i++) {
          pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
      }
    },
    computed: {

    },
    mounted: function() {
      var that = this;
      this.$nextTick(() => {
        this.$on('openDialog', function(action) {
          this.dialogVisible = true;
          })
      })
    },
    components: {
    }
  }
</script>
<style lang="scss" scoped>
  ul{
    list-style: none;
    padding: 0;
    margin: 0;
    height: 163px;
    overflow: auto;
  }
  ul li{
    list-style: none;
    height: 36px;
    width: 100%;
    text-indent: 12px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    div{

    }
  }
</style>

