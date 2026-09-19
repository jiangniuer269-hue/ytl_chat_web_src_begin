<template>
  <div :id="id" type="text/plain"></div>
</template>

<script>
import $ from "jquery";
export default {
  name: "ue",

  data() {
    return {
      editor: null
    };
  },
  props: {
    value: "",
    id:{},
    config: {}
  },

  mounted() {
    const _this = this;

    this.editor = window.UE.getEditor(this.id, this.config);

    this.editor.addListener("ready", function() {
      _this.editor.setContent(_this.value);
      window.UE.dom.domUtils.on(_this.editor.body, "keydown", function(oEvent) {
        var oEvent = oEvent || window.oEvent;
        //获取键盘的keyCode值
        var nKeyCode = oEvent.keyCode || oEvent.which || oEvent.charCode;
        //获取ctrl 键对应的事件属性
        var bCtrlKeyCode = oEvent.ctrlKey || oEvent.metaKey;
        if (nKeyCode == 13 && bCtrlKeyCode) {
          _this.insertHtml("<br><br>")
        }else if (nKeyCode == 13) {
          //do something
          _this.$emit("sendMsg")
          //阻止触发默认的ctrl+s事件
          oEvent.returnValue = false;
        }
      });
      $("iframe[id^='ueditor']").contents().find("body.view").css({
        padding:0,
        margin:0,
        "background-color": "#fff",
        "min-height":"32px"
      })
      $("iframe[id^='ueditor']").contents().find("body.view p").css({
        padding:0,
        margin:0,
        "line-height":"32px"
      })

    });
    // var that = this;
    // $(document).AndKey({
    //   bindKey: "ctrl+enter",
    //   model: "once", //once loop
    //   interval: 50,
    //   context: this,
    //   callBack: function() {
    //     console.log(222);
    //     if (that.isFocus()) {
    //       console.log(1111111);
    //     }
    //   }
    // });
  },

  methods: {
    getUEContent() {
      return this.editor.getContent();
    },
    setUEContent(str) {
      return this.editor.setContent(str);
    },
    clear() {
      return this.editor.setContent("");
    },
    insertHtml(value) {
      this.editor.execCommand("insertHtml", value);
    },
    isFocus() {
      return this.editor.isFocus();
    }
  },

  destroyed() {
    this.editor.destroy();
  }
};
</script>
<style>
#edui1_bottombar {
  display: none;
}
</style>

