import React, { /* useRef, */ useEffect, useState } from 'react'
// import styled from 'styled-components'
import styles from './Cam.module.scss'
import cx from 'classnames'
import { anims } from './const'

let hats = {
  '🧢': styles.BilledHat,
  '💣': styles.BombHat,
  '🎩': styles.TopHat,
  '👒': styles.SunHat,
  '⛑': styles.MedicHat,
}

function Cam({ camRef, style, anim, hat, flip, muted, onStream }) {
  let { frames, rate } = anims[anim]

  let [frame, setFrame] = useState(0)
  // let camRef = useRef()
  // let stream = useMedia('user', true)

  // useEffect(() => {
  //   camRef.current.srcObject = stream

  //   if (stream) {
  //     onStream && onStream(stream)
  //   }

  // }, [stream, onStream])

  useEffect(() => {
    setFrame(0)

    let i = setInterval(() =>
      setFrame(frame =>
        (frame + 1) % frames.length,
      ),
      rate
    )

    return () => clearInterval(i)
  }, [anim, frames, rate])

  return (
    <div
      className={cx(styles.Cam, flip && styles.Flip)}
      style={style}
      hidden={!camRef || !camRef.current || !camRef.current.srcObject}
    >
      <img
        className={styles.Body}
        src={anims['stand'].frames[frame]}
        alt="sprite body"
      />
      {/* {
        Object.keys(anims).flatMap(a =>
          anims[a].frames.map((body, f) => {
            let isUs = a === anim && f === frame

            return (
              <img
                key={`${a},${f}`}
                className={styles.Body}
                src={body}
                alt="sprite body"
                style={isUs ? { display: 'inline' } : { display: 'none' }}
              />
            )
          })
        )
      } */}

      <div className={cx(styles.Crop, flip || styles.Flip)}>
        <video
          ref={camRef}
          autoPlay
          playsInline
        // muted={muted}
        // hidden
        />
      </div>

      <span className={hats[hat]}>
        {hat}
      </span>

      {/* <span className={styles.Name}>Alex</span> */}

    </div>

  )
}

/* function useMedia(facingMode, audio, connRef) {
  let [stream, setStream] = useState()

  facingMode = facingMode || 'user'

  useEffect(() => {

    let constr = {
      video: { facingMode },
      audio,
    }

    if (!navigator.mediaDevices) {
      return alert(`This browser does not support WebRTC. Try using the original browser for this device.`)
    }

    navigator.mediaDevices
      .getUserMedia(constr)
      .then(setStream)

  }, [facingMode, audio])

  // if (!connRef.current) return alert(`RTCPeerConnection lost.`)

  // stream.getTracks().forEach(track => {
  //   const sender = connRef.current.getSenders()
  //     .find(sender => sender.track.kind === track.kind)

  //   if (sender) {
  //     console.log(`replacing track! (${track.kind})`)
  //     sender.replaceTrack(track)
  //   } else {
  //     console.log(`adding track! (${track.kind})`)
  //     connRef.current.addTrack(track, stream)
  //   }

  // })

  return stream
} */

// function nextFrame(arr, dt, off) {
//   let t = Date.now() - (off || 0)
//   return ((t - (t % dt)) / dt) % arr.length
// }

export default Cam
