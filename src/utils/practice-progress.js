const PRACTICE_STORAGE_BASE_KEY = 'practice_state_v1'

const createDefaultProgress = () => ({
  overall: 0,
  subjects: {
    algebra: 0,
    geometry: 0,
    statistics: 0,
    calculus: 0,
  },
})

const clampPercent = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

const toSubjectKey = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return null
  if (normalized.includes('algebra')) return 'algebra'
  if (normalized.includes('geometry')) return 'geometry'
  if (normalized.includes('stat')) return 'statistics'
  if (normalized.includes('calculus')) return 'calculus'
  return null
}

export const getPracticeStorageKey = (userId) => {
  const id = String(userId || '').trim()
  return id ? `${PRACTICE_STORAGE_BASE_KEY}:${id}` : PRACTICE_STORAGE_BASE_KEY
}

export const readPracticeStateForUser = (userId) => {
  try {
    const perUserKey = getPracticeStorageKey(userId)
    const raw = localStorage.getItem(perUserKey)
    if (raw) {
      return JSON.parse(raw)
    }

    const legacyRaw = localStorage.getItem(PRACTICE_STORAGE_BASE_KEY)
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw)
      if (String(userId || '').trim()) {
        localStorage.setItem(perUserKey, JSON.stringify(parsed))
      }
      return parsed
    }
  } catch {
    return null
  }

  return null
}

export const computeDashboardProgressFromPractice = (practiceState, fallbackProgress) => {
  const safeFallback = {
    ...createDefaultProgress(),
    ...(fallbackProgress || {}),
    subjects: {
      ...createDefaultProgress().subjects,
      ...(fallbackProgress?.subjects || {}),
    },
  }

  const history = Array.isArray(practiceState?.history) ? practiceState.history : []
  if (history.length === 0) {
    return {
      overall: clampPercent(safeFallback.overall),
      subjects: {
        algebra: clampPercent(safeFallback.subjects.algebra),
        geometry: clampPercent(safeFallback.subjects.geometry),
        statistics: clampPercent(safeFallback.subjects.statistics),
        calculus: clampPercent(safeFallback.subjects.calculus),
      },
    }
  }

  const perSubject = {
    algebra: { total: 0, correct: 0 },
    geometry: { total: 0, correct: 0 },
    statistics: { total: 0, correct: 0 },
    calculus: { total: 0, correct: 0 },
  }

  let total = 0
  let correct = 0

  history.forEach((entry) => {
    const subjectKey = toSubjectKey(entry?.subject)
    const isCorrect = Boolean(entry?.isCorrect)

    total += 1
    if (isCorrect) correct += 1

    if (subjectKey && perSubject[subjectKey]) {
      perSubject[subjectKey].total += 1
      if (isCorrect) perSubject[subjectKey].correct += 1
    }
  })

  const nextSubjects = { ...safeFallback.subjects }
  Object.keys(perSubject).forEach((subjectKey) => {
    const stats = perSubject[subjectKey]
    if (stats.total > 0) {
      nextSubjects[subjectKey] = clampPercent((stats.correct / stats.total) * 100)
    } else {
      nextSubjects[subjectKey] = clampPercent(safeFallback.subjects[subjectKey])
    }
  })

  return {
    overall: total > 0 ? clampPercent((correct / total) * 100) : clampPercent(safeFallback.overall),
    subjects: {
      algebra: clampPercent(nextSubjects.algebra),
      geometry: clampPercent(nextSubjects.geometry),
      statistics: clampPercent(nextSubjects.statistics),
      calculus: clampPercent(nextSubjects.calculus),
    },
  }
}
