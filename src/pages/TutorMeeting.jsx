import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatMeetingTime, formatRelativeMessageTime, getMeetingStatus } from '@/utils/date-utils'
import { CalendarPlus, MessageCircle, Video, NotebookPen } from 'lucide-react'

const mockStudentContacts = [
  {
    id: 's1',
    name: 'Alex Johnson',
    grade: 'Grade 8',
    avatar: '/api/placeholder/40/40',
    lastMessageAt: '2025-01-04T09:45:00.000Z'
  },
  {
    id: 's2',
    name: 'Bianca Chen',
    grade: 'Grade 9',
    avatar: '/api/placeholder/40/40',
    lastMessageAt: '2025-01-03T16:20:00.000Z'
  },
  {
    id: 's3',
    name: 'Miguel Torres',
    grade: 'Grade 7',
    avatar: '/api/placeholder/40/40',
    lastMessageAt: '2025-01-02T13:10:00.000Z'
  }
]

const mockMessagesByStudent = {
  s1: [
    {
      id: 'm1',
      sender: 'student',
      content: 'Could we review discriminants again?',
      timestamp: '2025-01-03T19:20:00.000Z'
    },
    {
      id: 'm2',
      sender: 'tutor',
      content: 'Absolutely! I will prepare a short recap for our next session.',
      timestamp: '2025-01-03T20:10:00.000Z'
    }
  ],
  s2: [
    {
      id: 'm3',
      sender: 'tutor',
      content: 'Great progress on the proof problems today.',
      timestamp: '2025-01-03T07:55:00.000Z'
    }
  ],
  s3: [
    {
      id: 'm4',
      sender: 'student',
      content: 'I might need extra time for the homework.',
      timestamp: '2025-01-01T18:05:00.000Z'
    },
    {
      id: 'm5',
      sender: 'tutor',
      content: 'Thanks for letting me know. We can adjust the deadline.',
      timestamp: '2025-01-01T18:20:00.000Z'
    }
  ]
}

const mockMeetingsByStudent = {
  s1: [
    {
      id: 'mt1',
      title: 'Quadratic Equation Clinic',
      scheduledFor: '2025-01-06T15:30:00.000Z',
      link: 'https://meet.example.com/quadratics-alex',
      description: 'Review discriminant applications and common pitfalls.'
    }
  ],
  s2: [
    {
      id: 'mt2',
      title: 'Geometry Practice',
      scheduledFor: '2025-01-05T12:00:00.000Z',
      link: 'https://meet.example.com/geometry-bianca',
      description: 'Circle theorems and transformations.'
    }
  ],
  s3: []
}

const fetchStudents = async () => {
  // TODO: Replace with API integration
  return Promise.resolve(mockStudentContacts)
}

const fetchChatHistory = async (studentId) => {
  // TODO: Replace with API integration
  return Promise.resolve(mockMessagesByStudent[studentId] ?? [])
}

const fetchStudentMeetings = async (studentId) => {
  // TODO: Replace with API integration
  return Promise.resolve(mockMeetingsByStudent[studentId] ?? [])
}

const createMeeting = async ({ studentId, title, description, scheduledFor }) => {
  // TODO: Replace with API integration
  const slug = `${studentId}-${Date.now()}`
  return Promise.resolve({
    id: `mt-${slug}`,
    title,
    scheduledFor,
    description,
    link: `https://meet.example.com/${slug}`
  })
}

const startInstantMeeting = async ({ studentId, description }) => {
  // TODO: Replace with API integration
  const now = new Date().toISOString()
  return Promise.resolve({
    id: `imt-${studentId}-${Date.now()}`,
    title: 'Instant Meeting',
    scheduledFor: now,
    description: description || 'Instant meeting',
    link: `https://meet.example.com/${studentId}/instant-${Date.now()}`
  })
}

