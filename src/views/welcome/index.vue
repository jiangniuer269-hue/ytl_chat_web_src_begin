<template>
  <div class="container">
    <div class="title">欢迎使用客服系统</div>
    <div class="content">未选择频道</div>
  </div>
</template>
<script>
  export default {
    beforeCreate() {
      if(JSON.parse(sessionStorage.getItem("currentUser")).origin == "wx"){
        return this.$router.push("/m")
      }
    },
  }
</script>
<style lang="scss" scoped>
body {
  height: 100%;
}
.container {
  height: 100%;
  background-color: #EFEEEC;
  text-align: center;
  vertical-align: middle;
  .title {
    padding-top: 200px;
    font-size: 28px;
    color: #0A78D8;
  }
  .content {
    font-size: 12x;
    margin-top: 6px;
    color: #D4D1CC;
  }
}
</style>

