import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatMeetingTime, formatRelativeMessageTime, getMeetingStatus } from '@/utils/date-utils'
import { MessageCircle, Video, CalendarClock, ChevronRight } from 'lucide-react'

const mockTutorContacts = [
  {
    id: 't1',
    name: 'Dr. Emily Carter',
    subject: 'Algebra II',
    avatar: '/api/placeholder/40/40',
    lastMessageAt: '2025-01-04T09:15:00.000Z'
  },
  {
    id: 't2',
    name: 'Mr. Daniel Lee',
    subject: 'Geometry',
    avatar: '/api/placeholder/40/40',
    lastMessageAt: '2025-01-03T18:45:00.000Z'
  },
  {
    id: 't3',
    name: 'Ms. Sofia Patel',
    subject: 'Statistics',
    avatar: '/api/placeholder/40/40',
    lastMessageAt: '2025-01-02T14:20:00.000Z'
  }
]

const mockMessagesByTutor = {
  t1: [
    {
      id: 'm1',
      sender: 'tutor',
      content: 'Hi Alex! Ready to review quadratic equations tomorrow?',
      timestamp: '2025-01-03T19:15:00.000Z'
    },
    {
      id: 'm2',
      sender: 'student',
      content: 'Yes! I completed the practice set you sent.',
      timestamp: '2025-01-03T20:02:00.000Z'
    },
    {
      id: 'm3',
      sender: 'tutor',
      content: 'Great work. I added a review meeting for us on Monday.',
      timestamp: '2025-01-04T08:55:00.000Z'
    }
  ],
  t2: [
    {
      id: 'm4',
      sender: 'tutor',
      content: 'How comfortable do you feel with circle theorems now?',
      timestamp: '2025-01-02T20:45:00.000Z'
    }
  ],
  t3: [
    {
      id: 'm5',
      sender: 'tutor',
      content: 'Let’s focus on interpreting box plots in our next session.',
      timestamp: '2025-01-01T12:15:00.000Z'
    }
  ]
}

const mockMeetingsByTutor = {
  t1: [
    {
      id: 'mt1',
      title: 'Quadratic Review',
      scheduledFor: '2025-01-06T15:30:00.000Z',
      link: 'https://meet.example.com/quadratic-review'
    },
    {
      id: 'mt2',
      title: 'Test Prep Sprint',
      scheduledFor: '2024-12-29T13:00:00.000Z',
      link: 'https://meet.example.com/test-prep'
    }
  ],
  t2: [
    {
      id: 'mt3',
      title: 'Geometry Problem Walkthrough',
      scheduledFor: '2025-01-05T12:00:00.000Z',
      link: 'https://meet.example.com/geometry'
    }
  ],
  t3: []
}

const fetchContacts = async () => {
  // TODO: Replace with API integration
  return Promise.resolve(mockTutorContacts)
}

const fetchChatHistory = async (tutorId) => {
  // TODO: Replace with API integration
  return Promise.resolve(mockMessagesByTutor[tutorId] ?? [])
}

const fetchTutorMeetings = async (tutorId) => {
  // TODO: Replace with API integration
  return Promise.resolve(mockMeetingsByTutor[tutorId] ?? [])
}

