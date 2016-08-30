import React from 'react'
import { connect } from 'react-redux'
import Snackbar from 'material-ui/Snackbar'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import { fetchAllThings, loadToken } from '../redux/actions'
import Reminder from '../components/Reminder'

const Home = React.createClass({
  displayName: 'Home',
  propTypes: {
    fetchAllThings: React.PropTypes.func.isRequired,
    loadToken: React.PropTypes.func.isRequired,
    promptForToken: React.PropTypes.bool.isRequired
  },

  componentDidMount: function () {
    this.props.fetchAllThings()
  },

  getInitialState: function () {
    return {
      token: ''
    }
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

  loadToken: function (e) {
    e.preventDefault()
    this.state.token.length && this.props.loadToken(this.state.token)
  },

  render: function () {
    if (this.props.promptForToken) {
      return (
        <div>
          <h1>Hey gimme a token!</h1>
          <form onSubmit={this.loadToken}>
            <TextField fullWidth hintText='insert token here' value={this.state.token} onChange={(e) => this.setState({token: e.target.value})} />
            <RaisedButton label='Go' type='submit' primary />
          </form>
        </div>
      )
    }
    return (
      <div>
        {this.props.reminderIds.map(this.renderReminder)}
        {this.props.reminderIds.length === 0 ? (<h3>No reminders, great job!</h3>) : null}
        {this.renderAlert()}
      </div>
    )
  }
})

const mapStateToProps = ({ reminders, alerts, promptForToken }) => {
  return {
    reminderIds: reminders.map(({id}) => id),
    alerts,
    promptForToken: !!promptForToken.resolve
  }
}

const mapDispatchToProps = { fetchAllThings, loadToken }

export default connect(mapStateToProps, mapDispatchToProps)(Home)
