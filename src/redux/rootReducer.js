/* eslint-disable camelcase */
import { combineReducers } from 'redux'
import { createReducer } from 'redux-act'
import _ from 'lodash'
import * as Actions from './actions'

const token = createReducer({
  [Actions.storeToken]: (state, payload) => {
    return payload;
  }
}, null);

const reminders = createReducer({
  [Actions.receivedReminders]: (state, payload) => {
    return payload.filter(({complete_ts}) => !complete_ts)
  },
  [Actions.loadingMessage]: (state, {reminderId, time}) => {
    let reminderIndex = state.findIndex(({id}) => id === reminderId)
    let newState = [...state]
    let referencedMessages = newState[reminderIndex].referencedMessages || []
    referencedMessages = [...referencedMessages, time]
    referencedMessages = _.uniq(referencedMessages)

    newState[reminderIndex].referencedMessages = referencedMessages
    return newState
  },
  [Actions.loadingMessageError]: (state, {reminderId, time}) => {
    // TODO: do something?
    return state
  },
  [Actions.reminderCompleted]: (state, id) => {
    let newState = [...state]
    _.remove(newState, ({id: reminderId}) => reminderId === id)
    return newState
  },
  [Actions.reminderDeleted]: (state, id) => {
    let newState = [...state]
    _.remove(newState, ({id: reminderId}) => reminderId === id)
    return newState
  }
},
[])

const channels = createReducer({
  [Actions.receivedChannels]: (state, payload) => {
    return [...state, ...payload]
  },
  [Actions.receivedGroups]: (state, payload) => {
    return [...state, ...payload]
  },
  [Actions.receivedMpims]: (state, payload) => {
    return [...state, ...payload]
  }
},
[])

const usersToFetch = createReducer({
  [Actions.addUserToFetch]: (state, payload) => {
    return _.uniq([...state, payload])
  },
  [Actions.receivedUsers]: (state, payload) => {
  // get ids that have been fetched. remove them from state
    let ids_added = _.map(payload, 'id')
    return _.difference(state, ids_added)
  }
},
[])

const users = createReducer({
  [Actions.receivedUsers]: (state, payload) => {
    let new_users = payload.reduce((users, {id, real_name, name}) => {
      users[id] = `@${name} (${real_name})`
      return users
    },
  {})
    return {...state, ...new_users}
  }
},
{})

const referencedMessages = createReducer({
  [Actions.receivedMessage]: (state, {messages, reminderId, message_url}) => {
    let message = {...messages[0]}
    message.fetching = false
    message.fetched = true
    message.message_url = message_url
    return {...state, [message.ts]: message}
  },
  [Actions.loadingMessage]: (state, {time}) => {
    return {...state, [time]: { fetching: true }}
  },
  [Actions.loadingMessageError]: (state, {time}) => {
    return {...state, [time]: { fetching: false }}
  }
},
{})

const alerts = createReducer({
  [Actions.createAlert]: (state, payload) => {
    return payload
  },
  [Actions.clearAlert]: (state, payload) => {
    return ''
  }
}, '')

// const promptForToken = createReducer({
//   [Actions.promptForToken]: (state, resolve) => {
//     return { resolve }
//   },
//   [Actions.loadToken]: (state, payload) => {
//     state.resolve(payload)
//     return { resolve: null }
//   }

// },
//   {
//     resolve: null
//   })

const channelsLoaded = createReducer({
  [Actions.channelsLoaded]: (state, payload) => {
    return true
  }
}, false)

const rootReducer = combineReducers({
  alerts,
  reminders,
  channels,
  usersToFetch,
  referencedMessages,
  users,
  // promptForToken,
  channelsLoaded,
  token,
})

export default rootReducer
/* eslint-enable camelcase */
