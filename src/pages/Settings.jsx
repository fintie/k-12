import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Bell, Shield, BookOpen, Save } from 'lucide-react'

const Settings = ({ user, setUser }) => {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    school: user?.school || '',
    grade: user?.grade || '',
    preferredDifficulty:
      user?.preferences?.difficulty || user?.preferredDifficulty || 'moderate',
    preferredSubject:
      user?.preferences?.subject || user?.preferredSubject || user?.subject || '',
  })

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      school: user?.school || '',
      grade: user?.grade || '',
      preferredDifficulty:
        user?.preferences?.difficulty || user?.preferredDifficulty || 'moderate',
      preferredSubject:
        user?.preferences?.subject || user?.preferredSubject || user?.subject || '',
    })
  }, [user])

  const handleChange = (field) => (valueOrEvent) => {
    const nextValue =
      typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent?.target?.value || ''
    setForm((prev) => ({ ...prev, [field]: nextValue }))
  }

  const initials = useMemo(() => {
    const letters = [form.firstName, form.lastName]
      .filter(Boolean)
      .map((part) => part[0])
    if (letters.length) return letters.join('').toUpperCase()
    if (user?.name) {
      return user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }
    return 'NG'
  }, [form.firstName, form.lastName, user?.name])

  const handleSave = () => {
    const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ')
    setUser((prev) => ({
      ...prev,
      ...form,
      name: fullName || prev?.name || 'User',
      grade: form.grade || prev?.grade || '',
      school: form.school || prev?.school || '',
      email: form.email || prev?.email || '',
      firstName: form.firstName,
      lastName: form.lastName,
      preferences: {
        ...(prev?.preferences || {}),
        difficulty: form.preferredDifficulty || prev?.preferences?.difficulty,
        subject: form.preferredSubject || prev?.preferences?.subject,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal information and profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} alt={user?.name || 'User avatar'} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Photo</Button>
                <p className="text-sm text-slate-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Input
                  id="grade"
                  value={form.grade}
                  onChange={handleChange('grade')}
                  placeholder="e.g. Grade 8"
                />
              </div>
              <div>
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={form.school}
                  onChange={handleChange('school')}
                  placeholder="Enter your school name"
                  autoComplete="organization"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.progress.overall}%</div>
              <p className="text-sm text-slate-600">Overall Progress</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Problems Solved</span>
                <span className="font-medium">247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Study Streak</span>
                <span className="font-medium">7 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Achievements</span>
                <span className="font-medium">8 badges</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Learning Preferences</CardTitle>
          </div>
          <CardDescription>Customize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="difficulty">Default Difficulty</Label>
              <Select
                value={form.preferredDifficulty}
                onValueChange={handleChange('preferredDifficulty')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (0-40)</SelectItem>
                  <SelectItem value="moderate">Moderate (40-80)</SelectItem>
                  <SelectItem value="advanced">Advanced (80-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Favorite Subject</Label>
              <Input
                id="subject"
                value={form.preferredSubject}
                onChange={handleChange('preferredSubject')}
                placeholder="e.g. Algebra"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hints">Show Hints</Label>
                <p className="text-sm text-slate-500">Display helpful hints during practice</p>
              </div>
              <Switch id="hints" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="timer">Show Timer</Label>
                <p className="text-sm text-slate-500">Display timer during practice sessions</p>
              </div>
              <Switch id="timer" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="explanations">Auto-show Explanations</Label>
                <p className="text-sm text-slate-500">Automatically show explanations after answers</p>
              </div>
              <Switch id="explanations" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-slate-500">Receive updates via email</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="study-reminders">Study Reminders</Label>
              <p className="text-sm text-slate-500">Daily reminders to practice</p>
            </div>
            <Switch id="study-reminders" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
              <p className="text-sm text-slate-500">Notifications for new badges and milestones</p>
            </div>
            <Switch id="achievement-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="group-updates">Study Group Updates</Label>
              <p className="text-sm text-slate-500">Updates from your study groups</p>
            </div>
            <Switch id="group-updates" />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Privacy & Security</CardTitle>
          </div>
          <CardDescription>Manage your privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profile-visibility">Public Profile</Label>
              <p className="text-sm text-slate-500">Allow others to see your profile</p>
            </div>
            <Switch id="profile-visibility" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="progress-sharing">Share Progress</Label>
              <p className="text-sm text-slate-500">Allow sharing of your learning progress</p>
            </div>
            <Switch id="progress-sharing" defaultChecked />
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full">Change Password</Button>
            <Button variant="outline" className="w-full">Download My Data</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default Settings

