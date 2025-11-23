import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatMeetingTime, formatRelativeMessageTime } from '@/utils/date-utils'
import { formatMeetingStatusLabel } from '@/utils/meeting-utils'
import { MessageCircle, Video, CalendarClock, ChevronRight } from 'lucide-react'
import { fetchChatMessages, fetchConversations, sendChatMessage, getChatServerBaseUrl } from '@/services/chat-service'
import { fetchUsers } from '@/services/user-service'
import { createMeeting, fetchMeetingById, fetchMeetings, sendIceCandidate, updateMeetingStatus } from '@/services/meeting-service'
import { useMeetingConnection } from '@/hooks/useMeetingConnection'
import { useMeetingEvents } from '@/hooks/useMeetingEvents'
import { useAuth } from '@/context/AuthContext'

const createConversationId = (a, b) => [String(a), String(b)].sort().join('__')

const StudentMeeting = () => {
  const [contacts, setContacts] = useState([])
  const [selectedTutorId, setSelectedTutorId] = useState(null)
  const [messagesByConversation, setMessagesByConversation] = useState({})
  const [meetings, setMeetings] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingMeetings, setLoadingMeetings] = useState(false)
  const [contactQuery, setContactQuery] = useState('')
  const [activeMeeting, setActiveMeeting] = useState(null)
  const [meetingError, setMeetingError] = useState('')
  const [isStartingMeeting, setIsStartingMeeting] = useState(false)
  const [isEndingMeeting, setIsEndingMeeting] = useState(false)
  const { user: authUser } = useAuth()

  const currentUserId = authUser?.id
  const currentUserRole = authUser?.role
  const activeMeetingRef = useRef(null)
  const pendingIceCandidatesRef = useRef([])
  const processedRemoteCandidatesRef = useRef(new Set())
  const answerAppliedRef = useRef(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const onIceCandidateRef = useRef(() => {})
  const meetingTimeoutRef = useRef(null)
  const hangUpRef = useRef(null)

  const handlePeerIceCandidate = useCallback(
    (candidate) => {
      if (candidate && typeof onIceCandidateRef.current === 'function') {
        onIceCandidateRef.current(candidate)
      }
    },
    []
  )

  const {
    localStream,
    remoteStream,
    startLocalMedia,
    stopLocalMedia,
    startScreenShare,
    stopScreenShare,
    createOffer,
    setRemoteDescription,
    addIceCandidate,
    closeConnection,
    isScreenSharing,
    connectionState,
    ensurePeerConnection
  } = useMeetingConnection({ onIceCandidate: handlePeerIceCandidate })

  const clearMeetingTimeout = useCallback(() => {
    if (meetingTimeoutRef.current) {
      clearTimeout(meetingTimeoutRef.current)
      meetingTimeoutRef.current = null
    }
  }, [])

  const upsertMeeting = useCallback((nextMeeting) => {
    if (!nextMeeting) return
    setMeetings((prev) => {
      const index = prev.findIndex((meeting) => meeting.id === nextMeeting.id)
      if (index === -1) {
        return [...prev, nextMeeting]
      }
      const copy = [...prev]
      copy[index] = nextMeeting
      return copy
    })
  }, [])

  const cleanupMeetingState = useCallback(() => {
    clearMeetingTimeout()
    pendingIceCandidatesRef.current = []
    processedRemoteCandidatesRef.current = new Set()
    answerAppliedRef.current = false
    activeMeetingRef.current = null
    closeConnection()
    stopLocalMedia()
    setActiveMeeting(null)
    setMeetingError('')
    setIsStartingMeeting(false)
  }, [closeConnection, stopLocalMedia])

  const handleRemoteHangUp = useCallback(() => {
    cleanupMeetingState()
  }, [cleanupMeetingState])

  const handleHangUp = useCallback(
    async (nextStatus = 'ended') => {
      if (!activeMeeting?.id || !currentUserId) {
        cleanupMeetingState()
        return
      }
      if (isEndingMeeting) return
      setIsEndingMeeting(true)
      try {
        await updateMeetingStatus({
          meetingId: activeMeeting.id,
          senderId: currentUserId,
          status: nextStatus
        })
      } catch (error) {
        console.error('Failed to update meeting status', error)
      } finally {
        setIsEndingMeeting(false)
        cleanupMeetingState()
      }
    },
    [activeMeeting, cleanupMeetingState, currentUserId, isEndingMeeting]
  )

  useEffect(() => {
    hangUpRef.current = handleHangUp
  }, [handleHangUp])

  const startMeetingTimeout = useCallback(() => {
    clearMeetingTimeout()
    meetingTimeoutRef.current = setTimeout(() => {
      if (hangUpRef.current) {
        hangUpRef.current('cancelled')
      }
      setMeetingError("Tutor didn't answer, the call was cancelled.")
    }, 60 * 1000)
  }, [clearMeetingTimeout])

  const handleStartMeeting = useCallback(async () => {
    if (!selectedTutorId || !currentUserId || isStartingMeeting) return
    console.log('[meeting] startMeeting clicked', {
      currentUserId,
      selectedTutorId,
      baseUrl: getChatServerBaseUrl?.()
    })
    setMeetingError('')
    setIsStartingMeeting(true)

    try {
      const mediaTimeoutMs = 3000
      let mediaStarted = false
      console.log('[meeting] attempting to start local media')
      await Promise.race([
        startLocalMedia().then(() => {
          mediaStarted = true
          console.log('[meeting] local media started')
        }),
        new Promise((resolve) =>
          setTimeout(() => {
            resolve('timeout')
          }, mediaTimeoutMs)
        )
      ])

      if (!mediaStarted) {
        console.warn('Student media permission pending/failed, proceeding without local media')
        setMeetingError(
          'Camera/mic unavailable right now. Call is starting without your media; grant permission to share.'
        )
        const pc = ensurePeerConnection()
        pc.addTransceiver('audio', { direction: 'recvonly' })
        pc.addTransceiver('video', { direction: 'recvonly' })
          console.log('[meeting] added recvonly transceivers as fallback')
        }

      let offer
      try {
        console.log('[meeting] createOffer start')
        offer = await Promise.race([
          createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('createOffer timeout after 5s')), 5000)
          )
        ])
        console.log('[meeting] createOffer success', { type: offer?.type, sdpLength: offer?.sdp?.length })
      } catch (offerError) {
        console.error('[meeting] createOffer failed, using fallback offer', offerError)
        offer = {
          type: 'offer',
          sdp:
            'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 0\r\nc=IN IP4 0.0.0.0\r\n'
        }
      }
      console.log('[meeting] creating meeting', {
        baseUrl: getChatServerBaseUrl?.(),
        conversationId: createConversationId(currentUserId, selectedTutorId),
        initiatorId: currentUserId,
        receiverId: selectedTutorId
      })
      const meeting = await createMeeting({
        conversationId: createConversationId(currentUserId, selectedTutorId),
        initiatorId: currentUserId,
        initiatorRole: currentUserRole || 'student',
        receiverId: selectedTutorId,
        receiverRole: 'tutor',
        offer
      })
      console.log('[meeting] created meeting', meeting)
      setActiveMeeting(meeting)
      upsertMeeting(meeting)
      startMeetingTimeout()
    } catch (error) {
      console.error('Failed to start meeting', error)
      setMeetingError(error instanceof Error ? error.message : 'Failed to start meeting')
      cleanupMeetingState()
    } finally {
      setIsStartingMeeting(false)
    }
  }, [
    cleanupMeetingState,
    createOffer,
    currentUserId,
    currentUserRole,
    ensurePeerConnection,
    isStartingMeeting,
    selectedTutorId,
    startLocalMedia,
    upsertMeeting
  ])

  const processMeetingUpdate = useCallback(
    async (meeting) => {
      if (!meeting) return
      upsertMeeting(meeting)
      if (meeting.status === 'accepted') {
        clearMeetingTimeout()
      }
      if (activeMeetingRef.current?.id === meeting.id) {
        setActiveMeeting(meeting)
      }

      const remoteCandidates = Array.isArray(meeting.candidates)
        ? meeting.candidates.filter((candidate) => candidate.senderId !== String(currentUserId))
        : []

      for (const candidate of remoteCandidates) {
        if (processedRemoteCandidatesRef.current.has(candidate.id)) continue
        processedRemoteCandidatesRef.current.add(candidate.id)
        try {
          await addIceCandidate(candidate.candidate)
        } catch (error) {
          console.error('Failed to add remote candidate', error)
        }
      }

      if (meeting.answer?.sdp && !answerAppliedRef.current) {
        try {
          await setRemoteDescription(meeting.answer)
          answerAppliedRef.current = true
        } catch (error) {
          console.error('Failed to set remote description', error)
        }
      }

      if (['ended', 'cancelled', 'rejected', 'failed'].includes(meeting.status)) {
        clearMeetingTimeout()
        handleRemoteHangUp()
      }
    },
    [addIceCandidate, clearMeetingTimeout, currentUserId, handleRemoteHangUp, setRemoteDescription, upsertMeeting]
  )

  const handleScreenShareToggle = useCallback(async () => {
    try {
      if (isScreenSharing) {
        stopScreenShare()
      } else {
        await startScreenShare()
      }
    } catch (error) {
      console.error('Screen share error', error)
      setMeetingError('Unable to toggle screen sharing.')
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare])

  const handleMeetingEvent = useCallback(
    (payload) => {
      if (!payload?.meeting) return
      processMeetingUpdate(payload.meeting)
    },
    [processMeetingUpdate]
  )

  useMeetingEvents(currentUserId, {
    onMeeting: handleMeetingEvent
  })

  useEffect(() => {
    onIceCandidateRef.current = (candidate) => {
      if (!candidate) return
      const meetingId = activeMeetingRef.current?.id
      if (!meetingId || !currentUserId) {
        pendingIceCandidatesRef.current = [...pendingIceCandidatesRef.current, candidate]
        return
      }
      sendIceCandidate({
        meetingId,
        senderId: currentUserId,
        senderRole: currentUserRole || 'student',
        candidate
      }).catch((error) => {
        console.error('Failed to send ICE candidate', error)
      })
    }
  }, [currentUserId, currentUserRole])

  useEffect(() => {
    activeMeetingRef.current = activeMeeting
    if (!activeMeeting) {
      processedRemoteCandidatesRef.current = new Set()
      pendingIceCandidatesRef.current = []
      answerAppliedRef.current = false
    }
  }, [activeMeeting])

  useEffect(() => {
    if (!activeMeeting?.id || !currentUserId) return
    if (pendingIceCandidatesRef.current.length === 0) return

    const queued = [...pendingIceCandidatesRef.current]
    pendingIceCandidatesRef.current = []

    queued.forEach((candidate) => {
      sendIceCandidate({
        meetingId: activeMeeting.id,
        senderId: currentUserId,
        senderRole: currentUserRole || 'student',
        candidate
      }).catch((error) => {
        console.error('Failed to flush ICE candidate', error)
      })
    })
  }, [activeMeeting?.id, currentUserId, currentUserRole])

  const loadContacts = useCallback(
    async (withSpinner = false) => {
      if (!currentUserId) return

      if (withSpinner) setLoadingContacts(true)

      try {
        const tutors = await fetchUsers({ role: 'tutor' })

        const mapped = tutors.map((tutor) => ({
          id: tutor.id,
          name: tutor.displayName || tutor.username,
          subject: tutor.subject || 'Tutor',
          avatar: '/api/placeholder/40/40',
          lastMessageAt: null
        }))

        const conversations = await fetchConversations(currentUserId)

        const lastMessageByContact = new Map()
        conversations.forEach((conversation) => {
          const otherParticipant = conversation.participants.find(
            (participant) => participant !== String(currentUserId)
          )
          if (otherParticipant) {
            lastMessageByContact.set(otherParticipant, conversation.lastMessageAt)
          }
        })

        const updatedContacts = mapped.map((contact) => ({
          ...contact,
          lastMessageAt: lastMessageByContact.get(contact.id) ?? contact.lastMessageAt
        }))

        setContacts(updatedContacts)
        setSelectedTutorId((prevSelected) => {
          if (updatedContacts.length === 0) {
            return prevSelected === null ? prevSelected : null
          }
          if (!prevSelected || !updatedContacts.some((contact) => contact.id === prevSelected)) {
            return updatedContacts[0].id
          }
          return prevSelected
        })
      } catch (error) {
        console.error('Failed to load tutors', error)
        setContacts([])
        setSelectedTutorId((prevSelected) => (prevSelected === null ? prevSelected : null))
      } finally {
        if (withSpinner) {
          setLoadingContacts(false)
        }
      }
    },
    [currentUserId]
  )

  useEffect(() => {
    if (!currentUserId) return

    loadContacts(true)
    const interval = setInterval(() => {
      loadContacts(false)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [currentUserId, loadContacts])

  useEffect(() => {
    if (!selectedTutorId || !currentUserId) return

    const conversationId = createConversationId(currentUserId, selectedTutorId)
    let isActive = true

    const fetchMessages = async (withSpinner = false) => {
      if (withSpinner) setLoadingChat(true)
      try {
        const chatHistory = await fetchChatMessages(conversationId)
        if (isActive) {
          setMessagesByConversation((prev) => ({ ...prev, [conversationId]: chatHistory }))
          if (chatHistory.length > 0) {
            const latestTimestamp = chatHistory[chatHistory.length - 1].timestamp
            setContacts((prev) =>
              prev.map((contact) =>
                contact.id === selectedTutorId
                  ? { ...contact, lastMessageAt: latestTimestamp }
                  : contact
              )
            )
          }
        }
      } catch (error) {
        console.error('Failed to load chat history', error)
        if (isActive) {
          setMessagesByConversation((prev) => ({ ...prev, [conversationId]: [] }))
        }
      } finally {
        if (withSpinner && isActive) {
          setLoadingChat(false)
        }
      }
    }

    fetchMessages(true)
    const interval = setInterval(() => {
      fetchMessages(false)
    }, 1000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [selectedTutorId, currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    let isMounted = true

    const loadMeetings = async () => {
      try {
        const latest = await fetchMeetings(currentUserId)
        if (isMounted) {
          setMeetings(latest)
        }
      } catch (error) {
        console.error('Failed to load meetings', error)
      } finally {
        if (isMounted) {
          setLoadingMeetings(false)
        }
      }
    }

    setLoadingMeetings(true)
    loadMeetings()
    const interval = setInterval(loadMeetings, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [currentUserId])

  useEffect(() => {
    if (!activeMeeting?.id) return
    let isMounted = true

    const refreshMeeting = async () => {
      try {
        const latest = await fetchMeetingById(activeMeeting.id)
        if (!isMounted) return
        await processMeetingUpdate(latest)
      } catch (error) {
        console.error('Failed to refresh meeting', error)
      }
    }

    const interval = setInterval(refreshMeeting, 1500)
    refreshMeeting()

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [activeMeeting?.id, processMeetingUpdate])

  useEffect(() => {
    if (!localVideoRef.current) return
    localVideoRef.current.srcObject = localStream ?? null
  }, [localStream])

  useEffect(() => {
    if (!remoteVideoRef.current) return
    remoteVideoRef.current.srcObject = remoteStream ?? null
  }, [remoteStream])

  useEffect(() => {
    if (!activeMeeting || !selectedTutorId) return
    const isSameTutor = activeMeeting.participants.includes(String(selectedTutorId))
    if (!isSameTutor) {
      handleHangUp('cancelled')
    }
  }, [activeMeeting, handleHangUp, selectedTutorId])

  const selectedTutor = useMemo(
    () => contacts.find((contact) => contact.id === selectedTutorId) ?? null,
    [contacts, selectedTutorId]
  )

  const sortedContacts = useMemo(() => {
    const filtered = contactQuery
      ? contacts.filter((contact) =>
          contact.name.toLowerCase().includes(contactQuery.toLowerCase()) ||
          contact.subject.toLowerCase().includes(contactQuery.toLowerCase())
        )
      : contacts

    return [...filtered].sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return dateB - dateA
    })
  }, [contacts, contactQuery])

  const currentMessages = useMemo(() => {
    if (!selectedTutorId || !currentUserId) return []
    const conversationId = createConversationId(currentUserId, selectedTutorId)
    return messagesByConversation[conversationId] ?? []
  }, [messagesByConversation, selectedTutorId, currentUserId])

  const currentMeetings = useMemo(() => {
    if (!selectedTutorId) return []
    return meetings
      .filter((meeting) => meeting.participants.includes(String(selectedTutorId)))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime()
        const dateB = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime()
        return dateB - dateA
      })
  }, [meetings, selectedTutorId])

  const meetingStatusDescription = useMemo(() => {
    if (!activeMeeting) return ''
    return formatMeetingStatusLabel(activeMeeting.status)
  }, [activeMeeting])

  const isMeetingLive = Boolean(activeMeeting)
  const callButtonDisabled = activeMeeting
    ? isEndingMeeting
    : !selectedTutorId || isStartingMeeting
  const callButtonLabel = activeMeeting
    ? isEndingMeeting
      ? 'Ending...'
      : 'Hang up'
    : isStartingMeeting
      ? 'Connecting...'
      : 'Start Meeting'

  const handleSelectTutor = (tutorId) => {
    setMeetingError('')
    setSelectedTutorId(tutorId)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTutorId || !currentUserId) return

    const trimmed = newMessage.trim()
    const conversationId = createConversationId(currentUserId, selectedTutorId)
    const optimisticId = `local-${Date.now()}`
    const timestamp = new Date().toISOString()

    const newEntry = {
      id: optimisticId,
      senderRole: 'student',
      senderId: currentUserId,
      participants: [String(currentUserId), String(selectedTutorId)],
      content: trimmed,
      timestamp,
    }

    setMessagesByConversation((prev) => {
      const existing = prev[conversationId] ?? []
      return { ...prev, [conversationId]: [...existing, newEntry] }
    })

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === selectedTutorId
          ? { ...contact, lastMessageAt: timestamp }
          : contact
      )
    )

    setNewMessage('')

    try {
      await sendChatMessage({
        conversationId,
        senderRole: 'student',
        senderId: currentUserId,
        content: trimmed,
        participants: [String(currentUserId), String(selectedTutorId)],
      })
      const refreshed = await fetchChatMessages(conversationId)

      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: refreshed }))

      const latestTimestamp = refreshed.length
        ? refreshed[refreshed.length - 1].timestamp
        : timestamp

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedTutorId
            ? { ...contact, lastMessageAt: latestTimestamp }
            : contact
        )
      )

      await loadContacts()
    } catch (error) {
      console.error('Failed to send message', error)
      setMessagesByConversation((prev) => {
        const existing = prev[conversationId] ?? []
        return {
          ...prev,
          [conversationId]: existing.filter((message) => message.id !== optimisticId),
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Tutor Meetings</h1>
        <p className="text-sm text-slate-600">
          Connect with your tutors, review past conversations, and join upcoming meetings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Contacts */}
        <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">Tutors</h2>
            </div>
            <span className="text-xs text-slate-500">{sortedContacts.length} total</span>
          </div>

          <div className="p-3">
            <Input
              placeholder="Search tutors..."
              className="h-9 text-sm"
              value={contactQuery}
              onChange={(event) => setContactQuery(event.target.value)}
              disabled={loadingContacts}
            />
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {loadingContacts && (
              <div className="p-4 text-sm text-slate-500">Loading tutors...</div>
            )}

            {!loadingContacts && sortedContacts.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                No tutors added yet.
              </div>
            )}

            {sortedContacts.map((contact) => {
              const isActive = contact.id === selectedTutorId
              return (
                <button
                  key={contact.id}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => handleSelectTutor(contact.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>
                      {contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-slate-900">
                      {contact.name}
                    </span>
                    <span className="text-xs text-slate-500">{contact.subject}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat */}
        <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {selectedTutor ? selectedTutor.name : 'Select a tutor'}
              </h2>
              {selectedTutor && (
                <p className="text-xs text-slate-500">Specialty: {selectedTutor.subject}</p>
              )}
            </div>
            <Button
              variant={isMeetingLive ? 'destructive' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() =>
                isMeetingLive
                  ? handleHangUp(activeMeeting?.status === 'accepted' ? 'ended' : 'cancelled')
                  : handleStartMeeting()
              }
              disabled={callButtonDisabled}
            >
              <Video className="h-4 w-4" />
              {callButtonLabel}
            </Button>
            {!isMeetingLive && isStartingMeeting && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => handleHangUp('cancelled')}
                disabled={isEndingMeeting}
              >
                <Video className="h-4 w-4" />
                Cancel call
              </Button>
            )}
          </div>

          {isMeetingLive ? (
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                  <div className="relative h-56 rounded-xl bg-slate-900 text-white">
                    <video
                      ref={remoteVideoRef}
                      className="h-full w-full rounded-xl object-cover"
                      autoPlay
                      playsInline
                    />
                    {!remoteStream && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-200">
                        Waiting for tutor to join...
                      </span>
                    )}
                  </div>
                  <div className="relative h-40 sm:h-56 rounded-xl bg-slate-900 text-white">
                    <video
                      ref={localVideoRef}
                      className="h-full w-full rounded-xl object-cover opacity-80"
                      autoPlay
                      playsInline
                      muted
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs">
                      You
                    </span>
                    {isScreenSharing && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-amber-500/80 px-2 py-0.5 text-[10px] font-medium text-white">
                        Screen sharing
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    Status: {meetingStatusDescription || 'Connecting'}
                  </span>
                  <span>Connection: {connectionState}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={handleScreenShareToggle}>
                    {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleHangUp('ended')}
                    disabled={isEndingMeeting}
                  >
                    Hang up
                  </Button>
                </div>

                {meetingError && (
                  <p className="text-sm text-red-600" role="alert">
                    {meetingError}
                  </p>
                )}
              </div>
            </div>
          ) : meetingError ? (
            <div className="border-b border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {meetingError}
            </div>
          ) : null}

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-5 py-4">
            {loadingChat && (
              <div className="text-sm text-slate-500">Loading conversation...</div>
            )}

            {currentMessages.map((message) => {
              const isStudent = message.senderRole === 'student'
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-sm ${
                      isStudent
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <span className="mt-1 text-xs text-slate-400">
                    {formatRelativeMessageTime(message.timestamp)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="border-t border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder={
                  selectedTutor ? `Message ${selectedTutor.name}` : 'Select a tutor to start messaging'
                }
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={!selectedTutor}
              />
              <Button onClick={handleSendMessage} disabled={!selectedTutor || !newMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default StudentMeeting

