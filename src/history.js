import { hashHistory, browserHistory } from 'react-router'

let history
if (process.env.NODE_ENV === 'production') {
  history = hashHistory
} else {
  history = browserHistory
}

export default history
