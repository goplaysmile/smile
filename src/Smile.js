import React, { createRef, useRef, useState, useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'webrtc-adapter'
import styles from './Smile.module.scss'

// handleDoc processes a request from firestore.
async function handleDoc(uid, doc, type, pc, facingMode) {
  if (doc.id === uid)   return console.log(`handleDoc: ignoring incoming add; it's ours.`)
  if (type !== 'added') return console.log(`handleDoc: ${type} is not a valid type.`)

  const msg = doc.data()
  console.log(`handleDoc: ${JSON.stringify(msg, null, 2)}`)

  if      (msg.ice)                   await handleIce(pc, msg.ice)
  else if (msg.sdp.type === 'offer')  await handleOffer(uid, pc, msg.sdp, facingMode)
  else if (msg.sdp.type === 'answer') await handleAnswer(pc, msg.sdp)
  else                                return alert(`handleDoc: unknown data.`)

  return doc.ref.delete()
}

// setDoc updates firestore with either an offer, answer, or ice request.
export async function setDoc(uid, msg) {
  console.log(`setDoc: ${JSON.stringify(msg, null, 2)}`)

  return firebase.firestore().collection('webrtc').doc(uid)
    .set(JSON.parse(JSON.stringify(msg)))
    .catch(alert)
}

// handleIce processes an ICE request.
async function handleIce(pc, ice) {
  console.warn('handleIce!')

  return pc.current.addIceCandidate(new RTCIceCandidate(ice))
    .catch(err => alert(`handleIce::addIceCandidate: ${err}`))
}

// handleOffer processes a WebRTC offer.
async function handleOffer(uid, pc, sdp, facingMode) {
  console.warn('handleOffer!')

  await pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
    .catch(err => alert(`handleOffer::setRemoteDescription: ${err}`))

  await openCamera(pc, facingMode)

  const answer = await pc.current.createAnswer()
    .catch(err => alert(`handleOffer::createAnswer: ${err}`))

  await pc.current.setLocalDescription(answer)
    .catch(err => alert(`handleOffer::setLocalDescription: ${err}`))

  return setDoc(uid, { sdp: pc.current.localDescription })
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
  if (!pc.current)             return alert(`RTCPeerConnection lost.`)

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
async function createOffer(pc, offer, onOffer) {
  if (offer) return
  
  const o = await pc.current.createOffer()
    .catch(err => alert(`createOffer: ${err}`))

  await pc.current.setLocalDescription(o)
    .catch(err => alert(`setLocalDescription: ${err}`))

  onOffer(pc.current.localDescription)
}

// handleIceCandidate responds to an incoming ICE candidate.
async function handleIceCandidate(e, uid) {
  console.log('handleIceCandidate!')

  return e.candidate
    ? setDoc(uid, { ice: e.candidate })
    : console.log(`handleIceCandidate: ice broadcast arrived.`)
}

// handleTrack responds to an incoming track for the stream.
function handleTrack(e, cam) {
  cam.current.srcObject = e.streams[0]
}

// Smile is the core component.
function Smile({ offer, onOffer }) {
  console.warn(`Smile render!`)

  const [facingMode, setFacingMode] = useState('user')
  const pc = useRef()
  const theirCam = useRef()
  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    })
    pc.current.onicecandidate = e => handleIceCandidate(e)
    pc.current.ontrack        = e => handleTrack(e, theirCam)

    // const dc = pc.current.createDataChannel('data')
    // dc.onopen = _ => {
    //   alert('dc.onopen!')
    // }

    // return firebase.firestore().collection('webrtc').onSnapshot(snapshot => 
    //   snapshot.docChanges().forEach(async ({ doc, type }) =>
    //     handleDoc(uid, doc, type, pc, facingMode)
    //   )
    // )

  }, [])

  const ourCam = useRef()
  useEffect(() => {
    openCamera(pc, facingMode, ourCam)
  }, [facingMode])

  return (
    <div
      className={styles.smile}
      onClick={() => createOffer(pc, offer, onOffer)}
    >
      <video
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
      ></video>
    </div>
  )
}

export default Smile
