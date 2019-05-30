import { useState, useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from './.firebase.config.json'

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

function useUser() {
  const [ user, setUser ] = useState(firebase.auth().currentUser)
  
  useEffect(() => {
    if (user) return

    firebase.auth().signInAnonymously().then(({ user }) => {
      setUser(user)
    })
  }, [user])

  return user
}

export default useUser
