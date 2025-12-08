import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BookOpen,
  CheckCircle,
  CreditCard,
  ListRestart,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  Star,
} from 'lucide-react'

const SUBJECTS = ['Algebra', 'Geometry', 'Statistics', 'Calculus']
const STORAGE_KEY = 'flashcard_decks_v1'

const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 7)}-${Date.now().toString(36)}`

const seedDecks = [
  {
    id: 'deck-algebra',
    name: 'Algebra Basics',
    subject: 'Algebra',
    favorite: true,
    lastReviewed: Date.now() - 1000 * 60 * 60 * 24 * 2,
    cards: [
      {
        id: 'alg-1',
        front: 'Solve for x: 2x + 5 = 17',
        back: 'x = 6',
        mastery: 1,
        seen: 2,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 20,
      },
      {
        id: 'alg-2',
        front: 'What is the slope of y = 3x + 4?',
        back: 'Slope = 3',
        mastery: 2,
        seen: 3,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 30,
      },
      {
        id: 'alg-3',
        front: 'Factor: x² - 9',
        back: '(x - 3)(x + 3)',
        mastery: 0,
        seen: 1,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 8,
      },
    ],
  },
  {
    id: 'deck-geometry',
    name: 'Geometry Formulas',
    subject: 'Geometry',
    favorite: false,
    lastReviewed: Date.now() - 1000 * 60 * 60 * 24 * 5,
    cards: [
      {
        id: 'geo-1',
        front: 'Area of a circle?',
        back: 'A = πr²',
        mastery: 2,
        seen: 4,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 10,
      },
      {
        id: 'geo-2',
        front: 'Sum of interior angles in a triangle?',
        back: '180°',
        mastery: 1,
        seen: 3,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 48,
      },
      {
        id: 'geo-3',
        front: 'Pythagorean theorem states:',
        back: 'a² + b² = c²',
        mastery: 1,
        seen: 2,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 12,
      },
    ],
  },
  {
    id: 'deck-stats',
    name: 'Statistics Terms',
    subject: 'Statistics',
    favorite: false,
    lastReviewed: Date.now() - 1000 * 60 * 60 * 12,
    cards: [
      {
        id: 'stat-1',
        front: 'Mean vs. Median?',
        back: 'Mean is the average; median is the middle value when sorted.',
        mastery: 1,
        seen: 2,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 10,
      },
      {
        id: 'stat-2',
        front: 'What is a mode?',
        back: 'The value that appears most frequently.',
        mastery: 0,
        seen: 1,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 3,
      },
      {
        id: 'stat-3',
        front: 'Standard deviation measures?',
        back: 'How spread out numbers are from the mean.',
        mastery: 0,
        seen: 1,
        lastReviewed: Date.now() - 1000 * 60 * 60 * 18,
      },
    ],
  },
]

const loadDecks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return seedDecks
}

const shuffleIds = (array) => {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const buildQueue = (cards, mode = 'review', shuffle = false) => {
  const base = Array.isArray(cards) ? cards : []
  if (!base.length) return []
  if (shuffle) {
    return shuffleIds(base.map((c) => c.id))
  }
  if (mode === 'quiz') {
    return shuffleIds(base.map((c) => c.id))
  }
  if (mode === 'spaced') {
    return base
      .slice()
      .sort((a, b) => {
        const masteryDiff = (a.mastery || 0) - (b.mastery || 0)
        if (masteryDiff !== 0) return masteryDiff
        return (a.lastReviewed || 0) - (b.lastReviewed || 0)
      })
      .map((c) => c.id)
  }
  return base.map((c) => c.id)
}

const getDeckProgress = (deck) => {
  const total = deck.cards?.length || 0
  const doneCount = deck.cards?.filter((card) => (card.seen || 0) > 0).length || 0
  const donePercent = total ? Math.round((doneCount / total) * 100) : 0
  const masteredCount = deck.cards?.filter((card) => (card.mastery || 0) >= 2).length || 0
  const dueCount = deck.cards?.filter((card) => (card.mastery || 0) < 2).length || 0
  return { total, doneCount, donePercent, masteredCount, dueCount }
}

const Flashcards = () => {
  const [decks, setDecks] = useState(() => loadDecks())
  const [newDeck, setNewDeck] = useState({
    name: '',
    subject: SUBJECTS[0],
    cards: [{ id: uid('card'), front: '', back: '' }],
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [studySession, setStudySession] = useState({
    deckId: '',
    queue: [],
    index: 0,
    showBack: false,
    mode: 'review',
  })
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, mastered: 0 })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [shuffleMap, setShuffleMap] = useState({})

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
    } catch {}
  }, [decks])

  const totals = useMemo(() => {
    const deckCount = decks.length
    const totalCards = decks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0)
    const masteredCards = decks.reduce(
      (sum, deck) => sum + (deck.cards?.filter((c) => (c.mastery || 0) >= 2).length || 0),
      0
    )
    return { deckCount, totalCards, masteredCards }
  }, [decks])

  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === studySession.deckId),
    [decks, studySession.deckId]
  )

  const isDeckComplete = (deck) => {
    if (!deck) return false
    const progress = getDeckProgress(deck)
    return progress.donePercent >= 100
  }

  const currentCardId =
    studySession.queue[studySession.index] ?? (studySession.queue.length ? studySession.queue[0] : null)
  const currentCard = activeDeck?.cards?.find((card) => card.id === currentCardId)

  const handleModeChange = (mode) => {
    setStudySession((prev) => {
      if (!activeDeck) return { ...prev, mode }
      return {
        ...prev,
        mode,
        queue: buildQueue(activeDeck.cards, mode, !!shuffleMap[activeDeck.id]),
        index: 0,
        showBack: false,
      }
    })
    const complete = isDeckComplete(activeDeck)
    setSessionComplete(complete)
    if (complete) showCompletionAlert()
  }

  const startStudy = (deckId, mode = studySession.mode) => {
    const deck = decks.find((d) => d.id === deckId)
    if (!deck || !deck.cards?.length) {
      alert('Add at least one card to study this deck.')
      return
    }
    const complete = isDeckComplete(deck)
    const shuffle = !!shuffleMap[deckId]
    setStudySession({
      deckId,
      queue: buildQueue(deck.cards, mode, shuffle),
      index: 0,
      showBack: false,
      mode,
    })
    setSessionStats({ reviewed: 0, mastered: 0 })
    setSessionComplete(complete)
    if (complete) showCompletionAlert()
  }

  const showCompletionAlert = () => {
    alert('You have completed all cards in this deck. Use the reset icon on the deck card to restart progress.')
  }

  const scheduleCompletionAlert = () => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setTimeout(showCompletionAlert, 0))
    } else {
      setTimeout(showCompletionAlert, 0)
    }
  }

  const goToNextCard = () => {
    const completeByProgress = isDeckComplete(activeDeck)
    if (completeByProgress || sessionComplete) {
      setSessionComplete(true)
      showCompletionAlert()
      return
    }
    setStudySession((prev) => {
      if (!prev.queue.length) return prev
      const nextIndex = (prev.index + 1) % prev.queue.length
      return { ...prev, index: nextIndex, showBack: false }
    })
  }

  const markCard = (isKnown) => {
    if (!activeDeck || !currentCard) return
    if (sessionComplete) {
      showCompletionAlert()
      return
    }
    let becameMastered = false

    const updatedDecks = decks.map((deck) => {
      if (deck.id !== activeDeck.id) return deck
      const updatedCards = deck.cards.map((card) => {
        if (card.id !== currentCard.id) return card
        const currentMastery = card.mastery || 0
        const nextMastery = Math.min(3, Math.max(0, currentMastery + (isKnown ? 1 : -1)))
        if (currentMastery < 2 && nextMastery >= 2) becameMastered = true
        return {
          ...card,
          mastery: nextMastery,
          seen: (card.seen || 0) + 1,
          lastReviewed: Date.now(),
        }
      })
      return { ...deck, cards: updatedCards, lastReviewed: Date.now() }
    })

    const updatedDeckSnapshot = updatedDecks.find((deck) => deck.id === activeDeck.id)
    setDecks(updatedDecks)

    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      mastered: prev.mastered + (becameMastered ? 1 : 0),
    }))

    if (updatedDeckSnapshot) {
      const progressAfter = getDeckProgress(updatedDeckSnapshot)
      if (progressAfter.donePercent >= 100) {
        setSessionComplete(true)
        scheduleCompletionAlert()
        return
      }
    }

    goToNextCard()
  }

  const resetDeckProgress = (deckId) => {
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== deckId) return deck
        return {
          ...deck,
          lastReviewed: null,
          cards: deck.cards.map((card) => ({
            ...card,
            mastery: 0,
            seen: 0,
            lastReviewed: null,
          })),
        }
      })
    )
    if (studySession.deckId === deckId) {
      setStudySession({
        deckId: '',
        queue: [],
        index: 0,
        showBack: false,
        mode: 'review',
      })
      setSessionStats({ reviewed: 0, mastered: 0 })
      setSessionComplete(false)
    }
  }

  const toggleShuffle = (deckId) => {
    setShuffleMap((prev) => {
      const next = { ...prev, [deckId]: !prev[deckId] }
      if (activeDeck?.id === deckId) {
        setStudySession((prevSession) => ({
          ...prevSession,
          queue: activeDeck ? buildQueue(activeDeck.cards, prevSession.mode, !!next[deckId]) : [],
          index: 0,
          showBack: false,
        }))
      }
      return next
    })
  }

  const toggleFavorite = (deckId) => {
    setDecks((prev) => prev.map((deck) => (deck.id === deckId ? { ...deck, favorite: !deck.favorite } : deck)))
  }

  const handleDeckField = (key, value) => {
    setNewDeck((prev) => ({ ...prev, [key]: value }))
  }

  const handleCardField = (cardId, key, value) => {
    setNewDeck((prev) => ({
      ...prev,
      cards: prev.cards.map((card) => (card.id === cardId ? { ...card, [key]: value } : card)),
    }))
  }

  const addCardRow = () => {
    setNewDeck((prev) => ({
      ...prev,
      cards: [...prev.cards, { id: uid('card'), front: '', back: '' }],
    }))
  }

  const removeCardRow = (cardId) => {
    setNewDeck((prev) => {
      if (prev.cards.length === 1) return prev
      return { ...prev, cards: prev.cards.filter((card) => card.id !== cardId) }
    })
  }

  const handleCreateDeck = () => {
    const trimmedName = newDeck.name.trim()
    const validCards = newDeck.cards
      .map((card) => ({
        id: card.id || uid('card'),
        front: card.front.trim(),
        back: card.back.trim(),
        mastery: 0,
        seen: 0,
        lastReviewed: null,
      }))
      .filter((card) => card.front && card.back)

    if (!trimmedName) {
      alert('Deck name is required.')
      return
    }

    if (!validCards.length) {
      alert('Add at least one card with both sides filled out.')
      return
    }

    const payload = {
      id: uid('deck'),
      name: trimmedName,
      subject: newDeck.subject,
      favorite: false,
      lastReviewed: null,
      cards: validCards,
    }
    setDecks((prev) => [payload, ...prev])
    setNewDeck({ name: '', subject: SUBJECTS[0], cards: [{ id: uid('card'), front: '', back: '' }] })
    setCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Flashcards</h1>
          <p className="text-slate-600 mt-1">Create, organize, and study with flashcards</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a flashcard deck</DialogTitle>
              <DialogDescription>Add a subject and a few cards to get started.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="deck-name">Deck name</Label>
                  <Input
                    id="deck-name"
                    value={newDeck.name}
                    onChange={(e) => handleDeckField('name', e.target.value)}
                    placeholder="e.g. Fractions basics"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={newDeck.subject} onValueChange={(value) => handleDeckField('subject', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pick a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Cards</Label>
                  <Button variant="ghost" size="sm" onClick={addCardRow}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add card
                  </Button>
                </div>
                {newDeck.cards.map((card, index) => (
                  <div key={card.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Card {index + 1}</span>
                      {newDeck.cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCardRow(card.id)}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label>Front</Label>
                        <textarea
                          value={card.front}
                          onChange={(e) => handleCardField(card.id, 'front', e.target.value)}
                          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Prompt or question"
                        />
                      </div>
                      <div>
                        <Label>Back</Label>
                        <textarea
                          value={card.back}
                          onChange={(e) => handleCardField(card.id, 'back', e.target.value)}
                          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Answer or explanation"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setCreateOpen(false)} type="button">
                Cancel
              </Button>
              <Button onClick={handleCreateDeck} type="button">
                Save Deck
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Decks</p>
              <p className="text-2xl font-bold text-slate-900">{totals.deckCount}</p>
            </div>
            <CreditCard className="h-6 w-6 text-indigo-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Cards</p>
              <p className="text-2xl font-bold text-slate-900">{totals.totalCards}</p>
            </div>
            <BookOpen className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Mastered</p>
              <p className="text-2xl font-bold text-slate-900">{totals.masteredCards}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => {
          const progress = getDeckProgress(deck)
          return (
            <Card key={deck.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{deck.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{deck.subject}</Badge>
                      {deck.favorite && <span className="text-amber-600 text-xs font-semibold">Favorite</span>}
                    </CardDescription>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={deck.favorite ? 'Unfavorite deck' : 'Favorite deck'}
                    onClick={() => toggleFavorite(deck.id)}
                  >
                    <Star
                      className={`h-5 w-5 ${deck.favorite ? 'text-amber-500 fill-amber-400' : 'text-slate-500'}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium">
                    {progress.doneCount}/{progress.total} done
                  </span>
                </div>
                <Progress value={progress.donePercent} />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{progress.donePercent}% studied · {progress.masteredCount} mastered</span>
                  <span>{progress.dueCount} need review</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1" onClick={() => startStudy(deck.id)}>
                    <Play className="mr-1 h-3 w-3" />
                    Study
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => resetDeckProgress(deck.id)}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={shuffleMap[deck.id] ? 'default' : 'outline'}
                    onClick={() => toggleShuffle(deck.id)}
                  >
                    <Shuffle className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {activeDeck && currentCard && (() => {
        const activeProgress = getDeckProgress(activeDeck)
        return (
          <Card>
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Now studying: {activeDeck.name}</CardTitle>
                <CardDescription>
                  {activeDeck.subject} · {studySession.mode} mode · {sessionStats.reviewed} reviewed this session
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Card {studySession.index + 1} of {activeDeck.cards.length}</Badge>
                <Badge>{activeProgress.donePercent}% studied</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-3xl [perspective:1200px]">
                  <div
                    className={`relative min-h-[420px] rounded-sm border shadow-md transition-all duration-500 ease-in-out [transform-style:preserve-3d] ${
                      studySession.showBack ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
                    }`}
                  >
                    <div className="absolute inset-0 flex flex-col justify-between bg-white px-6 py-10 [backface-visibility:hidden]">
                      <div className="text-lg leading-relaxed text-slate-900 whitespace-pre-wrap">
                        {currentCard.front}
                      </div>
                      <div className="flex justify-center pt-8">
                        <Button
                          onClick={() => setStudySession((prev) => ({ ...prev, showBack: !prev.showBack }))}
                          className="rounded-full bg-blue-600 hover:bg-blue-700 px-6"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Turn
                        </Button>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-between bg-white px-6 py-10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="text-lg leading-relaxed text-slate-900 whitespace-pre-wrap">
                        {currentCard.back}
                      </div>
                      <div className="flex justify-center pt-8">
                        <Button
                          onClick={() => setStudySession((prev) => ({ ...prev, showBack: !prev.showBack }))}
                          className="rounded-full bg-blue-600 hover:bg-blue-700 px-6"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Turn
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-slate-600">
                <span>Card {studySession.index + 1} of {activeDeck.cards.length}</span>
                <span>· Seen {currentCard.seen || 0} times</span>
                <span>· Session reviewed {sessionStats.reviewed}</span>
                <span>· Newly mastered {sessionStats.mastered}</span>
                <span>· Deck progress {activeProgress.donePercent}%</span>
              </div>
              <div className="max-w-3xl mx-auto">
                <Progress value={activeProgress.donePercent} />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => markCard(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Known
                </Button>
                <Button variant="outline" onClick={() => markCard(false)}>
                  <ListRestart className="mr-2 h-4 w-4" />
                  Needs Practice
                </Button>
                <Button variant="ghost" onClick={goToNextCard}>
                  <Play className="mr-2 h-4 w-4" />
                  Next card
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {!activeDeck && (
        <Card>
          <CardHeader>
            <CardTitle>Start studying</CardTitle>
            <CardDescription>Select a deck to launch a study session.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Pick any deck above and tap Study to begin.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Study Modes</CardTitle>
          <CardDescription>Pick how you want to review flashcards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'review', title: 'Review Mode', desc: 'Flip through cards at your own pace', icon: CreditCard, accent: 'text-blue-600' },
              { id: 'quiz', title: 'Quiz Mode', desc: 'Shuffle cards for a fast quiz', icon: Shuffle, accent: 'text-green-600' },
              { id: 'spaced', title: 'Spaced Repetition', desc: 'Prioritize cards that need practice', icon: RotateCcw, accent: 'text-purple-600' },
            ].map((mode) => {
              const Icon = mode.icon
              const active = studySession.mode === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeChange(mode.id)}
                  className={`text-left p-4 border rounded-lg transition ${
                    active ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'hover:border-indigo-200'
                  }`}
                >
                  <Icon className={`h-8 w-8 mb-2 ${mode.accent}`} />
                  <h3 className="font-medium flex items-center gap-2">
                    {mode.title}
                    {active && <Badge>Active</Badge>}
                  </h3>
                  <p className="text-sm text-slate-600">{mode.desc}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Flashcards
