import { m, useReducedMotion } from 'motion/react'
import { content } from '../../data/content'
import { springs } from '../../motion/tokens'

/** The staycation pass; all of its text comes from staycation-pass.json. */
export function StaycationTicket() {
  const reduce = useReducedMotion()
  const { header, route, details, code } = content.pass

  return (
    <m.section
      className="ticket story-split__media"
      initial={reduce ? false : { opacity: 0, y: 28, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={reduce ? { duration: 0 } : springs.gentle}
    >
      <div className="ticket-top">
        <span>{header.left}</span><strong>{header.title}</strong><span>{header.right}</span>
      </div>
      <div className="ticket-route" aria-hidden="true">
        <div><strong>{route.from.place}</strong><span>{route.from.note}</span></div>
        <span className="ticket-route__line">{route.symbol}</span>
        <div><strong>{route.to.place}</strong><span>{route.to.note}</span></div>
      </div>
      <div className="ticket-grid">
        {details.map((detail) => (
          <div key={detail.label}><span>{detail.label}</span><strong>{detail.value}</strong></div>
        ))}
      </div>
      <div className="ticket-code">{code}</div>
    </m.section>
  )
}
