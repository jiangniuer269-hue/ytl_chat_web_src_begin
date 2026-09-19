import request from '@/utils/request'

export const loginwx = (playid,code,type,id) =>
  request({
    url: '/wx/auth',
    method: 'POST',
    data:{
      code:code,
      type:type,
      id:id,
      playid:playid,
    }
  })
export const tokenLogin = (token) =>
  request({
    url: '/user/tokenLogin',
    method: 'GET',
    params: {
      token: token
    }
  })
