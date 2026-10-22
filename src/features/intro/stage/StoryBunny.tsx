import { m, useReducedMotion, type Variants } from 'motion/react'
import { storyEase } from '../../../motion/tokens'

const FUR = '#DDB07F'
const FUR_SHADE = '#C08E5E'
const CREAM = '#FFF4E4'
const INK = '#4A2E5C'
const ROSE = '#D9A9BD'
const VIOLET = '#7050A8'
const VIOLET_DEEP = '#4E3478'
const LILAC = '#E9DFF3'
const LAVENDER = '#B8A2D9'

const line = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

const arrive: Variants = {
  hidden: { opacity: 0, x: 46, y: 0 },
  shown: {
    opacity: 1,
    x: [46, 22, 22, 0, 0],
    y: [0, -20, 0, -9, 0],
    transition: {
      delay: 0.95,
      duration: 1.05,
      times: [0, 0.28, 0.48, 0.74, 1],
      ease: 'easeInOut',
      opacity: { delay: 0.95, duration: 0.3 },
    },
  },
  instant: { opacity: 1, x: 0, y: 0, transition: { duration: 0.25 } },
}

const appear = (delay: number): Variants => ({
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { delay, duration: 0.9, ease: storyEase } },
  instant: { opacity: 1, transition: { duration: 0.25 } },
})

const pivot = (origin: string) => ({ transformBox: 'fill-box', transformOrigin: origin }) as const

