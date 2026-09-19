import request from '@/utils/request'

export const listUser = (name, limit, offset,originType) =>
    request({
        url: '/users',
        method: 'GET',
        params: {
            name: name,
            limit: limit,
            offset: offset,
          originType:originType ? originType : 0
        }
    })

export const deleteWx = (userId) =>
request({
    url: '/wx/' + userId + '/unbind',
    method: 'GET',
    params: {
    }
})

export const offlineUser = (id) =>
    request({
        url: '/users/'+ id +'/onlineStatus',
        method: 'POST',
        params: {
        }
    })
export const forbiddenUser = (id,type) =>
    request({
        url: '/users/'+ id +'/forbiddenUser',
        method: 'POST',
        data: {
          type
        }
    })

export const listUserLogs = (keyword, limit, offset) =>
    request({
        url: '/log/list',
        method: 'GET',
        params: {
          keyword: keyword,
            limit: limit,
            offset: offset,
        }
    })

export const updateOnlineStatus = (userId, onlineStatus) =>
    request({
        url: '/users/' + userId,
        method: 'POST',
        data: {
            'onlineStatus': onlineStatus
        }
    })

export const getMyInfo = () =>
    request({
        url: '/users/me',
        method: 'GET'
    })

export const updateMyInfo = (userId, nickname, avatarUrl,signature,fastMsg) =>
    request({
        url: '/users/' + userId,
        method: 'POST',
        data: {
            nickname: nickname,
            signature: signature,
            avatarUrl: avatarUrl,
            fastMsg: fastMsg,
        }
    })

export const registerUser = (user) =>
    request({
        url: '/users',
        method: 'POST',
        data: user
    })

export const listNonMembers = (channelId, username, limit, offset) =>
    request({
        url: '/users/nonChannelMembers',
        method: 'GET',
        params: {
            channelId: channelId,
            username: username,
            limit: limit,
            offset: offset
        }
    })

export const changePassword = (userId, username, oldPassword, newPassword) =>
    request({
        url: '/users/' + userId + '/password',
        method: 'PUT',
        data: {
            username: username,
            oldPassword: oldPassword,
            newPassword: newPassword
        }
    })

export const changeSecPassword = (userId, username, oldPassword, newPassword) =>
  request({
    url: '/users/' + userId + '/secondaryPwd',
    method: 'PUT',
    data: {
      username: username,
      oldSecondaryPwd: oldPassword,
      newSecondaryPwd: newPassword
    }
  })

export const resetPassword = (userId, username, newPassword) =>
    request({
        url: '/users/' + userId + '/password',
        method: 'POST',
        data: {
            username: username,
            newPassword: newPassword
        }
    })

export const resetSecPassword = (userId, username, newPassword) =>
  request({
    url: '/users/' + userId + '/secondaryPwd',
    method: 'POST',
    data: {
      username: username,
      newSecondaryPwd: newPassword
    }
  })

  export const listDomain = () =>
  request({
    url: '/domain/getAllDomain',
    method: 'GET',
    data: {
    }
  })

  export const forbiddenDomain = (id) =>
  request({
    url: '/domain/disable/' + id,
    method: 'POST',
    data: {
    }
  })

  export const getdomain = () =>
  request({
    url: '/domain/qrcode/',
    method: 'GET',
    data: {
    }
  })
  

