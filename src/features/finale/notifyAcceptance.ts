import { supabase } from '../../auth/supabase'
import { content } from '../../data/content'

function detail(label: string) {
  return content.pass.details.find((item) => item.label === label)?.value
}

/**
 * Asks the owner's Google Apps Script to create the event and email the invitation to whoever is signed in.
 * The celebration never waits on it. Empty placeholders disable it until the event and endpoint are ready.
 */
export function notifyAcceptance() {
  const invite = content.pass.calendarInvite
  if (!supabase || !invite.webAppUrl || !invite.start || !invite.end) return

  const destination = detail('Destination') ?? 'our staycation'
  void supabase.auth.getSession().then(({ data }) => {
    const guestEmail = data.session?.user.email
    if (!guestEmail) return
    void fetch(invite.webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        guestEmail,
        start: invite.start,
        end: invite.end,
        destination,
        location: invite.location,
      }),
    }).catch(() => undefined)
  })
}