const TutorMeeting = () => {
  const [contacts, setContacts] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [messagesByStudent, setMessagesByStudent] = useState({})
  const [meetingsByStudent, setMeetingsByStudent] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [contactQuery, setContactQuery] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingMeetings, setLoadingMeetings] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [startingInstant, setStartingInstant] = useState(false)
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    datetime: '',
    description: ''
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadContacts = async () => {
      setLoadingContacts(true)
      try {
        const data = await fetchStudents()
        if (!isMounted) return
        setContacts(data)
        if (data.length > 0) {
          setSelectedStudentId(data[0].id)
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
    if (!selectedStudentId || messagesByStudent[selectedStudentId]) return

    let isMounted = true

    const loadChat = async () => {
      setLoadingChat(true)
      try {
        const chatHistory = await fetchChatHistory(selectedStudentId)
        if (isMounted) {
          setMessagesByStudent((prev) => ({ ...prev, [selectedStudentId]: chatHistory }))
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
  }, [selectedStudentId, messagesByStudent])

  useEffect(() => {
    if (!selectedStudentId || meetingsByStudent[selectedStudentId]) return

    let isMounted = true

    const loadMeetings = async () => {
      setLoadingMeetings(true)
      try {
        const meetings = await fetchStudentMeetings(selectedStudentId)
        if (isMounted) {
          setMeetingsByStudent((prev) => ({ ...prev, [selectedStudentId]: meetings }))
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
  }, [selectedStudentId, meetingsByStudent])

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
    if (!selectedStudentId) return []
    return messagesByStudent[selectedStudentId] ?? []
  }, [messagesByStudent, selectedStudentId])

  const currentMeetings = useMemo(() => {
    if (!selectedStudentId) return []
    return (meetingsByStudent[selectedStudentId] ?? []).sort((a, b) => {
      const dateA = new Date(a.scheduledFor).getTime()
      const dateB = new Date(b.scheduledFor).getTime()
      return dateA - dateB
    })
  }, [meetingsByStudent, selectedStudentId])

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId)
    setFormError('')
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedStudentId) return

    const newEntry = {
      id: `local-${Date.now()}`,
      sender: 'tutor',
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessagesByStudent((prev) => {
      const existing = prev[selectedStudentId] ?? []
      return { ...prev, [selectedStudentId]: [...existing, newEntry] }
    })

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === selectedStudentId
          ? { ...contact, lastMessageAt: newEntry.timestamp }
          : contact
      )
    )

    setNewMessage('')

    // TODO: send message through messaging service
  }

  const handleMeetingFormChange = (field) => (event) => {
    setMeetingForm((prev) => ({ ...prev, [field]: event.target.value }))
    setFormError('')
  }

  const handleScheduleMeeting = async (event) => {
    event.preventDefault()
    if (!selectedStudentId) {
      setFormError('Select a student before scheduling a meeting.')
      return
    }

    if (!meetingForm.title.trim() || !meetingForm.datetime) {
      setFormError('Meeting title and date/time are required.')
      return
    }

    setScheduling(true)
    try {
      const scheduledFor = new Date(meetingForm.datetime).toISOString()
      const meeting = await createMeeting({
        studentId: selectedStudentId,
        title: meetingForm.title.trim(),
        description: meetingForm.description.trim(),
        scheduledFor
      })

      setMeetingsByStudent((prev) => {
        const existing = prev[selectedStudentId] ?? []
        return { ...prev, [selectedStudentId]: [...existing, meeting] }
      })

      setMeetingForm({ title: '', datetime: '', description: '' })
      setFormError('')
    } finally {
      setScheduling(false)
    }
  }

  const handleStartInstantMeeting = async () => {
    if (!selectedStudentId) {
      setFormError('Select a student before starting an instant meeting.')
      return
    }

    setStartingInstant(true)
    try {
      const meeting = await startInstantMeeting({
        studentId: selectedStudentId,
        description: meetingForm.description.trim()
      })

      setMeetingsByStudent((prev) => {
        const existing = prev[selectedStudentId] ?? []
        return { ...prev, [selectedStudentId]: [...existing, meeting] }
      })

      setFormError('')
    } finally {
      setStartingInstant(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Student Meetings</h1>
        <p className="text-sm text-slate-600">
          Manage your student conversations, schedule sessions, and launch meetings instantly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_340px]">
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
                    <span className="text-xs text-slate-500">{contact.grade}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {contact.lastMessageAt
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
            <Button variant="outline" size="sm" className="gap-2">
              <Video className="h-4 w-4" />
              Start Call
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
              const isTutor = message.sender === 'tutor'
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isTutor ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-sm ${
                      isTutor
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

        {/* Meeting Management */}
        <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
            <CalendarPlus className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-900">Meeting Controls</h2>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Instant Meeting</p>
                  <p className="text-xs text-slate-500">
                    Launch a call now for quick check-ins or urgent support.
                  </p>
                </div>
                <Video className="h-4 w-4 text-indigo-500" />
              </div>
              <Button
                variant="default"
                className="w-full gap-2"
                onClick={handleStartInstantMeeting}
                disabled={startingInstant || !selectedStudent}
              >
                <Video className="h-4 w-4" />
                {startingInstant ? 'Starting...' : 'Start Instant Meeting'}
              </Button>
            </div>

            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-indigo-500" />
                <p className="text-sm font-semibold text-slate-900">Schedule Meeting</p>
              </div>
              <form className="space-y-4" onSubmit={handleScheduleMeeting}>
                <div className="space-y-1">
                  <Label htmlFor="meeting-title">Title</Label>
                  <Input
                    id="meeting-title"
                    placeholder="Enter meeting title"
                    value={meetingForm.title}
                    onChange={handleMeetingFormChange('title')}
                    disabled={!selectedStudent}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="meeting-datetime">Date & Time</Label>
                  <Input
                    id="meeting-datetime"
                    type="datetime-local"
                    value={meetingForm.datetime}
                    onChange={handleMeetingFormChange('datetime')}
                    disabled={!selectedStudent}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="meeting-description">Description</Label>
                  <textarea
                    id="meeting-description"
                    className="h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Highlight goals or preparation notes"
                    value={meetingForm.description}
                    onChange={handleMeetingFormChange('description')}
                    disabled={!selectedStudent}
                  />
                </div>
                {formError && (
                  <p className="text-xs text-red-500">{formError}</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={scheduling || !selectedStudent}
                >
                  {scheduling ? 'Scheduling...' : 'Add Meeting'}
                </Button>
              </form>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {selectedStudent ? `${selectedStudent.name}'s Meetings` : 'Select a student'}
              </h3>
              <div className="space-y-4">
                {loadingMeetings && (
                  <div className="text-sm text-slate-500">Loading meetings...</div>
                )}

                {!loadingMeetings && (!selectedStudent || currentMeetings.length === 0) && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    {selectedStudent
                      ? 'No meetings scheduled. Schedule one to get started.'
                      : 'Select a student to manage meetings.'}
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
                            <p className="text-sm font-semibold text-slate-900">
                              {meeting.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatMeetingTime(meeting.scheduledFor)}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                            {status}
                          </span>
                        </div>
                        {meeting.description && (
                          <p className="text-xs text-slate-600">{meeting.description}</p>
                        )}
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
      </div>
    </div>
  )
}

export default TutorMeeting
