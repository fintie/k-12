import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatMeetingTime = (isoString) => {
  if (!isoString) return ''
  return dayjs(isoString).format('MMM D, YYYY h:mm A')
}

export const formatRelativeMessageTime = (isoString) => {
  if (!isoString) return ''
  return dayjs(isoString).fromNow()
}

export const getMeetingStatus = (isoString) => {
  if (!isoString) return 'Scheduled'
  const now = dayjs()
  const meetingTime = dayjs(isoString)

  if (meetingTime.isBefore(now.subtract(1, 'hour'))) {
    return 'Completed'
  }

  if (meetingTime.isBefore(now) && meetingTime.isAfter(now.subtract(1, 'hour'))) {
    return 'In Progress'
  }

  if (meetingTime.isBefore(now.add(1, 'hour'))) {
    return 'Starting Soon'
  }

  return 'Scheduled'
}
