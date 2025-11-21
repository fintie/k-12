import { useCallback, useEffect, useRef, useState } from 'react'

const ICE_SERVERS = []

export const useMeetingConnection = ({ onIceCandidate } = {}) => {
  const peerRef = useRef(null)
  const pendingCandidatesRef = useRef([])
  const screenStreamRef = useRef(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [connectionState, setConnectionState] = useState('new')
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const ensurePeerConnection = useCallback(() => {
    if (peerRef.current) {
      return peerRef.current
    }

    if (typeof window === 'undefined') {
      throw new Error('Peer connection can only be created in the browser environment.')
    }

    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && typeof onIceCandidate === 'function') {
        onIceCandidate(event.candidate)
      }
    }

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams
      if (stream) {
        setRemoteStream(stream)
      }
    }

    peerConnection.onconnectionstatechange = () => {
      setConnectionState(peerConnection.connectionState)
    }

    peerRef.current = peerConnection

    return peerConnection
  }, [onIceCandidate])

  useEffect(() => {
    const peerConnection = peerRef.current
    if (!peerConnection || !localStream) return

    localStream.getTracks().forEach((track) => {
      const existingSender = peerConnection
        .getSenders()
        .find((sender) => sender.track && sender.track.kind === track.kind)

      if (existingSender) {
        existingSender.replaceTrack(track)
      } else {
        peerConnection.addTrack(track, localStream)
      }
    })
  }, [localStream])

  const startLocalMedia = useCallback(async () => {
    if (localStream) {
      return localStream
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Media devices are not available in this environment.')
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 1280, height: 720 }
    })
    setLocalStream(stream)
    return stream
  }, [localStream])

  const stopLocalMedia = useCallback(() => {
    if (!localStream) return

    localStream.getTracks().forEach((track) => track.stop())
    setLocalStream(null)
  }, [localStream])

  const stopScreenShare = useCallback(() => {
    const screenStream = screenStreamRef.current
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }

    const peerConnection = peerRef.current
    const fallbackTrack = localStream?.getVideoTracks()[0]
    if (peerConnection && fallbackTrack) {
      const sender = peerConnection
        .getSenders()
        .find((item) => item.track && item.track.kind === 'video')
      if (sender) {
        sender.replaceTrack(fallbackTrack)
      }
    }

    setIsScreenSharing(false)
  }, [localStream])

  const startScreenShare = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen sharing is not supported in this environment.')
    }

    const peerConnection = ensurePeerConnection()
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
    const [screenTrack] = displayStream.getVideoTracks()

    if (screenTrack) {
      const sender = peerConnection
        .getSenders()
        .find((item) => item.track && item.track.kind === 'video')

      if (sender) {
        await sender.replaceTrack(screenTrack)
        screenStreamRef.current = displayStream
        setIsScreenSharing(true)
        screenTrack.addEventListener('ended', () => {
          stopScreenShare()
        })
      }
    }

    return displayStream
  }, [ensurePeerConnection, stopScreenShare])

  const setRemoteDescription = useCallback(
    async (description) => {
      if (!description) return
      const peerConnection = ensurePeerConnection()
      const needsUpdate =
        !peerConnection.currentRemoteDescription ||
        peerConnection.currentRemoteDescription.sdp !== description.sdp

      if (needsUpdate) {
        await peerConnection.setRemoteDescription(description)
      }

      const pending = pendingCandidatesRef.current
      if (pending.length > 0) {
        pendingCandidatesRef.current = []
        for (const candidate of pending) {
          try {
            await peerConnection.addIceCandidate(candidate)
          } catch (error) {
            console.error('Failed to flush pending ICE candidate', error)
          }
        }
      }
    },
    [ensurePeerConnection]
  )

  const addIceCandidate = useCallback(async (candidate) => {
    if (!candidate) return

    const peerConnection = peerRef.current
    if (!peerConnection || !peerConnection.remoteDescription) {
      pendingCandidatesRef.current = [...pendingCandidatesRef.current, candidate]
      return
    }

    try {
      await peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Failed to add ICE candidate', error)
    }
  }, [])

  const createOffer = useCallback(
    async (options) => {
      const peerConnection = ensurePeerConnection()
      const offer = await peerConnection.createOffer(options)
      await peerConnection.setLocalDescription(offer)
      return offer
    },
    [ensurePeerConnection]
  )

  const createAnswer = useCallback(
    async (options) => {
      const peerConnection = ensurePeerConnection()
      const answer = await peerConnection.createAnswer(options)
      await peerConnection.setLocalDescription(answer)
      return answer
    },
    [ensurePeerConnection]
  )

  const closeConnection = useCallback(() => {
    stopScreenShare()
    stopLocalMedia()

    const peerConnection = peerRef.current
    if (peerConnection) {
      peerConnection.onicecandidate = null
      peerConnection.ontrack = null
      peerConnection.onconnectionstatechange = null
      peerConnection.getSenders().forEach((sender) => sender.track?.stop())
      peerConnection.close()
    }

    peerRef.current = null
    setRemoteStream(null)
    setConnectionState('closed')
    pendingCandidatesRef.current = []
  }, [stopLocalMedia, stopScreenShare])

  useEffect(() => {
    return () => {
      closeConnection()
    }
  }, [closeConnection])

  return {
    localStream,
    remoteStream,
    connectionState,
    isScreenSharing,
    startLocalMedia,
    stopLocalMedia,
    startScreenShare,
    stopScreenShare,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closeConnection,
    ensurePeerConnection
  }
}
