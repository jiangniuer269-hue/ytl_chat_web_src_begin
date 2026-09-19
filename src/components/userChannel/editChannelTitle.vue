<template>
  <el-dialog :modal-append-to-body="false" :visible.sync="dialogVisible" width="500px" v-loading="loadingVisible" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header"><h3>编辑群公告</h3></div>
    <el-form class="el-dialog-form" ref="form" :model="model" :rules="formRules"
      label-width="80px" label-position="right" size="small">
      <el-form-item label="群公告" prop="channelTitle">
        <el-col :span="22"><el-input type="textarea" ref="channelTitle" v-model="model.channelTitle"></el-input></el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="doSaveChannelTitle()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { updateUserChannelDisplayName  } from '@/api/channel'
import { outputError } from '@/utils/exception'

export default {
  name: 'edit-channel-title',
  data() {
    return {
      loadingVisible: false,
      dialogVisible: false,
      model: {
        channelId: '',
        channelTitle: ''
      },
      formRules: {
        channelTitle: [
          { required: true, message: '请输入群公告', trigger: 'blur' },
        ]
      }
    }
  },
  methods: {
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
        this.$refs['channelTitle'].focus()
      })
    },
    doSaveChannelTitle() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loadingVisible = true
          updateUserChannelDisplayName(this.model.channelId, this.model.channelTitle)
          .then(response => {
            this.$emit('onEditTitleFinished', this.model.channelTitle)
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
    this.$nextTick(() => {
      this.$on('openDialog', function(userChannel) {
        this.model.channelId = userChannel.channelId
        this.model.channelTitle = userChannel.purpose
        this.dialogVisible = true
      })
    })
  }
}
</script>

