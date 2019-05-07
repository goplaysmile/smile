import React from 'react'
import ReactDOM from 'react-dom'
import Smile from './Smile'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Smile />, div)
  ReactDOM.unmountComponentAtNode(div)
})