/** The intro's illustrated bunny, discovering a gift and a glowing flower at dusk. */
export function StoryBunny() {
  const reduce = useReducedMotion()
  const idle = !reduce

  return (
    <svg className="story-bunny" viewBox="0 0 260 240" role="img" aria-label="A caramel bunny with one floppy ear with a violet ribbon beside a small gift and a glowing purple flower">
      <defs>
        <radialGradient id="flower-glow">
          <stop offset="0" stopColor={LAVENDER} stopOpacity="0.85" />
          <stop offset="1" stopColor={LAVENDER} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fur-depth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.45" stopColor={FUR} />
          <stop offset="1" stopColor={FUR_SHADE} />
        </linearGradient>
      </defs>

      <m.g variants={appear(0.75)}>
        <ellipse cx="44" cy="223" rx="34" ry="4.5" fill="#1C0F26" opacity="0.45" />
        <rect x="23" y="190" width="44" height="32" rx="2.5" fill={LILAC} {...line} />
        <rect x="19" y="182" width="52" height="10" rx="2.5" fill="#FFF9F1" {...line} />
        <rect x="41.5" y="182" width="7" height="40" fill={VIOLET} />
        <path d="M45 182c-8-10-19-7-15 0 3 4 10 3 15 0Zm0 0c8-10 19-7 15 0-3 4-10 3-15 0Z" fill={VIOLET} stroke={VIOLET_DEEP} strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="45" cy="182.5" r="2.8" fill={VIOLET_DEEP} />
        <path d="M23 205h44" stroke={INK} strokeWidth="0.8" opacity="0.25" />
      </m.g>

      <m.g variants={appear(1.25)}>
        <m.circle
          cx="78"
          cy="150"
          r="30"
          fill="url(#flower-glow)"
          animate={idle ? { opacity: [0.55, 0.9, 0.55] } : undefined}
          transition={idle ? { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 2.4 } : undefined}
        />
        <path d="M84 222c-2-24 2-48-6-68" fill="none" stroke="#5E7A62" strokeWidth="2" strokeLinecap="round" />
        <path d="M83 200c-10-6-16-4-19 1 7 3 13 3 19-1Zm1-14c9-7 15-6 18-2-6 4-12 4-18 2Z" fill="#6F8C72" />
        <m.g
          style={pivot('50% 0%')}
          animate={idle ? { rotate: [0, 3, 0, -2, 0] } : undefined}
          transition={idle ? { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.6 } : undefined}
        >
          <g stroke={VIOLET_DEEP} strokeWidth="1" strokeLinejoin="round">
            <path d="M78 152C70 148 64 140 62 132c6 2 12 8 16 20Z" fill={LAVENDER} />
            <path d="M78 152c8-5 14-12 17-20-6 2-12 8-17 20Z" fill={LAVENDER} />
            <path d="M78 152c-3-10-2-20 1-28 3 8 3 18-1 28Z" fill="#6C46B5" />
            <path d="M78 152c-8 1-16-1-21-6 7-1 15 1 21 6Z" fill="#6C46B5" />
            <path d="M78 152c8 1 16-1 21-6-7-1-15 1-21 6Z" fill="#6C46B5" />
          </g>
          <path d="M78 151l-6-12M78 151v-16M78 151l6-12" stroke="#E6DDF0" strokeWidth="0.8" strokeLinecap="round" />
          <g fill="#6B3F5E">
            <circle cx="72" cy="138.5" r="1.4" />
            <circle cx="78" cy="134.5" r="1.4" />
            <circle cx="84" cy="138.5" r="1.4" />
          </g>
        </m.g>
      </m.g>

      <m.g variants={arrive}>
        <ellipse cx="160" cy="223" rx="62" ry="5" fill="#1C0F26" opacity="0.5" />

        <m.g
          style={pivot('50% 100%')}
          animate={idle ? { scaleY: [1, 1.014, 1], scaleX: [1, 0.995, 1] } : undefined}
          transition={idle ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 2.2 } : undefined}
        >
          <circle cx="213" cy="199" r="11" fill={CREAM} {...line} />
          <path d="M120 222c-16 0-22-18-16-36 6-20 20-36 42-40 30-5 58 12 64 40 5 20-6 36-26 36Z" fill="url(#fur-depth)" {...line} />
          <path d="M108 200c-2-18 6-34 20-42 6 10 6 30-2 46-6 4-14 2-18-4Z" fill={CREAM} opacity="0.85" />
          <ellipse cx="182" cy="198" rx="25" ry="21" fill={FUR} opacity="0.9" />
          <path d="M160 211c2-21 18-33 38-30" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
          <ellipse cx="171" cy="219.5" rx="23" ry="5.5" fill={CREAM} {...line} />
          <ellipse cx="117" cy="219" rx="9.5" ry="5.5" fill={CREAM} {...line} />
          <ellipse cx="133" cy="220" rx="9.5" ry="5.5" fill={CREAM} {...line} />
          <path d="M112 219v-2.5M117 219.5v-3M129 220v-2.5M134 220.5v-3" stroke={INK} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />

          <m.g
            style={pivot('8% 70%')}
            animate={idle ? { rotate: [0, 0, 5, -2, 0] } : undefined}
            transition={idle ? { duration: 5.6, times: [0, 0.78, 0.85, 0.92, 1], repeat: Infinity, delay: 3.1 } : undefined}
          >
            <path d="M134 108c4-18 18-28 34-26 16 2 26 16 24 34-1 10-8 14-13 9-4-5-6-12-12-17-9-8-20-6-27 4Z" fill={FUR_SHADE} {...line} />
            <path d="M150 94c8-4 20-2 27 6 6 7 9 16 8 22-4-6-8-13-14-18-6-6-14-9-21-10Z" fill={ROSE} opacity="0.75" />
          </m.g>

          <path d="M92 132c-2-20 12-34 32-36 22-2 36 12 36 30s-14 30-34 30c-20 0-32-8-34-24Z" fill={FUR} {...line} />
          <ellipse cx="101" cy="138" rx="12.5" ry="10.5" fill={CREAM} />

          <m.g
            style={pivot('50% 100%')}
            animate={idle ? { rotate: [0, 0, -7, 3, 0] } : undefined}
            transition={idle ? { duration: 5.2, times: [0, 0.8, 0.86, 0.93, 1], repeat: Infinity, delay: 2.4 } : undefined}
          >
            <path d="M112 102c-8-30-8-62 4-76 8-8 16 0 16 18 0 22-4 42-6 58Z" fill={FUR} {...line} />
            <path d="M116 97c-5-23-5-48 2-61 4-4 8 2 8 14 0 18-2 34-4 47Z" fill={ROSE} opacity="0.85" />
          </m.g>

          <m.g
            style={pivot('50% 50%')}
            animate={idle ? { scaleY: [1, 1, 0.12, 1] } : undefined}
            transition={idle ? { duration: 4.6, times: [0, 0.93, 0.965, 1], repeat: Infinity, delay: 2 } : undefined}
          >
            <ellipse cx="112" cy="125" rx="5.2" ry="6.4" fill="#2B1838" />
            <circle cx="110.3" cy="122.6" r="1.9" fill="#FFF9F1" />
            <circle cx="113.9" cy="127.8" r="0.8" fill="#FFF9F1" />
          </m.g>
          <path d="M116.6 120.4l3-2.2M117.4 123l3.2-1" fill="none" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
          <ellipse cx="109" cy="140" rx="7" ry="3.8" fill={ROSE} opacity="0.45" />
          <path d="M90 133.5q3-2 5.5 0-1.8 3.8-2.7 3.8-.9 0-2.8-3.8Z" fill={ROSE} stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M92.6 137.4q1.6 3.8 5.6 2.4" fill="none" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
          <path d="M95 137.5l-12-3M95 139.5l-12 1.5" stroke={INK} strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />

          <path d="M108 151q20 9 42-1" fill="none" stroke={VIOLET} strokeWidth="3.6" strokeLinecap="round" />
          <path d="M128 155c-10-10-20-4-14 4 4 4 10 0 14-4Zm0 0c10-10 20-4 14 4-4 4-10 0-14-4Z" fill={VIOLET} stroke={VIOLET_DEEP} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M126.5 157l-5 12 3.6-1.4 1.6 3.4 2-13ZM129.5 157l5 12-3.6-1.4-1.6 3.4-2-13Z" fill={VIOLET_DEEP} />
          <circle cx="128" cy="155.5" r="3.2" fill={VIOLET_DEEP} />
        </m.g>
      </m.g>

      <m.g variants={appear(0.9)} fill="none" stroke="#3B2650" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 223c1-6 3-9 6-11M10 223c0-5 1-7 3-9M232 223c1-7 4-10 7-12M238 223c0-5 2-8 4-9M100 223c0-4 1-6 3-8" />
      </m.g>
    </svg>
  )
}
