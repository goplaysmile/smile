import React, { useState, useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import useUser from './User'
import Smile, { setDoc } from './Smile'

function App() {
  const user = useUser()
  const [ local, setLocal ] = useState()
  const [ remote, setRemote ] = useState()
  const [ ice, setIce ] = useState()

  useEffect(() => {
    if (!user) return

    return firebase.firestore().collection('webrtc').onSnapshot(snapshot => 
      snapshot.docChanges().forEach(async ({ doc, type }) => {
        if (doc.id === user.uid)   return console.log(`handleDoc: ignoring incoming add; it's ours.`)
        if (type !== 'added') return console.log(`handleDoc: ${type} is not a valid type.`)

        const msg = doc.data()
        console.log(`handleDoc: ${JSON.stringify(msg, null, 2)}`)

        // if      (msg.ice)                   await handleIce(pc, msg.ice)
        // else if (msg.type === 'offer')  await handleOffer(user.uid, pc, msg.sdp, facingMode)
        // else if (msg.type === 'answer') await handleAnswer(pc, msg.sdp)
        // else                                return alert(`handleDoc: unknown data.`)

        // return doc.ref.delete()
      })
    )
  }, [user])

  if (!user) return null

  return (
    <div>
      <Smile
        onLocalDesc={local => {
          console.log(`Smile onLocalDesc!`)
          setDoc(user.uid, local)
          setLocal(local)
        }}
        onRemoteDesc={remote => {
          console.log(`Smile onRemoteDesc!`)
          setDoc(user.uid, remote)
          setRemote(remote)
        }}
        onIceCand={ice => {
          console.log(`Smile onIceCand!`)
          setDoc(user.uid, ice)
          setIce(ice)
        }}
        localDesc={local}
        remoteDesc={remote}
        iceCand={ice}
      />
    </div>
  )
}

export default App