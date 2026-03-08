import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen, 
  Users, 
  Calendar,
  Star,
  Trophy,
  Check
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const Dashboard = ({ user }) => {
  const [chartWindow, setChartWindow] = useState('7d')
  const [taskDetails, setTaskDetails] = useState(null)
  const [upcomingTasks, setUpcomingTasks] = useState([
    {
      id: 'task-1',
      title: 'Geometry Test Prep',
      due: 'Tomorrow',
      priority: 'high',
      detail: 'Finish Chapter 6 review and solve the 15-question prep set.'
    },
    {
      id: 'task-2',
      title: 'Algebra Practice Set',
      due: '2 days',
      priority: 'medium',
      detail: 'Complete linear equations worksheet and submit mistakes journal.'
    },
    {
      id: 'task-3',
      title: 'Statistics Project',
      due: '1 week',
      priority: 'low',
      detail: 'Prepare one-page summary with chart and interpretation.'
    },
  ])

  const weeklyProgress = useMemo(() => {
    const base = chartWindow === '30d'
      ? [
          { day: 'W1', score: 71 },
          { day: 'W2', score: 75 },
          { day: 'W3', score: 79 },
          { day: 'W4', score: 83 },
        ]
      : chartWindow === '14d'
        ? [
            { day: 'D1', score: 70 }, { day: 'D2', score: 74 }, { day: 'D3', score: 72 },
            { day: 'D4', score: 76 }, { day: 'D5', score: 78 }, { day: 'D6', score: 77 },
            { day: 'D7', score: 81 }, { day: 'D8', score: 80 }, { day: 'D9', score: 82 },
            { day: 'D10', score: 84 }, { day: 'D11', score: 83 }, { day: 'D12', score: 86 },
            { day: 'D13', score: 88 }, { day: 'D14', score: 89 },
          ]
        : [
            { day: 'Mon', score: 72 },
            { day: 'Tue', score: 78 },
            { day: 'Wed', score: 75 },
            { day: 'Thu', score: 82 },
            { day: 'Fri', score: 79 },
            { day: 'Sat', score: 85 },
            { day: 'Sun', score: 88 },
          ]

    return base.map((item) => {
      const variance = Math.floor(Math.random() * 3)
      return { ...item, score: Math.min(100, item.score + variance) }
    })
  }, [chartWindow])

  const subjectData = useMemo(
    () => [
      { subject: 'Algebra', score: user.progress.subjects.algebra, color: '#4F46E5' },
      { subject: 'Geometry', score: user.progress.subjects.geometry, color: '#7C3AED' },
      { subject: 'Statistics', score: user.progress.subjects.statistics, color: '#10B981' },
      { subject: 'Calculus', score: user.progress.subjects.calculus, color: '#F59E0B' },
    ],
    [user.progress.subjects.algebra, user.progress.subjects.calculus, user.progress.subjects.geometry, user.progress.subjects.statistics]
  )

  const recentActivities = [
    { type: 'practice', subject: 'Algebra', score: 92, time: '2 hours ago' },
    { type: 'exam', subject: 'Geometry', score: 78, time: '1 day ago' },
    { type: 'flashcard', subject: 'Statistics', score: 85, time: '2 days ago' },
    { type: 'study_group', subject: 'Calculus', participants: 5, time: '3 days ago' },
  ]

  const achievements = [
    { title: 'Perfect Score', description: 'Got 100% on Algebra quiz', icon: Trophy, color: 'text-yellow-600' },
    { title: 'Study Streak', description: '7 days in a row', icon: Star, color: 'text-purple-600' },
    { title: 'Helper', description: 'Helped 3 classmates', icon: Users, color: 'text-blue-600' },
  ]

  const completeTask = (taskId) => {
    setUpcomingTasks((prev) => prev.filter((task) => task.id !== taskId))
    setTaskDetails(null)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-600 mt-1">Ready to continue your math journey?</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link to="/practice">
            <BookOpen className="mr-2 h-4 w-4" />
            Start Practice
            </Link>
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Study
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.progress.overall}%</div>
            <Progress value={user.progress.overall} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+23 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Badges earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Your progress across different math topics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your daily performance this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              {[
                { id: '7d', label: '7 days' },
                { id: '14d', label: '14 days' },
                { id: '30d', label: '30 days' },
              ].map((window) => (
                <Button
                  key={window.id}
                  size="sm"
                  variant={chartWindow === window.id ? 'default' : 'outline'}
                  onClick={() => setChartWindow(window.id)}
                >
                  {window.label}
                </Button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'practice' ? 'bg-blue-500' :
                      activity.type === 'exam' ? 'bg-green-500' :
                      activity.type === 'flashcard' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{activity.subject}</p>
                      <p className="text-sm text-slate-600">
                        {activity.score ? `Score: ${activity.score}%` : `${activity.participants} participants`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{activity.time}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements & Tasks */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${achievement.color}`} />
                      <div>
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-slate-600">{achievement.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-slate-600">Due {task.due}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {task.priority}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => setTaskDetails(task)}>Details</Button>
                      <Button size="sm" onClick={() => completeTask(task.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {upcomingTasks.length === 0 && (
                  <p className="text-xs text-slate-500">All tasks completed. Great work.</p>
                )}
                {taskDetails && (
                  <div className="rounded-md border bg-slate-50 p-2 text-xs text-slate-700">
                    <p className="font-medium">{taskDetails.title}</p>
                    <p>{taskDetails.detail}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your favorite learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BookOpen className="h-6 w-6" />
              <span>Practice Problems</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span>Take Quiz</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Join Study Group</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Award className="h-6 w-6" />
              <span>Review Flashcards</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
