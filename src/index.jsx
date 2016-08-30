import React from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { Provider } from 'react-redux'
import Container from './Container'
import Home from './routes/Home'
import store from './redux/configureStore'
import { fetchUsers } from './redux/actions'
import './styles/index.less'

// periodically fetch unknown users
setInterval(() => {
  store.dispatch(fetchUsers())
}, 1000)

var Index = () => {
  return (
    <Provider store={store}>
      <MuiThemeProvider>
        <Container>
          <Home />
        </Container>
      </MuiThemeProvider>
    </Provider>
  )
}

document.addEventListener('DOMContentLoaded', function domLoaded (event) {
  ReactDOM.render(<Index />, document.getElementById('root'))
})
