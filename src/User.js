import { useState, useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import firebaseConfig from './.firebase.config.json'

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

function useUser() {
  let [user, setUser] = useState(firebase.auth().currentUser)
  let [uids, setUids] = useState([])

  useEffect(() => {
    if (user) return

    firebase.auth().signInAnonymously().then(({ user }) => {
      let signInRef = firebase.database().ref(user.uid)

      signInRef.set(true)
      signInRef
        .onDisconnect()
        .remove()

      setUser(user)
    })
  }, [user])

  useEffect(() => {
    firebase.database().ref().on('value', snap => {
      let uids = []
      snap.forEach(item => {
        uids = [...uids, item.key]
      })
      setUids(uids)
    })
  }, [])

  return [user, uids]
}

export default useUser
