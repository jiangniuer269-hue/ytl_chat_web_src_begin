<template>
  <el-dialog :modal-append-to-body="false" :visible.sync="dialogVisible" width="500px" v-loading="loadingVisible" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header"><h3>编辑频道头像</h3></div>
    <el-form class="el-dialog-form" ref="form" :model="model" :rules="formRules"
      label-width="80px" label-position="right" size="small">
      <el-form-item label="头像">
        <el-col :span="16">
          <el-upload
            class="avatar-uploader"
            :action="uploadAvatarUrl"
            :headers="uploadRequestHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="model.avatarUrl" :src="model.avatarUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="doSaveChannelTitle()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { updateChannelAvatar  } from '@/api/channel'
import { outputError } from '@/utils/exception'

export default {
  name: 'edit-channel-avatar',
  data() {
    return {
      loadingVisible: false,
      dialogVisible: false,
      newAvatarUrl: "",
      model: {
        channelId: '',
        channelTitle: '',
        avatarUrl: ''
      },
      uploadRequestHeaders: {
        'X-Token': sessionStorage.getItem('token')
      },
      formRules: {
        channelTitle: [
          { required: true, message: '请输入频道标题', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed:{
    uploadAvatarUrl:function(){
      return window.gconfig.BASE_API + '/channels/'+ this.model.channelId+'/uploadAvatar'
    }
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.newAvatarUrl = res
      this.model.avatarUrl = URL.createObjectURL(file.raw)
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
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    doSaveChannelTitle() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loadingVisible = true
          updateChannelAvatar(this.model.channelId, this.newAvatarUrl)
          .then(response => {
            this.$emit('onEditAvatarFinished', this.model.avatarUrl)
            this.loadingVisible = false
            this.dialogVisible = false
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
    console.log(this.model)
    this.$nextTick(() => {
      this.$on('openDialog', function(userChannel) {
        console.log(this.model)
        this.model.channelId = userChannel.channelId
        this.model.channelTitle = userChannel.channelDisplayName
        this.dialogVisible = true
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

