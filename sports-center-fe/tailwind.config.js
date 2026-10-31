// Design tokens copied from the Stitch export (Apex Athletic / FitZone).
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface-bright': '#f8f9ff', 'secondary-fixed-dim': '#bec6e0', 'primary-fixed': '#e3dfff',
        'surface-variant': '#d3e4fe', 'on-primary-fixed': '#100069', 'on-tertiary-container': '#ffb48d',
        'surface-container-low': '#eff4ff', 'inverse-on-surface': '#eaf1ff', primary: '#2a14b4',
        'inverse-primary': '#c3c0ff', 'outline-variant': '#c7c4d7', 'secondary-container': '#dae2fd',
        'inverse-surface': '#213145', 'on-secondary-fixed': '#131b2e', 'on-surface': '#0b1c30',
        'surface-container-high': '#dce9ff', 'on-secondary-fixed-variant': '#3f465c',
        'primary-container': '#4338ca', 'on-primary-fixed-variant': '#372abf', error: '#ba1a1a',
        'on-tertiary-fixed-variant': '#783200', outline: '#777586', 'on-error': '#ffffff',
        'tertiary-container': '#893a00', 'surface-container': '#e5eeff', tertiary: '#652900',
        background: '#f8f9ff', 'on-tertiary-fixed': '#341100', 'surface-container-lowest': '#ffffff',
        'on-tertiary': '#ffffff', 'on-primary-container': '#c1beff', 'on-secondary-container': '#5c647a',
        'primary-fixed-dim': '#c3c0ff', 'tertiary-fixed-dim': '#ffb690', 'surface-tint': '#5148d7',
        secondary: '#565e74', 'on-primary': '#ffffff', surface: '#f8f9ff', 'secondary-fixed': '#dae2fd',
        'on-background': '#0b1c30', 'surface-container-highest': '#d3e4fe', 'on-surface-variant': '#464554',
        'error-container': '#ffdad6', 'on-secondary': '#ffffff', 'tertiary-fixed': '#ffdbca',
        'surface-dim': '#cbdbf5', 'on-error-container': '#93000a',
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
      spacing: {
        gutter: '1.5rem', 'space-xl': '2rem', 'margin-mobile': '1rem', 'space-md': '1rem', margin: '2rem',
        'gutter-mobile': '1rem', 'space-sm': '0.5rem', 'space-lg': '1.5rem', 'space-xs': '0.25rem',
      },
      fontFamily: {
        'display-lg': ['Be Vietnam Pro', 'sans-serif'], 'headline-xl-mobile': ['Be Vietnam Pro', 'sans-serif'], 'headline-sm': ['Be Vietnam Pro', 'sans-serif'],
        'headline-md': ['Be Vietnam Pro', 'sans-serif'], 'display-lg-mobile': ['Be Vietnam Pro', 'sans-serif'], 'label-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'], 'body-lg': ['Inter', 'sans-serif'], 'label-md': ['Inter', 'sans-serif'], 'body-sm': ['Inter', 'sans-serif'],
        'headline-xl': ['Be Vietnam Pro', 'sans-serif'], 'label-sm': ['Inter', 'sans-serif'], 'headline-lg': ['Be Vietnam Pro', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'headline-xl-mobile': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'display-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'headline-xl': ['30px', { lineHeight: '38px', fontWeight: '700' }],
        'label-sm': ['11px', { lineHeight: '14px', fontWeight: '600' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
      },
    },
  },
}
