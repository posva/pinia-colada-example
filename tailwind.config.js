import Typograhpy from '@tailwindcss/typography'
import daisyui from 'daisyui'
import themes from 'daisyui/src/theming/themes'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  daisyui: {
    themes: [
      {
        light: {
          ...themes.lofi,
        },
      },
    ],
  },
  theme: {
    extend: {},
  },
  plugins: [Typograhpy, daisyui],
}
