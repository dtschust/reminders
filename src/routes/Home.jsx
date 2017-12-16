import React from 'react'
import { connect } from 'react-redux'
import Snackbar from 'material-ui/Snackbar'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import { fetchAllThings } from '../redux/actions'
import Reminder from '../components/Reminder'

const Home = React.createClass({
  displayName: 'Home',
  propTypes: {
    token: React.PropTypes.string.isRequired,
    fetchAllThings: React.PropTypes.func.isRequired,
  },

  componentDidMount: function () {
    this.props.fetchAllThings()
  },

  renderReminder: function (id) {
    return (
      <Reminder key={id} id={id} />
    )
  },

  renderAlert: function () {
    if (this.props.alerts.length) {
      return (
        <Snackbar
          open
          message={this.props.alerts}
        />
      )
    }
  },

  refetchChannels: function () {
    const tokens = localStorage.getItem('tokens');
    Object.keys(localStorage).forEach((key) => {
    localStorage.clear(key)
    })
    localStorage.setItem('tokens', tokens)
    this.props.fetchAllThings()
  },

  render: function () {
    if (!this.props.token) {
      return (
        <div>
          <h1>Hey gimme a token!</h1>
        </div>
      )
    }
    return (
      <div style={{ border: '1px solid gray' }} >
        {this.props.reminderIds.map(this.renderReminder)}
        {this.props.reminderIds.length === 0 ? (<h3>No reminders, great job!</h3>) : null}
        {this.renderAlert()}
        <RaisedButton label='(Refetch data)' onClick={this.refetchChannels} />
      </div>
    )
  }
})

const mapStateToProps = ({ token, reminders, alerts, promptForToken }) => {
  return {
    reminderIds: reminders.map(({id}) => id),
    alerts,
    token,
  }
}

const mapDispatchToProps = { fetchAllThings }

export default connect(mapStateToProps, mapDispatchToProps)(Home)
