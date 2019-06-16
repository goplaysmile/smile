import React, { useState, useEffect, useRef } from 'react'
// import firebase from 'firebase/app'
// import 'firebase/firestore'
import Peer from 'peerjs'
import useUser from './User'
// import Smile, { setDoc } from './Smile'
import Cam from './Cam'
import styles from './App.module.scss'

function App() {
  let [user, uids] = useUser()

  let peerRef = useRef()
  useEffect(() => {
    if (!user) return
    peerRef.current = new Peer(user.uid)
  }, [user])

  let [ourStream, setOurStream] = useState()
  let ourVideo = useRef()
  useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      video: true,
      // audio: true,
    }).then(stream => {
      setOurStream(stream)
      ourVideo.current.srcObject = stream
    })

  }, [])

  let theirVideo = useRef()
  let [, setTheirStream] = useState()
  useEffect(() => {

    if (!peerRef.current || !ourStream) return

    peerRef.current.on('call', call => {

      // navigator.mediaDevices.getUserMedia({
      //   video: true,
      //   // audio: true,
      // }).then(ourStream => {
      //   setOurStream(ourStream)
      //   ourVideo.current.srcObject = ourStream

      console.log(`someone's calling you.. *answer*`)
      call.answer(ourStream)

      call.on('stream', stream => {
        console.log(`one of their streams have arrived!`)
        setTheirStream(stream)
        theirVideo.current.srcObject = stream
      })
      // })
    })

  }, [peerRef.current, ourStream])

  return (
    <div
      className={styles.App}

      onClick={() => {
        let theirUid = uids.find(theirUid => theirUid !== user.uid)

        // navigator.mediaDevices.getUserMedia({
        //   video: true,
        //   // audio: true,
        // }).then(ourStream => {
        //   setOurStream(ourStream)
        //   ourVideo.current.srcObject = ourStream

        if (!theirUid || !ourStream) return

        console.log(`calling ${theirUid}..`)
        let call = peerRef.current.call(theirUid, ourStream)

        call.on('stream', stream => {
          console.log(`one of their streams have arrived!`)
          setTheirStream(stream)
          theirVideo.current.srcObject = stream
        })
        // })
      }}
    >

      <Cam
        camRef={theirVideo}
        className={styles.TheirVideo}
        style={{
          top: `${50}px`,
          left: `${20}px`,
        }}
        anim={'stand'}
        hat="🧢"
        flip
        muted
      />

      <Cam
        camRef={ourVideo}
        className={styles.OurVideo}
        style={{
          top: `${50}px`,
          right: `${20}px`,
        }}
        anim={'stand'}
        hat="👒"
      />

      {/* <video
        ref={theirVideo}
        className={styles.TheirVideo}
        autoPlay
        muted
        playsInline
      />

      <video
        ref={ourVideo}
        className={styles.OurVideo}
        autoPlay
        muted
        playsInline
      /> */}

    </div>
  )

  // const [ local, setLocal ] = useState()
  // const [ remote, setRemote ] = useState()
  // const [ ice, setIce ] = useState()

  // useEffect(() => {
  //   if (!user) return

  //   return firebase.firestore().collection('webrtc').onSnapshot(snapshot => 
  //     snapshot.docChanges().forEach(async ({ doc, type }) => {
  //       if (doc.id === user.uid)   return console.log(`handleDoc: ignoring incoming add; it's ours.`)
  //       if (type !== 'added') return console.log(`handleDoc: ${type} is not a valid type.`)

  //       const msg = doc.data()
  //       console.log(`handleDoc: ${JSON.stringify(msg, null, 2)}`)

  //       if (msg.type === 'offer' || msg.type === 'answer') setRemote(msg)
  //       else setIce(msg)

  //       return doc.ref.delete()
  //     })
  //   )
  // }, [user])

  // if (!user) return null

  // return (
  //   <div>
  //     <Smile
  //       onLocalDesc={local => {
  //         console.log(`Smile onLocalDesc!`)
  //         setDoc(user.uid, local)
  //         setLocal(local)
  //       }}
  //       onIceCand={ice => {
  //         console.log(`Smile onIceCand!`)
  //         setDoc(user.uid, ice)
  //         setIce(ice)
  //       }}
  //       localDesc={local}
  //       remoteDesc={remote}
  //       iceCand={ice}
  //     />
  //   </div>
  // )
}

export default App
