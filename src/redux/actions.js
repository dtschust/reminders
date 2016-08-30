/* global fetch, localStorage */
import { createAction } from 'redux-act'

let TOKEN

export const loadingReminders = createAction('loading reminders')
export const loadingRemindersError = createAction('error loading reminders')
export const receivedReminders = createAction('received reminders')

export const loadingMpims = createAction('loading mpims')
export const loadingMpimsError = createAction('error loading mpims')
export const receivedMpims = createAction('received mpims')

export const loadingChannels = createAction('loading channels')
export const loadingChannelsError = createAction('error loading channels')
export const receivedChannels = createAction('received channels')

export const loadingGroups = createAction('loading groups')
export const loadingGroupsError = createAction('error loading groups')
export const receivedGroups = createAction('received groups')

export const loadingMessage = createAction('loading message')
export const loadingMessageError = createAction('error loading message')
export const receivedMessage = createAction('received message')

export const addUserToFetch = createAction('add a user to fetch')

export const loadingUsers = createAction('loading users')
export const loadingUsersError = createAction('error loading users')
export const receivedUsers = createAction('received users')

export const deletingReminder = createAction('deleting a reminder')
export const deletingReminderError = createAction('error deleting reminder')
export const reminderDeleted = createAction('deleted reminder')

export const completingReminder = createAction('completing a reminder')
export const completingReminderError = createAction('error completing reminder')
export const reminderCompleted = createAction('completed reminder')

export const promptForToken = createAction('request a token from the user')
export const loadToken = createAction('load a token')

export const fetchAllThings = function () {
  return (dispatch) => {
    TOKEN = localStorage.getItem('token')
    let promise
    if (!TOKEN) {
      promise = new Promise((resolve) => {
        dispatch(promptForToken(resolve))
      })
      promise.then((token) => {
        TOKEN = token
        localStorage.setItem('token', token)
      })
    } else {
      promise = Promise.resolve()
    }
    promise.then(() => {
      dispatch(fetchReminders())
      dispatch(fetchChannels())
      dispatch(fetchGroups())
      dispatch(fetchMpims())
    })
  }
}

export const createAlert = createAction('create an alert')
export const clearAlert = createAction('clear alert')

export const completeReminder = function (id) {
  return (dispatch) => {
    dispatch(completingReminder(id))
    return fetch(`https://slack.com/api/reminders.complete?token=${TOKEN}&reminder=${id}`, {
      method: 'GET'
    }).then(function (response) {
      return response.json()
    }).then(({ok}) => {
      if (!ok) {
        throw Error('not ok!')
      }
      dispatch(reminderCompleted(id))
    }).catch(function () {
      console.error(arguments)
      dispatch(createAlert('Error completing reminder, try to delete instead?'))
      setTimeout(() => {
        dispatch(clearAlert())
      }, 2000)
      dispatch(completingReminderError())
    })
  }
}

export const deleteReminder = function (id) {
  return (dispatch) => {
    dispatch(deletingReminder(id))
    return fetch(`https://slack.com/api/reminders.delete?token=${TOKEN}&reminder=${id}`, {
      method: 'GET'
    }).then(function (response) {
      return response.json()
    }).then(({ok}) => {
      if (!ok) {
        throw Error('not ok!')
      }
      dispatch(reminderDeleted(id))
    }).catch(function () {
      console.error(arguments)
      dispatch(createAlert('Error deleting reminder, I don\'t know why and I\'m sorry'))
      setTimeout(() => {
        dispatch(clearAlert())
      }, 2000)
      dispatch(deletingReminderError())
    })
  }
}

const sortReminders = (reminders) => {
  return reminders.sort((a, b) => {
    if (!a.complete_ts && b.complete_ts) {
      return -1
    } else if (a.complete_ts && b.complete_ts) {
      return 1
    } else {
      return a.time < b.time ? 1 : -1
    }
  })
}

export const fetchUsers = function () {
  return (dispatch, getState) => {
    dispatch(loadingUsers())
    let { usersToFetch } = getState()
    if (!usersToFetch.length) {
      return
    }

    return fetch(`https://slack.com/api/users.info?token=${TOKEN}&users=${usersToFetch.join(',')}`, {
      method: 'GET'
    }).then(function (response) {
      return response.json()
    }).then(({users}) => {
      dispatch(receivedUsers(users))
    }).catch(function () {
      console.error(arguments)
      dispatch(loadingUsersError())
    })
  }
}

