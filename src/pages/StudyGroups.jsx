import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Plus, MessageCircle, Calendar, Search } from 'lucide-react'

const StudyGroups = () => {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Algebra Masters',
      members: 12,
      subject: 'Algebra',
      active: true,
      description: 'Weekly equation drills and peer-led solution reviews.',
      joined: true,
    },
    {
      id: 2,
      name: 'Geometry Club',
      members: 8,
      subject: 'Geometry',
      active: false,
      description: 'Visual proofs, diagram challenges, and shape puzzles.',
      joined: false,
    },
    {
      id: 3,
      name: 'Calculus Study Hall',
      members: 15,
      subject: 'Calculus',
      active: true,
      description: 'Limits and derivatives practice with timed warmups.',
      joined: true,
    },
  ])

  const [discoverQuery, setDiscoverQuery] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const discoverGroups = useMemo(() => {
    const pool = [
      { id: 101, name: 'Statistics Sprint', subject: 'Statistics', members: 9, active: true, description: 'Data interpretation and probability problem sets.' },
      { id: 102, name: 'Exam Prep Circle', subject: 'Algebra', members: 14, active: true, description: 'Focused revision plans before major exams.' },
      { id: 103, name: 'Math Olympiad Starters', subject: 'Mixed', members: 7, active: false, description: 'Challenge questions and strategy walkthroughs.' },
    ]

    return pool.filter((group) => {
      const q = discoverQuery.trim().toLowerCase()
      if (!q) return true
      return group.name.toLowerCase().includes(q) || group.subject.toLowerCase().includes(q)
    })
  }, [discoverQuery])

  const joinGroup = (group) => {
    const alreadyJoined = groups.some((existing) => existing.name === group.name)
    if (alreadyJoined) {
      setStatusMessage(`You are already in ${group.name}.`)
      return
    }

    setGroups((prev) => [
      ...prev,
      {
        id: group.id,
        name: group.name,
        members: group.members + 1,
        subject: group.subject,
        active: group.active,
        description: group.description,
        joined: true,
      },
    ])
    setStatusMessage(`Joined ${group.name}.`)
  }

  const openGroupDetails = (group) => {
    setStatusMessage(`${group.name}: ${group.description}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Groups</h1>
          <p className="text-slate-600 mt-1">Collaborate with other students and learn together</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700" onClick={() => setStatusMessage('Group creation form is next in roadmap.')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {statusMessage && (
        <div className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700">{statusMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant={group.active ? 'default' : 'secondary'}>
                  {group.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>{group.subject}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{group.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openGroupDetails(group)}>
                    Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatusMessage(`Opening chat for ${group.name}...`)}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatusMessage(`Opening schedule for ${group.name}...`)}>
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discover Groups</CardTitle>
          <CardDescription>Search and join study groups that match your interests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              value={discoverQuery}
              onChange={(event) => setDiscoverQuery(event.target.value)}
              placeholder="Search by group name or subject"
            />
          </div>

          {discoverGroups.length === 0 ? (
            <p className="text-sm text-slate-500">No matching groups found.</p>
          ) : (
            <div className="space-y-3">
              {discoverGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-slate-900">{group.name}</p>
                    <p className="text-xs text-slate-600">{group.subject} · {group.members} members</p>
                  </div>
                  <Button size="sm" onClick={() => joinGroup(group)}>Join</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StudyGroups
