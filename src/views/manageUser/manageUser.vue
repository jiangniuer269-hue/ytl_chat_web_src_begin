<template>
  <div style="background-color: #fff;padding: 10px;">
    <div class="demo-input-suffix" style="float: left">
      <el-input style="width: 200px;"
        placeholder="搜索用户名/昵称"
        prefix-icon="el-icon-search" @keyup.enter.native="searchUser" clearable @clear="clearSearch"
        v-model="page.username">
      </el-input>
      <el-select @change="selectOrigin" v-model="value" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <el-row style="float: right;">
      <el-button type="warning" @click="restartSys">重启服务</el-button>

      <el-button type="success" @click="addUser">添加用户</el-button>
      <register-user ref="registerUser" @onRegisterSuccessed="onRegisterSuccessed"></register-user>
      <!--<el-button type="warning">批量删除</el-button>-->
    </el-row>
  <el-table
    :data="tableData"
    style="width: 100%">
    <!--<el-table-column-->
      <!--type="selection"-->
      <!--width="55">-->
    <!--</el-table-column>-->
    <el-table-column
      label="用户名">
      <template slot-scope="scope">
        <!--<i class="el-icon-time"></i>-->
        <span size="medium">{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="姓名">
      <template slot-scope="scope">
        <span size="medium">{{ scope.row.nickname }}</span>
      </template>
    </el-table-column>
    <el-table-column width="160px"
      label="昨日加好友数量">
      <template slot-scope="scope">
        {{ scope.row.yesterdayNewFrilends }}
      </template>
    </el-table-column>
    <el-table-column width="160px"
      label="好友数量">
      <template slot-scope="scope">
        {{ scope.row.personCnt }}
      </template>
    </el-table-column>
    <el-table-column width="160px"
      label="注册时间">
      <template slot-scope="scope">
        <span size="medium">{{ scope.row.createdAt }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="用户来源">
      <template slot-scope="scope">
        <span v-if="scope.row.origin == 'sys'" size="medium">系统用户</span>
        <span v-if="scope.row.origin == 'pc'" size="medium">pc用户</span>
        <span v-if="scope.row.origin == 'wx'" size="medium">微信用户</span>
        <span v-if="scope.row.origin == 'link'" size="medium">游客</span>
      </template>
    </el-table-column>
    <el-table-column
      label="状态">
      <template slot-scope="scope">
        <span style="margin-right: 10px;"  v-if="scope.row.onlineStatus == 'offline'">离线</span>
        <span style="margin-right: 10px; color: green" v-if="scope.row.onlineStatus == 'online'">在线</span>
        <span  v-if="scope.row.locked">禁用</span>
        <span style="color: green" v-if="!scope.row.locked">启用</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" min-width="200px" max-width="300px">
      <template slot-scope="scope">
        <span style="cursor: pointer; color: red;" v-if="scope.row.onlineStatus == 'online'"
                   @click="handleOffLine(scope.$index, scope.row)">下线</span>
        <span style="cursor: pointer;color: red;" v-if="!scope.row.locked"
                   @click="handleForbidden(scope.$index, scope.row)">禁用</span>
        <span style="cursor: pointer;color: red;" v-if="scope.row.locked"
              @click="handleForbidden(scope.$index, scope.row)">启用</span>
        <span style="cursor: pointer; color: #6ce26c" v-if="scope.row.origin == 'pc'"
          @click="handleEdit(scope.$index, scope.row)">重置密码</span>
        <span style="cursor: pointer;color: #66b1ff" v-if="scope.row.origin == 'pc'"
                   @click="handleEditSec(scope.$index, scope.row)">重置二级密码</span>
        <span style="cursor: pointer;color: #66b1ff" v-if="scope.row.origin == 'pc'"
                   @click="handleDeleteWx(scope.$index, scope.row)">解绑微信</span>
      </template>
    </el-table-column>
  </el-table>
    <div style="height: 30px;margin-top: 20px;">
      <el-pagination style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.current"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="page.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total">
      </el-pagination>
    </div>
    <reset-password ref="resetPassword" :current="current"></reset-password>
    <reset-secpassword ref="resetSecPassword" :current="current"></reset-secpassword>
  </div>
</template>

<script>
  import { listUser,offlineUser,forbiddenUser,deleteWx } from '@/api/user'
  import { restartSys } from '@/api/auth'

  export default {
    data() {
      return {
        options: [{
          value: '0',
          label: '全部'
        }, {
          value: '2',
          label: 'PC'
        }, {
          value: '1',
          label: '微信'
        }],
        value: '0',
        page: {
          username: '',
          current:1,
          pageSize: 20,
          total:0,
          originType:0,
        },
        tableData: [],
        current:{}
      }
    },
    mounted(){
      this.doSearchUser()
    },
    methods: {
      handleDeleteWx(index,row){
        this.$confirm('确定解绑'+row.name+'微信？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(_ => {
                deleteWx(row.id).then(response => {
                    if(response.status == 200){
                        this.$message({
                            showClose: true,
                            message: '解绑成功！',
                            type: 'success'
                        })
                    }
                }).catch(error => {
                    outputError(this, error)
                })
            }).catch(_ => {

            })
      },
        restartSys(){
            this.$confirm('确定重启服务？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(_ => {
                restartSys().then(response => {
                    if(response.data == 1 && response.status == 200){
                        this.$message({
                            showClose: true,
                            message: '重启成功！',
                            type: 'success'
                        })
                    }
                }).catch(error => {
                    outputError(this, error)
                })
            }).catch(_ => {

            })
        },
        handleForbidden(index, row){
            var type = "";
            if(row.locked){
                type = "off";
            }else{
                type = "on";
            }
            forbiddenUser(row.id,type).then(response => {
                if(response.data == 1 && response.status == 200){
                    this.$message({
                        showClose: true,
                        message: '操作成功！',
                        type: 'success'
                    })
                    row.locked = !row.locked
                }
            }).catch(error => {
                outputError(this, error)
            })
        },
        handleOffLine(index, row){
            offlineUser(row.id).then(response => {
                if(response.data == 1 && response.status == 200){
                    this.$message({
                        showClose: true,
                        message: '用户下线成功！',
                        type: 'success'
                    })
                    row.onlineStatus = 'offline'
                }
            }).catch(error => {
                    outputError(this, error)
                })
        },
      selectOrigin(){
        this.doSearchUser()
      },
      onRegisterSuccessed(){
        this.clearSearch()
      },
      clearSearch(){
        this.page.username = ""
        this.page.current = 1
        this.doSearchUser()
      },
      searchUser(){
        this.page.current = 1
        this.doSearchUser()
      },
      addUser(){
        this.$refs.registerUser.$emit('openDialog')
      },
      doSearchUser() {
        this.showLoading = true
        listUser(this.page.username, this.page.pageSize, (this.page.current-1) * this.page.pageSize,this.value)
          .then(response => {
            this.tableData = response.data.rows;
            this.page.total = response.data.total;
            this.showLoading = false
          })
          .catch(error => {
            this.showLoading = false
            outputError(this, error)
          })
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleSizeChange(val) {
        this.page.pageSize = val;
        this.doSearchUser()
      },
      handleCurrentChange(val) {
        this.page.current = val;
        this.doSearchUser()
      },
      handleEdit(index, row) {
        console.log(index, row);
        this.current = row;
        this.$refs.resetPassword.$emit('openDialog')
        //修改密码

      },
        handleEditSec(index, row) {
            console.log(index, row);
            this.current = row;
            this.$refs.resetSecPassword.$emit('openDialog')
            //修改密码

        },
      handleDelete(index, row) {
        console.log(index, row);
      }
    },
    components: {
      RegisterUser: resolve => require(['@/components/user/register'], resolve),
      ResetPassword: resolve => require(['@/components/user/resetPassword'], resolve),
      ResetSecpassword: resolve => require(['@/components/user/resetSecPassword'], resolve)
    }
  }
</script>
<style lang="scss" >
  .el-input__icon{
    line-height: 28px;
  }
  .el-pagination .el-select .el-input .el-input__inner{
    line-height: 28px;
    height: 28px;
  }
</style>
