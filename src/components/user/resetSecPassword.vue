<template>
  <el-dialog :visible.sync="dialogVisible" width="500px" v-loading="loadingVisible" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header"><h3>重置二级密码</h3></div>
    <el-form :model="changePwdModel" :rules="secformRules" class="el-dialog-form"
      ref="changePwdForm" label-width="120px" label-position="right" size="small">
      <el-form-item label="新二级密码" prop="newSecondaryPwd">
        <el-col :span="16"><el-input type="password"  :maxlength="16" v-model="changePwdModel.newSecondaryPwd" auto-complete="off"></el-input></el-col>
      </el-form-item>
      <el-form-item label="确认二级密码" prop="checkPassword">
        <el-col :span="16"><el-input type="password" :maxlength="16" v-model="changePwdModel.checkPassword" auto-complete="off"></el-input></el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="doChangePassword">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { resetSecPassword } from '@/api/user'
import { outputError } from '@/utils/exception'

export default {
  name: "change-secpassword",
  props: ['current'],
  data() {
    var validateNewPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新二级密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度至少六位数'))
      } else {
        if (this.changePwdModel.newSecondaryPwd !== '') {
          this.$refs.changePwdForm.validateField('checkPassword')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入二级密码'))
      } else if (value !== this.changePwdModel.newSecondaryPwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      loadingVisible: false,
      dialogVisible: false,
      changePwdModel: {
          newSecondaryPwd: '',
        checkPassword: ''
      },
        secformRules: {
            newSecondaryPwd: [
          { required: true, message: '请输入新二级密码', trigger: 'blur' },
          { validator: validateNewPass, trigger: 'blur' }
        ],
        checkPassword: [
          { required: true,message: '请重复新二级密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleDialogOpen() {

    },
    doChangePassword() {
      this.$refs['changePwdForm'].validate((valid) => {
        if (valid) {
          this.loadingVisible = true

            resetSecPassword(this.current.id, this.current.name, this.changePwdModel.newSecondaryPwd)
          .then(response => {
            this.loadingVisible = false
            if(response.data > 0) {
              this.dialogVisible = false
              this.$message({
                message: '重置二级密码成功',
                type: 'success'
              });
              return
            }
            outputError(this, { message: '重置二级密码失败！' })
          })
          .catch(error => {
            this.loadingVisible = false
            outputError(this, error)
          })
        } else {
          return false
        }
      })
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openDialog', function(action) {
        this.changePwdModel.newPassword = "";
        this.changePwdModel.checkPassword = "";
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

