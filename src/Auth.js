import React from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from './.firebase.config.json'
import { useAuthState } from 'react-firebase-hooks/auth'

firebase.initializeApp(firebaseConfig)

function Auth({ render: View }) {
  const { initialising, user } = useAuthState(firebase.auth())

  const login = () => {
    firebase.auth().signInAnonymously()
  }

  if (initialising) {
    return (
      <div>
        <p>Initialising User...</p>
      </div>
    )
  }

  if (!user) return <button onClick={login}>Log in</button>

  return <View uid={user.uid} />
}

export default Auth
