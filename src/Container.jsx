/* global localStorage */
import React from 'react'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import injectTapEventPlugin from 'react-tap-event-plugin'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const reset = function () {
  Object.keys(localStorage).forEach((key) => {
    localStorage.clear(key)
  })
  window.location.reload()
}

const Container = ({ children, loading }) => {
  return (
    <div className='app-container'>
      <AppBar
        title='Reminders' iconElementLeft={(<span />)} iconElementRight={(<FlatButton label='Problem?' onClick={reset} />)}
      />
      {children}
    </div>

  )
}

export default Container
