// ===== SCRIB3-OS Design Tokens =====
// Single source of truth — referenced by Tailwind theme and components.
// Values extracted directly from Figma Design Kit.

export const colors = {
  offWhite: '#EAF2D7',
  black: '#000000',
  pink: '#D7ABC5',
  surface: 'rgba(234,242,215,0.2)',
  surfaceDark: 'rgba(234,242,215,0.08)',
  text: {
    primary: '#000000',
    onColor: '#EAF2D7',
  },
  border: {
    default: '#000000',
    onColor: '#EAF2D7',
    panelWidth: '0.733px',
    pillWidth: '0.784px',
  },
} as const

export const typography = {
  displayHero: {
    family: "'Kaio', sans-serif",
    weight: 800,
    size: '80px',
    lineHeight: 0.9,
    letterSpacing: '0px',
    fontFeatureSettings: "'ordn' 1, 'dlig' 1",
    transform: 'uppercase' as const,
  },
  displayDash: {
    family: "'Kaio', sans-serif",
    weight: 800,
    size: '30px',
    lineHeight: 0.88,
    fontFeatureSettings: "'ordn' 1, 'dlig' 1",
    transform: 'uppercase' as const,
  },
  displayName: {
    family: "'Kaio', sans-serif",
    weight: 900,
    size: '15px',
    lineHeight: 1.4,
    transform: 'uppercase' as const,
  },
  body: {
    family: "'Owners Wide', sans-serif",
    weight: 400,
    size: '20px',
    lineHeight: 1.1,
    letterSpacing: '1.6px',
  },
  bodySml: {
    family: "'Owners Wide', sans-serif",
    weight: 400,
    size: '16px',
    lineHeight: 1.4,
    letterSpacing: '0.96px',
  },
  pillNav: {
    family: "'Owners Wide', sans-serif",
    weight: 400,
    size: '12.55px',
    lineHeight: 1.25,
    letterSpacing: '1.004px',
    transform: 'uppercase' as const,
  },
  meta: {
    family: "'NT Stardust', sans-serif",
    weight: 400,
    size: '3.5px',
    letterSpacing: '0.13px',
  },
  time: {
    family: "'Owners Wide', sans-serif",
    size: '18px',
    transform: 'lowercase' as const,
    fontFeatureSettings: "'dlig' 1",
  },
} as const

export const radius = {
  panel: '10.258px',
  pill: '75.641px',
  pillSml: '40px',
  avatar: '50%',
} as const

export const spacing = {
  pagePadding: '40px',
  navHeight: '85px',
} as const
