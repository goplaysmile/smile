import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import * as serviceWorker from './serviceWorker'

console.log(`<meta http-equiv="cache-control" content="no-cache">`)
console.log(`<meta http-equiv="expires" content="Mon, 22 Jul 2002 11:12:01 GMT">`)

try {
  ReactDOM.render(<App />, document.getElementById('root'))
} catch (e) {
  alert(e)
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
