import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, MessageCircle, Calendar } from 'lucide-react'

const StudyGroups = () => {
  const mockGroups = [
    { id: 1, name: 'Algebra Masters', members: 12, subject: 'Algebra', active: true },
    { id: 2, name: 'Geometry Club', members: 8, subject: 'Geometry', active: false },
    { id: 3, name: 'Calculus Study Hall', members: 15, subject: 'Calculus', active: true },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Groups</h1>
          <p className="text-slate-600 mt-1">Collaborate with other students and learn together</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGroups.map((group) => (
          <Card key={group.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant={group.active ? "default" : "secondary"}>
                  {group.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{group.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
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
          <CardDescription>Find study groups that match your interests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">Browse available study groups or create your own!</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudyGroups

