import React from 'react'
import useUser from './User'
import Smile from './Smile'

function App() {
  const user = useUser()

  if (!user) return null

  return (
    <div>
      <Smile uid={user.uid} />
    </div>
  )
}

export default App