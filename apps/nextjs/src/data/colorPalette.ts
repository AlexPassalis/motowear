const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
] as const

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

export const colorPalette = [
  'black',
  'white',
  ...colors.flatMap(color => steps.map(step => `${color}-${step}`)),
]