const StudentMeeting = () => {
  const [contacts, setContacts] = useState([])
  const [selectedTutorId, setSelectedTutorId] = useState(null)
  const [messagesByTutor, setMessagesByTutor] = useState({})
  const [meetingsByTutor, setMeetingsByTutor] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingMeetings, setLoadingMeetings] = useState(false)
  const [contactQuery, setContactQuery] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadContacts = async () => {
      setLoadingContacts(true)
      try {
        const data = await fetchContacts()
        if (!isMounted) return
        setContacts(data)
        if (data.length > 0) {
          setSelectedTutorId(data[0].id)
        }
      } finally {
        if (isMounted) {
          setLoadingContacts(false)
        }
      }
    }

    loadContacts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedTutorId || messagesByTutor[selectedTutorId]) return

    let isMounted = true
    const loadChat = async () => {
      setLoadingChat(true)
      try {
        const chatHistory = await fetchChatHistory(selectedTutorId)
        if (isMounted) {
          setMessagesByTutor((prev) => ({ ...prev, [selectedTutorId]: chatHistory }))
        }
      } finally {
        if (isMounted) {
          setLoadingChat(false)
        }
      }
    }

    loadChat()

    return () => {
      isMounted = false
    }
  }, [selectedTutorId, messagesByTutor])

  useEffect(() => {
    if (!selectedTutorId || meetingsByTutor[selectedTutorId]) return

    let isMounted = true
    const loadMeetings = async () => {
      setLoadingMeetings(true)
      try {
        const meetings = await fetchTutorMeetings(selectedTutorId)
        if (isMounted) {
          setMeetingsByTutor((prev) => ({ ...prev, [selectedTutorId]: meetings }))
        }
      } finally {
        if (isMounted) {
          setLoadingMeetings(false)
        }
      }
    }

    loadMeetings()

    return () => {
      isMounted = false
    }
  }, [selectedTutorId, meetingsByTutor])

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
  }, [contacts])

  const currentMessages = useMemo(() => {
    if (!selectedTutorId) return []
    return messagesByTutor[selectedTutorId] ?? []
  }, [messagesByTutor, selectedTutorId])

  const currentMeetings = useMemo(() => {
    if (!selectedTutorId) return []
    return (meetingsByTutor[selectedTutorId] ?? []).sort((a, b) => {
      const dateA = new Date(a.scheduledFor).getTime()
      const dateB = new Date(b.scheduledFor).getTime()
      return dateA - dateB
    })
  }, [meetingsByTutor, selectedTutorId])

  const handleSelectTutor = (tutorId) => {
    setSelectedTutorId(tutorId)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTutorId) return

    const newEntry = {
      id: `local-${Date.now()}`,
      sender: 'student',
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessagesByTutor((prev) => {
      const existing = prev[selectedTutorId] ?? []
      return { ...prev, [selectedTutorId]: [...existing, newEntry] }
    })

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === selectedTutorId
          ? { ...contact, lastMessageAt: newEntry.timestamp }
          : contact
      )
    )

    setNewMessage('')

    // TODO: send message through messaging service
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Tutor Meetings</h1>
        <p className="text-sm text-slate-600">
          Connect with your tutors, review past conversations, and join upcoming meetings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
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
            <Button variant="outline" size="sm" className="gap-2">
              <Video className="h-4 w-4" />
              Join Meeting
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-5 py-4">
            {loadingChat && (
              <div className="text-sm text-slate-500">Loading conversation...</div>
            )}

            {!loadingChat && currentMessages.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Send a message to start the conversation.
              </div>
            )}

            {currentMessages.map((message) => {
              const isStudent = message.sender === 'student'
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-sm ${
                      isStudent
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 rounded-bl-none'
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

        {/* Meetings */}
        <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
            <CalendarClock className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Meetings</h2>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {loadingMeetings && (
              <div className="text-sm text-slate-500">Loading meetings...</div>
            )}

            {!loadingMeetings && (!selectedTutor || currentMeetings.length === 0) && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                {selectedTutor
                  ? 'No meetings scheduled yet. Check back soon!'
                  : 'Select a tutor to view scheduled meetings.'}
              </div>
            )}

            {!loadingMeetings &&
              currentMeetings.map((meeting) => {
                const status = getMeetingStatus(meeting.scheduledFor)
                return (
                  <div
                    key={meeting.id}
                    className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{meeting.title}</p>
                        <p className="text-xs text-slate-500">
                          {formatMeetingTime(meeting.scheduledFor)}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                        {status}
                      </span>
                    </div>
                    <div className="rounded-md bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">Meeting Link</p>
                      <p className="truncate text-sm text-indigo-600">{meeting.link}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Video className="h-4 w-4" />
                      Join Meeting
                    </Button>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentMeeting
