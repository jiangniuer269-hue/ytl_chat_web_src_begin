export class IMClient {
  constructor(url, heartChecknterval) {
    this.url = url
    this.heartChecknterval = heartChecknterval
    this.currentChannelId = ''
  }

  connect(callback) {
    this.connectCallback = callback
    this.conn = new WebSocket(this.url)

    this.conn.onopen = () => {
      this.connected = true
      this.onOpen()
    }

    this.conn.onclose = () => {
      this.connected = false
      this.onClose()
    }

    this.conn.onerror = (event) => {
      this.onError(event)
    }

    this.conn.onmessage = (event) => {
      this.onMessage(event.data)
    }
  }

  heartCheckUtil = {
    start: () => {
      this.heartCheckObj = setInterval(() => {
        console.log(this.conn.readyState)
        if (this.conn && this.conn.readyState === 1) {
          this.conn.send('')
      }
      }, 2000)
    },

    reset: () => {
      clearInterval(this.heartCheckObj)
      this.heartCheckUtil.start()
    },

    stop: () => {
      if (this.heartCheckObj) {
        clearInterval(this.heartCheckObj)
      }
    }
  }

  reconnectUtil = {
    start: () => {
      this.reconnectObj = setTimeout(() => {
        // 已经关闭了与服务器的连接
        if (this.conn.readyState == 3) {
          this.reconnectStarting = true
          console.log("尝试重新连接ws")
          this.connect()
        }
      }, 2000)
    },

    stop: () => {
      this.reconnectStarting = false
      if (this.reconnectObj) {
        clearTimeout(this.reconnectObj)
        this.reconnectObj = null
      }
    }
  }

  onOpen() {
    if(this.connectCallback != null) {
      this.connectCallback(this)
    }
    const reconnectStarting = this.reconnectStarting
    this.reconnectUtil.stop()
    if (reconnectStarting && this.handleReconnectSuccessed) {
      this.handleReconnectSuccessed()
    }
    if(this.handleUserOnline) {
      this.handleUserOnline()
    }
    this.heartCheckUtil.stop()
    this.heartCheckUtil.start()
  }

  onClose() {
    this.heartCheckUtil.stop()
    this.reconnectUtil.start()
    if(this.handleConnectionClosed) {
      this.handleConnectionClosed()
    }
    if(this.handleUserOffline) {
      this.handleUserOffline()
    }
  }

  onError(error) {
    console.error(error)
  }

  onMessage(message) {
    if (message !== '') {
      this.handleMessage(JSON.parse(message))
    }
    // this.heartCheckUtil.reset()
  }

  send(message) {
    if (this.connected) {
      this.conn.send(message)
      // this.heartCheckUtil.reset()
    }
  }
  decrypt(data) {
    var ik = sessionStorage.getItem('key') || localStorage.getItem('key')
    var key  = CryptoJS.enc.Utf8.parse(ik);
    var iv   = CryptoJS.enc.Utf8.parse(ik);
    return CryptoJS.AES.decrypt(data, key, {iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding}).toString(CryptoJS.enc.Utf8);
  }

  handleMessage(message) {
    switch (message.action) {
      case "ONLINE_STATUS_CHANGED":
        if (this.handleOnlineStatusChanged) {
          this.handleOnlineStatusChanged(message)
        }
        if(this.handleUserOnlineStatusChanged) {
          this.handleUserOnlineStatusChanged(message)
        }
        break
      case "NICKNAME_CHANGED":
        if (this.handleNicknameChanged) {
          this.handleNicknameChanged(message)
        }
        break
      case "AVATAR_CHANGED":
        if (this.handleAvatarChanged) {
          this.handleAvatarChanged(message)
        }
        break
      case "NEW_MESSAGE":
        if (this.handleNewMessage) {
          if(message.content){
            message.content = this.decrypt(message.content)
          }
          this.handleNewMessage(message)
        }
        if (this.handleUnreadMessage) {
          this.handleUnreadMessage(message)
        }
        break
      case "READ_MESSAGE":
        if(this.handleReadMessage) {
          this.handleReadMessage(message)
        }
        break
      case "JOIN_CHANNEL":
        if(this.handleJoinChannel) {
          this.handleJoinChannel(message)
        }
        break
      case "MESSAGE_REMOVED":
        if(this.handleMessageRemoved) {
          this.handleMessageRemoved(message)
        }
        break
      case "MESSAGE_REMOVED_ALL":
        if(this.handleMessageRemovedAll) {
          this.handleMessageRemovedAll(message)
        }
        break
      case "CHANNEL_NAME_CHANGED":
        if(this.handleChannelNameChanged) {
          this.handleChannelNameChanged(message)
        }
        break
      case "MEMBERS_COUNT_CHANGED":
        if(this.handleMembersCountChanged) {
          this.handleMembersCountChanged(message)
        }
        break
      case "REMOVE_FROM_CHANNEL":
        if(this.handleRemoveFromChannel) {
          this.handleRemoveFromChannel(message)
        }
        break
      case "LEAVE_CHANNEL":
        if(this.handleLeaveChannel) {
          this.handleLeaveChannel(message)
        }
        break
      case "CHANNEL_REMOVED":
        if(this.handleChannelRemoved) {
          this.handleChannelRemoved(message)
        }
        break
      case "FORCE_UPDATE_LINE_OR_FORBIDDEN_USER":
        if(this.handleForceLF) {
          this.handleForceLF(message)
        }
        break
      case "BIND_ADD_CHANNEL":
        if(this.handleChannelAdd) {
          this.handleChannelAdd(message)
        }
        break
      case "READ_MESSAGE_TO_OTHER":
        if(this.handleReadMessageToOther) {
          this.handleReadMessageToOther(message)
        }
        break
    }
  }

  bindleForceLF(callback) {
    this.handleForceLF = callback
  }

  bindOnlineStatusChanged(callback) {
    this.handleOnlineStatusChanged = callback
  }
  unbindOnlineStatusChanged() {
    this.handleOnlineStatusChanged = null
  }

  bindNicknameChanged(callback) {
    this.handleNicknameChanged = callback
  }
  unbindNicknameChanged() {
    this.handleNicknameChanged = null
  }

  bindAvatarChanged(callback) {
    this.handleAvatarChanged = callback
  }
  unbindAvatarChanged() {
    this.handleAvatarChanged = null
  }

  bindNewMessage(callback) {
    this.handleNewMessage = callback
  }
  unbindNewMesssage() {
    this.handleNewMessage = null
  }

  bindConnectionClosed(callback) {
    this.handleConnectionClosed = callback
  }
  unbindConnectionClosed() {
    this.handleConnectionClosed = null
  }

  bindReconnectSuccessed(callback) {
    this.handleReconnectSuccessed = callback
  }
  unbindReconnectSuccessed() {
    this.handleReconnectSuccessed = null
  }

  bindUnreadMessage(callback) {
    this.handleUnreadMessage = callback
  }
  unbindUnreadMessage() {
    this.handleUnreadMessage = null
  }

  bindReadMessage(callback) {
    this.handleReadMessage = callback
  }
  unbindReadMessage() {
    this.handleReadMessage = null
  }

  bindJoinChannel(callback) {
    this.handleJoinChannel = callback
  }
  unbindJoinChannel() {
    this.handleJoinChannel = null
  }

  bindUserOnlineStatusChanged(callback) {
    this.handleUserOnlineStatusChanged = callback
  }
  unbindUserOnlineStatusChanged() {
    this.handleUserOnlineStatusChanged = null
  }

  bindMessageRemoved(callback) {
    this.handleMessageRemoved = callback
  }
  bindMessageRemovedAll(callback) {
    this.handleMessageRemovedAll = callback
  }
  unbindMessageRemoved() {
    this.handleMessageRemoved = null
  }

  bindChannelNameChanged(callback) {
    this.handleChannelNameChanged = callback
  }
  unbindChannelNameChanged() {
    this.handleChannelNameChanged = null
  }

  bindMembersCountChanged(callback) {
    this.handleMembersCountChanged = callback
  }
  unbindMembersCountChanged() {
    this.handleMembersCountChanged = null
  }

  bindRemoveFromChannel(callback) {
    this.handleRemoveFromChannel = callback
  }
  unbindRemoveFromChannel() {
    this.handleRemoveFromChannel = null
  }

  bindLeaveChannel(callback) {
    this.handleLeaveChannel = callback
  }
  unbindLeaveChannel() {
    this.handleLeaveChannel = null
  }

  bindChannelRemoved(callback) {
    this.handleChannelRemoved = callback
  }
  unbindChannelRemoved() {
    this.handleChannelRemoved = null
  }
  bindChannelAdd(callback){
    this.handleChannelAdd = callback
  }
  bindReadMessageToOther(callback){
    this.handleReadMessageToOther = callback
  }
  bindUserOnline(callback) {
    this.handleUserOnline = callback
  }
  unbindUserOnline() {
    this.handleUserOnline = null
  }

  bindUserOffline(callback) {
    this.handleUserOffline = callback
  }
  unbindUserOffline() {
    this.handleUserOffline = null
  }

}
