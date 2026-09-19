<template>
  <div id="app">
    <transition>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<style>
html,body{
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}
#app {
  background:url(./assets/images/background.jpg)  0% 0% / contain ;
   position: absolute; 
   inset: 0px;
    /* 设置背景图平铺方式 */
  background-repeat: no-repeat; /* 默认横向和纵向都完全平铺 */
  /* 可选：如果你想让背景固定，不随滚动条滚动 */
  background-attachment: fixed;
    /* 3. 设置背景图在容器中的对齐位置（例如居中） 
  background-position: center; */
    /* 1. 保持背景图原始尺寸，不主动放大或缩小 
  background-size: auto; */
   padding-left: 600px;
}
</style>
