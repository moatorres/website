'use client'

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from '@shadcn/ui'
import { AlertCircleIcon, ArrowRightIcon, LoaderCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

import { ArticleSkeleton } from '@/components/skeleton'
import { signIn, verifySession } from '@/lib/session'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [state, action, pending] = React.useActionState(signIn, {
    data: { password: '' },
    error: null,
    success: false,
  })

  React.useEffect(() => {
    if (pending) setLoading(true)
    if (state.error) setLoading(false)
  }, [pending, state.error])

  React.useEffect(() => {
    verifySession().then((session) => {
      if (session) router.push('/dashboard')
    })
  }, [router])

  React.useEffect(() => {
    if (state.success) {
      window.location.href = '/dashboard'
    }
  }, [state.success, router])

  if (loading) {
    return <ArticleSkeleton className="w-full" />
  }

  return (
    !state.success && (
      <Card className="w-xs m-auto">
        <CardHeader>
          <CardTitle className="text-3xl">
            A journey of a thousand miles begins with a single step.
          </CardTitle>
          <CardDescription className="text-xs">Laozi</CardDescription>
        </CardHeader>

        <CardContent>
          <form action={action}>
            <div className="flex flex-col space-x-3 space-y-4">
              {state?.error && (
                <Alert variant="destructive" className="border-destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Something went wrong!</AlertTitle>
                  <AlertDescription>
                    {/* Your password is too short. Please try in again. */}
                    {state.error}
                  </AlertDescription>
                </Alert>
              )}
              <Input
                id="password"
                name="password"
                type="password"
                disabled={state.success}
              />
              <Button
                type="submit"
                disabled={pending}
                className="w-full cursor-pointer"
              >
                {pending ? 'Submitting...' : 'Login'}
                {pending ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <ArrowRightIcon />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            By clicking continue, you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </CardFooter>
      </Card>
    )
  )
}
