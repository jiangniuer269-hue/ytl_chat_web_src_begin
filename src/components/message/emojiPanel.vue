<template>
  <div isEmoji>
    <div class="emoji-pop slide-top" :style="{'top':position.top,'left':position.left}" isEmoji :id="id" tabindex="-1">
      <ul class="tabpage" isEmoji>
        <li class="tabpage-item" v-bind:class="{'active': activeIndex == 1}" @click="activeIndex = 1">
          <a isEmoji href="javascript:;">经典表情</a>
        </li>
        <li class="tabpage-item" v-bind:class="{'active': activeIndex == 2}" @click="activeIndex = 2">
          <a isEmoji href="javascript:;">贴吧表情</a>
        </li>
      </ul>
      <div class="emoji-container" v-bind:class="{'active': activeIndex == 1}" v-bind:style="emojiContentStyle" isEmoji>
        <div class="icon-container" @click="selectEmoticon" isEmoji>

          <a v-for="index in 91" :key="index" title="" type="emoji_icon"><img tag="emoji" :src="'../../../static/images/qq/'+index+'.gif'"></a>
        </div>
      </div>
      <div class="emoji-container" v-bind:class="{'active': activeIndex == 2}" v-bind:style="emojiContentStyle">
        <div class="icon-container" @click="selectEmoticon" isEmoji>
          <a v-for="index in 50" :key="index" title="" type="emoji_icon"><img tag="emoji" :src="'../../../static/images/tieba/'+index+'.jpg'"></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      emojiContentStyle: {
        height: '230px'
      },
      activeIndex: 1
    }
  },
  name: 'emoji-pannel',
  methods: {
    selectEmoticon(e) {
      if(e.target.src && e.target.tagName == "IMG")
        this.$emit('select-emoticon', "<img src="+e.target.src+">")
    }
  },
  props: {
    id: {
      type: String
    },
    position:{
      type:Object
    }
  }
}
</script>

<style lang="scss" scoped>
body {
  font-family: Helvetica Neue,Helvetica,Hiragino Sans GB,Microsoft YaHei,\\5FAE\8F6F\96C5\9ED1,Arial,sans-serif;
}
.emoji-pop {
  position: absolute;
  background-color: #fff;
  z-index: 9999999;
  outline: none;
  // height: 260px;
  max-width: 470px;
  overflow: none;
  background-color: #eee;
  .tabpage {
    margin: 0;
    padding: 8px 20px 0;
    overflow: hidden;
    background-color: #e4e4e4;
  }
  .tabpage-item {
    float: left;
    border-top-left-radius: 4px;
    -moz-border-radius-topleft: 4px;
    -webkit-border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    -moz-border-radius-topright: 4px;
    -webkit-border-top-right-radius: 4px;
    a {
      display: block;
      text-decoration: none;
      color: #333;
      padding: 5px 20px;
      font-size: 14px;
      outline: 0;
    }
  }
  .emoji-container {
    height: 230px;
    overflow-y: none;
    display: none;
  }
  .emoji-container.active {
    display: block;
  }
  .tabpage-item.active {
    background-color: #fff;
  }
  ul {
    padding-left: 0;
    list-style-type: none;
  }
  li {
    display: list-item;
    text-align: -webkit-match-parent;
  }
  .icon-container {
    margin-right: -1px;
    height: 230px;
    padding: 0;
    overflow-y: auto;
    background-color: #e4e4e4;
    a {
      float: left;
      width: 28px;
      height: 28px;
      font-size: 19px;
      text-align: center;
      cursor: pointer;
      background-color: #fff;
      margin: 1px;
      img{
        width: 24px;
        height: 24px;
        text-align: center;
        margin-top: 2px;
      }
    }
  }
}
.slide-top {
  -webkit-transition: all 0 cubic-bezier(.25,.46,.45,.94);
  transition: all 0 cubic-bezier(.25,.46,.45,.94);
}
.pop-arrow {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  border-width: 8px;
  border-color: #eee transparent transparent transparent;
  border-style: solid dashed dashed dashed;
  left: 14px;
  top: 260px;
}
</style>

