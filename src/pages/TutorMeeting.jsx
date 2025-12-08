import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatMeetingTime, formatRelativeMessageTime } from '@/utils/date-utils'
import { formatMeetingStatusLabel } from '@/utils/meeting-utils'
import { MessageCircle, Video } from 'lucide-react'
import { fetchChatMessages, fetchConversations, sendChatMessage } from '@/services/chat-service'
import { fetchUsers } from '@/services/user-service'
import {
  fetchMeetingById,
  fetchMeetings,
  sendIceCandidate,
  sendMeetingAnswer,
  updateMeetingStatus
} from '@/services/meeting-service'
import { useMeetingConnection } from '@/hooks/useMeetingConnection'
import { useMeetingEvents } from '@/hooks/useMeetingEvents'
import { useAuth } from '@/context/AuthContext'

const createConversationId = (a, b) => [String(a), String(b)].sort().join('__')

const TutorMeeting = () => {
  const [contacts, setContacts] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [messagesByConversation, setMessagesByConversation] = useState({})
  const [meetings, setMeetings] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [contactQuery, setContactQuery] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingMeetings, setLoadingMeetings] = useState(false)
  const [activeMeeting, setActiveMeeting] = useState(null)
  const [meetingError, setMeetingError] = useState('')
  const [pendingIncomingMeeting, setPendingIncomingMeeting] = useState(null)
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false)
  const [isEndingMeeting, setIsEndingMeeting] = useState(false)
  const { user: authUser } = useAuth()
  const currentUserId = authUser?.id
  const currentUserRole = authUser?.role
  const formatStudentName = useCallback(
    (participant) =>
      [participant?.firstName, participant?.lastName].filter(Boolean).join(' ') ||
      participant?.displayName ||
      participant?.username ||
      'Student',
    []
  )
  const activeMeetingRef = useRef(null)
  const pendingIceCandidatesRef = useRef([])
  const processedRemoteCandidatesRef = useRef(new Set())
  const answerAppliedRef = useRef(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const onIceCandidateRef = useRef(() => {})

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
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closeConnection,
    isScreenSharing,
    connectionState,
    ensurePeerConnection
  } = useMeetingConnection({ onIceCandidate: handlePeerIceCandidate })

  const syncPendingMeeting = useCallback(
    (list) => {
      const asString = (value) => (value == null ? '' : String(value))
      const me = asString(currentUserId)
      if (!currentUserId) {
        setPendingIncomingMeeting(null)
        return
      }
      const pending =
        list.find(
          (meeting) => {
            const status = meeting.status || ''
            if (!['pending', 'ringing'].includes(status)) return false
            const receiverMatch = asString(meeting.receiverId) === me
            const participantMatch = Array.isArray(meeting.participants)
              ? meeting.participants.some((p) => asString(p) === me)
              : false
            return receiverMatch || participantMatch
          }
        ) ?? null
      setPendingIncomingMeeting(pending)
    },
    [currentUserId]
  )

  const upsertMeeting = useCallback(
    (nextMeeting) => {
      if (!nextMeeting) return
      setMeetings((prev) => {
        const index = prev.findIndex((meeting) => meeting.id === nextMeeting.id)
        let nextList
        if (index === -1) {
          nextList = [...prev, nextMeeting]
        } else {
          nextList = [...prev]
          nextList[index] = nextMeeting
        }
        syncPendingMeeting(nextList)
        return nextList
      })
    },
    [syncPendingMeeting]
  )

  const cleanupMeetingState = useCallback(() => {
    pendingIceCandidatesRef.current = []
    processedRemoteCandidatesRef.current = new Set()
    answerAppliedRef.current = false
    activeMeetingRef.current = null
    closeConnection()
    stopLocalMedia()
    setActiveMeeting(null)
    setMeetingError('')
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

  const handleAcceptMeeting = useCallback(
    async (meeting) => {
      if (!meeting?.id || !currentUserId || isJoiningMeeting) return
      setMeetingError('')
      setIsJoiningMeeting(true)

      try {
        const mediaTimeoutMs = 3000
        let mediaStarted = false
        await Promise.race([
          startLocalMedia().then(() => {
            mediaStarted = true
          }),
          new Promise((resolve) =>
            setTimeout(() => {
              resolve('timeout')
            }, mediaTimeoutMs)
          )
        ])

        if (!mediaStarted) {
          console.warn('Tutor media permission pending/failed, proceeding without local media')
          setMeetingError(
            'Camera/mic unavailable right now. Connecting without your media; grant permission to share.'
          )
          const pc = ensurePeerConnection()
          pc.addTransceiver('audio', { direction: 'recvonly' })
          pc.addTransceiver('video', { direction: 'recvonly' })
        }
        if (meeting.offer) {
          await setRemoteDescription(meeting.offer)
          answerAppliedRef.current = true
        }
        const answer = await createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        const updated = await sendMeetingAnswer({
          meetingId: meeting.id,
          senderId: currentUserId,
          senderRole: currentUserRole || 'tutor',
          answer
        })
        setActiveMeeting(updated)
        upsertMeeting(updated)
      } catch (error) {
        console.error('Failed to join meeting', error)
        setMeetingError(error instanceof Error ? error.message : 'Failed to join meeting')
        cleanupMeetingState()
      } finally {
        setIsJoiningMeeting(false)
      }
    },
    [
    cleanupMeetingState,
    createAnswer,
    currentUserId,
    currentUserRole,
    ensurePeerConnection,
    isJoiningMeeting,
    setRemoteDescription,
    startLocalMedia,
    upsertMeeting
  ]
  )

  const handleDeclineMeeting = useCallback(
    async (meeting) => {
      if (!meeting?.id || !currentUserId) return
      try {
        await updateMeetingStatus({
          meetingId: meeting.id,
          senderId: currentUserId,
          status: 'rejected'
        })
      } catch (error) {
        console.error('Failed to decline meeting', error)
      }
    },
    [currentUserId]
  )

  const processMeetingUpdate = useCallback(
    async (meeting) => {
      if (!meeting) return
      upsertMeeting(meeting)
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

      if (meeting.offer?.sdp && !answerAppliedRef.current) {
        // Tutor should already have applied offer when accepting, but ensure fallback
        try {
          await setRemoteDescription(meeting.offer)
          answerAppliedRef.current = true
        } catch (error) {
          console.error('Failed to set remote offer', error)
        }
      }

      if (['ended', 'cancelled', 'rejected', 'failed'].includes(meeting.status)) {
        handleRemoteHangUp()
      }
    },
    [addIceCandidate, currentUserId, currentUserRole, handleRemoteHangUp, setRemoteDescription, upsertMeeting]
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
        senderRole: currentUserRole || 'tutor',
        candidate
      }).catch((error) => {
        console.error('Failed to send ICE candidate', error)
      })
    }
  }, [currentUserId, currentUserRole])

  const refreshContacts = useCallback(
    async (withSpinner = false) => {
      if (!currentUserId) return

      if (withSpinner) setLoadingContacts(true)
      try {
        const [conversationData, students] = await Promise.all([
          fetchConversations(currentUserId),
          fetchUsers({ role: 'student' }),
        ])

        const studentMap = new Map(
          students.map((student) => [
            student.id,
            {
              id: student.id,
              name: formatStudentName(student),
              grade: student.grade || 'Student',
              avatar: '/api/placeholder/40/40',
            },
          ])
        )

        const seen = new Set()
        const mapped = []

        conversationData.forEach((conversation) => {
          const otherParticipant = conversation.participants.find(
            (participant) => participant !== String(currentUserId)
          )
          if (!otherParticipant || seen.has(otherParticipant)) return
          seen.add(otherParticipant)

          const baseInfo =
            studentMap.get(otherParticipant) ??
            {
              id: otherParticipant,
              name: `Student ${otherParticipant}`,
              grade: 'Student',
              avatar: '/api/placeholder/40/40',
            }

          mapped.push({
            ...baseInfo,
            lastMessageAt: conversation.lastMessageAt,
          })
        })

        setContacts(mapped)
        setSelectedStudentId((prevSelected) => {
          if (mapped.length === 0) {
            return prevSelected === null ? prevSelected : null
          }
          if (!prevSelected || !mapped.some((contact) => contact.id === prevSelected)) {
            return mapped[0].id
          }
          return prevSelected
        })
      } catch (error) {
        console.error('Failed to load conversations', error)
        setContacts([])
        setSelectedStudentId((prevSelected) => (prevSelected === null ? prevSelected : null))
      } finally {
        if (withSpinner) {
          setLoadingContacts(false)
        }
      }
    },
    [currentUserId, formatStudentName]
  )

  useEffect(() => {
    activeMeetingRef.current = activeMeeting
    if (!activeMeeting) {
      processedRemoteCandidatesRef.current = new Set()
      pendingIceCandidatesRef.current = []
      answerAppliedRef.current = false
    }
  }, [activeMeeting])

  useEffect(() => {
    if (!currentUserId) return

    refreshContacts(true)
    const interval = setInterval(() => {
      refreshContacts(false)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [currentUserId, refreshContacts])

  useEffect(() => {
    if (!activeMeeting?.id || !currentUserId) return
    if (pendingIceCandidatesRef.current.length === 0) return

    const queued = [...pendingIceCandidatesRef.current]
    pendingIceCandidatesRef.current = []

    queued.forEach((candidate) => {
      sendIceCandidate({
        meetingId: activeMeeting.id,
        senderId: currentUserId,
        senderRole: currentUserRole || 'tutor',
        candidate
      }).catch((error) => {
        console.error('Failed to flush ICE candidate', error)
      })
    })
  }, [activeMeeting?.id, currentUserId, currentUserRole])

  useEffect(() => {
    if (!selectedStudentId || !currentUserId) return

    const conversationId = createConversationId(currentUserId, selectedStudentId)
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
                contact.id === selectedStudentId
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
  }, [selectedStudentId, currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    let isMounted = true

    const loadMeetings = async () => {
      try {
        const latest = await fetchMeetings(currentUserId)
        if (isMounted) {
          setMeetings(latest)
          syncPendingMeeting(latest)
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
    const interval = setInterval(loadMeetings, 1500)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [currentUserId, syncPendingMeeting])

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
    if (!activeMeeting || !selectedStudentId) return
    const isSameStudent = activeMeeting.participants.includes(String(selectedStudentId))
    if (!isSameStudent) {
      handleHangUp('cancelled')
    }
  }, [activeMeeting, handleHangUp, selectedStudentId])


  const selectedStudent = useMemo(
    () => contacts.find((contact) => contact.id === selectedStudentId) ?? null,
    [contacts, selectedStudentId]
  )

  const sortedContacts = useMemo(() => {
    const filtered = contactQuery
      ? contacts.filter((contact) =>
          contact.name.toLowerCase().includes(contactQuery.toLowerCase()) ||
          contact.grade.toLowerCase().includes(contactQuery.toLowerCase())
        )
      : contacts

    return [...filtered].sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return dateB - dateA
    })
  }, [contacts, contactQuery])

  const currentMessages = useMemo(() => {
    if (!selectedStudentId || !currentUserId) return []
    const conversationId = createConversationId(currentUserId, selectedStudentId)
    return messagesByConversation[conversationId] ?? []
  }, [messagesByConversation, selectedStudentId, currentUserId])

  const currentMeetings = useMemo(() => {
    if (!selectedStudentId) return []
    return meetings
      .filter((meeting) => meeting.participants.includes(String(selectedStudentId)))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime()
        const dateB = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime()
        return dateB - dateA
      })
  }, [meetings, selectedStudentId])

  const pendingMeetingStudentId = useMemo(() => {
    if (!pendingIncomingMeeting) return null
    return (
      pendingIncomingMeeting.participants.find(
        (participant) => participant !== String(currentUserId)
      ) ?? pendingIncomingMeeting.initiatorId
    )
  }, [pendingIncomingMeeting, currentUserId])

  const pendingMeetingStudent = useMemo(
    () => contacts.find((contact) => contact.id === pendingMeetingStudentId) ?? null,
    [contacts, pendingMeetingStudentId]
  )

  const meetingStatusDescription = useMemo(() => {
    if (!activeMeeting) return ''
    return formatMeetingStatusLabel(activeMeeting.status)
  }, [activeMeeting])

  const isMeetingLive = Boolean(activeMeeting)
  const callButtonDisabled = activeMeeting
    ? isEndingMeeting
    : pendingIncomingMeeting
      ? isJoiningMeeting
      : true
  const callButtonLabel = activeMeeting
    ? isEndingMeeting
      ? 'Ending...'
      : 'Hang up'
    : pendingIncomingMeeting
      ? isJoiningMeeting
        ? 'Connecting...'
        : 'Answer Call'
      : 'Waiting'

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId)
    setMeetingError('')
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudentId || !currentUserId) return

    const trimmed = newMessage.trim()
    const conversationId = createConversationId(currentUserId, selectedStudentId)
    const optimisticId = `local-${Date.now()}`
    const timestamp = new Date().toISOString()

    const newEntry = {
      id: optimisticId,
      senderRole: 'tutor',
      senderId: currentUserId,
      participants: [String(currentUserId), String(selectedStudentId)],
      content: trimmed,
      timestamp,
    }

    setMessagesByConversation((prev) => {
      const existing = prev[conversationId] ?? []
      return { ...prev, [conversationId]: [...existing, newEntry] }
    })

    setContacts((prev) => {
      const existing = prev.find((contact) => contact.id === selectedStudentId)
      if (existing) {
        return prev.map((contact) =>
          contact.id === selectedStudentId
            ? { ...contact, lastMessageAt: timestamp }
            : contact
        )
      }
      return [
        ...prev,
        {
          id: selectedStudentId,
          name: `Student ${selectedStudentId}`,
          grade: 'Student',
          avatar: '/api/placeholder/40/40',
          lastMessageAt: timestamp,
        },
      ]
    })

    setNewMessage('')

    try {
      await sendChatMessage({
        conversationId,
        senderRole: 'tutor',
        senderId: currentUserId,
        content: trimmed,
        participants: [String(currentUserId), String(selectedStudentId)],
      })
      const refreshed = await fetchChatMessages(conversationId)

      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: refreshed }))

      const latestTimestamp = refreshed.length
        ? refreshed[refreshed.length - 1].timestamp
        : timestamp

      setContacts((prev) => {
        const updated = prev.map((contact) =>
          contact.id === selectedStudentId
            ? { ...contact, lastMessageAt: latestTimestamp }
            : contact
        )
        return updated
      })

      await refreshContacts()
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
        <h1 className="text-2xl font-semibold text-slate-900">Student Meetings</h1>
        <p className="text-sm text-slate-600">
          Manage your student conversations and respond to live meeting requests in real time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Contacts */}
        <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">Students</h2>
            </div>
            <span className="text-xs text-slate-500">{sortedContacts.length} total</span>
          </div>

          <div className="p-3">
            <Input
              placeholder="Search students..."
              className="h-9 text-sm"
              value={contactQuery}
              onChange={(event) => setContactQuery(event.target.value)}
              disabled={loadingContacts}
            />
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {loadingContacts && (
              <div className="p-4 text-sm text-slate-500">Loading students...</div>
            )}

            {!loadingContacts && sortedContacts.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                No students available yet.
              </div>
            )}

            {sortedContacts.map((contact) => {
              const isActive = contact.id === selectedStudentId
              const hasIncomingMeeting = contact.id === pendingMeetingStudentId
              return (
                <button
                  key={contact.id}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => handleSelectStudent(contact.id)}
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
                    <span className="text-xs text-slate-500">
                      {contact.grade}
                      {hasIncomingMeeting && (
                        <span className="ml-2 text-amber-600">Incoming call</span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {hasIncomingMeeting
                      ? 'Incoming'
                      : contact.lastMessageAt
                        ? formatRelativeMessageTime(contact.lastMessageAt)
                        : ''}
                  </span>
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
                {selectedStudent ? selectedStudent.name : 'Select a student'}
              </h2>
              {selectedStudent && (
                <p className="text-xs text-slate-500">Grade: {selectedStudent.grade}</p>
              )}
            </div>
            <Button
              variant={isMeetingLive ? 'destructive' : pendingIncomingMeeting ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => {
                if (isMeetingLive) {
                  handleHangUp('ended')
                } else if (pendingIncomingMeeting) {
                  if (pendingMeetingStudentId) {
                    handleSelectStudent(pendingMeetingStudentId)
                  }
                  handleAcceptMeeting(pendingIncomingMeeting)
                }
              }}
              disabled={callButtonDisabled}
            >
              <Video className="h-4 w-4" />
              {callButtonLabel}
            </Button>
            {!isMeetingLive && (isJoiningMeeting || pendingIncomingMeeting) && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => handleHangUp('cancelled')}
                disabled={isEndingMeeting}
              >
                <Video className="h-4 w-4" />
                Hang up
              </Button>
            )}
          </div>

          {pendingIncomingMeeting && !isMeetingLive && (
            <div className="border-b border-slate-200 bg-amber-50 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Incoming meeting from {pendingMeetingStudent?.name || 'student'}
                  </p>
                  <p className="text-xs text-slate-600">Answer to start the live session.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (pendingMeetingStudentId) {
                        handleSelectStudent(pendingMeetingStudentId)
                      }
                      handleDeclineMeeting(pendingIncomingMeeting)
                    }}
                    disabled={isJoiningMeeting}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (pendingMeetingStudentId) {
                        handleSelectStudent(pendingMeetingStudentId)
                      }
                      handleAcceptMeeting(pendingIncomingMeeting)
                    }}
                    disabled={isJoiningMeeting}
                  >
                    {isJoiningMeeting ? 'Connecting...' : 'Answer'}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                        Waiting for the student&apos;s video...
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
              const isTutor = message.senderRole === 'tutor'
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isTutor ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-sm ${
                      isTutor
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
                  selectedStudent ? `Message ${selectedStudent.name}` : 'Select a student to start messaging'
                }
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={!selectedStudent}
              />
              <Button onClick={handleSendMessage} disabled={!selectedStudent || !newMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

export default TutorMeeting

