import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

const LoginGuard = ({ children, featureName = 'this feature' }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      setOpen(true)
    }
  }, [isLoading, user])

  const goLogin = () => {
    navigate('/login', { state: { from: location.pathname } })
  }

  const handleDismiss = () => {
    setOpen(false)
    navigate('/home')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm text-slate-600">
        Loading workspace...
      </div>
    )
  }

  if (user) {
    return children
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              Please sign in to use {featureName}. Click confirm to go to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={handleDismiss}>
              Keep browsing
            </Button>
            <Button onClick={goLogin}>Go to login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-[360px] items-center justify-center bg-slate-50">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Sign in to use {featureName}</p>
          <p className="mt-2 text-sm text-slate-600">Sign in to continue with this feature.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={handleDismiss}>
              Maybe later
            </Button>
            <Button onClick={goLogin}>Go to login</Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginGuard
