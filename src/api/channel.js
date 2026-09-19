import request from '@/utils/request'

export const listUserChannels = (userId,skip, limit) =>
    request({
        aes:true,
        url: '/userChannels/' + userId + '?limit=' + limit +'&skip=' + skip,
        method: 'GET'
    })

export const listGroup = (userId) =>
  request({
    url: '/userChannels/' + userId + '/group',
    method: 'GET'
  })

export const saveGroup = (userId,groupInfo) =>
  request({
    url: '/userChannels/' + userId + '/group',
    method: 'POST',
    data: groupInfo
  })
export const deleteGroup = (groupId) =>
  request({
    url: '/userChannels/' + groupId + '/group/delete',
    method: 'POST'
  })
  export const moveGroup = (channelId,groupId) =>
  request({
    url: '/userChannels/' + channelId + '/moveGroup',
    method: 'POST',
    data:{
        groupId:groupId
    }
  })

  export const sendPurpose = (userId,info) =>
  request({
    url: '/userChannels/' + userId + '/purpose',
    method: 'POST',
    data: info
  })

export const getUserChannel = (userId, channelId) =>
    request({
        url: '/userChannels',
        method: 'GET',
        params: {
            userId: userId,
            channelId: channelId
        }
    })

export const getChannelList = () =>
    request({
        url: '/channels/',
        method: 'GET'
    })

export const createChannel = (channel) =>
    request({
        url: '/channels/',
        method: 'post',
        data: channel
    })

export const getChannelById = (id) =>
    request({
        url: '/channels/' + id,
        method: 'GET'
    })

export const isAdmin = (channelId) =>
    request({
        url: '/channels/' + channelId + '/isAdmin',
        method: 'GET'
    })
export const judgeIsAdmin = (channelId,userId) =>
  request({
    url: '/channels/' + channelId + "/"+ userId + '/isAdmin',
    method: 'GET'
  })

    // 群用途
export const updateUserChannelDisplayName = (channelId, displayName) =>
    request({
        url: '/userChannels/' + channelId,
        method: 'POST',
        // headers: {
        //     'Content-type': 'text/xml'
        // },
        data: displayName
    })

export const updateChannelName = (channelId, name) =>
    request({
        url: '/channels/' + channelId,
        method: 'POST',
        data: {
            name: name
        }
    })

    export const updateChannelAvatar = (channelId, avatarUrl) =>
    request({
        url: '/channels/' + channelId,
        method: 'POST',
        data: {
            avatarUrl: avatarUrl
        }
    })

export const updateChannelPurpose = (channelId, purpose) =>
    request({
        url: '/channels/' + channelId,
        method: 'POST',
        data: {
            purpose: purpose
        }
    })

export const addMember = (channelId, userIds) =>
    request({
        url: '/channels/' + channelId + '/members',
        method: 'POST',
        data: userIds
    })

export const listMember = (channelId, username, limit, offset) =>
    request({
        url: '/channels/' + channelId + '/members',
        method: 'GET',
        params: {
            username: username,
            limit: limit,
            offset: offset
        }
    })

export const removeMember = (channelId, memberId) =>
    request({
        url: '/channels/' + channelId + '/members/delete',
        method: 'POST',
        // headers: {
        //     'Content-type': 'text/xml'
        // },
        data: memberId
    })
export const deleteMsg = (channelId,toUserId,secondaryPwd) =>
    request({
        url: '/messages/deleteall',
        method: 'POST',
        // headers: {
        //     'Content-type': 'text/xml'
        // },
        data: {
          channelId:channelId,
          toUserId:toUserId,
          secondaryPwd:secondaryPwd,
        }
    })

export const changeAdmin = (channelId, memberId, isAdmin) =>
    request({
        url: '/channels/' + channelId + '/admin',
        method: 'PUT',
        data: {
            memberId: memberId,
            isAdmin: isAdmin
        }
    })
export const forbidMember = (channelId,memberId,isForbid) =>
    request({
        url: '/channels/' + channelId + '/forbid',
        method: 'PUT',
      data: {
        userId: memberId,
        isForbid: isForbid,
      }
    })
export const memberInfo = (channelId,data) =>
    request({
        url: '/channels/' + channelId + '/memberInfo',
        method: 'POST',
      data:data
    })
export const getMemberInfo = (channelId,memberId,secondaryPwd) =>
    request({
        url: '/channels/' + channelId + '/memberInfo',
        method: 'GET',
        params: {
          secondaryPwd: secondaryPwd || '',
            memberId: memberId,
        }
    })
    export const allForbid = (channelId,isAllForbid) =>
    request({
        url: '/channels/' + channelId + '/allForbid',
        method: 'PUT',
      data: {
        allForbid: isAllForbid
      }
    })

export const leaveChannel = (channelId, memberId, memberNickname) =>
    request({
        url: '/channels/' + channelId + '/members/' + memberId+"/delete",
        method: 'POST',
        data: {
            memberNickname: memberNickname
        }
    })

export const removeChannel = (channelId) =>
    request({
        url: '/channels/' + channelId+"/delete",
        method: 'POST',
    })

export const hideChannel = (userId, channelId) =>
    request({
        url: '/userChannels/' + channelId + '/hiding',
        method: 'POST'
    })

export const searchUserChannel = (userId, name) =>
    request({
        url: '/userChannels/' + userId + '/search',
        method: 'GET',
        aes:true,
        params: {
            name: name
        }
    })
