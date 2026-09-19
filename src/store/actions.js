import * as types from './mutation-types'

export default {
  setAvatarUrl({ commit }, data) {
    commit(types.SET_AVATAR_URL, data)
  },
  setIMClient({ commit }, data) {
    commit(types.SET_IM_CLIENT, data)
  },
  setCurrentChannelId({ commit }, data) {
    commit(types.SET_CURRENT_CHANNEL_ID, data)
  },
  setUnreadCount({ commit },data) {
    commit(types.SET_UNREAD_COUNT,data)
  }
}
