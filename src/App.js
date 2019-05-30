import React, { useState, useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import useUser from './User'
import Smile, { setDoc } from './Smile'

function App() {
  const user = useUser()
  const [ offer, setOffer ] = useState()

  useEffect(() => {
    if (!user) return

    return firebase.firestore().collection('webrtc').onSnapshot(snapshot => 
      snapshot.docChanges().forEach(async ({ doc, type }) => {
        console.log(`handleDoc!`)

        if (doc.id === user.uid) return console.log(`handleDoc: ignoring incoming add; it's ours.`)
        if (type !== 'added') return console.log(`handleDoc: ${type} is not a valid type.`)

        const msg = doc.data()
        console.log(`handleDoc: ${JSON.stringify(msg, null, 2)}`)

        await doc.ref.delete()
      })
    )
  }, [user])

  return (
    <div>
      <Smile
        offer={offer}
        onOffer={offer => {
          console.log(`Smile onOffer! ${JSON.stringify(offer)}`)
          setDoc(user.uid, offer)
          setOffer(offer)
        }}
      />
    </div>
  )
}

export default App