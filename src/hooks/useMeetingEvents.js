import { useEffect, useRef, useState } from 'react'
import { getChatServerBaseUrl } from '@/services/chat-service'

const BASE_URL = getChatServerBaseUrl()

export const useMeetingEvents = (participantId, { onMeeting } = {}) => {
  const handlerRef = useRef(onMeeting)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    handlerRef.current = onMeeting
  }, [onMeeting])

  useEffect(() => {
    if (!participantId || typeof window === 'undefined' || typeof EventSource === 'undefined') {
      setConnected(false)
      return undefined
    }

    const source = new EventSource(
      `${BASE_URL}/meetings/events?participantId=${encodeURIComponent(participantId)}`
    )

    const handleMeeting = (event) => {
      if (!handlerRef.current) return
      try {
        const data = JSON.parse(event.data)
        handlerRef.current(data)
      } catch (error) {
        console.error('Failed to parse meeting event payload', error)
      }
    }

    const handleHeartbeat = () => {
      setConnected(true)
    }

    source.addEventListener('meeting', handleMeeting)
    source.addEventListener('heartbeat', handleHeartbeat)
    source.onopen = () => setConnected(true)
    source.onerror = () => setConnected(false)

    return () => {
      setConnected(false)
      source.removeEventListener('meeting', handleMeeting)
      source.removeEventListener('heartbeat', handleHeartbeat)
      source.close()
    }
  }, [participantId])

  return { connected }
}
