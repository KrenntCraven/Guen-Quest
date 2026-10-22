import type { Session } from '@supabase/supabase-js'
import { m, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Petals } from '../components/ambience/Petals'
import { StoryBadge } from '../components/StoryBadge'
import { supabase, supabaseConfigured } from './supabase'

const ALLOWED_EMAILS = new Set(['krenntc@gmail.com', 'guenyli8@gmail.com'])

type AuthState = 'loading' | 'signed-out' | 'denied' | 'authorized' | 'setup'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2c1.9-1.7 3-4.3 3-7.5Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.3l-3.2-2.6c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.2a10 10 0 0 0 0 9.4L6.5 14Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.2 7.4l3.3 2.7A5.8 5.8 0 0 1 12 6.1Z" />
    </svg>
  )
}

export function AuthGate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const denied = useRef(false)
  const [state, setState] = useState<AuthState>(supabaseConfigured ? 'loading' : 'setup')
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let mounted = true

    const checkSession = (session: Session | null) => {
      if (!mounted) return
      if (!session) {
        setState(denied.current ? 'denied' : 'signed-out')
        return
      }

      const email = session.user.email?.toLowerCase()
      if (email && ALLOWED_EMAILS.has(email)) {
        denied.current = false
        setState('authorized')
        return
      }

      denied.current = true
      setState('denied')
      window.setTimeout(() => void client.auth.signOut(), 0)
    }

    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError('We could not check your invitation. Please try again.')
        setState('signed-out')
        return
      }
      checkSession(data.session)
    })

    const { data } = client.auth.onAuthStateChange((_event, session) => checkSession(session))
    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    if (!supabase) return
    denied.current = false
    setError('')
    setSigningIn(true)
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (signInError) {
      setError('Google sign-in could not start. Please try again.')
      setSigningIn(false)
    }
  }

  if (state === 'authorized') return children

  const isSetup = state === 'setup'
  const isLoading = state === 'loading'
  const isDenied = state === 'denied'

  return (
    <main className="screen auth-screen">
      <Petals count={6} />
      <m.section
        className="auth-card"
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <StoryBadge lily />
        <span className="eyebrow">Level 25</span>
        <h1>{isDenied ? 'This account isn’t invited.' : 'A story made for two.'}</h1>
        <p className="auth-copy">
          {isSetup
            ? 'Add your Supabase project details to open the private entrance.'
            : isLoading
              ? 'Checking your invitation…'
              : isDenied
                ? 'Choose one of the two invited Google accounts to enter.'
                : 'Sign in with an invited Google account to begin Guen’s birthday quest.'}
        </p>

        {!isSetup && !isLoading && (
          <button className="auth-google-button" type="button" onClick={() => void signIn()} disabled={signingIn}>
            <GoogleIcon />
            {signingIn ? 'Opening Google…' : isDenied ? 'Try another account' : 'Continue with Google'}
          </button>
        )}

        {isSetup && (
          <p className="auth-setup">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>.
          </p>
        )}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-note">Only invited accounts can continue.</p>
      </m.section>
    </main>
  )
}
