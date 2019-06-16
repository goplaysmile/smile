import React, { useRef, useState, useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'webrtc-adapter'
import styles from './Smile.module.scss'
import Cam from './Cam'

// // handleDoc processes a request from firestore.
// async function handleDoc(uid, doc, type, pc, facingMode) {
//   if (doc.id === uid)   return console.log(`handleDoc: ignoring incoming add; it's ours.`)
//   if (type !== 'added') return console.log(`handleDoc: ${type} is not a valid type.`)

//   const msg = doc.data()
//   console.log(`handleDoc: ${JSON.stringify(msg, null, 2)}`)

//   if      (msg.ice)                   await handleIce(pc, msg.ice)
//   else if (msg.sdp.type === 'offer')  await handleOffer(uid, pc, msg.sdp, facingMode)
//   else if (msg.sdp.type === 'answer') await handleAnswer(pc, msg.sdp)
//   else                                return alert(`handleDoc: unknown data.`)

//   return doc.ref.delete()
// }

// setDoc updates firestore with either an offer, answer, or ice request.
export async function setDoc(uid, msg) {
  console.log(`setDoc: ${JSON.stringify(msg, null, 2)}`)

  return firebase.firestore().collection('webrtc').doc(uid)
    .set(JSON.parse(JSON.stringify(msg)))
    .catch(alert)
}

// handleIceCandidate responds to an incoming ICE candidate.
async function handleIceCandidate(e, onIceCand) {
  console.log('handleIceCandidate!')

  return e.candidate
    ? onIceCand(e.candidate)
    : console.log(`handleIceCandidate: ice broadcast arrived.`)
}

// handleIce processes an ICE request.
async function handleIce(pc, ice) {
  console.warn('handleIce!')

  return pc.current.addIceCandidate(new RTCIceCandidate(ice))
    .catch(err => alert(`handleIce::addIceCandidate: ${err}`))
}

// handleOffer processes a WebRTC offer.
async function handleOffer(pc, sdp, facingMode, onLocalDesc) {
  console.warn('handleOffer!')

  await pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
    .catch(err => alert(`handleOffer::setRemoteDescription: ${err}`))

  await openCamera(pc, facingMode)

  const answer = await pc.current.createAnswer()
    .catch(err => alert(`handleOffer::createAnswer: ${err}`))

  await pc.current.setLocalDescription(answer)
    .catch(err => alert(`handleOffer::setLocalDescription: ${err}`))

  onLocalDesc(pc.current.localDescription)
}

// handleAnswer processes a WebRTC answer.
async function handleAnswer(pc, sdp) {
  console.warn('handleAnswer!')

  return pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
    .catch(err => alert(`handleAnswer::setRemoteDescription: ${err}`))
}

// openCamera opens a camera and adds tracks to the stream.
async function openCamera(pc, facingMode, cam) {
  if (!navigator.mediaDevices) return alert(`This browser does not support WebRTC. Try using the original browser for this device.`)
  if (!pc.current) return alert(`RTCPeerConnection lost.`)

  facingMode = facingMode || 'user'

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode },
    audio: true,
  })

  stream.getTracks().forEach(track => {
    const sender = pc.current.getSenders()
      .find(sender => sender.track.kind === track.kind)

    if (sender) {
      console.log(`replacing track! (${track.kind})`)
      sender.replaceTrack(track)
    } else {
      console.log(`adding track! (${track.kind})`)
      pc.current.addTrack(track, stream)
    }

  })

  if (cam && cam.current) cam.current.srcObject = stream
}

// createOffer signals to another user the offer to communicate.
async function createOffer(pc, localDesc, onLocalDesc) {
  if (localDesc) return

  const offer = await pc.current.createOffer()
    .catch(err => alert(`createOffer: ${err}`))

  await pc.current.setLocalDescription(offer)
    .catch(err => alert(`setLocalDescription: ${err}`))

  onLocalDesc(pc.current.localDescription)
}

// handleTrack responds to an incoming track for the stream.
function handleTrack(e, cam) {
  cam.current.srcObject = e.streams[0]
}

// Smile is the core component.
function Smile({
  onLocalDesc,
  onIceCand,
  localDesc,
  remoteDesc,
  iceCand,
}) {
  console.warn(`Smile render!`)

  const [facingMode/* , setFacingMode */] = useState('user')
  const pc = useRef()
  const ourCam = useRef()
  const theirCam = useRef()

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    })
    pc.current.onicecandidate = e => handleIceCandidate(e, onIceCand)
    pc.current.ontrack = e => handleTrack(e, theirCam)

    // const dc = pc.current.createDataChannel('data')
    // dc.onopen = _ => {
    //   alert('dc.onopen!')
    // }
  }, [])

  useEffect(() => {
    openCamera(pc, facingMode, ourCam)
  }, [facingMode])

  useEffect(() => {
    console.warn(`Smile handle offer effect!`)
    if (!remoteDesc) return
    handleOffer(pc, remoteDesc, facingMode, onLocalDesc)
  }, [!localDesc && remoteDesc])

  useEffect(() => {
    console.warn(`Smile handle answer effect!`)
    if (!remoteDesc) return
    handleAnswer(pc, remoteDesc)
  }, [localDesc && remoteDesc])

  useEffect(() => {
    console.warn(`Smile ice candidate effect!`)
    if (!iceCand) return
    handleIce(pc, iceCand)
  }, [iceCand])

  return (
    <div
      className={styles.smile}
      onClick={() => createOffer(pc, localDesc, onLocalDesc)}
    >
      <Cam
        camRef={theirCam}
        style={{
          top: `${50}px`,
          left: `${20}px`,
        }}
        anim={'stand'}
        hat="🧢"
      // onStream={stream => {
      //   // WebRTC stuff
      // }}
      />

      <Cam
        camRef={ourCam}
        style={{
          top: `${50}px`,
          right: `${20}px`,
        }}
        anim={'stand'}
        hat="🎩"
      // onStream={stream => {
      //   // WebRTC stuff
      // }}
      />

      {/* <video
        ref={theirCam}
        className={styles.theirCam}
        autoPlay
        muted
        playsInline
      ></video>

      <video
        ref={ourCam}
        className={styles.ourCam}
        autoPlay
        muted
        playsInline
        onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
      ></video> */}
    </div>
  )
}

export default Smile
