<template>
  <el-dialog :visible.sync="dialogVisible" width="500px" v-loading="loadingVisible" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header"><h3>修改个人信息</h3></div>
    <el-form :model="myInfoModel" :rules="formRules" class="el-dialog-form"
      ref="userForm" label-width="80px" label-position="right" size="small">
      <el-form-item label="用户名">
        <el-col :span="16"><el-input :maxlength="32" v-model="myInfoModel.username" readonly></el-input></el-col>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-col :span="16"><el-input ref="nickname" :maxlength="24" v-model="myInfoModel.nickname" autofocus></el-input></el-col>
      </el-form-item>
      <el-form-item label="个人签名" prop="signature">
        <el-col :span="16"><el-input ref="signature" :maxlength="32" v-model="myInfoModel.signature"></el-input></el-col>
      </el-form-item>
      <el-form-item label="头像">
        <el-col :span="16">
          <el-upload
            class="avatar-uploader"
            :action="uploadAvatarUrl"
            :headers="uploadRequestHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="myInfoModel.avatarUrl" :src="myInfoModel.avatarUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-col>
      </el-form-item>
      <el-form-item label="快捷消息" prop="fastMsg">
        <el-col :span="23">
          <el-input ref="fastMsg" type="textarea" v-model="myInfoModel.fastMsg" autofocus></el-input>
          <div style="color:red;font-weighhth:bold;">提示：每条快捷消息使用+分隔，例如：快捷消息1+快捷消息2</div>
          </el-col>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="doSaveMyInfo()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getMyInfo, updateMyInfo } from '@/api/user'
import { outputError } from '@/utils/exception'

export default {
  name: 'edit-personal-info',
  data() {
    return {
      loadingVisible: false,
      dialogVisible: false,
      myInfoModel: {
        username: '',
        nickname: '',
        signature: '',
        avatarUrl: '',
        fastMsg: '',
      },
      newAvatarUrl: '',
      oldNickname: '',
      uploadAvatarUrl: window.gconfig.BASE_API + '/users/me/avatar',
      uploadRequestHeaders: {
        'X-Token': sessionStorage.getItem('token')
      },
      formRules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 24, message: '长度在 3 到 24 个字符', trigger: 'blur' }
        ],signature: [
          { min: 0, max: 32, message: '长度在 0 到 32 个字符', trigger: 'blur' }
        ],
      }
    }
  },
  methods: {
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['userForm'].clearValidate()
        this.$refs['nickname'].focus()
      })
    },
    handleAvatarSuccess(res, file) {
      this.newAvatarUrl = res
      this.myInfoModel.avatarUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 5
      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
      }
      return (isJPG || isPNG) && isLt2M
    },
    doSaveMyInfo() {
      if(this.myInfoModel.nickname.length > 24){
        this.$message.error('昵称不能超过24个字符');
        return;
      }
      this.loadingVisible = true
      const userId = JSON.parse(sessionStorage.getItem('currentUser')).id
      updateMyInfo(userId, this.oldNickname !== this.myInfoModel.nickname ? this.myInfoModel.nickname : '', this.newAvatarUrl,this.myInfoModel.signature,this.myInfoModel.fastMsg)
      .then(response => {
        this.$store.dispatch('setAvatarUrl', this.newAvatarUrl)
        this.loadingVisible = false
        this.dialogVisible = false
      })
      .catch(error => {
        this.loadingVisible = false
        outputError(this, error)
      })
    }
  },
  computed: {
    saveButtonEnable() {
      return (this.oldNickname !== this.myInfoModel.nickname) || this.newAvatarUrl != ''
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openDialog', function(action) {
        getMyInfo()
        .then(response => {
          this.myInfoModel = response.data
          this.myInfoModel.username = response.data.name
          this.myInfoModel.fastMsg = response.data.fastMsg
          this.oldNickname = response.data.nickname

          let myAvatarUrl = response.data.avatarUrl
          if(myAvatarUrl != null && myAvatarUrl.trim() !== '') {
            myAvatarUrl = myAvatarUrl.toLowerCase()
            if(!myAvatarUrl.startsWith('http:') && !myAvatarUrl.startsWith('https:')) {
              const userId = JSON.parse(sessionStorage.getItem('currentUser')).id
              this.myInfoModel.avatarUrl = window.gconfig.BASE_API + '/users/' + userId + '/avatar?width=80&height=80&rdm='
            }
          }
          this.dialogVisible = true
        })
        .catch(error => {
          outputError(this, error)
        })
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.avatar-uploader  {
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 80px;
  width: 80px;
  margin: 0;
  padding: 0;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
}
.avatar {
  width: 80px;
  height: 80px;
  display: block;
  border-radius: 80px;
}
</style>

