const STATUS_LABELS = {
  pending: 'Waiting for tutor',
  ringing: 'Ringing',
  accepted: 'In progress',
  ended: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Declined',
  failed: 'Failed'
}

export const formatMeetingStatusLabel = (status) => {
  if (!status) {
    return 'Unknown'
  }
  return STATUS_LABELS[status] ?? 'Unknown'
}
