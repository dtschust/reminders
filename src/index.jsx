import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { Provider } from 'react-redux'
import Container from './Container'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Home from './routes/Home'
import configureStore from './redux/configureStore'
import { fetchUsers, storeToken } from './redux/actions'
import './styles/index.less'
require('es6-promise').polyfill()
require('isomorphic-fetch')

const store = configureStore();

// periodically fetch unknown users
setInterval(() => {
  _.forEach(storesMap, (store) => {
    store.dispatch(fetchUsers())
  })
}, 1000)

const tokens = JSON.parse(localStorage.getItem('tokens'));

const storesMap = {};

if (tokens && tokens.length) {
  tokens.forEach((token) => {
    storesMap[token] = configureStore();
    storesMap[token].dispatch(storeToken(token));
  })
}

let inputTokens = '';

const updateTokens = (e) => {
  inputTokens = e.target.value;
}

const onSubmitTokens = (e) => {
  e.preventDefault();
  const tokens = inputTokens.replace(/\s/g, '').split(',');
  localStorage.setItem('tokens', JSON.stringify(tokens));
  window.location.reload();
}
const PromptForToken = () => {
  return (
    <div>
      <h1>Hey gimme a token or tokens!</h1>
      <form onSubmit={onSubmitTokens}>
        <TextField fullWidth hintText='insert comma separated list of tokens' onChange={updateTokens} />
        <RaisedButton label='Go' type='submit' primary />
      </form>
    </div>
  )
}


var Index = () => {
  return (
    <MuiThemeProvider>
      <Container>
        {tokens && tokens.length ? tokens.map((token) => (
          <Provider key={token} store={storesMap[token]}>
            <Home />
          </Provider>
        )): null}
        {!tokens || !tokens.length ? (<PromptForToken />) : null }
      </Container>
    </MuiThemeProvider>
  )
}

document.addEventListener('DOMContentLoaded', function domLoaded (event) {
  ReactDOM.render(<Index />, document.getElementById('root'))
})