export const fetchChannels = function () {
  return (dispatch) => {
    dispatch(loadingChannels())
    let channels = localStorage.getItem('channels')
    if (channels) {
      dispatch(receivedChannels(JSON.parse(channels)))
      return Promise.resolve()
    }

    return fetch(`https://slack.com/api/channels.list?token=${TOKEN}&exclude_members=true`, {
      method: 'GET'
    }).then(function (response) {
      return response.json()
    }).then(({channels}) => {
      dispatch(receivedChannels(channels))
      localStorage.setItem('channels', JSON.stringify(channels))
    }).catch(function () {
      console.error(arguments)
      dispatch(loadingChannelsError())
    })
  }
}

export const fetchMpims = function () {
  return (dispatch) => {
    dispatch(loadingMpims())
    let mpims = localStorage.getItem('mpims')
    if (mpims) {
      dispatch(receivedMpims(JSON.parse(mpims)))
      return Promise.resolve()
    }

    return fetch(`https://slack.com/api/mpim.list?token=${TOKEN}&exclude_members=true`, {
      method: 'GET'
    }).then(function (response) {
      return response.json()
    }).then(({groups}) => {
      dispatch(receivedMpims(groups))
      localStorage.setItem('mpims', JSON.stringify(groups))
    }).catch(function () {
      console.error(arguments)
      dispatch(loadingMpimsError())
    })
  }
}

export const fetchGroups = function () {
  return (dispatch) => {
    dispatch(loadingGroups())
    let groups = localStorage.getItem('groups')
    if (groups) {
      dispatch(receivedGroups(JSON.parse(groups)))
      return Promise.resolve()
    }

    return fetch(`https://slack.com/api/groups.list?token=${TOKEN}&exclude_members=true`, {
      method: 'GET'
    }).then(function (response) {
      return response.json()
    }).then(({groups}) => {
      dispatch(receivedGroups(groups))
      localStorage.setItem('groups', JSON.stringify(groups))
    }).catch(function () {
      console.error(arguments)
      dispatch(loadingGroupsError())
    })
  }
}

export const fetchMessage = function (dispatch, getState, reminderId, channel, time, url, endpoint = 'channels.history') {
  let { referencedMessages } = getState()
  if (referencedMessages[time] && (referencedMessages[time].fetching || referencedMessages[time].fetched)) {
    return
  }
  dispatch(loadingMessage({reminderId, time}))
  return fetch(`https://slack.com/api/${endpoint}?token=${TOKEN}&channel=${channel}&inclusive=1&latest=${time}&oldest=${time}`, {
    method: 'GET'
  }).then(function (response) {
    return response.json()
  }).then(({messages}) => {
    dispatch(receivedMessage({messages, reminderId, message_url: url, time}))
  }).catch(function () {
    console.error(arguments)
    dispatch(loadingMessageError({reminderId, time}))
  })
}

export const fetchMessages = function (reminderId, text) {
  return (dispatch, getState) => {
    let promises = []
    let regex = /(?:https:\/\/tinyspeck.slack.com\/archives\/)(.*?)\/p(\d*\w?\/?)/g
    let match = regex.exec(text)
    while (match) {
      let [ url, channelName, time ] = match
      time = `${time.slice(0, time.length - 6)}.${time.slice(-6)}`
      // get CID
      let channel = getState().channels.find(({name}) => name === channelName)
      if (!channel) {
        fetchMessage(dispatch, getState, reminderId, channelName, time, url, 'im.history')
      } else {
        let endpoint = 'channels.history'
        if (channel.is_mpim) {
          endpoint = 'mpim.history'
        } else if (channel.is_group) {
          endpoint = 'groups.history'
        }
        channel = channel.id
        fetchMessage(dispatch, getState, reminderId, channel, time, url, endpoint)
      }

      match = regex.exec(text)
    }
    return Promise.all(promises)
  }
}

export const fetchReminders = function () {
  return (dispatch) => {
    dispatch(loadingReminders())
    return fetch(`https://slack.com/api/reminders.list?token=${TOKEN}`, {
      method: 'GET'
    }).then(function (response) {
      return response.json()
    }).then(({reminders}) => {
      return sortReminders(reminders)
    }).then((reminders) => {
      dispatch(receivedReminders(reminders))
    }).catch(function () {
      console.error(arguments)
      dispatch(loadingRemindersError())
    })
  }
}
