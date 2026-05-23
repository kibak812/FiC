/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './screens/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', '"Courier New"', 'monospace'],
        'pixel-kr': ['Galmuri11', 'NeoDunggeunmo', 'DungGeunMo', '"Apple SD Gothic Neo"', '"Malgun Gothic"', 'monospace']
      },
      colors: {
        pixel: {
          'bg-dark': '#0f0a12',
          'bg-main': '#1a1423',
          'bg-mid': '#2d2137',
          handle: '#c9a04a',
          'handle-dark': '#9e7a2c',
          head: '#5a5a7a',
          'head-dark': '#3d3d5c',
          deco: '#2d6b4e',
          'deco-dark': '#1f4a35',
          hp: '#cc3333',
          'hp-light': '#ff5555',
          block: '#3388cc',
          'block-light': '#55bbff',
          energy: '#ccaa33',
          'energy-light': '#ffdd44',
          rare: '#aa55cc',
          'rare-light': '#dd88ff',
          legend: '#ffcc00',
          'legend-light': '#ffff44',
          common: '#5588cc',
          starter: '#666666'
        }
      }
    }
  },
  plugins: []
};
