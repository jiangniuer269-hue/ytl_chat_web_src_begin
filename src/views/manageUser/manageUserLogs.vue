<template>
  <div style="background-color: #fff;padding: 10px;">
    <div class="demo-input-suffix" style="float: left">
      <el-input style="width: 400px;"
        placeholder="输入内容按回车搜索日志"
        prefix-icon="el-icon-search" @keyup.enter.native="searchUser" clearable @clear="clearSearch"
        v-model="page.keyword">
      </el-input>
    </div>
  <el-table
    :data="tableData"
    style="width: 100%">
    <!--<el-table-column-->
      <!--type="selection"-->
      <!--width="55">-->
    <!--</el-table-column>-->
    <el-table-column width="120px"
      label="操作类型">
      <template slot-scope="scope">
        <span>{{ scope.row.type }}</span>
      </template>
    </el-table-column>
    <el-table-column width="120px"
      label="操作人">
      <template slot-scope="scope">
        <span>{{ scope.row.editor.name }}</span>
      </template>
    </el-table-column>
    <el-table-column width="160px"
      label="操作时间">
      <template slot-scope="scope">
        <span>{{ scope.row.created_at }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="操作日志">
      <template slot-scope="scope">
        <!--<i class="el-icon-time"></i>-->
        <span>{{ scope.row.content }}</span>
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
  import { listUserLogs } from '@/api/user'

  export default {
    data() {
      return {
        page: {
          keyword: '',
          current:1,
          pageSize: 20,
          total:0,
        },
        tableData: [],
        current:{}
      }
    },
    mounted(){
      this.doSearchUser()
    },
    methods: {
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
      doSearchUser() {
        this.showLoading = true
        listUserLogs(this.page.keyword, this.page.pageSize, (this.page.current-1) * this.page.pageSize)
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
