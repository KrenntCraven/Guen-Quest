import { content } from '../../data/content'

function detail(label: string) {
  return content.pass.details.find((item) => item.label === label)?.value
}

/**
 * Asks the owner's Google Apps Script to create an event and email its Calendar invitation to the configured guest.
 * The celebration never waits on it. Empty placeholders disable it until the event and endpoint are ready.
 */
export function notifyAcceptance() {
  const invite = content.pass.calendarInvite
  if (!invite.webAppUrl || !invite.start || !invite.end) return

  const destination = detail('Destination') ?? 'our staycation'
  void fetch(invite.webAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      guestEmail: invite.guestEmail,
      start: invite.start,
      end: invite.end,
      destination,
    }),
  }).catch(() => undefined)
}
