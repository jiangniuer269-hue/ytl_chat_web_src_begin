<template>
  <el-dialog :visible.sync="dialogVisible" width="500px" v-loading="loadingVisible" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header"><h3>导出好友资料</h3></div>
    <el-form :model="changePwdModel" :rules="formRules" class="el-dialog-form"
      ref="changePwdForm" label-width="80px" label-position="right" size="small">
      <el-form-item label="二级密码" prop="secondaryPwd">
        <el-col :span="16"><el-input ref="secondaryPwd" type="password" :maxlength="16" v-model="changePwdModel.secondaryPwd" auto-complete="off"></el-input></el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="exports">确 定</el-button>
    </span>
    <iframe style="display: none;" name="baseExport"></iframe>
    <form id="baseForm" name="baseForm" method="post" action="" target="baseExport" style="display: none;">
      <input type="hidden" :value="changePwdModel.secondaryPwd" name="secondaryPwd">
      <input type="hidden" :value="changePwdModel.token" name="token">
    </form>
  </el-dialog>
</template>

<script>
import { changePassword } from '@/api/user'
import { outputError } from '@/utils/exception'
import $ from 'jquery'
export default {
  name: "change-password",
  data() {
    return {
      loadingVisible: false,
      dialogVisible: false,
      changePwdModel: {
          token: '',
        secondaryPwd: '',
      },
      formRules: {
          secondaryPwd: [
          { required: true, message: '请输入二级密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['secondaryPwd'].focus()
      })
    },
      exports() {
      this.$refs['changePwdForm'].validate((valid) => {
        if (valid) {
          let currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
          this.changePwdModel.token = sessionStorage.getItem('token')
            setTimeout(()=>{
                this.dialogVisible = false;
                this.changePwdModel.token = "";
                this.changePwdModel.secondaryPwd = "";
                $("#baseForm").attr("action",window.gconfig.BASE_API+ '/userChannels/'+ currentUser.id +'/export').submit();
            },500)
        } else {
          return false
        }
      })
    }
  },
    watch: {
      "dialogVisible":function (val) {
          if(!val){
              this.changePwdModel.token = "";
              this.changePwdModel.secondaryPwd = "";
          }
      }
    },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openDialog', function(action) {
        this.dialogVisible = true

      })
    })
  }
}
</script>

<style lang="scss" scoped>
.vc-input {
  float: left;
  width: 190px;
}
.vc {
  width: 70px;
  height: 30px;
  line-height: 30px;
  float: right;
  border: solid 1px #CECECE;
  background-color: #F0F0F0;
  text-align: center;
  color: #007ACC;
}
.vc:hover {
  cursor: pointer;
}
</style>

