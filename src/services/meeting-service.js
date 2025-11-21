import { getChatServerBaseUrl } from '@/services/chat-service'

const BASE_URL = getChatServerBaseUrl()

const parseResponse = async (response) => {
  const text = await response.text()
  if (!text) {
    return {}
  }
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error('Unable to parse server response')
  }
}

const handleRequest = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options
  })
  const data = await parseResponse(response)

  if (!response.ok) {
    const message = data?.error || 'Meeting service request failed'
    throw new Error(message)
  }

  return data
}

const asMeeting = (payload) => ({
  id: payload.id,
  conversationId: payload.conversationId,
  participants: Array.isArray(payload.participants)
    ? payload.participants.map((participant) => String(participant))
    : [],
  initiatorId: payload.initiatorId,
  initiatorRole: payload.initiatorRole,
  receiverId: payload.receiverId,
  receiverRole: payload.receiverRole,
  status: payload.status,
  offer: payload.offer ?? null,
  answer: payload.answer ?? null,
  candidates: Array.isArray(payload.candidates) ? payload.candidates : [],
  createdAt: payload.createdAt,
  updatedAt: payload.updatedAt,
  startedAt: payload.startedAt ?? null,
  endedAt: payload.endedAt ?? null
})

const assertMeetingPayload = (data) => {
  if (!data?.meeting) {
    throw new Error('Server response missing meeting payload')
  }
  return asMeeting(data.meeting)
}

export const createMeeting = async ({
  conversationId,
  initiatorId,
  initiatorRole,
  receiverId,
  receiverRole,
  offer
}) => {
  const data = await handleRequest('/meetings', {
    method: 'POST',
    body: JSON.stringify({
      conversationId,
      initiatorId,
      initiatorRole,
      receiverId,
      receiverRole,
      offer
    })
  })

  return assertMeetingPayload(data)
}

export const fetchMeetings = async (participantId, { status } = {}) => {
  if (!participantId) {
    throw new Error('participantId is required to fetch meetings')
  }
  const search = new URLSearchParams({ participantId })
  if (status) {
    search.set('status', status)
  }
  const data = await handleRequest(`/meetings?${search.toString()}`)
  const meetings = Array.isArray(data.meetings) ? data.meetings : []
  return meetings.map(asMeeting)
}

export const fetchMeetingById = async (meetingId) => {
  if (!meetingId) {
    throw new Error('meetingId is required')
  }
  const data = await handleRequest(`/meetings/${encodeURIComponent(meetingId)}`)
  return assertMeetingPayload(data)
}

export const sendMeetingAnswer = async ({ meetingId, senderId, senderRole, answer }) => {
  if (!meetingId || !senderId || !senderRole || !answer) {
    throw new Error('meetingId, senderId, senderRole, and answer are required')
  }

  const data = await handleRequest(`/meetings/${encodeURIComponent(meetingId)}/answer`, {
    method: 'POST',
    body: JSON.stringify({ senderId, senderRole, answer })
  })

  return assertMeetingPayload(data)
}

export const sendIceCandidate = async ({ meetingId, senderId, senderRole, candidate }) => {
  if (!meetingId || !senderId || !candidate) {
    throw new Error('meetingId, senderId, and candidate are required')
  }

  return handleRequest(`/meetings/${encodeURIComponent(meetingId)}/candidates`, {
    method: 'POST',
    body: JSON.stringify({ senderId, senderRole, candidate })
  })
}

export const updateMeetingStatus = async ({ meetingId, senderId, status }) => {
  if (!meetingId || !senderId || !status) {
    throw new Error('meetingId, senderId, and status are required')
  }

  const data = await handleRequest(`/meetings/${encodeURIComponent(meetingId)}/status`, {
    method: 'POST',
    body: JSON.stringify({ senderId, status })
  })

  return assertMeetingPayload(data)
}
