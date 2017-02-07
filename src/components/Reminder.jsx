import React from 'react'
import { connect } from 'react-redux'
import { fetchMessages, addUserToFetch, completeReminder, deleteReminder } from '../redux/actions'
import FlatButton from 'material-ui/FlatButton'
import CircularProgress from 'material-ui/CircularProgress'
import Paper from 'material-ui/Paper'
import moment from 'moment'
import _ from 'lodash'
import { createSelector } from 'reselect'

const horribleRegexHacks = function (message) {
  message = message.replace(/( |\n)\*(.*?)\*/g, '<strong>$1$2</strong>')
  message = message.replace(/\n/g, '<br/>')
  message = message.replace(/(?:```)(?:<br\/>)?(.*?)(?:```)/gm, '<pre>$1</pre>')
  message = message.replace(/(?:`)(.*?)(?:`)/g, '<pre class="inline">$1</pre>')
  message = message.replace(/(?: _)(.*?)(?:_)/g, '<i> $1</i>')
  message = message.replace(/(?:~)(.*?)(?:~)/g, '<s>$1</s>')
  return message
}

const buildMessageHTML = function (message, users, addUserToFetch) {
  let regex = /<(.*?)>/g
  message = message.replace(regex, (match) => {
    if (match.slice(0, 3) === '<#C') {
      // channel
      let channelName = /(?:<.*)\|(.*)>/.exec(match)[1]
      return `<span style=color:blue>#${channelName}</span>`
    } else if (match.slice(0, 3) === '<@U' || match.slice(0, 3) === '<@W') {
      // user
      let userId = /(?:<@)(.*)>/.exec(match)[1].split('|')[0]
      if (users[userId]) {
        return `<span style=color:blue>${users[userId]}</span>`
      }
      _.defer(() => {
        addUserToFetch(userId)
      })
      return match
    } else {
      // link
      let [ url, display ] = match.slice(1, -1).split('|')
      if (!display) {
        display = url
      }
      return `<a href="${url}">${display}</a>`
    }
  })
  return horribleRegexHacks(message)
}

const Reminder = React.createClass({
  displayName: 'Reminder',
  propTypes: {
    id: React.PropTypes.string,
    text: React.PropTypes.string,
    message: React.PropTypes.object,
    message_url: React.PropTypes.string,
    complete_ts: React.PropTypes.number,
    time: React.PropTypes.number,
    referencedMessages: React.PropTypes.array,
    fetchMessages: React.PropTypes.func.isRequired,
    completeReminder: React.PropTypes.func.isRequired,
    addUserToFetch: React.PropTypes.func.isRequired,
    channels_loaded: React.PropTypes.bool,
    users: React.PropTypes.object
  },

  complete: function () {
    this.props.completeReminder(this.props.id)
  },

  delete: function () {
    this.props.deleteReminder(this.props.id)
  },

  componentWillReceiveProps: function (nextProps) {
    this.maybeFetchMessage(nextProps)
  },

  componentWillMount: function () {
    this.maybeFetchMessage(this.props)
  },

  maybeFetchMessage: function (props) {
    if (props.channels_loaded) {
      props.fetchMessages(props.id, props.text)
    }
  },

  renderMessage: function (message, i) {
    if (message.fetching) {
      return (<CircularProgress key={i} />)
    } else if (message && message.text) {
      let user = this.props.users[message.user]
      if (!user) {
        _.defer(() => {
          message.user && this.props.addUserToFetch(message.user)
        })
        user = message.user
      }
      return (
        <Paper key={i} style={{margin: '20px', padding: '20px'}} zDepth={1}>
          <a style={{textAlign: 'center', display: 'block', fontSize: '18px', marginBottom: '20px'}} target='_blank' href={message.message_url}>Referenced Message by {user}</a>
          <div dangerouslySetInnerHTML={{__html: buildMessageHTML(message.text, this.props.users, this.props.addUserToFetch)}} />
        </Paper>
      )
    }
  },

  render: function () {
    let {text, time} = this.props
    let referencedMessageText = _.get(this.props, 'referencedMessages[0].text');
    let omnifocusUrl = `omnifocus:///add?name=${encodeURI(text)}`
    if (referencedMessageText) {
      omnifocusUrl += `&note=${encodeURI(referencedMessageText)}`
    }
    return (
      <Paper style={{margin: '20px', padding: '20px'}} zDepth={1}>
        <FlatButton onClick={this.complete} label='Try to complete' primary />
        <FlatButton onClick={this.delete} label='Try to delete' secondary />
        <FlatButton style={{float: 'right'}} href={omnifocusUrl} label='+ Omnifocus' primary />
        <h2 dangerouslySetInnerHTML={{__html: buildMessageHTML(text, this.props.users, this.props.addUserToFetch)}} />
        {this.props.referencedMessages.map(this.renderMessage)}
        <h3 title={moment(time * 1000).format('dddd, MMMM Do YYYY, h:mm:ss a')}>{`originally due ${moment(time * 1000).fromNow()} (I don't do snoozes)`}</h3>
      </Paper>
    )
  }
})

const getReminders = (state) => state.reminders
const getId = (state) => state.id
const getAllReferencedMessages = (state) => state.referencedMessages

const makeGetReminder = () => {
  return createSelector(
  [ getReminders, getId ],
  (reminders, id) => {
    return reminders.find(({id: reminderId}) => id === reminderId)
  }
  )
}

const makeGetReferencedMessages = (getReminder) => {
  return createSelector(
  [ getReminder, getAllReferencedMessages ],
  (reminder, allReferencedMessages) => {
    return (reminder.referencedMessages || []).map((id) => allReferencedMessages[id])
  }
  )
}

const makeMapStateToProps = () => {
  const getReminder = makeGetReminder()
  const getReferencedMessages = makeGetReferencedMessages(getReminder)
  const mapStateToProps = ({ reminders, channels, users, referencedMessages, channelsLoaded }, {id}) => {
    let reminder = getReminder({reminders, id})
    return {
      channels_loaded: channelsLoaded,
      users,
      ...reminder,
      referencedMessages: getReferencedMessages({ reminders, id, referencedMessages })
    }
  }
  return mapStateToProps
}

const mapDispatchToProps = { fetchMessages, addUserToFetch, completeReminder, deleteReminder }

export default connect(makeMapStateToProps, mapDispatchToProps)(Reminder)
