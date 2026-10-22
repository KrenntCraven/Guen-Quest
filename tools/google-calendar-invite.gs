/**
 * Google Apps Script backend for the Birthday Quest's automatic Calendar invite.
 *
 * Setup:
 * 1. Open https://script.google.com while signed into the calendar that should own the event.
 * 2. Create a project, paste this file into Code.gs and save.
 * 3. Deploy > New deployment > Web app.
 * 4. Execute as: Me. Who has access: Anyone.
 * 5. Authorize Calendar and Gmail access, deploy, and copy the /exec URL into staycation-pass.json.
 *
 * After editing this file, update the existing deployment (Deploy > Manage deployments > Edit > Version: New version)
 * so the /exec URL keeps working with the new code.
 *
 * This endpoint deliberately accepts only the guest below and creates only one event for a given start time.
 */
const ALLOWED_GUEST = 'Krenntc@gmail.com'
const EVENT_TITLE = 'Level 25 Staycation'
const TIME_ZONE = 'Asia/Manila'
const EMAIL_SUBJECT = "You're invited ♥"
const EMAIL_FROM = 'Level 25'
const PASS = {
  left: 'LEVEL 25',
  title: 'STAYCATION PASS',
  right: 'FOR GUEN ♥',
  from: { place: 'HOME', note: 'Everyday' },
  symbol: '♥',
  to: { place: 'ESCAPE', note: 'Just us' },
  code: '2 5 ♥ G U E N ♥ 2 5',
  note: 'Pack a small bag. Our next adventure is waiting.',
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(date) {
  return Utilities.formatDate(date, TIME_ZONE, 'EEE, MMM d, yyyy')
}

function formatTime(date) {
  return Utilities.formatDate(date, TIME_ZONE, 'h:mm a')
}

function formatDuration(start, end) {
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const parts = []
  if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
  if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
  if (!parts.length) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
  return parts.join(' ')
}

function invitationDetails(start, end, destination) {
  const place = destination || 'To be announced'
  const sameDay = formatDate(start) === formatDate(end)
  const when = sameDay
    ? `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`
    : `${formatDate(start)} at ${formatTime(start)} to ${formatDate(end)} at ${formatTime(end)}`
  return {
    place,
    when,
    date: sameDay ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`,
    checkIn: formatTime(start),
    duration: formatDuration(start, end),
    calendarDay: `https://calendar.google.com/calendar/r/day/${Utilities.formatDate(start, TIME_ZONE, 'yyyy/M/d')}`,
  }
}

function cell(label, value) {
  return `<td width="50%" valign="top" style="padding:8px 8px 16px;">
    <div style="margin:0 0 4px;color:#6f647f;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">${label}</div>
    <div style="margin:0;color:#2a1b3d;font-size:16px;font-weight:700;line-height:1.35;">${value}</div>
  </td>`
}

function invitationHtml(details) {
  const place = escapeHtml(details.place)
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf7ff;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(PASS.note)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7ff;">
    <tr>
      <td align="center" style="padding:32px 16px;font-family:'Segoe UI','Trebuchet MS',sans-serif;">
        <p style="margin:0 0 6px;color:#6b4fb0;font-size:13px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">You're invited</p>
        <p style="max-width:420px;margin:0 0 22px;color:#6f647f;font-size:16px;line-height:1.5;">${escapeHtml(PASS.note)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border:1px solid #ebe3f7;border-radius:26px;overflow:hidden;">
          <tr>
            <td style="padding:16px 20px;background:#3d2a6e;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#b9a2e6;font-size:11px;font-weight:800;letter-spacing:0.12em;">${PASS.left}</td>
                  <td align="center" style="color:#ffffff;font-size:12px;font-weight:800;letter-spacing:0.12em;">${PASS.title}</td>
                  <td align="right" style="color:#b9a2e6;font-size:11px;font-weight:800;letter-spacing:0.12em;">${escapeHtml(PASS.right)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px;background:#f3eefb;border-bottom:2px dashed #ebe3f7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="42%" valign="middle">
                    <div style="color:#3d2a6e;font-size:22px;font-weight:700;line-height:1;">${PASS.from.place}</div>
                    <div style="margin-top:4px;color:#6f647f;font-size:12px;">${PASS.from.note}</div>
                  </td>
                  <td width="16%" align="center" valign="middle" style="color:#a63d6b;font-size:18px;">${PASS.symbol}</td>
                  <td width="42%" align="right" valign="middle">
                    <div style="color:#3d2a6e;font-size:22px;font-weight:700;line-height:1;">${PASS.to.place}</div>
                    <div style="margin-top:4px;color:#6f647f;font-size:12px;">${PASS.to.note}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 16px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>${cell('Date', escapeHtml(details.date))}${cell('Check-in', escapeHtml(details.checkIn))}</tr>
                <tr>${cell('Duration', escapeHtml(details.duration))}${cell('Destination', place)}</tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 16px;background:#f3eefb;border-top:2px dashed #ebe3f7;color:#6b4fb0;font-family:'Courier New',Courier,monospace;font-size:13px;letter-spacing:0.28em;">${escapeHtml(PASS.code)}</td>
          </tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
          <tr>
            <td align="center" style="background:#6b4fb0;border-radius:999px;">
              <a href="${details.calendarDay}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;">Open in Google Calendar</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function calendarDescription(details) {
  return [
    `${PASS.left}  ·  ${PASS.title}  ·  ${PASS.right}`,
    '',
    `${PASS.from.place}  ${PASS.from.note}    ${PASS.symbol}    ${PASS.to.place}  ${PASS.to.note}`,
    '',
    `Date: ${details.date}`,
    `Check-in: ${details.checkIn}`,
    `Duration: ${details.duration}`,
    `Destination: ${details.place}`,
    '',
    PASS.note,
    '',
    PASS.code,
  ].join('\n')
}

function isOwner(guest) {
  return Session.getEffectiveUser().getEmail().toLowerCase() === String(guest).toLowerCase()
}

function findEvent(eventId) {
  try {
    return CalendarApp.getDefaultCalendar().getEventById(eventId)
  } catch (error) {
    return null
  }
}

/** Writes the staycation pass into the event. The owner is not added as a guest, since Google would list them as awaiting. */
function restyleEvent(event, details, guest) {
  event.setTitle(EVENT_TITLE)
  event.setDescription(calendarDescription(details))
  event.setLocation(details.place)
  event.setColor(CalendarApp.EventColor.MAUVE)
  if (!isOwner(guest)) return
  event.getGuestList().forEach((person) => {
    if (person.getEmail().toLowerCase() === guest.toLowerCase()) event.removeGuest(guest)
  })
}

function createCalendarEvent(guest, start, end, details) {
  const options = {
    description: calendarDescription(details),
    location: details.place,
  }
  if (!isOwner(guest)) {
    options.guests = guest
    options.sendInvites = true
  }
  const event = CalendarApp.getDefaultCalendar().createEvent(EVENT_TITLE, start, end, options)
  event.setColor(CalendarApp.EventColor.MAUVE)
  return event
}

function invitationText(details) {
  return [
    "You're invited.",
    '',
    PASS.note,
    '',
    `${PASS.left} · ${PASS.title} · ${PASS.right}`,
    `${PASS.from.place} ${PASS.symbol} ${PASS.to.place}`,
    '',
    `Date: ${details.date}`,
    `Check-in: ${details.checkIn}`,
    `Duration: ${details.duration}`,
    `Destination: ${details.place}`,
    '',
    PASS.code,
    '',
    `Open in Google Calendar: ${details.calendarDay}`,
  ].join('\n')
}

/**
 * Google never emails an event's own organizer, so when the guest is this script's own account the invitation
 * arrives as this styled email instead.
 */
function emailOwnerCopy(guest, start, end, destination) {
  const owner = Session.getEffectiveUser().getEmail()
  if (owner.toLowerCase() !== guest.toLowerCase()) return false
  const details = invitationDetails(start, end, destination)
  MailApp.sendEmail({
    to: guest,
    name: EMAIL_FROM,
    subject: EMAIL_SUBJECT,
    body: invitationText(details),
    htmlBody: invitationHtml(details),
  })
  return true
}

function createInvite(data) {
  const guest = String(data.guestEmail || '').trim()
  const start = new Date(data.start)
  const end = new Date(data.end)
  const destination = String(data.destination || '')

  if (guest.toLowerCase() !== ALLOWED_GUEST.toLowerCase()) return { ok: false, error: 'Guest is not allowed.' }
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return { ok: false, error: 'Invalid event timing.' }

  const details = invitationDetails(start, end, destination)
  const key = `birthday-invite:${guest.toLowerCase()}:${start.toISOString()}`
  const ownerEmailKey = `${key}:owner-email`
  const properties = PropertiesService.getScriptProperties()
  const existingEventId = properties.getProperty(key)
  const existingEvent = existingEventId && findEvent(existingEventId)
  if (existingEvent) {
    restyleEvent(existingEvent, details, guest)
    const emailSent =
      properties.getProperty(ownerEmailKey) === 'sent' || emailOwnerCopy(guest, start, end, destination)
    if (emailSent) properties.setProperty(ownerEmailKey, 'sent')
    return { ok: true, duplicate: true, emailSent, eventId: existingEventId }
  }

  const calendarEvent = createCalendarEvent(guest, start, end, details)
  properties.setProperty(key, calendarEvent.getId())
  const emailSent = emailOwnerCopy(guest, start, end, destination)
  if (emailSent) properties.setProperty(ownerEmailKey, 'sent')
  return { ok: true, emailSent, eventId: calendarEvent.getId() }
}

function doPost(event) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    return json(createInvite(JSON.parse(event.postData.contents)))
  } catch (error) {
    return json({ ok: false, error: String(error) })
  } finally {
    lock.releaseLock()
  }
}

/** Run this from the editor to preview the styled email for the Oct 20 test slot. It does not create a calendar event. */
function previewEmail() {
  const sent = emailOwnerCopy(
    ALLOWED_GUEST,
    new Date('2026-10-20T15:00:00+08:00'),
    new Date('2026-10-20T17:00:00+08:00'),
    'Our staycation destination',
  )
  Logger.log(sent ? 'Preview sent.' : 'Preview was not sent. The script account must be the guest.')
}

/** Run this from the editor to test: creates a two-hour sample event tomorrow and sends the invitation email. */
function sendSample() {
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const result = createInvite({
    guestEmail: ALLOWED_GUEST,
    start: start.toISOString(),
    end: end.toISOString(),
    destination: 'SAMPLE: Birthday Quest calendar test',
  })
  Logger.log(JSON.stringify(result))
}
