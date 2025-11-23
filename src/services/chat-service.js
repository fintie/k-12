const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const DEFAULT_BASE_URL = 'https://test-server-uqtw.onrender.com';

const CHAT_SERVER_BASE_URL = (() => {
  const envUrl = import.meta?.env?.VITE_CHAT_SERVER_URL;
  if (envUrl) return trimTrailingSlash(envUrl);
  // Always fall back to hosted server if no env override is provided
  return DEFAULT_BASE_URL;
})();

// Helps confirm which backend is in use
console.log('Chat/meeting server base:', CHAT_SERVER_BASE_URL);

const asMessage = (payload) => ({
  id: payload.id,
  conversationId: payload.conversationId,
  senderRole: payload.senderRole || payload.sender || 'unknown',
  senderId: payload.senderId != null ? String(payload.senderId) : undefined,
  participants: Array.isArray(payload.participants)
    ? payload.participants.map((participant) => String(participant))
    : [],
  content: payload.content,
  timestamp: payload.createdAt,
});

export const fetchChatMessages = async (conversationId) => {
  if (!conversationId) {
    throw new Error('conversationId is required to fetch messages');
  }

  const response = await fetch(
    `${CHAT_SERVER_BASE_URL}/messages?conversationId=${encodeURIComponent(conversationId)}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch messages');
  }

  const payload = await response.json();
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  return messages
    .map(asMessage)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendChatMessage = async ({
  conversationId,
  senderRole,
  senderId,
  content,
  participants,
}) => {
  if (!conversationId || !senderRole || !senderId || !content) {
    throw new Error('conversationId, senderRole, senderId, and content are required to send a message');
  }

  const payload = {
    conversationId,
    senderRole,
    senderId,
    content,
    participants: Array.isArray(participants)
      ? Array.from(new Set(participants.map((participant) => String(participant))))
      : undefined,
  };

  const response = await fetch(`${CHAT_SERVER_BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to send message');
  }

  const data = await response.json();
  return asMessage(data);
};

export const getChatServerBaseUrl = () => CHAT_SERVER_BASE_URL;

export const fetchConversations = async (participantId) => {
  if (!participantId) {
    throw new Error('participantId is required to fetch conversations');
  }

  const response = await fetch(
    `${CHAT_SERVER_BASE_URL}/conversations?participantId=${encodeURIComponent(participantId)}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch conversations');
  }

  const payload = await response.json();
  const conversations = Array.isArray(payload.conversations) ? payload.conversations : [];
  return conversations;
};
