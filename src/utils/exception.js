export function outputError(source, error) {
  console.log(error.response ? error.response : error.message)
  if(error.response.status == 412){
    source.$message({
      showClose: true,
      message: error.response.data,
      type: 'error'
    })
    window.location.href = "/#/"
  }else{
    source.$message({
      showClose: true,
      message: error.response.data,
      type: 'error'
    })
  }
}
