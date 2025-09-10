import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Play, RotateCcw, Star } from 'lucide-react'

const Flashcards = () => {
  const mockDecks = [
    { id: 1, name: 'Algebra Basics', cards: 25, subject: 'Algebra', mastered: 18 },
    { id: 2, name: 'Geometry Formulas', cards: 30, subject: 'Geometry', mastered: 22 },
    { id: 3, name: 'Statistics Terms', cards: 20, subject: 'Statistics', mastered: 15 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Flashcards</h1>
          <p className="text-slate-600 mt-1">Create, organize, and study with flashcards</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          New Deck
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDecks.map((deck) => (
          <Card key={deck.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{deck.name}</CardTitle>
                <Badge variant="outline">{deck.subject}</Badge>
              </div>
              <CardDescription>{deck.cards} cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium">{deck.mastered}/{deck.cards}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(deck.mastered / deck.cards) * 100}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Play className="mr-1 h-3 w-3" />
                    Study
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Star className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Modes</CardTitle>
          <CardDescription>Different ways to review your flashcards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Review Mode</h3>
              <p className="text-sm text-slate-600">Flip through cards at your own pace</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Play className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Quiz Mode</h3>
              <p className="text-sm text-slate-600">Test yourself with timed questions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RotateCcw className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Spaced Repetition</h3>
              <p className="text-sm text-slate-600">Optimized review schedule</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Flashcards

