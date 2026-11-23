/**
 * Canvas-rendered charts cannot read CSS variables: ECharts' serializer only
 * understands hex/rgb. These values mirror the `--chart-*` design tokens (oklch) at
 * their closest sRGB equivalents, kept in one module so a palette change updates
 * every chart instead of one component.
 */
export interface ChartTheme {
  text: string
  axis: string
  split: string
  tooltipBackground: string
  tooltipBorder: string
  /** Fixed-length so `series[0]` is always defined under `noUncheckedIndexedAccess`. */
  series: [string, string, string, string, string]
}

const LIGHT: ChartTheme = {
  text: '#3f3f46',
  axis: '#d4d4d8',
  split: '#e4e4e7',
  tooltipBackground: '#ffffff',
  tooltipBorder: '#e4e4e7',
  series: ['#4f46e5', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6'],
}

const DARK: ChartTheme = {
  text: '#d4d4d8',
  axis: '#3f3f46',
  split: '#27272a',
  tooltipBackground: '#18181b',
  tooltipBorder: '#3f3f46',
  series: ['#818cf8', '#38bdf8', '#fbbf24', '#fb7185', '#a78bfa'],
}

export function chartTheme(isDark: boolean): ChartTheme {
  return isDark ? DARK : LIGHT
}

export function tooltipStyle(theme: ChartTheme) {
  return {
    backgroundColor: theme.tooltipBackground,
    borderColor: theme.tooltipBorder,
    borderWidth: 1,
    padding: 10,
    textStyle: { color: theme.text, fontSize: 12 },
    extraCssText: 'border-radius: 8px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);',
  }
}
