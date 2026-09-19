import request from '@/utils/request'

export const listMessage = (channelId, maxCreateAt, limit) =>
    request({
        url: '/messages',
        method: 'GET',
        aes:true,
        params: {
            channelId: channelId,
            maxCreateAt: maxCreateAt,
            limit: limit
        },
       
    })

export const saveMessage = (message) =>
    request({
        url: '/messages',
        method: 'POST',
        data: message,
        aes:true
    })
export const saveMessageAll = (message) =>
  request({
    url: '/messages/multMessages',
    method: 'POST',
    aes:true,
    data: {
      content:message
    }
  })

  export const messageForword = (mids,pids,gids,note) =>
  request({
    url: '/messages/messageForword',
    method: 'POST',
    aes:true,
    data: {
        mids,
        pids,
        gids,
        note
    }
  })


export const readMessage = (channelId,ids, total) =>
    request({
        url: '/messages/read',
        method: 'POST',
        data: {
            channelId: channelId,
            ids:ids,
            total: total
        }
    })

export const removeMessage = (messageId, channelId, toUserId,secondaryPwd,createAt) =>
    request({
        url: '/messages/deleteone',
        method: 'POST',
        data: {
            messageId: messageId,
            channelId: channelId,
            toUserId: toUserId,
            secondaryPwd: secondaryPwd,
            createAt:createAt
        }
    })
