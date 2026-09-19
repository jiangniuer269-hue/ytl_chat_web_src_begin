<template>
  <el-dialog  :modal="false" :close-on-click-modal="false" :show-close="false" class="img-viewer-dlg" :visible="dialogVisible" width="100%" center>
    <div @click="close" class="image-container">
      <img  @click="close" :src="imageUrl">
    </div>
  </el-dialog>
</template>

<script>
import $ from 'jquery'
import { setTimeout } from 'timers';
export default {
  name: 'image-viewer',
  props: ['imageUrl', 'imageWidth', 'imageHeight'],
  data() {
    return {
      dialogVisible: false
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openDialog', function(data) {
        this.dialogVisible = true
        this.$nextTick(() => {
          //获取设备的宽高
          var W = $(document).width()
          var H = $(document).height()
          var wh = W/H;
          $(".image-container img").css({
            width:"auto",
            height:"auto"
          })
          var imgW = $(".image-container img").width();
          var imgH = $(".image-container img").height();
          console.log(W,H,imgW,imgH)
          if(imgW/imgH >wh){
            var ww = imgW > W ? W : imgW;
            $(".image-container img").css({
              width:ww,
              height:"auto"
            })
          }else{
             var hh = imgH > H ? H : imgH;
            $(".image-container img").css({
              height:hh,
              width:'auto'
            })
          }
          $(".image-container img").css({
                "margin-top":-$(".image-container img").height()/2,
                "margin-left":-$(".image-container img").width()/2
              })
        })
      })
    })
  },
  methods: {
    close(){
      this.dialogVisible = false;
    }
  }
}
</script>


<style lang="scss" scoped>
.img-viewer-dlg {
  margin: 0;
  padding: 0;
}
.image-container {
  text-align: center;
  position: fixed;
  top:0;
  bottom:0;
  left:0;
  right:0;
  // background-color: rgba(0,0,0,.3);
  img {
    vertical-align: middle;
    /*width: 100%;*/
    max-width: 100%;
    position: absolute;
    top:50%;
    left:50%;
    z-index: 999;
  }
}
</style>
