<template>
  <div style="background-color: #fff;padding: 10px;">
    
  <el-table
    :data="tableData"
    style="width: 100%">
    <!--<el-table-column-->
      <!--type="selection"-->
      <!--width="55">-->
    <!--</el-table-column>-->
    <el-table-column
      label="域名">
      <template slot-scope="scope">
        <!--<i class="el-icon-time"></i>-->
        <span size="medium">{{ scope.row.url }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="状态">
      <template slot-scope="scope">
        <span v-if="scope.row.status == 0" size="medium">未启用</span>
        <span v-if="scope.row.status == 1" size="medium">已启用</span>
        <span v-if="scope.row.status == 2" size="medium">已禁用</span>
      </template>
    </el-table-column>

    <el-table-column label="操作" min-width="60px" max-width="300px">
      <template slot-scope="scope">
        <span style="cursor: pointer;color: red;"  @click="handleForbidden(scope.row)">禁用</span>
      </template>
    </el-table-column>
  </el-table>
  </div>
</template>

<script>
  import { listDomain,forbiddenDomain } from '@/api/user'
  import { restartSys } from '@/api/auth'

  export default {
    data() {
      return {
        tableData: []
      }
    },
    mounted(){
      this.doSearchDomain()
    },
    methods: {
        handleForbidden(row){
            this.$confirm('确定禁用域名？'+row.url, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(_ => {
                forbiddenDomain(row.id).then(response => {
                
                    this.$message({
                        showClose: true,
                        message: '操作成功！',
                        type: 'success'
                    })
                    this.tableData = response.data;
                  
              }).catch(error => {
                  outputError(this, error)
              })
            }).catch(_ => {

            })
        },   
      doSearchDomain() {
        this.showLoading = true
        listDomain()
          .then(response => {
            this.tableData = response.data;
            this.showLoading = false
          })
          .catch(error => {
            this.showLoading = false
            outputError(this, error)
          })
      }
    },
    components: {
     
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
