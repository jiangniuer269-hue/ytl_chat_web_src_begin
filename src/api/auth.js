import request from '@/utils/request'
import qs from 'qs'

export const getVerificationCode = () =>
    request({
        url: 'auth/verificationCode',
        method: 'GET'
    })

export const login = (username, password,qcode) =>
    request({
        url: 'auth/login',
        method: 'post',
        data: qs.stringify({
            username,
            password,
            qcode,
        })
    })
    export const isLogin = (username,password) =>
    request({
        url: 'auth/isLogin',
        method: 'post',
        data: qs.stringify({
            username,
            password
        })
    })
export const restartSys = () =>
  request({
    url: '/system/cmd/2',
    method: 'post',
  })
